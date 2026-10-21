from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import current_profile
from app.core.db import get_conn
from app.schemas.members import BirthdayPrefs, PhotoSubmissionIn
from app.services.audit import audit

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
