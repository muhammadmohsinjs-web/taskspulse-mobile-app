import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "../../tasks/api/tasksApi";

export function useBacklog(params?: { status?: string; skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ["tasks", "backlog", params],
    queryFn: () => tasksApi.getAll({ ...params, isBacklog: true }),
  });
}
