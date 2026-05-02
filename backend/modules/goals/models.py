from sqlalchemy import Column, String, DateTime, ForeignKey, Index, UniqueConstraint, func
from database import Base
from modules.utils import generate_uuid


class Goal(Base):
    __tablename__ = "goals"
    __table_args__ = (
        Index("idx_goals_user_id", "user_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    target_date = Column(String, nullable=True, default=None)
    color = Column(String, default="#4A90D9")
    deleted_at = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class GoalTaskLink(Base):
    __tablename__ = "goal_task_links"
    __table_args__ = (
        UniqueConstraint("goal_id", "task_id"),
        Index("idx_goal_task_links_goal_id", "goal_id"),
        Index("idx_goal_task_links_task_id", "task_id"),
        Index("idx_goal_task_links_user_id", "user_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    goal_id = Column(String, ForeignKey("goals.id"), nullable=False)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
