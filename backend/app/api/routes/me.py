from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import date

from app.api.deps import current_profile
from app.core.db import get_conn
from app.schemas.members import BirthdayPrefs, PhotoSubmissionIn
from app.services.audit import audit


class ProfileEditRequestIn(BaseModel):
    full_name: str | None = None
    preferred_display_name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    date_of_birth: date | None = None
    request_notes: str | None = None

router = APIRouter(prefix="/api/me", tags=["member portal"])


async def _my_member(conn, profile):
    m = await conn.fetchrow(
        """select id, member_number, full_name, preferred_display_name, membership_status,
                  profile_photo_path, profile_photo_status, date_joined
             from members where profile_id = $1""", profile["id"])
    if not m:
        raise HTTPException(404, "No member record is linked to this account")
    return m


@router.get("")
async def me(profile=Depends(current_profile), conn=Depends(get_conn)):
    m = await _my_member(conn, profile)
    prefs = await conn.fetchrow("select * from birthday_preferences where member_id=$1", m["id"])
    return {"profile": {"display_name": profile["display_name"], "role": profile["role"]},
            "member": dict(m), "birthday_preferences": dict(prefs) if prefs else None}


@router.put("/birthday-preferences")
async def update_prefs(body: BirthdayPrefs, profile=Depends(current_profile),
                       conn=Depends(get_conn)):
    m = await _my_member(conn, profile)
    d = body.model_dump()
    await conn.execute(
        """insert into birthday_preferences (member_id, public_birthday_name_allowed,
              public_photo_allowed, public_birthday_date_allowed, announcement_design_allowed,
              gallery_photo_allowed, birthday_contact_preference, consent_recorded_at)
           values ($1,$2,$3,$4,$5,$6,$7, now())
           on conflict (member_id) do update set
              public_birthday_name_allowed=$2, public_photo_allowed=$3,
              public_birthday_date_allowed=$4, announcement_design_allowed=$5,
              gallery_photo_allowed=$6, birthday_contact_preference=$7,
              consent_recorded_at=now()""", m["id"], *d.values())
    await audit(conn, profile["id"], "birthday_prefs.self_update", "member", m["id"])
    return {"ok": True}


@router.get("/edit-requests")
async def my_edit_requests(profile=Depends(current_profile), conn=Depends(get_conn)):
    """Return this member's own edit requests, newest first."""
    m = await _my_member(conn, profile)
    rows = await conn.fetch(
        """select id, full_name, preferred_display_name, phone, email, address,
                  date_of_birth, request_notes, status, reviewed_at, review_notes, created_at
             from member_profile_edit_requests
            where member_id = $1
            order by created_at desc""",
        m["id"],
    )
    return [dict(r) for r in rows]


@router.post("/edit-request", status_code=201)
async def submit_edit_request(
    body: ProfileEditRequestIn,
    profile=Depends(current_profile),
    conn=Depends(get_conn),
):
    """Submit a profile-change request for admin approval.
    At least one field must be provided (other than request_notes).
    Only one pending request per member is allowed at a time.
    """
    m = await _my_member(conn, profile)

    # Must have at least one field to change
    editable = {k: v for k, v in body.model_dump().items()
                if k != "request_notes" and v is not None}
    if not editable:
        raise HTTPException(422, "Provide at least one field to change.")

    # Reject if there is already a pending request
    existing = await conn.fetchrow(
        "select id from member_profile_edit_requests "
        "where member_id = $1 and status = 'pending'",
        m["id"],
    )
    if existing:
        raise HTTPException(409, "You already have a pending edit request. "
                                 "Please wait for it to be reviewed.")

    row = await conn.fetchrow(
        """insert into member_profile_edit_requests
             (member_id, submitted_by, full_name, preferred_display_name,
              phone, email, address, date_of_birth, request_notes)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           returning id, status, created_at""",
        m["id"], profile["id"],
        body.full_name, body.preferred_display_name, body.phone,
        str(body.email) if body.email else None,
        body.address, body.date_of_birth, body.request_notes,
    )
    await audit(conn, profile["id"], "edit_request.submit", "member", m["id"])
    return dict(row)


@router.post("/photo-submissions", status_code=201)
async def submit_photo(body: PhotoSubmissionIn, profile=Depends(current_profile),
                       conn=Depends(get_conn)):
    """Client uploads the image to the private `member-photos` bucket first
    (path must start with the member's id), then registers it here for review."""
    m = await _my_member(conn, profile)
    if not body.file_path.startswith(f"{m['id']}/"):
        raise HTTPException(422, "Photo path must be inside your own folder")
    async with conn.transaction():
        await conn.execute(
            """insert into member_photo_submissions (member_id, file_path, submitted_by)
               values ($1,$2,$3)""", m["id"], body.file_path, profile["id"])
        await conn.execute(
            "update members set profile_photo_status='pending' where id=$1 "
            "and profile_photo_path is null", m["id"])
        await audit(conn, profile["id"], "photo.submit", "member", m["id"])
    return {"status": "pending"}
