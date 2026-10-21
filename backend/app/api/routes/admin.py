from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import require
from app.core.db import get_conn
from app.schemas.members import PhotoReviewIn
from app.services import birthdays as bday
from app.services.audit import audit
from app.services.settings import church_today, get_settings


class EditRequestReviewIn(BaseModel):
    approve: bool
    review_notes: str | None = None

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/birthdays/overview")
async def birthday_overview(profile=Depends(require("birthdays:manage")),
                            conn=Depends(get_conn)):
    s = await get_settings(conn)
    today = church_today(s)
    rule = s.get("leap_day_rule", "feb28")
    ws, we = bday.week_range(today)
    ms, me = bday.month_range(today.year, today.month)

    def run(a, b):
        return bday.celebrants(conn, a, b, today, rule, public=False)

    missing_dob = await conn.fetch(
        """select id, member_number, full_name from members
            where membership_status='active' and date_of_birth is null order by full_name""")
    no_consent = await conn.fetch(
        """select m.id, m.member_number, m.full_name from members m
             left join birthday_preferences bp on bp.member_id = m.id
            where m.membership_status='active'
              and (bp.id is null or bp.consent_recorded_at is null) order by m.full_name""")
    return {
        "today": await run(today, today),
        "this_week": await run(ws, we),
        "this_month": await run(ms, me),
        "missing_birth_date": [dict(r) for r in missing_dob],
        "consent_not_recorded": [dict(r) for r in no_consent],
    }


@router.get("/photo-submissions")
async def pending_photos(status: str = "pending", profile=Depends(require("photos:review")),
                         conn=Depends(get_conn)):
    rows = await conn.fetch(
        """select s.id, s.member_id, m.full_name, s.file_path, s.status, s.submitted_at
             from member_photo_submissions s join members m on m.id = s.member_id
            where s.status = $1 order by s.submitted_at""", status)
    return [dict(r) for r in rows]


@router.post("/photo-submissions/{sub_id}/review")
async def review_photo(sub_id: UUID, body: PhotoReviewIn,
                       profile=Depends(require("photos:review")), conn=Depends(get_conn)):
    status = "approved" if body.approve else "rejected"
    async with conn.transaction():
        sub = await conn.fetchrow(
            """update member_photo_submissions
                  set status=$2, reviewed_by=$3, reviewed_at=now(), review_notes=$4
                where id=$1 and status='pending' returning member_id, file_path""",
            sub_id, status, profile["id"], body.notes)
        if not sub:
            raise HTTPException(404, "No pending submission with that id")
        if body.approve:
            await conn.execute(
                """update members set profile_photo_path=$2, profile_photo_status='approved',
                          profile_photo_updated_at=now(), profile_photo_updated_by=$3
                    where id=$1""", sub["member_id"], sub["file_path"], profile["id"])
        else:
            await conn.execute(
                """update members set profile_photo_status =
                       case when profile_photo_path is null then 'rejected' else 'approved' end
                    where id=$1""", sub["member_id"])
        await audit(conn, profile["id"], f"photo.{status}", "member", sub["member_id"])
    # NOTE: on approval, copy the file from `member-photos` to the public `public-photos`
    # bucket (Supabase Storage API) so the public site can show it.
    return {"status": status}


@router.get("/registrations")
async def list_registrations(status: str = "pending",
                             profile=Depends(require("registrations:review")),
                             conn=Depends(get_conn)):
    rows = await conn.fetch(
        "select id, payload, status, created_at from member_registration_requests "
        "where status=$1 order by created_at", status)
    return [dict(r) for r in rows]


@router.post("/registrations/{req_id}/approve", status_code=201)
async def approve_registration(req_id: UUID, profile=Depends(require("registrations:review")),
                               conn=Depends(get_conn)):
    async with conn.transaction():
        req = await conn.fetchrow(
            "select payload from member_registration_requests "
            "where id=$1 and status='pending' for update", req_id)
        if not req:
            raise HTTPException(404, "No pending registration with that id")
        p = req["payload"]
        member = await conn.fetchrow(
            """insert into members (full_name, preferred_display_name, date_of_birth, phone,
                   email, date_joined, membership_status)
               values ($1,$2,$3::date,$4,$5,current_date,'active') returning id""",
            p["full_name"], p.get("preferred_display_name"), _date(p.get("date_of_birth")),
            p.get("phone"), p.get("email"))
        await conn.execute(
            """insert into birthday_preferences (member_id, public_birthday_name_allowed,
                  public_photo_allowed, public_birthday_date_allowed, consent_recorded_at)
               values ($1,$2,$3,$4, now())""",
            member["id"], p.get("allow_name", False), p.get("allow_photo", False),
            p.get("allow_date", False))
        await conn.execute(
            """update member_registration_requests set status='approved', reviewed_by=$2,
                      reviewed_at=now(), member_id=$3 where id=$1""",
            req_id, profile["id"], member["id"])
        await audit(conn, profile["id"], "registration.approve", "member", member["id"])
    return {"member_id": str(member["id"])}


@router.post("/registrations/{req_id}/reject")
async def reject_registration(req_id: UUID, profile=Depends(require("registrations:review")),
                              conn=Depends(get_conn)):
    r = await conn.execute(
        """update member_registration_requests set status='rejected', reviewed_by=$2,
                  reviewed_at=now() where id=$1 and status='pending'""", req_id, profile["id"])
    if r.endswith("0"):
        raise HTTPException(404, "No pending registration with that id")
    await audit(conn, profile["id"], "registration.reject", "registration", req_id)
    return {"status": "rejected"}


def _date(v):
    from datetime import date
    return date.fromisoformat(v) if v else None


# ── Profile edit requests ─────────────────────────────────────

@router.get("/edit-requests")
async def list_edit_requests(
    status: str = "pending",
    profile=Depends(require("members:write")),
    conn=Depends(get_conn),
):
    """List member profile-edit requests by status (default: pending)."""
    rows = await conn.fetch(
        """select r.id, r.member_id, m.full_name as current_full_name,
                  m.member_number,
                  r.full_name, r.preferred_display_name, r.phone, r.email,
                  r.address, r.date_of_birth, r.request_notes,
                  r.status, r.reviewed_at, r.review_notes, r.created_at
             from member_profile_edit_requests r
             join members m on m.id = r.member_id
            where r.status = $1
            order by r.created_at""",
        status,
    )
    return [dict(r) for r in rows]


@router.post("/edit-requests/{req_id}/review")
async def review_edit_request(
    req_id: UUID,
    body: EditRequestReviewIn,
    profile=Depends(require("members:write")),
    conn=Depends(get_conn),
):
    """Approve or reject a profile-edit request.
    On approval the changed fields are written directly to the members table.
    """
    async with conn.transaction():
        req = await conn.fetchrow(
            "select * from member_profile_edit_requests "
            "where id = $1 and status = 'pending' for update",
            req_id,
        )
        if not req:
            raise HTTPException(404, "No pending edit request with that id")

        new_status = "approved" if body.approve else "rejected"
        await conn.execute(
            """update member_profile_edit_requests
                  set status=$2, reviewed_by=$3, reviewed_at=now(), review_notes=$4
                where id=$1""",
            req_id, new_status, profile["id"], body.review_notes,
        )

        if body.approve:
            # Build dynamic UPDATE for only the non-null requested fields
            EDITABLE = ("full_name", "preferred_display_name", "phone",
                        "email", "address", "date_of_birth")
            updates = {col: req[col] for col in EDITABLE if req[col] is not None}
            if updates:
                sets = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(updates))
                await conn.execute(
                    f"update members set {sets} where id = $1",
                    req["member_id"], *updates.values(),
                )
            await audit(
                conn, profile["id"], "edit_request.approve",
                "member", req["member_id"], {"request_id": str(req_id)},
            )
        else:
            await audit(
                conn, profile["id"], "edit_request.reject",
                "member", req["member_id"], {"request_id": str(req_id)},
            )

    return {"status": new_status}
