import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsApi } from "../api/goalsApi";
import { GoalCreatePayload, GoalUpdatePayload } from "../../../types/goal";

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: goalsApi.getAll,
  });
}

export function useGoal(id: string | null) {
  return useQuery({
    queryKey: ["goals", id],
    queryFn: () => goalsApi.getById(id!),
    enabled: !!id,
  });
}

export function useGoalTasks(goalId: string | null) {
  return useQuery({
    queryKey: ["goals", goalId, "tasks"],
    queryFn: () => goalsApi.getTasks(goalId!),
    enabled: !!goalId,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoalCreatePayload) => goalsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (error: Error) => {
      console.error("Failed to create goal:", error.message);
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GoalUpdatePayload }) =>
      goalsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update goal:", error.message);
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (error: Error) => {
      console.error("Failed to delete goal:", error.message);
    },
  });
}

export function useLinkTaskToGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, taskId }: { goalId: string; taskId: string }) =>
      goalsApi.linkTask(goalId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      console.error("Failed to link task:", error.message);
    },
  });
}

export function useUnlinkTaskFromGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, taskId }: { goalId: string; taskId: string }) =>
      goalsApi.unlinkTask(goalId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      console.error("Failed to unlink task:", error.message);
    },
  });
}
