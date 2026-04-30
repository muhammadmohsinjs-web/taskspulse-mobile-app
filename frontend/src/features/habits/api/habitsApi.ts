import { apiClient } from "../../../services/apiClient";
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
    const body: Record<string, unknown> = { title: payload.title };
    if (payload.description) body.description = payload.description;
    if (payload.categoryId) body.category_id = payload.categoryId;
    if (payload.recurrenceRule) body.recurrence_rule = payload.recurrenceRule;
    if (payload.color) body.color = payload.color;
    const data = await apiClient.post<HabitRaw>("/habits", body);
    return mapHabit(data);
  },

  update: async (id: string, payload: HabitUpdatePayload): Promise<Habit> => {
    const body: Record<string, unknown> = {};
    if (payload.title !== undefined) body.title = payload.title;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.categoryId !== undefined) body.category_id = payload.categoryId;
    if (payload.recurrenceRule !== undefined) body.recurrence_rule = payload.recurrenceRule;
    if (payload.color !== undefined) body.color = payload.color;
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
