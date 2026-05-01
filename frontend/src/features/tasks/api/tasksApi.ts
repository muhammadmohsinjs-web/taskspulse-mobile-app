import { apiClient } from "../../../services/apiClient";
import { toSnakeCase } from "../../../services/mappers";
import { TaskRaw, Task, mapTask, TaskCreatePayload, TaskUpdatePayload } from "../../../types/task";

export const tasksApi = {
  getAll: async (params?: { date?: string; month?: string; status?: string; categoryId?: string; isBacklog?: boolean; skip?: number; limit?: number }): Promise<Task[]> => {
    const query = new URLSearchParams();
    if (params?.date) query.set("date", params.date);
    if (params?.month) query.set("month", params.month);
    if (params?.status) query.set("status", params.status);
    if (params?.categoryId) query.set("category_id", params.categoryId);
    if (params?.isBacklog) query.set("is_backlog", "true");
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    const qs = query.toString();
    const data = await apiClient.get<TaskRaw[]>(`/tasks${qs ? "?" + qs : ""}`);
    return data.map(mapTask);
  },

  getById: async (id: string): Promise<Task> => {
    const data = await apiClient.get<TaskRaw>(`/tasks/${id}`);
    return mapTask(data);
  },

  create: async (payload: TaskCreatePayload): Promise<Task> => {
    const body = toSnakeCase(payload as unknown as Record<string, unknown>);
    const data = await apiClient.post<TaskRaw>("/tasks", body);
    return mapTask(data);
  },

  update: async (id: string, payload: TaskUpdatePayload): Promise<Task> => {
    const body = toSnakeCase(payload as unknown as Record<string, unknown>);
    const data = await apiClient.put<TaskRaw>(`/tasks/${id}`, body);
    return mapTask(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
