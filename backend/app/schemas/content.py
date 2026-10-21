from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


# ── Monthly Word & Prayer ────────────────────────────────────

class MonthlyWordPublic(BaseModel):
    id: UUID
    month: int
    year: int
    title: str
    pastor_name: str | None = None
    video_url: str | None = None
    thumbnail_path: str | None = None
    message_description: str | None = None
    prayer_focus: str | None = None
    scripture_reference: str | None = None
    prayer_points: list[str] = []
    published_at: datetime | None = None


class MonthlyWordCreate(BaseModel):
    month: int
    year: int
    title: str
    pastor_name: str | None = None
    video_url: str | None = None
    thumbnail_path: str | None = None
    message_description: str | None = None
    prayer_focus: str | None = None
    scripture_reference: str | None = None
    prayer_points: list[str] = []
    publication_status: str = "draft"


class MonthlyWordUpdate(BaseModel):
    title: str | None = None
    pastor_name: str | None = None
    video_url: str | None = None
    thumbnail_path: str | None = None
    message_description: str | None = None
    prayer_focus: str | None = None
    scripture_reference: str | None = None
    prayer_points: list[str] | None = None
    publication_status: str | None = None


# ── Sermons ──────────────────────────────────────────────────

class SermonPublic(BaseModel):
    id: UUID
    title: str
    preacher_name: str | None = None
    sermon_date: date | None = None
    scripture_reference: str | None = None
    category: str | None = None
    description: str | None = None
    video_url: str | None = None
    audio_url: str | None = None
    thumbnail_path: str | None = None


class SermonCreate(BaseModel):
    title: str
    preacher_name: str | None = None
    sermon_date: date | None = None
    scripture_reference: str | None = None
    category: str | None = None
    description: str | None = None
    video_url: str | None = None
    audio_url: str | None = None
    thumbnail_path: str | None = None
    publication_status: str = "draft"


class SermonUpdate(BaseModel):
    title: str | None = None
    preacher_name: str | None = None
    sermon_date: date | None = None
    scripture_reference: str | None = None
    category: str | None = None
    description: str | None = None
    video_url: str | None = None
    audio_url: str | None = None
    thumbnail_path: str | None = None
    publication_status: str | None = None


# ── Announcements ────────────────────────────────────────────

class AnnouncementPublic(BaseModel):
    id: UUID
    title: str
    body: str
    image_path: str | None = None
    published_at: datetime | None = None
    expires_at: datetime | None = None


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    target_audience: str = "public"
    department_id: UUID | None = None
    image_path: str | None = None
    expires_at: datetime | None = None
    status: str = "draft"


class AnnouncementUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    target_audience: str | None = None
    department_id: UUID | None = None
    image_path: str | None = None
    expires_at: datetime | None = None
    status: str | None = None


# ── Gallery ──────────────────────────────────────────────────

class AlbumPublic(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    album_date: date | None = None
    cover_image_path: str | None = None
    media_count: int = 0


class AlbumCreate(BaseModel):
    title: str
    description: str | None = None
    activity_occurrence_id: UUID | None = None
    album_date: date | None = None
    visibility: str = "public"


class MediaItem(BaseModel):
    id: UUID
    file_path: str
    media_type: str
    caption: str | None = None
    display_order: int


# ── Visitors ─────────────────────────────────────────────────

class VisitorSubmit(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    service_attended: str | None = None
    message: str | None = None
    follow_up_permission: bool = False


class VisitorAdmin(VisitorSubmit):
    id: UUID
    visit_date: date
    follow_up_status: str
    created_at: datetime