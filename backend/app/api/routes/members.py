from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import has_perm, require
from app.core.db import get_conn
from app.schemas.members import (MEMBER_STATUSES, BirthdayPrefs, MemberCreate,
                                 MemberOut, MemberUpdate)
from app.services.audit import audit

router = APIRouter(prefix="/api/members", tags=["members"])

# ── Column sets ───────────────────────────────────────────────

BASIC = (
    "id, member_number, full_name, preferred_display_name, membership_status, "
    "profile_photo_path, profile_photo_status, date_joined, role, has_login"
)
SENSITIVE = BASIC + ", date_of_birth, phone, email, address"


def _cols(profile: dict) -> str:
    return SENSITIVE if has_perm(profile, "members:read_sensitive") else BASIC


# ── Routes ────────────────────────────────────────────────────

@router.get("", response_model=list[MemberOut])
async def list_members(
    q: str | None = None,
    status: str | None = None,
    birth_month: int | None = Query(None, ge=1, le=12),
    limit: int = Query(50, le=200),
    offset: int = 0,
    profile=Depends(require("members:read")),
    conn=Depends(get_conn),
):
    """List members, including their system role and whether they have a login."""
    rows = await conn.fetch(
        f"""select {_cols(profile)} from admin_members_with_role
             where ($1::text is null or full_name ilike '%'||$1||'%'
                    or member_number ilike $1||'%')
               and ($2::text is null or membership_status = $2)
               and ($3::int  is null or date_part('month', date_of_birth)::int = $3)
             order by full_name limit $4 offset $5""",
        q, status, birth_month, limit, offset,
    )
    return [dict(r) for r in rows]


@router.get("/{member_id}", response_model=MemberOut)
async def get_member(
    member_id: UUID,
    profile=Depends(require("members:read")),
    conn=Depends(get_conn),
):
    row = await conn.fetchrow(
        f"select {_cols(profile)} from admin_members_with_role where id=$1", member_id
    )
    if not row:
        raise HTTPException(404, "Member not found")
    return dict(row)


@router.post("", response_model=MemberOut, status_code=201)
async def create_member(
    body: MemberCreate,
    force: bool = False,
    profile=Depends(require("members:write")),
    conn=Depends(get_conn),
):
    if body.membership_status not in MEMBER_STATUSES:
        raise HTTPException(422, "Invalid membership status")

    if not force:
        dups = await conn.fetch(
            """select id, member_number, full_name from members
                where ($1::text is not null and phone = $1)
                   or ($2::text is not null and lower(email) = lower($2))
                   or (lower(full_name) = lower($3) and $4::date is not null
                       and date_of_birth = $4)""",
            body.phone, body.email, body.full_name, body.date_of_birth,
        )
        if dups:
            raise HTTPException(
                409,
                {"message": "Possible duplicate members",
                 "candidates": [dict(d, id=str(d["id"])) for d in dups]},
            )

    SENSITIVE_COLS = (
        "id, member_number, full_name, preferred_display_name, membership_status, "
        "profile_photo_path, profile_photo_status, date_joined, "
        "date_of_birth, phone, email, address"
    )
    async with conn.transaction():
        row = await conn.fetchrow(
            f"""insert into members
                  (full_name, preferred_display_name, date_of_birth, phone,
                   email, address, date_joined, membership_status)
                values ($1,$2,$3,$4,$5,$6,$7,$8)
                returning {SENSITIVE_COLS}""",
            body.full_name, body.preferred_display_name, body.date_of_birth,
            body.phone, body.email, body.address, body.date_joined,
            body.membership_status,
        )
        await conn.execute(
            "insert into birthday_preferences (member_id) values ($1)", row["id"]
        )
        await audit(conn, profile["id"], "member.create", "member", row["id"])

    return {**dict(row), "role": None, "has_login": False}


@router.patch("/{member_id}", response_model=MemberOut)
async def update_member(
    member_id: UUID,
    body: MemberUpdate,
    profile=Depends(require("members:write")),
    conn=Depends(get_conn),
):
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(422, "Nothing to update")
    if data.get("membership_status") and data["membership_status"] not in MEMBER_STATUSES:
        raise HTTPException(422, "Invalid membership status")

    sets = ", ".join(f"{k} = ${i + 2}" for i, k in enumerate(data))
    SENSITIVE_COLS = (
        "id, member_number, full_name, preferred_display_name, membership_status, "
        "profile_photo_path, profile_photo_status, date_joined, "
        "date_of_birth, phone, email, address"
    )
    async with conn.transaction():
        row = await conn.fetchrow(
            f"update members set {sets} where id = $1 returning {SENSITIVE_COLS}",
            member_id, *data.values(),
        )
        if not row:
            raise HTTPException(404, "Member not found")
        await audit(
            conn, profile["id"], "member.update", "member", member_id,
            {"fields": list(data)},
        )

    # Re-fetch with role from the view
    full = await conn.fetchrow(
        "select role, has_login from admin_members_with_role where id = $1", member_id
    )
    return {**dict(row), "role": full["role"] if full else None,
            "has_login": full["has_login"] if full else False}


@router.get("/{member_id}/birthday-preferences")
async def get_prefs(
    member_id: UUID,
    profile=Depends(require("members:read")),
    conn=Depends(get_conn),
):
    row = await conn.fetchrow(
        "select * from birthday_preferences where member_id=$1", member_id
    )
    if not row:
        raise HTTPException(404, "Preferences not found")
    return dict(row)


@router.put("/{member_id}/birthday-preferences")
async def set_prefs(
    member_id: UUID,
    body: BirthdayPrefs,
    profile=Depends(require("members:write")),
    conn=Depends(get_conn),
):
    d = body.model_dump()
    await conn.execute(
        """insert into birthday_preferences
             (member_id, public_birthday_name_allowed, public_photo_allowed,
              public_birthday_date_allowed, announcement_design_allowed,
              gallery_photo_allowed, birthday_contact_preference, consent_recorded_at)
           values ($1,$2,$3,$4,$5,$6,$7, now())
           on conflict (member_id) do update set
              public_birthday_name_allowed=$2, public_photo_allowed=$3,
              public_birthday_date_allowed=$4, announcement_design_allowed=$5,
              gallery_photo_allowed=$6, birthday_contact_preference=$7,
              consent_recorded_at=now()""",
        member_id, *d.values(),
    )
    await audit(conn, profile["id"], "birthday_prefs.update", "member", member_id)
    return {"ok": True}
