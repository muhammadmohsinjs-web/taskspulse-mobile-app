from pydantic import BaseModel


class StreakInfo(BaseModel):
    habit_id: str
    habit_title: str
    color: str
    current_streak: int
    longest_streak: int


class GoalProgress(BaseModel):
    goal_id: str
    goal_title: str
    color: str
    progress: float
    total_tasks: int
    completed_tasks: int


class TaskTrends(BaseModel):
    last_30_days_created: int
    last_30_days_completed: int
    completion_rate: float
    avg_tasks_per_day: float
    daily_created: list[int]
    daily_completed: list[int]


class HabitBar(BaseModel):
    date: str
    label: str
    completion_rate: float
    completed: int
    total: int


class CategoryDistribution(BaseModel):
    category_name: str
    color: str
    task_count: int
    habit_count: int


class AnalyticsSummaryOut(BaseModel):
    habit_completion_rate_7d: float
    total_habits: int
    habit_bars: list[HabitBar]
    top_streaks: list[StreakInfo]
    goal_progress: list[GoalProgress]
    task_trends: TaskTrends
    category_distribution: list[CategoryDistribution]


class HeatmapDay(BaseModel):
    date: str
    count: int
    level: int


class HeatmapOut(BaseModel):
    days: list[HeatmapDay]
    max_count: int
