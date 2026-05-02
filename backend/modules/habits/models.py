from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index, func, UniqueConstraint
from database import Base
from modules.utils import generate_uuid


class Habit(Base):
    __tablename__ = "habits"
    __table_args__ = (
        Index("idx_habits_user_id", "user_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    category_id = Column(String, ForeignKey("categories.id"), nullable=True, default=None)
    recurrence_rule = Column(String, nullable=False, default='{"type":"daily"}')
    color = Column(String, default="#4A90D9")
    deleted_at = Column(String, nullable=True, default=None)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class HabitLog(Base):
    __tablename__ = "habit_logs"
    __table_args__ = (
        UniqueConstraint("habit_id", "completed_date"),
        Index("idx_habit_logs_habit_id", "habit_id"),
        Index("idx_habit_logs_date", "completed_date"),
        Index("idx_habit_logs_user_id", "user_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False)
    completed_date = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class HabitStreak(Base):
    __tablename__ = "habit_streaks"
    __table_args__ = (
        Index("idx_habit_streaks_user_id", "user_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    habit_id = Column(String, ForeignKey("habits.id"), nullable=False, unique=True)
    current_streak = Column(Integer, nullable=False, default=0)
    longest_streak = Column(Integer, nullable=False, default=0)
    last_completed_date = Column(String, nullable=True, default=None)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
