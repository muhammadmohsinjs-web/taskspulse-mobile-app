import { apiClient } from "../../../services/apiClient";
import {
  AuthResponseRaw,
  TokenResponseRaw,
  AuthUserRaw,
  AuthUser,
  mapAuthUser,
  LoginPayload,
  RegisterPayload,
  RegisterResponseRaw,
} from "../../../types/auth";

export const authApi = {
  register: async (payload: RegisterPayload): Promise<RegisterResponseRaw> => {
    const raw = await apiClient.request<RegisterResponseRaw>("/auth/register", {
      method: "POST",
      body: payload,
      skipAuth: true,
      skipRefresh: true,
    });

    return raw;
  },

  login: async (payload: LoginPayload): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> => {
    const raw = await apiClient.request<AuthResponseRaw>("/auth/login", {
      method: "POST",
      body: payload,
      skipAuth: true,
      skipRefresh: true,
    });

    return {
      user: mapAuthUser(raw.user),
      accessToken: raw.tokens.access_token,
      refreshToken: raw.tokens.refresh_token,
    };
  },

  me: async (): Promise<AuthUser> => {
    const raw = await apiClient.get<AuthUserRaw>("/auth/me");
    return mapAuthUser(raw);
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const raw = await apiClient.request<TokenResponseRaw>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
      skipAuth: true,
      skipRefresh: true,
    });

    return {
      accessToken: raw.access_token,
      refreshToken: raw.refresh_token,
    };
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.request<void>("/auth/logout", {
      method: "POST",
      body: { refresh_token: refreshToken },
      skipAuth: true,
      skipRefresh: true,
    });
  },
};
