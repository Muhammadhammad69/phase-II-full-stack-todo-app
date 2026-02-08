from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel


def get_utc_now():
    """Helper function to get current UTC time in a consistent way."""
    # Return naive datetime in UTC for database compatibility
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(SQLModel, table=True):
    __tablename__ = "users"

    email: str = Field(default=None, primary_key=True)
    username: str = Field(default=None)
    password: str = Field(default=None)  # Add password field
    created_at: Optional[datetime] = Field(default_factory=get_utc_now)
    updated_at: Optional[datetime] = Field(default_factory=get_utc_now)

    # Relationship to tasks
    tasks: List["Task"] = Relationship(back_populates="user")


# Forward reference for Task model
if TYPE_CHECKING:
    from app.models.task import Task
