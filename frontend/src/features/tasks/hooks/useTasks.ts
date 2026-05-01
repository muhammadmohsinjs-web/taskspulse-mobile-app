import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasksApi";
import { TaskCreatePayload, TaskUpdatePayload } from "../../../types";

export function useTasks(params?: { date?: string; month?: string; status?: string; categoryId?: string; isBacklog?: boolean; skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => tasksApi.getAll(params),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskCreatePayload) => tasksApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["cockpit"] });
    },
    onError: (error: Error) => {
      console.error("Failed to create task:", error.message);
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskUpdatePayload }) =>
      tasksApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["cockpit"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update task:", error.message);
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["cockpit"] });
    },
    onError: (error: Error) => {
      console.error("Failed to delete task:", error.message);
    },
  });
}
