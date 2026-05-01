from datetime import datetime
from pydantic import BaseModel


class GoalCreate(BaseModel):
    title: str
    description: str = ""
    target_date: str | None = None
    color: str = "#4A90D9"


class GoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    target_date: str | None = None
    color: str | None = None


class GoalTaskLinkCreate(BaseModel):
    task_id: str


class GoalTaskLinkOut(BaseModel):
    id: str
    goal_id: str
    task_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class GoalOut(BaseModel):
    id: str
    title: str
    description: str
    target_date: str | None = None
    color: str
    deleted_at: str | None = None
    created_at: datetime
    updated_at: datetime
    progress: float = 0.0
    total_tasks: int = 0
    completed_tasks: int = 0
