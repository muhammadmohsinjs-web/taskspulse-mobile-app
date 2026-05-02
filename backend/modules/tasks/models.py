from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Index, func
from database import Base
from modules.utils import generate_uuid


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        Index("idx_tasks_user_id", "user_id"),
        Index("idx_tasks_category_id", "category_id"),
        Index("idx_tasks_status", "status"),
        Index("idx_tasks_due_date", "due_date"),
        Index("idx_tasks_deleted_at", "deleted_at"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    status = Column(String, nullable=False, default="todo")
    priority = Column(String, nullable=False, default="medium")
    due_date = Column(String, nullable=True, default=None)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True, default=None)
    recurrence_rule = Column(String, nullable=True, default=None)
    completed_at = Column(String, nullable=True, default=None)
    deleted_at = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
