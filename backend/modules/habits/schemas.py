import json
from datetime import datetime
from pydantic import BaseModel, field_validator


def _validate_recurrence_json(v: str | None) -> str | None:
    if v is None:
        return v
    try:
        json.loads(v)
    except (json.JSONDecodeError, TypeError):
        raise ValueError("recurrence_rule must be a valid JSON string")
    return v


class HabitCreate(BaseModel):
    title: str
    description: str = ""
    category_id: str | None = None
    recurrence_rule: str = '{"type":"daily"}'
    color: str = "#4A90D9"

    _validate_recurrence = field_validator("recurrence_rule")(_validate_recurrence_json)


class HabitUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category_id: str | None = None
    recurrence_rule: str | None = None
    color: str | None = None

    _validate_recurrence = field_validator("recurrence_rule")(_validate_recurrence_json)


class HabitOut(BaseModel):
    id: str
    title: str
    description: str
    category_id: str | None = None
    recurrence_rule: str
    color: str
    deleted_at: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HabitLogOut(BaseModel):
    id: str
    habit_id: str
    completed_date: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HabitStreakOut(BaseModel):
    id: str
    habit_id: str
    current_streak: int
    longest_streak: int
    last_completed_date: str | None = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class HabitWithStreak(BaseModel):
    id: str
    title: str
    description: str
    category_id: str | None = None
    recurrence_rule: str
    color: str
    deleted_at: str | None = None
    created_at: datetime
    updated_at: datetime
    current_streak: int = 0
    longest_streak: int = 0
    last_completed_date: str | None = None
    completed_today: bool = False
