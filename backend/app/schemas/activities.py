from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class OccurrencePublic(BaseModel):
    id: UUID
    activity_id: UUID
    title: str | None = None
    activity_title: str
    category: str | None = None
    start_at: datetime
    end_at: datetime | None = None
    venue: str | None = None
    description: str | None = None
    cover_image_path: str | None = None
    occurrence_status: str
    registration_required: bool
    registration_deadline: datetime | None = None
    department: str | None = None


class OccurrenceDetail(OccurrencePublic):
    report_summary: str | None = None
    attendance_total: int | None = None


class ActivityCreate(BaseModel):
    title: str
    category_id: UUID | None = None
    description: str | None = None
    organizing_department_id: UUID | None = None
    recurrence_rule: str | None = None
    default_venue: str | None = None
    visibility: str = "public"


class OccurrenceCreate(BaseModel):
    activity_id: UUID
    title: str | None = None
    start_at: datetime
    end_at: datetime | None = None
    venue: str | None = None
    description: str | None = None
    occurrence_status: str = "scheduled"
    registration_required: bool = False
    registration_deadline: datetime | None = None


class OccurrenceUpdate(BaseModel):
    title: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    venue: str | None = None
    description: str | None = None
    occurrence_status: str | None = None
    registration_required: bool | None = None
    registration_deadline: datetime | None = None


class ReportCreate(BaseModel):
    report_summary: str | None = None
    attendance_total: int | None = None
    outcomes: str | None = None
    challenges: str | None = None
    follow_up_actions: str | None = None


class CategoryOut(BaseModel):
    id: UUID
    name: str
    description: str | None = None