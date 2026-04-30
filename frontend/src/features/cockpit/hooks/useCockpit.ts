import { useQuery } from "@tanstack/react-query";
import { cockpitApi } from "../api/cockpitApi";

export function useCockpit() {
  return useQuery({
    queryKey: ["cockpit"],
    queryFn: cockpitApi.get,
  });
}
