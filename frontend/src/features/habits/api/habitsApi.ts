import { apiClient } from "../../../services/apiClient";
import { toSnakeCase } from "../../../services/mappers";
import { HabitRaw, Habit, mapHabit, HabitCreatePayload, HabitUpdatePayload, HabitStreak, HabitStreakRaw, mapHabitStreak } from "../../../types/habit";

export const habitsApi = {
  getAll: async (): Promise<Habit[]> => {
    const data = await apiClient.get<HabitRaw[]>("/habits");
    return data.map(mapHabit);
  },

  getById: async (id: string): Promise<Habit> => {
    const data = await apiClient.get<HabitRaw>(`/habits/${id}`);
    return mapHabit(data);
  },

  create: async (payload: HabitCreatePayload): Promise<Habit> => {
    const body = toSnakeCase(payload as unknown as Record<string, unknown>);
    const data = await apiClient.post<HabitRaw>("/habits", body);
    return mapHabit(data);
  },

  update: async (id: string, payload: HabitUpdatePayload): Promise<Habit> => {
    const body = toSnakeCase(payload as unknown as Record<string, unknown>);
    const data = await apiClient.put<HabitRaw>(`/habits/${id}`, body);
    return mapHabit(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/habits/${id}`);
  },

  complete: async (id: string): Promise<{ id: string; habit_id: string; completed_date: string }> => {
    return apiClient.post(`/habits/${id}/complete`);
  },

  undoComplete: async (id: string, onDate?: string): Promise<void> => {
    const query = onDate ? `?date=${encodeURIComponent(onDate)}` : "";
    await apiClient.delete(`/habits/${id}/complete${query}`);
  },

  getStreak: async (id: string): Promise<HabitStreak> => {
    const data = await apiClient.get<HabitStreakRaw>(`/habits/${id}/streak`);
    return mapHabitStreak(data);
  },
};
