"""
Extended member admin routes:
  POST /api/admin/members/invite      — create member + send Supabase invite email
  PATCH /api/admin/members/{id}/role  — assign a role to a member's linked profile
  GET  /api/admin/roles               — list all roles
"""

import os
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.api.deps import require
from app.core.db import get_conn
from app.services.audit import audit

router = APIRouter(prefix="/api/admin", tags=["admin-members"])

SUPABASE_URL     = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE  = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


# ── Schemas ───────────────────────────────────────────────────

class InviteIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    preferred_display_name: str | None = None
    phone: str | None = None
    role_name: str = "member"


class RoleAssignIn(BaseModel):
    role_name: str


# ── Routes ────────────────────────────────────────────────────

@router.get("/roles")
async def list_roles(
    profile=Depends(require("members:read")),
    conn=Depends(get_conn),
):
    """List all system roles (used to populate role selectors in the frontend)."""
    rows = await conn.fetch(
        "select id, name, description, permissions from roles order by name"
    )
    return [dict(r) for r in rows]


@router.post("/members/invite", status_code=201)
async def invite_member(
    body: InviteIn,
    profile=Depends(require("members:write")),
    conn=Depends(get_conn),
):
    """
    1. Look up the role.
    2. Create the member record (status = active).
    3. Send a Supabase Auth invite email — the member receives a link to set their password.
    4. Once they sign in, the auth trigger creates a profile row that we link to the member.
    """
    # 1. Validate role
    role = await conn.fetchrow("select id from roles where name = $1", body.role_name)
    if not role:
        raise HTTPException(422, f"Unknown role: {body.role_name}")

    # 2. Create member record
    async with conn.transaction():
        member = await conn.fetchrow(
            """insert into members
                 (full_name, preferred_display_name, phone, email,
                  date_joined, membership_status)
               values ($1, $2, $3, $4, current_date, 'active')
               returning id, member_number""",
            body.full_name,
            body.preferred_display_name or body.full_name,
            body.phone,
            str(body.email),
        )
        await conn.execute(
            "insert into birthday_preferences (member_id) values ($1)",
            member["id"],
        )
        await audit(conn, profile["id"], "member.invite", "member", member["id"])

    # 3. Send Supabase invite email
    if not SUPABASE_URL or not SUPABASE_SERVICE:
        # Running locally without Supabase — skip the email, just return success
        return {
            "member_id": str(member["id"]),
            "member_number": member["member_number"],
            "invite_sent": False,
            "note": "Supabase not configured — member created but no email sent.",
        }

    invite_payload = {
        "email": str(body.email),
        "data": {
            "full_name": body.full_name,
            "member_id": str(member["id"]),
            "role_name": body.role_name,
            # The auth hook (see below) reads these and sets up the profile
        },
        # Supabase will automatically redirect to your site's /auth/callback
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/admin/invite",
            json=invite_payload,
            headers={
                "apikey": SUPABASE_SERVICE,
                "Authorization": f"Bearer {SUPABASE_SERVICE}",
                "Content-Type": "application/json",
            },
            timeout=10,
        )

    if resp.status_code not in (200, 201):
        # Member is created; log the email failure but don't roll back
        return {
            "member_id": str(member["id"]),
            "member_number": member["member_number"],
            "invite_sent": False,
            "email_error": resp.text,
        }

    auth_user = resp.json()

    # 4. If Supabase returned the auth user immediately, pre-create the profile
    #    so the member can log in right away with the correct role.
    auth_uid = auth_user.get("id")
    if auth_uid:
        await conn.execute(
            """insert into profiles (auth_user_id, display_name, email, role_id)
               values ($1::uuid, $2, $3, $4)
               on conflict (auth_user_id) do update
                 set display_name = excluded.display_name,
                     email        = excluded.email,
                     role_id      = excluded.role_id""",
            auth_uid,
            body.preferred_display_name or body.full_name,
            str(body.email),
            role["id"],
        )
        # Link profile → member
        profile_row = await conn.fetchrow(
            "select id from profiles where auth_user_id = $1::uuid", auth_uid
        )
        if profile_row:
            await conn.execute(
                "update members set profile_id = $1 where id = $2",
                profile_row["id"], member["id"],
            )

    return {
        "member_id": str(member["id"]),
        "member_number": member["member_number"],
        "invite_sent": True,
    }


@router.patch("/members/{member_id}/role")
async def assign_role(
    member_id: UUID,
    body: RoleAssignIn,
    profile=Depends(require("members:write")),
    conn=Depends(get_conn),
):
    """Assign a system role to the profile linked to this member."""
    # Validate role
    role = await conn.fetchrow(
        "select id, name from roles where name = $1", body.role_name
    )
    if not role:
        raise HTTPException(422, f"Unknown role: {body.role_name}")

    # Find the member's linked profile
    member = await conn.fetchrow(
        "select profile_id from members where id = $1", member_id
    )
    if not member:
        raise HTTPException(404, "Member not found")

    if not member["profile_id"]:
        raise HTTPException(
            409,
            "This member has no login account yet. "
            "Invite them by email first, or wait until they sign up.",
        )

    await conn.execute(
        "update profiles set role_id = $1 where id = $2",
        role["id"], member["profile_id"],
    )
    await audit(
        conn, profile["id"], "member.role_assign", "member", member_id,
        {"role": body.role_name},
    )
    return {"ok": True, "role": body.role_name}
