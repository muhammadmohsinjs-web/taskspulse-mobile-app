import { validateStatus, validatePriority } from "./task";

export interface PlanningTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  categoryId: string | null;
  completedAt: string | null;
}

export interface PlanningTaskRaw {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  category_id: string | null;
  completed_at: string | null;
}

export interface WeekDay {
  date: string;
  dayName: string;
  tasks: PlanningTask[];
  taskCount: number;
  capacityPct: number;
  overloaded: boolean;
}

export interface WeekDayRaw {
  date: string;
  day_name: string;
  tasks: PlanningTaskRaw[];
  task_count: number;
  capacity_pct: number;
  overloaded: boolean;
}

export interface WeekView {
  weekLabel: string;
  weekStart: string;
  days: WeekDay[];
  totalTasks: number;
  avgTasksPerDay: number;
}

export interface WeekViewRaw {
  week_label: string;
  week_start: string;
  days: WeekDayRaw[];
  total_tasks: number;
  avg_tasks_per_day: number;
}

export interface FocusTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  categoryId: string | null;
  isOverdue: boolean;
  isUnscheduled: boolean;
}

export interface FocusTaskRaw {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  category_id: string | null;
  is_overdue: boolean;
  is_unscheduled: boolean;
}

export interface FocusQueue {
  overdue: FocusTask[];
  unscheduled: FocusTask[];
  highPriority: FocusTask[];
  totalPending: number;
}

export interface FocusQueueRaw {
  overdue: FocusTaskRaw[];
  unscheduled: FocusTaskRaw[];
  high_priority: FocusTaskRaw[];
  total_pending: number;
}

export interface AutoBalanceRequest {
  weekStartDate: string;
  maxTasksPerDay: number;
}

export interface AutoBalanceResponse {
  balanced: boolean;
  movedCount: number;
  weekDays: WeekDay[];
}

export interface CarryForwardRequest {
  targetWeekStart: string;
}

export interface CarryForwardResponse {
  movedCount: number;
  tasks: PlanningTask[];
}

function mapPlanningTask(raw: PlanningTaskRaw): PlanningTask {
  return {
    id: raw.id,
    title: raw.title,
    status: validateStatus(raw.status),
    priority: validatePriority(raw.priority),
    dueDate: raw.due_date,
    categoryId: raw.category_id,
    completedAt: raw.completed_at,
  };
}

function mapWeekDay(raw: WeekDayRaw): WeekDay {
  return {
    date: raw.date,
    dayName: raw.day_name,
    tasks: raw.tasks.map(mapPlanningTask),
    taskCount: raw.task_count,
    capacityPct: raw.capacity_pct,
    overloaded: raw.overloaded,
  };
}

function mapFocusTask(raw: FocusTaskRaw): FocusTask {
  return {
    id: raw.id,
    title: raw.title,
    status: raw.status,
    priority: raw.priority,
    dueDate: raw.due_date,
    categoryId: raw.category_id,
    isOverdue: raw.is_overdue,
    isUnscheduled: raw.is_unscheduled,
  };
}

export function mapWeekView(raw: WeekViewRaw): WeekView {
  return {
    weekLabel: raw.week_label,
    weekStart: raw.week_start,
    days: raw.days.map(mapWeekDay),
    totalTasks: raw.total_tasks,
    avgTasksPerDay: raw.avg_tasks_per_day,
  };
}

export function mapFocusQueue(raw: FocusQueueRaw): FocusQueue {
  return {
    overdue: raw.overdue.map(mapFocusTask),
    unscheduled: raw.unscheduled.map(mapFocusTask),
    highPriority: raw.high_priority.map(mapFocusTask),
    totalPending: raw.total_pending,
  };
}
