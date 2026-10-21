import calendar

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.db import get_conn
from app.schemas.birthdays import Celebrant
from app.schemas.members import RegistrationIn
from app.services import birthdays as bday
from app.services.settings import PUBLIC_KEYS, church_today, get_settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# ── Site settings ────────────────────────────────────────────
@router.get("/settings")
async def public_settings(conn=Depends(get_conn)):
    s = await get_settings(conn)
    return {k: s.get(k) for k in PUBLIC_KEYS}


# ── Birthdays ────────────────────────────────────────────────
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


# ── Activities ───────────────────────────────────────────────
@router.get("/activities/upcoming")
async def upcoming_activities(limit: int = Query(6, le=20), conn=Depends(get_conn)):
    rows = await conn.fetch("""
        select ao.id, ao.activity_id,
               coalesce(ao.title, a.title) as activity_title,
               ao.title, ac.name as category,
               ao.start_at, ao.end_at, ao.venue, ao.description,
               ao.cover_image_path, ao.occurrence_status,
               ao.registration_required, ao.registration_deadline,
               d.name as department
        from activity_occurrences ao
        join activities a on a.id = ao.activity_id
        left join activity_categories ac on ac.id = a.category_id
        left join departments d on d.id = a.organizing_department_id
        where ao.occurrence_status = 'published'
          and ao.start_at >= now()
          and a.visibility = 'public'
        order by ao.start_at
        limit $1""", limit)
    return [dict(r) for r in rows]


@router.get("/activities/categories")
async def activity_categories(conn=Depends(get_conn)):
    rows = await conn.fetch("select id, name, description from activity_categories order by name")
    return [dict(r) for r in rows]


@router.get("/activities")
async def list_activities(
    year: int | None = None, month: int | None = None,
    category: str | None = None, limit: int = Query(40, le=100), offset: int = 0,
    conn=Depends(get_conn)
):
    filters = ["ao.occurrence_status in ('published','completed')", "a.visibility='public'"]
    params: list = []

    def p(v):
        params.append(v)
        return f"${len(params)}"

    if year:
        filters.append(f"extract(year from ao.start_at)={p(year)}")
    if month:
        filters.append(f"extract(month from ao.start_at)={p(month)}")
    if category:
        filters.append(f"ac.name ilike {p(f'%{category}%')}")
    where = "where " + " and ".join(filters)
    params += [limit, offset]
    rows = await conn.fetch(f"""
        select ao.id, ao.activity_id,
               coalesce(ao.title, a.title) as activity_title,
               ao.title, ac.name as category,
               ao.start_at, ao.end_at, ao.venue, ao.description,
               ao.cover_image_path, ao.occurrence_status,
               ao.registration_required, ao.registration_deadline,
               d.name as department
        from activity_occurrences ao
        join activities a on a.id = ao.activity_id
        left join activity_categories ac on ac.id = a.category_id
        left join departments d on d.id = a.organizing_department_id
        {where}
        order by ao.start_at desc
        limit ${len(params)-1} offset ${len(params)}""", *params)
    return [dict(r) for r in rows]


@router.get("/activities/{occ_id}")
async def activity_detail(occ_id: str, conn=Depends(get_conn)):
    row = await conn.fetchrow("""
        select ao.id, ao.activity_id,
               coalesce(ao.title, a.title) as activity_title,
               ao.title, ac.name as category,
               ao.start_at, ao.end_at, ao.venue, ao.description,
               ao.cover_image_path, ao.occurrence_status,
               ao.registration_required, ao.registration_deadline,
               d.name as department,
               ar.report_summary, ar.attendance_total
        from activity_occurrences ao
        join activities a on a.id = ao.activity_id
        left join activity_categories ac on ac.id = a.category_id
        left join departments d on d.id = a.organizing_department_id
        left join activity_reports ar on ar.activity_occurrence_id = ao.id
        where ao.id = $1::uuid
          and ao.occurrence_status in ('published','completed','cancelled')
          and a.visibility = 'public'""", occ_id)
    if not row:
        raise HTTPException(404, "Activity not found")
    return dict(row)


# ── Monthly Word & Prayer ────────────────────────────────────
@router.get("/monthly-word/current")
async def current_monthly_word(conn=Depends(get_conn)):
    row = await conn.fetchrow("""
        select id,month,year,title,pastor_name,video_url,thumbnail_path,
               message_description,prayer_focus,scripture_reference,
               prayer_points,published_at
        from monthly_word_prayer
        where publication_status='published'
        order by year desc, month desc
        limit 1""")
    return dict(row) if row else None


@router.get("/monthly-word")
async def monthly_word_archive(conn=Depends(get_conn)):
    rows = await conn.fetch("""
        select id,month,year,title,pastor_name,video_url,thumbnail_path,
               message_description,prayer_focus,scripture_reference,
               prayer_points,published_at
        from monthly_word_prayer
        where publication_status='published'
        order by year desc, month desc""")
    return [dict(r) for r in rows]


@router.get("/monthly-word/{year}/{month}")
async def monthly_word_by_date(year: int, month: int, conn=Depends(get_conn)):
    row = await conn.fetchrow("""
        select id,month,year,title,pastor_name,video_url,thumbnail_path,
               message_description,prayer_focus,scripture_reference,
               prayer_points,published_at
        from monthly_word_prayer
        where year=$1 and month=$2 and publication_status='published'""", year, month)
    if not row:
        raise HTTPException(404, "Edition not found")
    return dict(row)


# ── Sermons ──────────────────────────────────────────────────
@router.get("/sermons")
async def list_sermons(
    search: str | None = None, preacher: str | None = None,
    category: str | None = None, limit: int = Query(30, le=100), offset: int = 0,
    conn=Depends(get_conn)
):
    filters = ["publication_status='published'"]
    params: list = []

    def p(v):
        params.append(v)
        return f"${len(params)}"

    if search:
        filters.append(f"(title ilike {p(f'%{search}%')} or description ilike {p(f'%{search}%')})")
    if preacher:
        filters.append(f"preacher_name ilike {p(f'%{preacher}%')}")
    if category:
        filters.append(f"category ilike {p(f'%{category}%')}")
    where = "where " + " and ".join(filters)
    params += [limit, offset]
    rows = await conn.fetch(f"""
        select id,title,preacher_name,sermon_date,scripture_reference,
               category,description,video_url,audio_url,thumbnail_path
        from sermons {where}
        order by sermon_date desc nulls last, created_at desc
        limit ${len(params)-1} offset ${len(params)}""", *params)
    return [dict(r) for r in rows]


@router.get("/sermons/{sermon_id}")
async def sermon_detail(sermon_id: str, conn=Depends(get_conn)):
    row = await conn.fetchrow("""
        select id,title,preacher_name,sermon_date,scripture_reference,
               category,description,video_url,audio_url,thumbnail_path
        from sermons where id=$1::uuid and publication_status='published'""", sermon_id)
    if not row:
        raise HTTPException(404, "Sermon not found")
    return dict(row)


# ── Announcements ─────────────────────────────────────────────
@router.get("/announcements")
async def list_announcements(conn=Depends(get_conn)):
    rows = await conn.fetch("""
        select id,title,body,image_path,published_at,expires_at
        from announcements
        where status='published'
          and target_audience='public'
          and (expires_at is null or expires_at > now())
        order by published_at desc
        limit 20""")
    return [dict(r) for r in rows]


# ── Gallery ───────────────────────────────────────────────────
@router.get("/gallery")
async def list_albums(year: int | None = None, conn=Depends(get_conn)):
    if year:
        rows = await conn.fetch("""
            select ga.id,ga.title,ga.description,ga.album_date,ga.cover_image_path,
                   count(gm.id)::int as media_count
            from gallery_albums ga
            left join gallery_media gm on gm.album_id=ga.id and gm.publication_status='published'
            where ga.visibility='public'
              and extract(year from ga.album_date)=$1
            group by ga.id order by ga.album_date desc""", year)
    else:
        rows = await conn.fetch("""
            select ga.id,ga.title,ga.description,ga.album_date,ga.cover_image_path,
                   count(gm.id)::int as media_count
            from gallery_albums ga
            left join gallery_media gm on gm.album_id=ga.id and gm.publication_status='published'
            where ga.visibility='public'
            group by ga.id order by ga.album_date desc
            limit 50""")
    return [dict(r) for r in rows]


@router.get("/gallery/{album_id}/media")
async def album_media(album_id: str, conn=Depends(get_conn)):
    album = await conn.fetchrow(
        "select id from gallery_albums where id=$1::uuid and visibility='public'", album_id)
    if not album:
        raise HTTPException(404, "Album not found")
    rows = await conn.fetch("""
        select id,file_path,media_type,caption,display_order
        from gallery_media
        where album_id=$1::uuid and publication_status='published'
        order by display_order, created_at""", album_id)
    return [dict(r) for r in rows]


# ── Departments ───────────────────────────────────────────────
@router.get("/departments")
async def list_departments(conn=Depends(get_conn)):
    rows = await conn.fetch("""
        select d.id, d.name, d.description,
               lm.preferred_display_name as leader_name
        from departments d
        left join members lm on lm.id=d.leader_member_id
        where d.status='active'
        order by d.name""")
    return [dict(r) for r in rows]


# ── Visitor registration ──────────────────────────────────────
@router.post("/visitors", status_code=201)
@limiter.limit("10/hour")
async def submit_visitor(request: Request, body: dict, conn=Depends(get_conn)):
    await conn.execute("""
        insert into visitors (name,email,phone,service_attended,message,follow_up_permission)
        values ($1,$2,$3,$4,$5,$6)""",
        body.get("name"), body.get("email"), body.get("phone"),
        body.get("service_attended"), body.get("message"),
        bool(body.get("follow_up_permission", False)))
    return {"status": "received"}


# ── Member self-registration ──────────────────────────────────
@router.post("/register", status_code=201)
@limiter.limit("5/hour")
async def register(request: Request, body: RegistrationIn, conn=Depends(get_conn)):
    await conn.execute(
        "insert into member_registration_requests (payload) values ($1)",
        body.model_dump(mode="json"),
    )
    return {"status": "pending"}
