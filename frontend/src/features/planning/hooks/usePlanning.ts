import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { planningApi } from "../api/planningApi";
import type { AutoBalanceRequest, CarryForwardRequest } from "../../../types/planning";

export function useWeekView(date?: string) {
  return useQuery({
    queryKey: ["planning", "week", date],
    queryFn: () => planningApi.getWeek(date),
  });
}

export function useFocusQueue() {
  return useQuery({
    queryKey: ["planning", "focus-queue"],
    queryFn: planningApi.getFocusQueue,
  });
}

export function useAutoBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AutoBalanceRequest) => planningApi.autoBalance(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["planning"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCarryForward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CarryForwardRequest) => planningApi.carryForward(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["planning"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
