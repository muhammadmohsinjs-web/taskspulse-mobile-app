import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { habitsApi } from "../api/habitsApi";
import { HabitCreatePayload, HabitUpdatePayload } from "../../../types";

export function useHabits() {
  return useQuery({
    queryKey: ["habits"],
    queryFn: habitsApi.getAll,
  });
}

export function useHabit(id: string) {
  return useQuery({
    queryKey: ["habits", id],
    queryFn: () => habitsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: HabitCreatePayload) => habitsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["cockpit"] });
    },
    onError: (error: Error) => {
      console.error("Failed to create habit:", error.message);
    },
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: HabitUpdatePayload }) =>
      habitsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["cockpit"] });
    },
    onError: (error: Error) => {
      console.error("Failed to update habit:", error.message);
    },
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["cockpit"] });
    },
    onError: (error: Error) => {
      console.error("Failed to delete habit:", error.message);
    },
  });
}

export function useToggleHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completedToday }: { id: string; completedToday: boolean }) => {
      if (completedToday) {
        await habitsApi.undoComplete(id);
      } else {
        await habitsApi.complete(id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["cockpit"] });
    },
    onError: (error: Error) => {
      console.error("Failed to toggle habit:", error.message);
    },
  });
}
