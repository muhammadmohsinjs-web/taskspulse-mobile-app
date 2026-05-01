from datetime import date, datetime, timezone, timedelta
from sqlalchemy.orm import Session
from modules.habits.models import Habit, HabitLog, HabitStreak
from modules.habits.schemas import HabitCreate, HabitUpdate, HabitWithStreak


def get_habits(db: Session):
    return db.query(Habit).filter(Habit.deleted_at.is_(None)).order_by(Habit.created_at.desc()).all()


def get_habit(db: Session, habit_id: str):
    return db.query(Habit).filter(Habit.id == habit_id, Habit.deleted_at.is_(None)).first()


def create_habit(db: Session, habit: HabitCreate):
    db_habit = Habit(**habit.model_dump())
    db.add(db_habit)
    db.flush()
    db_streak = HabitStreak(habit_id=db_habit.id)
    db.add(db_streak)
    db.commit()
    db.refresh(db_habit)
    return db_habit


def update_habit(db: Session, habit_id: str, habit: HabitUpdate):
    db_habit = db.query(Habit).filter(Habit.id == habit_id, Habit.deleted_at.is_(None)).first()
    if not db_habit:
        return None
    update_data = habit.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_habit, key, value)
    db.commit()
    db.refresh(db_habit)
    return db_habit


def delete_habit(db: Session, habit_id: str):
    db_habit = db.query(Habit).filter(Habit.id == habit_id, Habit.deleted_at.is_(None)).first()
    if not db_habit:
        return None
    db_habit.deleted_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    return db_habit


def complete_habit(db: Session, habit_id: str, completion_date: str | None = None):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.deleted_at.is_(None)).first()
    if not habit:
        return None

    today_str = date.today().isoformat()
    completed = completion_date or today_str

    if completed > today_str:
        raise ValueError("Cannot complete a habit for a future date")

    existing = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed_date == completed,
    ).first()
    if existing:
        return existing

    log = HabitLog(habit_id=habit_id, completed_date=completed)
    db.add(log)
    try:
        db.commit()
    except Exception:
        db.rollback()
        return None
    db.refresh(log)

    _recalculate_streak(db, habit_id)
    return log


def undo_completion(db: Session, habit_id: str, completion_date: str | None = None):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.deleted_at.is_(None)).first()
    if not habit:
        return None
    completed = completion_date or date.today().isoformat()

    log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed_date == completed,
    ).first()
    if not log:
        return None

    db.delete(log)
    db.commit()

    _recalculate_streak(db, habit_id)
    return log


def get_habit_completions_for_date(db: Session, habit_id: str, target_date: str):
    return db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed_date == target_date,
    ).first()


def batch_get_streaks(db: Session, habit_ids: list[str]) -> dict[str, HabitStreak]:
    streaks = db.query(HabitStreak).filter(HabitStreak.habit_id.in_(habit_ids)).all()
    existing_ids = {s.habit_id for s in streaks}
    result = {s.habit_id: s for s in streaks}
    has_new = False
    new_streaks: list[HabitStreak] = []
    for hid in habit_ids:
        if hid not in existing_ids:
            streak = HabitStreak(habit_id=hid)
            db.add(streak)
            result[hid] = streak
            new_streaks.append(streak)
            has_new = True
    if has_new:
        db.commit()
        for s in new_streaks:
            db.refresh(s)
    return result


def batch_is_completed_today(db: Session, habit_ids: list[str]) -> dict[str, bool]:
    today = date.today().isoformat()
    logs = db.query(HabitLog.habit_id).filter(
        HabitLog.habit_id.in_(habit_ids),
        HabitLog.completed_date == today,
    ).all()
    completed_ids = {row[0] for row in logs}
    return {hid: hid in completed_ids for hid in habit_ids}


def get_streak(db: Session, habit_id: str):
    streak = db.query(HabitStreak).filter(HabitStreak.habit_id == habit_id).first()
    if not streak:
        streak = HabitStreak(habit_id=habit_id)
        db.add(streak)
        db.commit()
        db.refresh(streak)
    return streak


def is_habit_completed_today(db: Session, habit_id: str):
    today = date.today().isoformat()
    log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed_date == today,
    ).first()
    return log is not None


def _recalculate_streak(db: Session, habit_id: str):
    streak = db.query(HabitStreak).filter(HabitStreak.habit_id == habit_id).first()
    if not streak:
        streak = HabitStreak(habit_id=habit_id)
        db.add(streak)
        db.flush()

    logs = (
        db.query(HabitLog.completed_date)
        .filter(HabitLog.habit_id == habit_id)
        .order_by(HabitLog.completed_date.desc())
        .all()
    )

    if not logs:
        streak.current_streak = 0
        streak.longest_streak = 0
        streak.last_completed_date = None
        db.commit()
        return

    dates = sorted(set(row[0] for row in logs), reverse=True)

    today = date.today()
    yesterday = (today - timedelta(days=1)).isoformat()

    current_streak = 0
    expected = today.isoformat()

    for d_str in dates:
        if d_str == expected or (current_streak == 0 and d_str == yesterday):
            current_streak += 1
            expected = (date.fromisoformat(d_str) - timedelta(days=1)).isoformat()
        elif current_streak > 0:
            break

    longest = 1
    temp = 1
    for i in range(1, len(dates)):
        prev = date.fromisoformat(dates[i - 1])
        curr = date.fromisoformat(dates[i])
        if (prev - curr).days == 1:
            temp += 1
            longest = max(longest, temp)
        else:
            temp = 1

    if dates:
        longest = max(longest, temp)

    streak.current_streak = current_streak
    streak.longest_streak = max(streak.longest_streak, longest)
    streak.last_completed_date = dates[0] if dates else None
    db.commit()


def build_habit_with_streak(db: Session, habit: Habit) -> HabitWithStreak:
    streak = get_streak(db, habit.id)
    completed_today = is_habit_completed_today(db, habit.id)
    return HabitWithStreak(
        id=habit.id,
        title=habit.title,
        description=habit.description,
        category_id=habit.category_id,
        recurrence_rule=habit.recurrence_rule,
        color=habit.color,
        deleted_at=habit.deleted_at,
        created_at=habit.created_at,
        updated_at=habit.updated_at,
        current_streak=streak.current_streak,
        longest_streak=streak.longest_streak,
        last_completed_date=streak.last_completed_date,
        completed_today=completed_today,
    )
