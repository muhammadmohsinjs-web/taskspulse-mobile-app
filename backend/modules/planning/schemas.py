from pydantic import BaseModel


class PlanningTask(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    due_date: str | None
    category_id: str | None
    completed_at: str | None


class WeekDay(BaseModel):
    date: str
    day_name: str
    tasks: list[PlanningTask]
    task_count: int
    capacity_pct: float
    overloaded: bool


class WeekViewOut(BaseModel):
    week_label: str
    week_start: str
    days: list[WeekDay]
    total_tasks: int
    avg_tasks_per_day: float


class FocusTask(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    due_date: str | None
    category_id: str | None
    is_overdue: bool
    is_unscheduled: bool


class FocusQueueOut(BaseModel):
    overdue: list[FocusTask]
    unscheduled: list[FocusTask]
    high_priority: list[FocusTask]
    total_pending: int


class AutoBalanceRequest(BaseModel):
    week_start_date: str
    max_tasks_per_day: int = 5


class AutoBalanceResponse(BaseModel):
    balanced: bool
    moved_count: int
    week_days: list[WeekDay]


class CarryForwardRequest(BaseModel):
    target_week_start: str


class CarryForwardResponse(BaseModel):
    moved_count: int
    tasks: list[PlanningTask]
