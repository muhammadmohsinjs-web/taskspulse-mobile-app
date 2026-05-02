import React from "react";
import { Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/features/auth/context/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
  mutationCache: new MutationCache({
    onError: (_error: Error) => {
      // Errors are handled per-screen via onError callbacks.
      // Log-only here to avoid duplicate alert popups.
      if (__DEV__) console.warn("[MutationCache]", _error.message);
    },
  }),
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  </QueryClientProvider>
);

export default App;
