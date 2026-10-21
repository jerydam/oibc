import calendar

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.db import get_conn
from app.schemas.birthdays import Celebrant
from app.schemas.members import RegistrationIn
from app.services import birthdays as bday
from app.services.settings import PUBLIC_KEYS, church_today, get_settings

router = APIRouter(prefix="/api/public", tags=["public"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/settings")
async def public_settings(conn=Depends(get_conn)):
    s = await get_settings(conn)
    return {k: s.get(k) for k in PUBLIC_KEYS}


@router.get("/birthdays/today", response_model=list[Celebrant])
async def birthdays_today(conn=Depends(get_conn)):
    s = await get_settings(conn)
    today = church_today(s)
    return await bday.celebrants(conn, today, today, today, s.get("leap_day_rule", "feb28"))


@router.get("/birthdays/week", response_model=list[Celebrant])
async def birthdays_week(conn=Depends(get_conn)):
    s = await get_settings(conn)
    today = church_today(s)
    start, end = bday.week_range(today)
    return await bday.celebrants(conn, start, end, today, s.get("leap_day_rule", "feb28"),
                                 require_date=True)


@router.get("/birthdays/month", response_model=list[Celebrant])
async def birthdays_month(year: int | None = Query(None, ge=1900, le=2200),
                          month: int | None = Query(None, ge=1, le=12),
                          conn=Depends(get_conn)):
    s = await get_settings(conn)
    today = church_today(s)
    year, month = year or today.year, month or today.month
    start, end = bday.month_range(year, month)
    return await bday.celebrants(conn, start, end, today, s.get("leap_day_rule", "feb28"),
                                 require_date=True)


@router.post("/register", status_code=201)
@limiter.limit("5/hour")
async def register(request: Request, body: RegistrationIn, conn=Depends(get_conn)):
    """Online registration lands in a pending queue for admin review."""
    await conn.execute(
        "insert into member_registration_requests (payload) values ($1)",
        body.model_dump(mode="json"),
    )
    return {"status": "pending"}
