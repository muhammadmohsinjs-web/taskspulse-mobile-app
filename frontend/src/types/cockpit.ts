import { validateStatus, validatePriority } from "./task";

export interface CockpitHabit {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  recurrenceRule: string;
  color: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  completedToday: boolean;
}

export interface CockpitTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  categoryId: string | null;
  completedAt: string | null;
}

export interface GlobalStreak {
  totalHabits: number;
  completedToday: number;
  streakActive: boolean;
  completionRate: number;
}

export interface DailyCockpit {
  date: string;
  habits: CockpitHabit[];
  tasks: CockpitTask[];
  globalStreak: GlobalStreak;
}

export interface CockpitRaw {
  date: string;
  habits: CockpitHabitRaw[];
  tasks: CockpitTaskRaw[];
  global_streak: GlobalStreakRaw;
}

export interface CockpitHabitRaw {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  recurrence_rule: string;
  color: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  completed_today: boolean;
}

export interface CockpitTaskRaw {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  category_id: string | null;
  completed_at: string | null;
}

export interface GlobalStreakRaw {
  total_habits: number;
  completed_today: number;
  streak_active: boolean;
  completion_rate: number;
}

export function mapCockpit(raw: CockpitRaw): DailyCockpit {
  return {
    date: raw.date,
    habits: raw.habits.map((h) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      categoryId: h.category_id,
      recurrenceRule: h.recurrence_rule,
      color: h.color,
      currentStreak: h.current_streak,
      longestStreak: h.longest_streak,
      lastCompletedDate: h.last_completed_date,
      completedToday: h.completed_today,
    })),
    tasks: raw.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: validateStatus(t.status),
      priority: validatePriority(t.priority),
      dueDate: t.due_date,
      categoryId: t.category_id,
      completedAt: t.completed_at,
    })),
    globalStreak: {
      totalHabits: raw.global_streak.total_habits,
      completedToday: raw.global_streak.completed_today,
      streakActive: raw.global_streak.streak_active,
      completionRate: raw.global_streak.completion_rate,
    },
  };
}
