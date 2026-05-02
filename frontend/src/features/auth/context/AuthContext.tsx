import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthUser, LoginPayload, RegisterPayload, RegisterResponseRaw } from "../../../types/auth";
import { tokenStorage } from "../storage/tokenStorage";
import { authApi } from "../api/authApi";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<RegisterResponseRaw>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const bootstrapped = useRef(false);

  // Configure apiClient auth callbacks
  useEffect(() => {
    const { configureAuthHandlers } = require("../../../services/apiClient");
    configureAuthHandlers({
      getAccessToken: () => tokenStorage.getAccessToken(),
      refreshSession: async () => {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) return null;
        try {
          const tokens = await authApi.refresh(refreshToken);
          await tokenStorage.saveTokens(tokens.accessToken, tokens.refreshToken);
          return tokens.accessToken;
        } catch {
          await tokenStorage.clearTokens();
          setUser(null);
          return null;
        }
      },
      logout: async () => {
        await tokenStorage.clearTokens();
        setUser(null);
        queryClient.clear();
      },
    });
  }, [queryClient]);

  // Bootstrap: try to restore session on mount
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const bootstrap = async () => {
      try {
        const accessToken = await tokenStorage.getAccessToken();
        const refreshToken = await tokenStorage.getRefreshToken();

        if (!accessToken || !refreshToken) {
          setIsBootstrapping(false);
          return;
        }

        // Try /auth/me with existing access token
        try {
          const currentUser = await authApi.me();
          setUser(currentUser);
          setIsBootstrapping(false);
          return;
        } catch {
          // Access token expired - try refresh
        }

        // Try refresh
        try {
          const tokens = await authApi.refresh(refreshToken);
          await tokenStorage.saveTokens(tokens.accessToken, tokens.refreshToken);
          const currentUser = await authApi.me();
          setUser(currentUser);
        } catch {
          // Refresh failed - clear everything
          await tokenStorage.clearTokens();
        }
      } catch {
        await tokenStorage.clearTokens();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsSubmitting(true);
    try {
      const result = await authApi.login(payload);
      await tokenStorage.saveTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<RegisterResponseRaw> => {
    setIsSubmitting(true);
    try {
      const result = await authApi.register(payload);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        // Fire-and-forget logout; don't block on network failure
        authApi.logout(refreshToken).catch(() => {});
      }
    } catch {
      // Ignore errors during logout
    }

    await tokenStorage.clearTokens();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isBootstrapping,
    isSubmitting,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
