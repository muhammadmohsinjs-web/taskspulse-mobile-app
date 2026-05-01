import { apiClient } from "../../../services/apiClient";
import { toSnakeCase } from "../../../services/mappers";
import { GoalRaw, Goal, mapGoal, GoalCreatePayload, GoalUpdatePayload, GoalTaskLinkRaw, GoalTaskLink, mapGoalTaskLink } from "../../../types/goal";
import { TaskRaw, Task, mapTask } from "../../../types/task";

export const goalsApi = {
  getAll: async (): Promise<Goal[]> => {
    const data = await apiClient.get<GoalRaw[]>("/goals");
    return data.map(mapGoal);
  },

  getById: async (id: string): Promise<Goal> => {
    const data = await apiClient.get<GoalRaw>(`/goals/${id}`);
    return mapGoal(data);
  },

  create: async (payload: GoalCreatePayload): Promise<Goal> => {
    const body = toSnakeCase(payload as unknown as Record<string, unknown>);
    const data = await apiClient.post<GoalRaw>("/goals", body);
    return mapGoal(data);
  },

  update: async (id: string, payload: GoalUpdatePayload): Promise<Goal> => {
    const body = toSnakeCase(payload as unknown as Record<string, unknown>);
    const data = await apiClient.put<GoalRaw>(`/goals/${id}`, body);
    return mapGoal(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/goals/${id}`);
  },

  linkTask: async (goalId: string, taskId: string): Promise<GoalTaskLink> => {
    const body = toSnakeCase({ taskId });
    const data = await apiClient.post<GoalTaskLinkRaw>(`/goals/${goalId}/tasks`, body);
    return mapGoalTaskLink(data);
  },

  unlinkTask: async (goalId: string, taskId: string): Promise<void> => {
    await apiClient.delete(`/goals/${goalId}/tasks/${taskId}`);
  },

  getTasks: async (goalId: string): Promise<Task[]> => {
    const data = await apiClient.get<TaskRaw[]>(`/goals/${goalId}/tasks`);
    return data.map(mapTask);
  },
};
