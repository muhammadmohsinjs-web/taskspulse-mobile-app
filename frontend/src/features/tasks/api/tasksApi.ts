import { apiClient } from "../../../services/apiClient";
import { TaskRaw, Task, mapTask, TaskCreatePayload, TaskUpdatePayload } from "../../../types/task";

export const tasksApi = {
  getAll: async (params?: { date?: string; status?: string; categoryId?: string }): Promise<Task[]> => {
    const query = new URLSearchParams();
    if (params?.date) query.set("date", params.date);
    if (params?.status) query.set("status", params.status);
    if (params?.categoryId) query.set("category_id", params.categoryId);
    const qs = query.toString();
    const data = await apiClient.get<TaskRaw[]>(`/tasks${qs ? "?" + qs : ""}`);
    return data.map(mapTask);
  },

  getById: async (id: string): Promise<Task> => {
    const data = await apiClient.get<TaskRaw>(`/tasks/${id}`);
    return mapTask(data);
  },

  create: async (payload: TaskCreatePayload): Promise<Task> => {
    const body: Record<string, unknown> = { title: payload.title };
    if (payload.description) body.description = payload.description;
    if (payload.status) body.status = payload.status;
    if (payload.priority) body.priority = payload.priority;
    if (payload.dueDate !== undefined) body.due_date = payload.dueDate;
    if (payload.categoryId !== undefined) body.category_id = payload.categoryId;
    if (payload.recurrenceRule !== undefined) body.recurrence_rule = payload.recurrenceRule;
    const data = await apiClient.post<TaskRaw>("/tasks", body);
    return mapTask(data);
  },

  update: async (id: string, payload: TaskUpdatePayload): Promise<Task> => {
    const body: Record<string, unknown> = {};
    if (payload.title !== undefined) body.title = payload.title;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.status !== undefined) body.status = payload.status;
    if (payload.priority !== undefined) body.priority = payload.priority;
    if (payload.dueDate !== undefined) body.due_date = payload.dueDate;
    if (payload.categoryId !== undefined) body.category_id = payload.categoryId;
    if (payload.recurrenceRule !== undefined) body.recurrence_rule = payload.recurrenceRule;
    const data = await apiClient.put<TaskRaw>(`/tasks/${id}`, body);
    return mapTask(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
