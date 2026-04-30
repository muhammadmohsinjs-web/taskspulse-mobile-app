import { useState, useCallback } from "react";
import { RefreshControl } from "react-native";
import { theme } from "../theme/theme";

interface UseRefreshControlOptions {
  /** Function that refetches the data */
  refetch: () => Promise<unknown>;
  /** Tint color for the spinner, defaults to theme primary */
  color?: string;
}

export function useRefreshControl({ refetch, color }: UseRefreshControlOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const refreshControl = (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      colors={[color || theme.colors.primary]}
    />
  );

  return { isRefreshing, onRefresh, refreshControl };
}
