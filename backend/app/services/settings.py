from datetime import date, datetime
from zoneinfo import ZoneInfo

PUBLIC_KEYS = ("church_name", "tagline", "service_times", "address")


async def get_settings(conn) -> dict:
    rows = await conn.fetch("select key, value from website_settings")
    return {r["key"]: r["value"] for r in rows}


def church_today(settings: dict) -> date:
    tz = ZoneInfo(settings.get("timezone", "Africa/Lagos"))
    return datetime.now(tz).date()
