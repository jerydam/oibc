"""Admin routes for content management: activities, monthly word, sermons,
announcements, gallery, visitors, departments."""
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import DbConn, require, require_any
from app.schemas.activities import (
    ActivityCreate, OccurrenceCreate,
    OccurrencePublic, OccurrenceUpdate, ReportCreate,
)
from app.schemas.content import (
    AlbumCreate, AnnouncementCreate, AnnouncementUpdate,
    MonthlyWordCreate, MonthlyWordPublic, MonthlyWordUpdate,
    SermonCreate, SermonPublic, SermonUpdate,
)
from app.services.audit import audit

router = APIRouter(prefix="/admin")

# ── permission shortcuts ──────────────────────────────────────
CONTENT    = Depends(require("content:manage"))
ACTIVITIES = Depends(require("activities:manage"))
MEMBERS_R  = Depends(require("members:read"))


# ════════════════════════════════════════════════════════════════
#  ACTIVITIES
# ════════════════════════════════════════════════════════════════

@router.get("/activities", response_model=list[OccurrencePublic])
async def admin_list_occurrences(
    conn: DbConn,
    actor=ACTIVITIES,
    status: str | None = None,
    year: int | None = None,
    month: int | None = None,
    limit: int = 50,
    offset: int = 0,
):
    filters: list[str] = []
    params: list = []

    def p(v):
        params.append(v)
        return f"${len(params)}"

    if status:
        filters.append(f"ao.occurrence_status={p(status)}")
    if year:
        filters.append(f"extract(year from ao.start_at)={p(year)}")
    if month:
        filters.append(f"extract(month from ao.start_at)={p(month)}")
    where = ("where " + " and ".join(filters)) if filters else ""
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


@router.post("/activities/series", status_code=201)
async def create_activity_series(payload: ActivityCreate, conn: DbConn, actor=ACTIVITIES):
    row = await conn.fetchrow("""
        insert into activities (title,category_id,description,organizing_department_id,
                                recurrence_rule,default_venue,visibility,created_by)
        values ($1,$2,$3,$4,$5,$6,$7,$8) returning id""",
        payload.title, payload.category_id, payload.description,
        payload.organizing_department_id, payload.recurrence_rule,
        payload.default_venue, payload.visibility, actor["profile_id"])
    await audit(conn, actor["profile_id"], "create", "activity", row["id"])
    return {"id": row["id"]}


@router.post("/activities/occurrences", status_code=201)
async def create_occurrence(payload: OccurrenceCreate, conn: DbConn, actor=ACTIVITIES):
    row = await conn.fetchrow("""
        insert into activity_occurrences
          (activity_id,title,start_at,end_at,venue,description,
           occurrence_status,registration_required,registration_deadline)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id""",
        payload.activity_id, payload.title, payload.start_at, payload.end_at,
        payload.venue, payload.description, payload.occurrence_status,
        payload.registration_required, payload.registration_deadline)
    await audit(conn, actor["profile_id"], "create", "activity_occurrence", row["id"])
    return {"id": row["id"]}


@router.patch("/activities/occurrences/{occ_id}")
async def update_occurrence(occ_id: UUID, payload: OccurrenceUpdate, conn: DbConn, actor=ACTIVITIES):
    data = payload.model_dump(exclude_none=True)
    if not data:
        return {"detail": "nothing to update"}
    updates, params = [], []

    def p(v):
        params.append(v)
        return f"${len(params)}"

    for field, val in data.items():
        updates.append(f"{field}={p(val)}")
    updates.append(f"updated_at={p(datetime.now(timezone.utc))}")
    params.append(occ_id)
    await conn.execute(
        f"update activity_occurrences set {','.join(updates)} where id=${len(params)}", *params)
    await audit(conn, actor["profile_id"], "update", "activity_occurrence", occ_id,
                {"fields": list(data.keys())})
    return {"detail": "updated"}


@router.post("/activities/occurrences/{occ_id}/publish")
async def publish_occurrence(occ_id: UUID, conn: DbConn, actor=ACTIVITIES):
    await conn.execute("""
        update activity_occurrences
        set occurrence_status='published', published_at=now(), updated_at=now()
        where id=$1""", occ_id)
    await audit(conn, actor["profile_id"], "publish", "activity_occurrence", occ_id)
    return {"detail": "published"}


@router.post("/activities/occurrences/{occ_id}/report", status_code=201)
async def submit_report(occ_id: UUID, payload: ReportCreate, conn: DbConn, actor=ACTIVITIES):
    await conn.execute("""
        insert into activity_reports
          (activity_occurrence_id,report_summary,attendance_total,outcomes,
           challenges,follow_up_actions,submitted_by,status)
        values ($1,$2,$3,$4,$5,$6,$7,'submitted')
        on conflict (activity_occurrence_id) do update set
          report_summary=excluded.report_summary,
          attendance_total=excluded.attendance_total,
          outcomes=excluded.outcomes,
          challenges=excluded.challenges,
          follow_up_actions=excluded.follow_up_actions,
          submitted_by=excluded.submitted_by,
          submitted_at=now(), status='submitted'""",
        occ_id, payload.report_summary, payload.attendance_total, payload.outcomes,
        payload.challenges, payload.follow_up_actions, actor["profile_id"])
    await audit(conn, actor["profile_id"], "submit_report", "activity_occurrence", occ_id)
    return {"detail": "report submitted"}


# ════════════════════════════════════════════════════════════════
#  MONTHLY WORD & PRAYER
# ════════════════════════════════════════════════════════════════

@router.get("/monthly-word", response_model=list[MonthlyWordPublic])
async def admin_list_mwp(conn: DbConn, actor=CONTENT):
    rows = await conn.fetch("""
        select id,month,year,title,pastor_name,video_url,thumbnail_path,
               message_description,prayer_focus,scripture_reference,prayer_points,
               publication_status,published_at
        from monthly_word_prayer order by year desc,month desc""")
    return [dict(r) for r in rows]


@router.post("/monthly-word", status_code=201)
async def create_mwp(payload: MonthlyWordCreate, conn: DbConn, actor=CONTENT):
    row = await conn.fetchrow("""
        insert into monthly_word_prayer
          (month,year,title,pastor_name,video_url,thumbnail_path,message_description,
           prayer_focus,scripture_reference,prayer_points,publication_status,created_by)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id""",
        payload.month, payload.year, payload.title, payload.pastor_name,
        payload.video_url, payload.thumbnail_path, payload.message_description,
        payload.prayer_focus, payload.scripture_reference,
        payload.prayer_points, payload.publication_status, actor["profile_id"])
    await audit(conn, actor["profile_id"], "create", "monthly_word_prayer", row["id"])
    return {"id": row["id"]}


@router.patch("/monthly-word/{mwp_id}")
async def update_mwp(mwp_id: UUID, payload: MonthlyWordUpdate, conn: DbConn, actor=CONTENT):
    data = payload.model_dump(exclude_none=True)
    if not data:
        return {"detail": "nothing to update"}
    updates, params = [], []

    def p(v):
        params.append(v)
        return f"${len(params)}"

    for field, val in data.items():
        updates.append(f"{field}={p(val)}")
    if data.get("publication_status") == "published":
        updates.append(f"published_at={p(datetime.now(timezone.utc))}")
    updates.append(f"updated_at={p(datetime.now(timezone.utc))}")
    params.append(mwp_id)
    await conn.execute(
        f"update monthly_word_prayer set {','.join(updates)} where id=${len(params)}", *params)
    await audit(conn, actor["profile_id"], "update", "monthly_word_prayer", mwp_id)
    return {"detail": "updated"}


# ════════════════════════════════════════════════════════════════
#  SERMONS
# ════════════════════════════════════════════════════════════════

@router.get("/sermons", response_model=list[SermonPublic])
async def admin_list_sermons(conn: DbConn, actor=CONTENT, limit: int = 50, offset: int = 0):
    rows = await conn.fetch("""
        select id,title,preacher_name,sermon_date,scripture_reference,
               category,description,video_url,audio_url,thumbnail_path,publication_status
        from sermons order by sermon_date desc nulls last, created_at desc
        limit $1 offset $2""", limit, offset)
    return [dict(r) for r in rows]


@router.post("/sermons", status_code=201)
async def create_sermon(payload: SermonCreate, conn: DbConn, actor=CONTENT):
    row = await conn.fetchrow("""
        insert into sermons
          (title,preacher_name,sermon_date,scripture_reference,category,description,
           video_url,audio_url,thumbnail_path,publication_status,created_by)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id""",
        payload.title, payload.preacher_name, payload.sermon_date,
        payload.scripture_reference, payload.category, payload.description,
        payload.video_url, payload.audio_url, payload.thumbnail_path,
        payload.publication_status, actor["profile_id"])
    await audit(conn, actor["profile_id"], "create", "sermon", row["id"])
    return {"id": row["id"]}


@router.patch("/sermons/{sermon_id}")
async def update_sermon(sermon_id: UUID, payload: SermonUpdate, conn: DbConn, actor=CONTENT):
    data = payload.model_dump(exclude_none=True)
    if not data:
        return {"detail": "nothing to update"}
    updates, params = [], []

    def p(v):
        params.append(v)
        return f"${len(params)}"

    for field, val in data.items():
        updates.append(f"{field}={p(val)}")
    updates.append(f"updated_at={p(datetime.now(timezone.utc))}")
    params.append(sermon_id)
    await conn.execute(
        f"update sermons set {','.join(updates)} where id=${len(params)}", *params)
    await audit(conn, actor["profile_id"], "update", "sermon", sermon_id)
    return {"detail": "updated"}


@router.delete("/sermons/{sermon_id}")
async def archive_sermon(sermon_id: UUID, conn: DbConn, actor=CONTENT):
    await conn.execute(
        "update sermons set publication_status='archived',updated_at=now() where id=$1", sermon_id)
    await audit(conn, actor["profile_id"], "archive", "sermon", sermon_id)
    return {"detail": "archived"}


# ════════════════════════════════════════════════════════════════
#  ANNOUNCEMENTS
# ════════════════════════════════════════════════════════════════

@router.get("/announcements")
async def admin_list_announcements(conn: DbConn, actor=CONTENT):
    rows = await conn.fetch("""
        select id,title,body,target_audience,status,published_at,expires_at,created_at
        from announcements order by created_at desc""")
    return [dict(r) for r in rows]


@router.post("/announcements", status_code=201)
async def create_announcement(payload: AnnouncementCreate, conn: DbConn, actor=CONTENT):
    published_at = datetime.now(timezone.utc) if payload.status == "published" else None
    row = await conn.fetchrow("""
        insert into announcements
          (title,body,target_audience,department_id,image_path,expires_at,status,published_at,created_by)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id""",
        payload.title, payload.body, payload.target_audience,
        payload.department_id, payload.image_path, payload.expires_at,
        payload.status, published_at, actor["profile_id"])
    await audit(conn, actor["profile_id"], "create", "announcement", row["id"])
    return {"id": row["id"]}


@router.patch("/announcements/{ann_id}")
async def update_announcement(ann_id: UUID, payload: AnnouncementUpdate, conn: DbConn, actor=CONTENT):
    data = payload.model_dump(exclude_none=True)
    if not data:
        return {"detail": "nothing to update"}
    updates, params = [], []

    def p(v):
        params.append(v)
        return f"${len(params)}"

    for field, val in data.items():
        updates.append(f"{field}={p(val)}")
    if data.get("status") == "published":
        updates.append(f"published_at={p(datetime.now(timezone.utc))}")
    updates.append(f"updated_at={p(datetime.now(timezone.utc))}")
    params.append(ann_id)
    await conn.execute(
        f"update announcements set {','.join(updates)} where id=${len(params)}", *params)
    await audit(conn, actor["profile_id"], "update", "announcement", ann_id)
    return {"detail": "updated"}


# ════════════════════════════════════════════════════════════════
#  GALLERY
# ════════════════════════════════════════════════════════════════

@router.get("/gallery")
async def admin_list_albums(conn: DbConn, actor=CONTENT):
    rows = await conn.fetch("""
        select ga.id,ga.title,ga.description,ga.album_date,ga.cover_image_path,
               ga.visibility, count(gm.id)::int as media_count
        from gallery_albums ga
        left join gallery_media gm on gm.album_id=ga.id
        group by ga.id order by ga.album_date desc""")
    return [dict(r) for r in rows]


@router.post("/gallery/albums", status_code=201)
async def create_album(payload: AlbumCreate, conn: DbConn, actor=CONTENT):
    row = await conn.fetchrow("""
        insert into gallery_albums
          (title,description,activity_occurrence_id,album_date,visibility,created_by)
        values ($1,$2,$3,$4,$5,$6) returning id""",
        payload.title, payload.description, payload.activity_occurrence_id,
        payload.album_date, payload.visibility, actor["profile_id"])
    await audit(conn, actor["profile_id"], "create", "gallery_album", row["id"])
    return {"id": row["id"]}


@router.post("/gallery/albums/{album_id}/media", status_code=201)
async def add_media(album_id: UUID, file_path: str, conn: DbConn, actor=CONTENT,
                    media_type: str = "image", caption: str | None = None):
    row = await conn.fetchrow("""
        insert into gallery_media (album_id,file_path,media_type,caption,created_by)
        values ($1,$2,$3,$4,$5) returning id""",
        album_id, file_path, media_type, caption, actor["profile_id"])
    return {"id": row["id"]}


@router.post("/gallery/media/{media_id}/tag-member", status_code=201)
async def tag_member(media_id: UUID, member_id: UUID, conn: DbConn, actor=CONTENT):
    await conn.execute("""
        insert into media_member_tags (media_id,member_id,tagged_by)
        values ($1,$2,$3) on conflict do nothing""",
        media_id, member_id, actor["profile_id"])
    return {"detail": "tagged"}


# ════════════════════════════════════════════════════════════════
#  VISITORS
# ════════════════════════════════════════════════════════════════

@router.get("/visitors")
async def admin_list_visitors(conn: DbConn, actor=MEMBERS_R,
                               status: str | None = None, limit: int = 50, offset: int = 0):
    if status:
        rows = await conn.fetch("""
            select id,name,email,phone,visit_date,service_attended,
                   follow_up_permission,follow_up_status,created_at
            from visitors where follow_up_status=$1
            order by created_at desc limit $2 offset $3""", status, limit, offset)
    else:
        rows = await conn.fetch("""
            select id,name,email,phone,visit_date,service_attended,
                   follow_up_permission,follow_up_status,created_at
            from visitors order by created_at desc limit $1 offset $2""", limit, offset)
    return [dict(r) for r in rows]


@router.patch("/visitors/{visitor_id}/status")
async def update_visitor_status(visitor_id: UUID, follow_up_status: str, conn: DbConn,
                                 actor=MEMBERS_R, assigned_to: UUID | None = None):
    await conn.execute("""
        update visitors set follow_up_status=$1, assigned_to=$2, updated_at=now()
        where id=$3""", follow_up_status, assigned_to, visitor_id)
    await audit(conn, actor["profile_id"], "update_visitor_status", "visitor",
                visitor_id, {"status": follow_up_status})
    return {"detail": "updated"}


# ════════════════════════════════════════════════════════════════
#  DEPARTMENTS
# ════════════════════════════════════════════════════════════════

@router.get("/departments")
async def admin_list_departments(conn: DbConn, actor=MEMBERS_R):
    rows = await conn.fetch("""
        select d.id,d.name,d.description,d.status,d.meeting_schedule,
               lm.preferred_display_name as leader_name,
               count(md.id)::int as member_count
        from departments d
        left join members lm on lm.id=d.leader_member_id
        left join member_departments md on md.department_id=d.id and md.status='active'
        group by d.id, lm.preferred_display_name
        order by d.name""")
    return [dict(r) for r in rows]


@router.post("/departments", status_code=201)
async def create_department(name: str, conn: DbConn, actor=MEMBERS_R,
                             description: str | None = None,
                             meeting_schedule: str | None = None):
    row = await conn.fetchrow("""
        insert into departments (name,description,meeting_schedule)
        values ($1,$2,$3) returning id""", name, description, meeting_schedule)
    await audit(conn, actor["profile_id"], "create", "department", row["id"])
    return {"id": row["id"]}


@router.patch("/departments/{dept_id}")
async def update_department(dept_id: UUID, conn: DbConn, actor=MEMBERS_R,
                             name: str | None = None, description: str | None = None,
                             leader_member_id: UUID | None = None,
                             meeting_schedule: str | None = None,
                             status: str | None = None):
    mapping = {"name": name, "description": description, "leader_member_id": leader_member_id,
                "meeting_schedule": meeting_schedule, "status": status}
    updates, params = [], []

    def p(v):
        params.append(v)
        return f"${len(params)}"

    for field, val in mapping.items():
        if val is not None:
            updates.append(f"{field}={p(val)}")
    if not updates:
        return {"detail": "nothing to update"}
    params.append(dept_id)
    await conn.execute(
        f"update departments set {','.join(updates)} where id=${len(params)}", *params)
    await audit(conn, actor["profile_id"], "update", "department", dept_id)
    return {"detail": "updated"}


# ════════════════════════════════════════════════════════════════
#  OVERVIEW (used by admin page)
# ════════════════════════════════════════════════════════════════

@router.get("/overview")
async def admin_overview(conn: DbConn, actor=MEMBERS_R):
    total_members = await conn.fetchval(
        "select count(*) from members where membership_status='active'")
    pending_regs = await conn.fetchval(
        "select count(*) from member_registration_requests where status='pending'")
    pending_photos = await conn.fetchval(
        "select count(*) from member_photo_submissions where status='pending'")
    upcoming = await conn.fetchval("""
        select count(*) from activity_occurrences
        where occurrence_status='published' and start_at >= now()""")
    from app.services.settings import get_settings
    from app.services.birthdays import get_today_celebrants
    s = await get_settings(conn)
    today_bdays = await get_today_celebrants(conn, s)
    return {
        "total_active_members": total_members,
        "pending_registrations": pending_regs,
        "pending_photos": pending_photos,
        "upcoming_activities": upcoming,
        "today_birthday_count": len(today_bdays),
    }
