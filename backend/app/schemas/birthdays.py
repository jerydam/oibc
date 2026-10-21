from datetime import date
from uuid import UUID

from pydantic import BaseModel


class Celebrant(BaseModel):
    id: UUID
    display_name: str
    photo_path: str | None = None
    department: str | None = None
    date: date | None = None  # None when the member hides their birthday date
    is_today: bool = False
