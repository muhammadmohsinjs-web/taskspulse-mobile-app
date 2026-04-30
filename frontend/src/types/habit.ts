export interface Habit {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  recurrenceRule: string;
  color: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  completedToday: boolean;
}

export interface HabitRaw {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  recurrence_rule: string;
  color: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  completed_today: boolean;
}

export function mapHabit(raw: HabitRaw): Habit {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    categoryId: raw.category_id,
    recurrenceRule: raw.recurrence_rule,
    color: raw.color,
    deletedAt: raw.deleted_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    currentStreak: raw.current_streak,
    longestStreak: raw.longest_streak,
    lastCompletedDate: raw.last_completed_date,
    completedToday: raw.completed_today,
  };
}

export interface HabitCreatePayload {
  title: string;
  description?: string;
  categoryId?: string | null;
  recurrenceRule?: string;
  color?: string;
}

export interface HabitUpdatePayload {
  title?: string;
  description?: string;
  categoryId?: string | null;
  recurrenceRule?: string;
  color?: string;
}

export interface HabitStreak {
  id: string;
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  updatedAt: string;
}

export interface HabitStreakRaw {
  id: string;
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  updated_at: string;
}

export function mapHabitStreak(raw: HabitStreakRaw): HabitStreak {
  return {
    id: raw.id,
    habitId: raw.habit_id,
    currentStreak: raw.current_streak,
    longestStreak: raw.longest_streak,
    lastCompletedDate: raw.last_completed_date,
    updatedAt: raw.updated_at,
  };
}
