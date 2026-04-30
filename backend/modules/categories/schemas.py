from datetime import datetime
from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    color: str = "#4A90D9"
    icon: str = "folder"
    applies_to: str = "both"


class CategoryUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    icon: str | None = None
    applies_to: str | None = None


class CategoryOut(BaseModel):
    id: str
    name: str
    color: str
    icon: str
    applies_to: str
    created_at: datetime

    model_config = {"from_attributes": True}
