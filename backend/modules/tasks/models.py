from sqlalchemy import Column, String, Boolean, DateTime, func
from database import Base
from modules.utils import generate_uuid


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    status = Column(String, nullable=False, default="todo")
    priority = Column(String, nullable=False, default="medium")
    due_date = Column(String, nullable=True, default=None)
    category_id = Column(String, nullable=True, default=None)
    recurrence_rule = Column(String, nullable=True, default=None)
    completed_at = Column(String, nullable=True, default=None)
    deleted_at = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
