from datetime import date
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

MEMBER_STATUSES = {"pending", "active", "inactive", "transferred", "deceased"}


class RegistrationIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    preferred_display_name: str | None = Field(None, max_length=80)
    date_of_birth: date | None = None
    phone: str | None = Field(None, max_length=30)
    email: EmailStr | None = None
    allow_name: bool = False
    allow_photo: bool = False
    allow_date: bool = False


class MemberCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    preferred_display_name: str | None = None
    date_of_birth: date | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    date_joined: date | None = None
    membership_status: str = "active"


class MemberUpdate(BaseModel):
    full_name: str | None = None
    preferred_display_name: str | None = None
    date_of_birth: date | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    date_joined: date | None = None
    membership_status: str | None = None
    admin_notes: str | None = None


class BirthdayPrefs(BaseModel):
    public_birthday_name_allowed: bool = False
    public_photo_allowed: bool = False
    public_birthday_date_allowed: bool = False
    announcement_design_allowed: bool = False
    gallery_photo_allowed: bool = False
    birthday_contact_preference: str | None = None


class PhotoSubmissionIn(BaseModel):
    file_path: str = Field(min_length=3, max_length=500)


class PhotoReviewIn(BaseModel):
    approve: bool
    notes: str | None = None


class MemberOut(BaseModel):
    id: UUID
    member_number: str
    full_name: str
    preferred_display_name: str | None = None
    membership_status: str
    profile_photo_path: str | None = None
    profile_photo_status: str
    date_joined: date | None = None
    date_of_birth: date | None = None  # only with members:read_sensitive
    phone: str | None = None
    email: str | None = None
