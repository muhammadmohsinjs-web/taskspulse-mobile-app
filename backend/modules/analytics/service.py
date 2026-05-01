from datetime import date, datetime, timedelta, timezone
from collections import defaultdict
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from modules.habits.models import Habit, HabitLog, HabitStreak
from modules.tasks.models import Task
from modules.goals.models import Goal, GoalTaskLink
from modules.categories.models import Category
from modules.analytics.schemas import (
    StreakInfo,
    GoalProgress,
    TaskTrends,
    HabitBar,
    CategoryDistribution,
    AnalyticsSummaryOut,
    HeatmapDay,
    HeatmapOut,
)


def _days_ago(n: int) -> date:
    return date.today() - timedelta(days=n)


def _iso(d: date) -> str:
    return d.isoformat()


def _day_label(d: date) -> str:
    return d.strftime("%a")


def _compute_level(count: int, max_count: int) -> int:
    if max_count == 0 or count == 0:
        return 0
    ratio = count / max_count
    if ratio <= 0.25:
        return 1
    if ratio <= 0.5:
        return 2
    if ratio <= 0.75:
        return 3
    return 4


def get_analytics_summary(db: Session) -> AnalyticsSummaryOut:
    today = date.today()

    # --- Habit completion rate (last 7 days) ---
    habits_active = db.query(Habit).filter(Habit.deleted_at.is_(None)).all()
    habit_ids = [h.id for h in habits_active]

    habit_bars: list[HabitBar] = []
    for i in range(7):
        d = _days_ago(6 - i)
        if habit_ids:
            daily_count = (
                db.query(func.count(HabitLog.id))
                .filter(
                    HabitLog.habit_id.in_(habit_ids),
                    HabitLog.completed_date == _iso(d),
                )
                .scalar()
                or 0
            )
            rate = round((daily_count / len(habit_ids)) * 100, 1)
        else:
            daily_count = 0
            rate = 0.0
        habit_bars.append(
            HabitBar(
                date=_iso(d),
                label=_day_label(d),
                completion_rate=rate,
                completed=daily_count,
                total=len(habit_ids),
            )
        )

    # 7-day average
    avg_rate = round(sum(b.completion_rate for b in habit_bars) / 7, 1) if habit_bars else 0.0

    # --- Top streaks ---
    streaks = (
        db.query(HabitStreak)
        .filter(HabitStreak.habit_id.in_(habit_ids))
        .order_by(HabitStreak.current_streak.desc())
        .limit(5)
        .all()
    )
    habit_map = {h.id: h for h in habits_active}
    top_streaks = [
        StreakInfo(
            habit_id=s.habit_id,
            habit_title=habit_map[s.habit_id].title,
            color=habit_map[s.habit_id].color,
            current_streak=s.current_streak,
            longest_streak=s.longest_streak,
        )
        for s in streaks
    ]

    # --- Goal progress ---
    goals = db.query(Goal).filter(Goal.deleted_at.is_(None)).all()
    goal_progress_list: list[GoalProgress] = []
    for g in goals:
        links = db.query(GoalTaskLink).filter(GoalTaskLink.goal_id == g.id).all()
        if not links:
            continue
        task_ids = [l.task_id for l in links]
        total_tasks = len(task_ids)
        completed_tasks = (
            db.query(func.count(Task.id))
            .filter(Task.id.in_(task_ids), Task.status == "done", Task.deleted_at.is_(None))
            .scalar()
            or 0
        )
        progress = round((completed_tasks / total_tasks) * 100, 1) if total_tasks > 0 else 0.0
        goal_progress_list.append(
            GoalProgress(
                goal_id=g.id,
                goal_title=g.title,
                color=g.color,
                progress=progress,
                total_tasks=total_tasks,
                completed_tasks=completed_tasks,
            )
        )

    # --- Task trends (30 days) ---
    # NOTE: func.date() delegates to SQLite's date() function, which extracts
    # "YYYY-MM-DD" from stored timestamps.  This is the correct SQLite idiom.
    # .cast(Date) would emit CAST(... AS DATE) which is a no-op in SQLite
    # (SQLite has no native DATE type) and would silently break comparisons.
    # Both func.now() (server_default on created_at) and Python date.today()
    # use local machine time, so dates remain consistent on single-machine deploys.
    # If migrating to PostgreSQL, replace func.date() with cast(col, Date).
    daily_created: list[int] = []
    daily_completed: list[int] = []
    total_created_30 = 0
    total_completed_30 = 0

    for i in range(30):
        d = _days_ago(29 - i)
        d_iso = _iso(d)
        created_count = (
            db.query(func.count(Task.id))
            .filter(
                Task.deleted_at.is_(None),
                func.date(Task.created_at) == d_iso,
            )
            .scalar()
            or 0
        )
        completed_count = (
            db.query(func.count(Task.id))
            .filter(
                Task.deleted_at.is_(None),
                Task.status == "done",
                Task.completed_at.like(f"{d_iso}%"),
            )
            .scalar()
            or 0
        )
        daily_created.append(created_count)
        daily_completed.append(completed_count)
        total_created_30 += created_count
        total_completed_30 += completed_count

    completion_rate = (
        round((total_completed_30 / total_created_30) * 100, 1) if total_created_30 > 0 else 0.0
    )
    avg_per_day = round(total_created_30 / 30, 1) if total_created_30 > 0 else 0.0

    task_trends = TaskTrends(
        last_30_days_created=total_created_30,
        last_30_days_completed=total_completed_30,
        completion_rate=completion_rate,
        avg_tasks_per_day=avg_per_day,
        daily_created=daily_created,
        daily_completed=daily_completed,
    )

    # --- Category distribution ---
    categories = db.query(Category).filter(Category.deleted_at.is_(None)).all()
    cat_dist: list[CategoryDistribution] = []
    for c in categories:
        task_count = (
            db.query(func.count(Task.id))
            .filter(Task.category_id == c.id, Task.deleted_at.is_(None))
            .scalar()
            or 0
        )
        habit_count = (
            db.query(func.count(Habit.id))
            .filter(Habit.category_id == c.id, Habit.deleted_at.is_(None))
            .scalar()
            or 0
        )
        if task_count > 0 or habit_count > 0:
            cat_dist.append(
                CategoryDistribution(
                    category_name=c.name,
                    color=c.color,
                    task_count=task_count,
                    habit_count=habit_count,
                )
            )

    return AnalyticsSummaryOut(
        habit_completion_rate_7d=avg_rate,
        total_habits=len(habit_ids),
        habit_bars=habit_bars,
        top_streaks=top_streaks,
        goal_progress=goal_progress_list,
        task_trends=task_trends,
        category_distribution=cat_dist,
    )


def get_heatmap(db: Session, months: int = 3) -> HeatmapOut:
    today = date.today()
    start_date = today - timedelta(days=months * 30)

    days: list[HeatmapDay] = []
    max_count = 0

    # Preload all habit logs and task completions in range
    habit_logs = (
        db.query(HabitLog.completed_date, func.count(HabitLog.id))
        .filter(HabitLog.completed_date >= _iso(start_date))
        .group_by(HabitLog.completed_date)
        .all()
    )
    habit_log_map = {row[0]: row[1] for row in habit_logs}

    task_completions = (
        db.query(func.substr(Task.completed_at, 1, 10), func.count(Task.id))
        .filter(
            Task.deleted_at.is_(None),
            Task.status == "done",
            Task.completed_at >= _iso(start_date),
        )
        .group_by(func.substr(Task.completed_at, 1, 10))
        .all()
    )
    task_comp_map = {row[0]: row[1] for row in task_completions}

    # See note above about func.date() and SQLite date extraction.
    task_created = (
        db.query(func.date(Task.created_at), func.count(Task.id))
        .filter(
            Task.deleted_at.is_(None),
            func.date(Task.created_at) >= _iso(start_date),
        )
        .group_by(func.date(Task.created_at))
        .all()
    )
    task_created_map = {row[0]: row[1] for row in task_created}

    current = start_date
    while current <= today:
        d_iso = _iso(current)
        count = (
            habit_log_map.get(d_iso, 0)
            + task_comp_map.get(d_iso, 0)
            + task_created_map.get(d_iso, 0)
        )
        if count > max_count:
            max_count = count
        days.append(HeatmapDay(date=d_iso, count=count, level=0))
        current += timedelta(days=1)

    # Set levels after we know max_count
    for d in days:
        d.level = _compute_level(d.count, max_count)

    return HeatmapOut(days=days, max_count=max_count)
