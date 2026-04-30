from datetime import datetime
from pydantic import BaseModel


class CockpitHabit(BaseModel):
    id: str
    title: str
    description: str
    category_id: str | None = None
    recurrence_rule: str
    color: str
    current_streak: int
    longest_streak: int
    last_completed_date: str | None = None
    completed_today: bool


class CockpitTask(BaseModel):
    id: str
    title: str
    description: str
    status: str
    priority: str
    due_date: str | None = None
    category_id: str | None = None
    completed_at: str | None = None


class CockpitGlobalStreak(BaseModel):
    total_habits: int
    completed_today: int
    streak_active: bool
    completion_rate: float


class DailyCockpitOut(BaseModel):
    date: str
    habits: list[CockpitHabit]
    tasks: list[CockpitTask]
    global_streak: CockpitGlobalStreak
