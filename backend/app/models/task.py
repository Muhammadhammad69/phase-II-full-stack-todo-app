import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel


class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


def get_utc_now():
    """Helper function to get current UTC time in a consistent way."""
    # Return naive datetime in UTC for database compatibility
    return datetime.now(timezone.utc).replace(tzinfo=None)


def convert_datetime_for_db(dt: Optional[datetime]) -> Optional[datetime]:
    """Convert timezone-aware datetime to naive datetime in UTC for database storage."""
    if dt is None:
        return None

    if dt.tzinfo is not None:
        # Convert to naive datetime by removing timezone info (assuming it's already UTC)
        return dt.astimezone(timezone.utc).replace(tzinfo=None)

    return dt


class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_email: str = Field(foreign_key="users.email")
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None)
    priority: PriorityEnum = Field(default=PriorityEnum.medium)
    is_completed: bool = Field(default=False)
    due_date: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    created_at: Optional[datetime] = Field(default_factory=get_utc_now)
    updated_at: Optional[datetime] = Field(default_factory=get_utc_now)

    # Relationship to User
    user: Optional["User"] = Relationship(back_populates="tasks")


# Add relationship to User model (back_populates)
if TYPE_CHECKING:
    from app.models.user import User
