import jwt
from fastapi import HTTPException

from app.core.config import settings


def decode_token(token: str) -> dict:
    """Verify a Supabase Auth access token (HS256 JWT secret)."""
    try:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
