from sqlalchemy import Column, String, DateTime, UniqueConstraint, func
from database import Base
from modules.utils import generate_uuid


class Goal(Base):
    __tablename__ = "goals"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    target_date = Column(String, nullable=True, default=None)
    color = Column(String, default="#4A90D9")
    deleted_at = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class GoalTaskLink(Base):
    __tablename__ = "goal_task_links"

    id = Column(String, primary_key=True, default=generate_uuid)
    goal_id = Column(String, nullable=False)
    task_id = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (UniqueConstraint("goal_id", "task_id"),)
