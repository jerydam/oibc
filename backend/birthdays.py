"""Birthday matching. Dates are computed in the church's time zone; leap-day
birthdays follow the `leap_day_rule` setting ('feb28' or 'mar1')."""
import calendar
from datetime import date, timedelta

from app.schemas.birthdays import Celebrant

PUBLIC_SRC = """select id, display_name, photo_path, birth_month, birth_day,
                       date_allowed, department from public_birthdays"""

# Admin view: all active members with a birth date, regardless of public consent.
ADMIN_SRC = """select id, coalesce(preferred_display_name, full_name) as display_name,
                      profile_photo_path as photo_path, birth_month, birth_day,
                      true as date_allowed, null::text as department
                 from members
                where membership_status = 'active' and date_of_birth is not null"""


def week_range(today: date) -> tuple[date, date]:
    """Monday-to-Sunday; works across month and year boundaries."""
    start = today - timedelta(days=today.weekday())
    return start, start + timedelta(days=6)


def month_range(year: int, month: int) -> tuple[date, date]:
    return date(year, month, 1), date(year, month, calendar.monthrange(year, month)[1])


def _keys_for(d: date, rule: str) -> list[tuple[int, int]]:
    keys = [(d.month, d.day)]
    if not calendar.isleap(d.year):
        if (rule == "feb28" and (d.month, d.day) == (2, 28)) or \
           (rule == "mar1" and (d.month, d.day) == (3, 1)):
            keys.append((2, 29))
    return keys


async def celebrants(conn, start: date, end: date, today: date, rule: str = "feb28",
                     *, public: bool = True, require_date: bool = False) -> list[Celebrant]:
    mapping: dict[tuple[int, int], list[date]] = {}
    d = start
    while d <= end:
        for key in _keys_for(d, rule):
            mapping.setdefault(key, []).append(d)
        d += timedelta(days=1)

    months = [k[0] for k in mapping]
    days = [k[1] for k in mapping]
    src = PUBLIC_SRC if public else ADMIN_SRC
    rows = await conn.fetch(
        f"""select * from ({src}) b
             where (b.birth_month, b.birth_day) in
                   (select * from unnest($1::int[], $2::int[]))""",
        months, days,
    )

    out: list[Celebrant] = []
    for r in rows:
        if require_date and not r["date_allowed"]:
            continue
        for when in mapping[(r["birth_month"], r["birth_day"])]:
            out.append(Celebrant(
                id=r["id"], display_name=r["display_name"], photo_path=r["photo_path"],
                department=r["department"],
                date=when if r["date_allowed"] else None,
                is_today=(when == today),
            ))
    out.sort(key=lambda c: (c.date or today, c.display_name.lower()))
    return out


async def get_today_celebrants(conn, settings: dict) -> list[Celebrant]:
    """Convenience wrapper used by the admin overview endpoint."""
    from app.services.settings import church_today
    today = church_today(settings)
    rule = settings.get("leap_day_rule", "feb28")
    return await celebrants(conn, today, today, today, rule, public=False)
