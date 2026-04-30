from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: Literal["todo", "in_progress", "done"] = "todo"
    priority: Literal["low", "medium", "high", "urgent"] = "medium"
    due_date: str | None = None
    category_id: str | None = None
    recurrence_rule: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: Literal["todo", "in_progress", "done"] | None = None
    priority: Literal["low", "medium", "high", "urgent"] | None = None
    due_date: str | None = None
    category_id: str | None = None
    recurrence_rule: str | None = None
    completed_at: str | None = None


class TaskOut(BaseModel):
    id: str
    title: str
    description: str
    status: str
    priority: str
    due_date: str | None = None
    category_id: str | None = None
    recurrence_rule: str | None = None
    completed_at: str | None = None
    deleted_at: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
