import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analyticsApi";

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: analyticsApi.getSummary,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHeatmap(months: number = 3) {
  return useQuery({
    queryKey: ["analytics", "heatmap", months],
    queryFn: () => analyticsApi.getHeatmap(months),
    staleTime: 5 * 60 * 1000,
  });
}
