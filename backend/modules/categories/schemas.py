from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    color: str = "#4A90D9"
    icon: str = "folder"
    applies_to: Literal["task", "habit", "both"] = "both"


class CategoryUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    icon: str | None = None
    applies_to: Literal["task", "habit", "both"] | None = None


class CategoryOut(BaseModel):
    id: str
    name: str
    color: str
    icon: str
    applies_to: Literal["task", "habit", "both"]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
