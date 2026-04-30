import { apiClient } from "../../../services/apiClient";
import { toSnakeCase } from "../../../services/mappers";
import { HabitRaw, Habit, mapHabit, HabitCreatePayload, HabitUpdatePayload, HabitStreak } from "../../../types/habit";

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
    const body = toSnakeCase(payload as Record<string, unknown>);
    const data = await apiClient.post<HabitRaw>("/habits", body);
    return mapHabit(data);
  },

  update: async (id: string, payload: HabitUpdatePayload): Promise<Habit> => {
    const body = toSnakeCase(payload as Record<string, unknown>);
    const data = await apiClient.put<HabitRaw>(`/habits/${id}`, body);
    return mapHabit(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/habits/${id}`);
  },

  complete: async (id: string): Promise<void> => {
    await apiClient.post(`/habits/${id}/complete`);
  },

  undoComplete: async (id: string): Promise<void> => {
    await apiClient.delete(`/habits/${id}/complete`);
  },

  getStreak: async (id: string): Promise<HabitStreak> => {
    return apiClient.get<HabitStreak>(`/habits/${id}/streak`);
  },
};
