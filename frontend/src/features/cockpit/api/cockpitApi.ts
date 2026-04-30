import { apiClient } from "../../../services/apiClient";
import { CockpitRaw, DailyCockpit, mapCockpit } from "../../../types/cockpit";

export const cockpitApi = {
  get: async (): Promise<DailyCockpit> => {
    const data = await apiClient.get<CockpitRaw>("/cockpit");
    return mapCockpit(data);
  },
};
