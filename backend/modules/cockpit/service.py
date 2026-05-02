from datetime import date
from sqlalchemy.orm import Session
from modules.habits.models import Habit
from modules.tasks.models import Task
from modules.habits import service as habit_service
from modules.cockpit.schemas import CockpitHabit, CockpitTask, CockpitGlobalStreak, DailyCockpitOut


def get_daily_cockpit(db: Session, user_id: str) -> DailyCockpitOut:
    today = date.today().isoformat()

    # Active habits
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.deleted_at.is_(None)).order_by(Habit.created_at).all()
    habit_ids = [h.id for h in habits]

    # Batch load streaks and completion status
    streaks = habit_service.batch_get_streaks(db, habit_ids, user_id)
    completions = habit_service.batch_is_completed_today(db, habit_ids, user_id)

    cockpit_habits = []
    completed_count = 0
    for h in habits:
        streak = streaks.get(h.id)
        is_completed = completions.get(h.id, False)
        if is_completed:
            completed_count += 1
        cockpit_habits.append(
            CockpitHabit(
                id=h.id,
                title=h.title,
                description=h.description,
                category_id=h.category_id,
                recurrence_rule=h.recurrence_rule,
                color=h.color,
                current_streak=streak.current_streak if streak else 0,
                longest_streak=streak.longest_streak if streak else 0,
                last_completed_date=streak.last_completed_date if streak else None,
                completed_today=is_completed,
            )
        )

    # Today's tasks (due today and not done, or in progress with no due date, not deleted)
    tasks = (
        db.query(Task)
        .filter(
            Task.user_id == user_id,
            Task.deleted_at.is_(None),
            ((Task.due_date == today) & (Task.status.in_(["todo", "in_progress"])))
            | ((Task.due_date.is_(None)) & (Task.status.in_(["todo", "in_progress"]))),
        )
        .order_by(Task.created_at.desc())
        .all()
    )

    cockpit_tasks = [
        CockpitTask(
            id=t.id,
            title=t.title,
            description=t.description,
            status=t.status,
            priority=t.priority,
            due_date=t.due_date,
            category_id=t.category_id,
            completed_at=t.completed_at,
        )
        for t in tasks
    ]

    # Global streak
    total_habits = len(habits)
    completion_rate = (completed_count / total_habits * 100) if total_habits > 0 else 0

    global_streak = CockpitGlobalStreak(
        total_habits=total_habits,
        completed_today=completed_count,
        streak_active=completed_count >= (total_habits * 0.8) if total_habits > 0 else False,
        completion_rate=round(completion_rate, 1),
    )

    return DailyCockpitOut(
        date=today,
        habits=cockpit_habits,
        tasks=cockpit_tasks,
        global_streak=global_streak,
    )
