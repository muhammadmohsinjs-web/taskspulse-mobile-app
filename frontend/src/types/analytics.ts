export interface StreakInfo {
  habitId: string;
  habitTitle: string;
  color: string;
  currentStreak: number;
  longestStreak: number;
}

export interface GoalProgress {
  goalId: string;
  goalTitle: string;
  color: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export interface TaskTrends {
  last30DaysCreated: number;
  last30DaysCompleted: number;
  completionRate: number;
  avgTasksPerDay: number;
  dailyCreated: number[];
  dailyCompleted: number[];
}

export interface HabitBar {
  date: string;
  label: string;
  completionRate: number;
  completed: number;
  total: number;
}

export interface CategoryDistribution {
  categoryName: string;
  color: string;
  taskCount: number;
  habitCount: number;
}

export interface AnalyticsSummary {
  habitCompletionRate7d: number;
  totalHabits: number;
  habitBars: HabitBar[];
  topStreaks: StreakInfo[];
  goalProgress: GoalProgress[];
  taskTrends: TaskTrends;
  categoryDistribution: CategoryDistribution[];
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

export interface HeatmapData {
  days: HeatmapDay[];
  maxCount: number;
}

// Raw (snake_case) types for API mapping
export interface StreakInfoRaw {
  habit_id: string;
  habit_title: string;
  color: string;
  current_streak: number;
  longest_streak: number;
}

export interface GoalProgressRaw {
  goal_id: string;
  goal_title: string;
  color: string;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
}

export interface TaskTrendsRaw {
  last_30_days_created: number;
  last_30_days_completed: number;
  completion_rate: number;
  avg_tasks_per_day: number;
  daily_created: number[];
  daily_completed: number[];
}

export interface HabitBarRaw {
  date: string;
  label: string;
  completion_rate: number;
  completed: number;
  total: number;
}

export interface CategoryDistributionRaw {
  category_name: string;
  color: string;
  task_count: number;
  habit_count: number;
}

export interface AnalyticsSummaryRaw {
  habit_completion_rate_7d: number;
  total_habits: number;
  habit_bars: HabitBarRaw[];
  top_streaks: StreakInfoRaw[];
  goal_progress: GoalProgressRaw[];
  task_trends: TaskTrendsRaw;
  category_distribution: CategoryDistributionRaw[];
}

export interface HeatmapDayRaw {
  date: string;
  count: number;
  level: number;
}

export interface HeatmapDataRaw {
  days: HeatmapDayRaw[];
  max_count: number;
}

export function mapAnalyticsSummary(raw: AnalyticsSummaryRaw): AnalyticsSummary {
  return {
    habitCompletionRate7d: raw.habit_completion_rate_7d,
    totalHabits: raw.total_habits,
    habitBars: raw.habit_bars.map((b) => ({
      date: b.date,
      label: b.label,
      completionRate: b.completion_rate,
      completed: b.completed,
      total: b.total,
    })),
    topStreaks: raw.top_streaks.map((s) => ({
      habitId: s.habit_id,
      habitTitle: s.habit_title,
      color: s.color,
      currentStreak: s.current_streak,
      longestStreak: s.longest_streak,
    })),
    goalProgress: raw.goal_progress.map((g) => ({
      goalId: g.goal_id,
      goalTitle: g.goal_title,
      color: g.color,
      progress: g.progress,
      totalTasks: g.total_tasks,
      completedTasks: g.completed_tasks,
    })),
    taskTrends: {
      last30DaysCreated: raw.task_trends.last_30_days_created,
      last30DaysCompleted: raw.task_trends.last_30_days_completed,
      completionRate: raw.task_trends.completion_rate,
      avgTasksPerDay: raw.task_trends.avg_tasks_per_day,
      dailyCreated: raw.task_trends.daily_created,
      dailyCompleted: raw.task_trends.daily_completed,
    },
    categoryDistribution: raw.category_distribution.map((c) => ({
      categoryName: c.category_name,
      color: c.color,
      taskCount: c.task_count,
      habitCount: c.habit_count,
    })),
  };
}

export function mapHeatmapData(raw: HeatmapDataRaw): HeatmapData {
  return {
    days: raw.days.map((d) => ({
      date: d.date,
      count: d.count,
      level: d.level,
    })),
    maxCount: raw.max_count,
  };
}
