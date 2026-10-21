from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.db import get_conn
from app.core.security import decode_token

bearer = HTTPBearer(auto_error=False)


async def current_profile(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    conn=Depends(get_conn),
) -> dict:
    if creds is None:
        raise HTTPException(401, "Not authenticated")
    claims = decode_token(creds.credentials)
    row = await conn.fetchrow(
        """select p.id, p.display_name, p.email, p.status,
                  coalesce(r.name, 'member') as role,
                  coalesce(r.permissions, '{}') as permissions
             from profiles p left join roles r on r.id = p.role_id
            where p.auth_user_id = $1::uuid""",
        claims["sub"],
    )
    if row is None or row["status"] != "active":
        raise HTTPException(403, "No active profile for this account")
    return dict(row)


def require(*perms: str):
    """Dependency factory: user must hold every listed permission (or '*')."""

    async def checker(profile: dict = Depends(current_profile)) -> dict:
        held = set(profile["permissions"])
        if "*" not in held and not set(perms) <= held:
            raise HTTPException(403, "You do not have permission to do this")
        return profile

    return checker


def has_perm(profile: dict, perm: str) -> bool:
    held = profile["permissions"]
    return "*" in held or perm in held
