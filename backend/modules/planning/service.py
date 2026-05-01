from datetime import date, datetime, timezone, timedelta
from sqlalchemy.orm import Session
from modules.tasks.models import Task
from modules.planning.schemas import (
    PlanningTask,
    WeekDay,
    WeekViewOut,
    FocusTask,
    FocusQueueOut,
    AutoBalanceResponse,
    CarryForwardResponse,
)


def _iso(d: date) -> str:
    return d.isoformat()


def _day_name(d: date) -> str:
    return d.strftime("%a")


def _planning_task(task: Task) -> PlanningTask:
    return PlanningTask(
        id=task.id,
        title=task.title,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        category_id=task.category_id,
        completed_at=task.completed_at,
    )


def _week_start_from_date(d: date) -> date:
    return d - timedelta(days=d.weekday())


def _get_tasks_for_day(db: Session, d: date) -> list[Task]:
    d_iso = _iso(d)
    return (
        db.query(Task)
        .filter(
            Task.deleted_at.is_(None),
            Task.due_date == d_iso,
        )
        .all()
    )


def get_week_view(db: Session, date_str: str | None = None) -> WeekViewOut:
    today = date.today()
    target = date.fromisoformat(date_str) if date_str else today
    week_start = _week_start_from_date(target)

    days: list[WeekDay] = []
    total_tasks = 0
    max_tasks = 1

    for i in range(7):
        d = week_start + timedelta(days=i)
        tasks = _get_tasks_for_day(db, d)
        count = len(tasks)
        total_tasks += count
        if count > max_tasks:
            max_tasks = count
        days.append(
            WeekDay(
                date=_iso(d),
                day_name=_day_name(d),
                tasks=[_planning_task(t) for t in tasks],
                task_count=count,
                capacity_pct=0,
                overloaded=False,
            )
        )

    for day_info in days:
        day_info.capacity_pct = round((day_info.task_count / max_tasks) * 100, 1) if max_tasks > 0 else 0.0
        day_info.overloaded = day_info.task_count > 5

    return WeekViewOut(
        week_label=f"{_day_name(week_start)} {week_start.day} – {_day_name(week_start + timedelta(days=6))} {(week_start + timedelta(days=6)).day}",
        week_start=_iso(week_start),
        days=days,
        total_tasks=total_tasks,
        avg_tasks_per_day=round(total_tasks / 7, 1),
    )


def get_focus_queue(db: Session) -> FocusQueueOut:
    today = date.today()
    today_iso = _iso(today)

    all_pending = (
        db.query(Task)
        .filter(
            Task.deleted_at.is_(None),
            Task.status != "done",
        )
        .all()
    )

    priority_order = {"urgent": 0, "high": 1, "medium": 2, "low": 3}

    def _focus_task(task: Task) -> FocusTask:
        is_overdue = task.due_date is not None and task.due_date < today_iso
        is_unscheduled = task.due_date is None
        return FocusTask(
            id=task.id,
            title=task.title,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            category_id=task.category_id,
            is_overdue=is_overdue,
            is_unscheduled=is_unscheduled,
        )

    overdue = sorted(
        [t for t in all_pending if t.due_date and t.due_date < today_iso],
        key=lambda t: (t.due_date or "", priority_order.get(t.priority, 2)),
    )

    unscheduled = sorted(
        [t for t in all_pending if not t.due_date],
        key=lambda t: priority_order.get(t.priority, 2),
    )

    high_priority = sorted(
        [t for t in all_pending if not (t.due_date and t.due_date < today_iso) and t.priority in ("urgent", "high")],
        key=lambda t: priority_order.get(t.priority, 2),
    )

    return FocusQueueOut(
        overdue=[_focus_task(t) for t in overdue],
        unscheduled=[_focus_task(t) for t in unscheduled],
        high_priority=[_focus_task(t) for t in high_priority],
        total_pending=len(all_pending),
    )


def auto_balance(db: Session, week_start_str: str, max_tasks_per_day: int) -> AutoBalanceResponse:
    week_start = date.fromisoformat(week_start_str)
    week_start = _week_start_from_date(week_start)

    moved_count = 0

    for i in range(7):
        current_day = week_start + timedelta(days=i)
        day_tasks = _get_tasks_for_day(db, current_day)

        if len(day_tasks) <= max_tasks_per_day:
            continue

        excess = day_tasks[max_tasks_per_day:]

        for j in range(1, 8):
            target_day = current_day + timedelta(days=j)
            if target_day < current_day:
                target_day = current_day - timedelta(days=j)

            target_tasks = _get_tasks_for_day(db, target_day)
            if len(target_tasks) < max_tasks_per_day:
                for task in excess:
                    if len(_get_tasks_for_day(db, target_day)) >= max_tasks_per_day:
                        break
                    task.due_date = _iso(target_day)
                    moved_count += 1
                    excess = [t for t in excess if t.id != task.id]

    db.commit()

    balanced_days: list[WeekDay] = []
    for i in range(7):
        d = week_start + timedelta(days=i)
        tasks = _get_tasks_for_day(db, d)
        count = len(tasks)
        balanced_days.append(
            WeekDay(
                date=_iso(d),
                day_name=_day_name(d),
                tasks=[_planning_task(t) for t in tasks],
                task_count=count,
                capacity_pct=round((count / max(max_tasks_per_day, 1)) * 100, 1),
                overloaded=count > max_tasks_per_day,
            )
        )

    return AutoBalanceResponse(
        balanced=moved_count > 0,
        moved_count=moved_count,
        week_days=balanced_days,
    )


def carry_forward(db: Session, target_week_start: str) -> CarryForwardResponse:
    today = date.today()
    today_iso = _iso(today)
    target_start = date.fromisoformat(target_week_start)

    overdue = (
        db.query(Task)
        .filter(
            Task.deleted_at.is_(None),
            Task.status != "done",
            Task.due_date.isnot(None),
            Task.due_date < today_iso,
        )
        .order_by(Task.due_date.asc())
        .all()
    )

    moved_count = 0
    moved_tasks: list[Task] = []

    day_offset = 0
    for task in overdue:
        target_day = target_start + timedelta(days=day_offset % 7)
        task.due_date = _iso(target_day)
        moved_count += 1
        moved_tasks.append(task)
        day_offset += 1

    db.commit()

    return CarryForwardResponse(
        moved_count=moved_count,
        tasks=[_planning_task(t) for t in moved_tasks],
    )
