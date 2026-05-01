import { apiClient } from "../../../services/apiClient";
import { toSnakeCase } from "../../../services/mappers";
import type {
  WeekViewRaw,
  WeekView,
  FocusQueueRaw,
  FocusQueue,
  AutoBalanceRequest,
  AutoBalanceResponse,
  CarryForwardRequest,
  CarryForwardResponse,
} from "../../../types/planning";
import { mapWeekView, mapFocusQueue } from "../../../types/planning";

export const planningApi = {
  getWeek: async (date?: string): Promise<WeekView> => {
    const qs = date ? `?date=${date}` : "";
    const data = await apiClient.get<WeekViewRaw>(`/planning/week${qs}`);
    return mapWeekView(data);
  },

  getFocusQueue: async (): Promise<FocusQueue> => {
    const data = await apiClient.get<FocusQueueRaw>("/planning/focus-queue");
    return mapFocusQueue(data);
  },

  autoBalance: async (payload: AutoBalanceRequest): Promise<AutoBalanceResponse> => {
    const body = toSnakeCase(payload as unknown as Record<string, unknown>);
    const data = await apiClient.post<AutoBalanceResponse>("/planning/auto-balance", body);
    return data;
  },

  carryForward: async (payload: CarryForwardRequest): Promise<CarryForwardResponse> => {
    const body = toSnakeCase(payload as unknown as Record<string, unknown>);
    const data = await apiClient.post<CarryForwardResponse>("/planning/carry-forward", body);
    return data;
  },
};
