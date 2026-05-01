import { apiClient } from "../../../services/apiClient";
import { AnalyticsSummaryRaw, AnalyticsSummary, HeatmapDataRaw, HeatmapData, mapAnalyticsSummary, mapHeatmapData } from "../../../types/analytics";

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const data = await apiClient.get<AnalyticsSummaryRaw>("/analytics/summary");
    return mapAnalyticsSummary(data);
  },

  getHeatmap: async (months: number = 3): Promise<HeatmapData> => {
    const data = await apiClient.get<HeatmapDataRaw>(`/analytics/heatmap?months=${months}`);
    return mapHeatmapData(data);
  },
};
