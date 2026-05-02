import { Platform } from "react-native";

const getBaseUrl = (): string => {
  // Allow override via EXPO_PUBLIC_API_URL environment variable (Expo build-time env var)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }
  return "http://localhost:8000";
};

const BASE_URL = getBaseUrl();
const DEFAULT_TIMEOUT = 15000;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeout?: number;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Auth handler configuration (set by AuthProvider to avoid circular imports)
// ---------------------------------------------------------------------------
type GetAccessTokenFn = () => Promise<string | null>;
type RefreshSessionFn = () => Promise<string | null>;
type LogoutFn = () => Promise<void>;

let _getAccessToken: GetAccessTokenFn | null = null;
let _refreshSession: RefreshSessionFn | null = null;
let _logout: LogoutFn | null = null;
let _refreshPromise: Promise<string | null> | null = null;

export function configureAuthHandlers(handlers: {
  getAccessToken: GetAccessTokenFn;
  refreshSession: RefreshSessionFn;
  logout: LogoutFn;
}) {
  _getAccessToken = handlers.getAccessToken;
  _refreshSession = handlers.refreshSession;
  _logout = handlers.logout;
}

// ---------------------------------------------------------------------------
// Request function
// ---------------------------------------------------------------------------
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const timer = setTimeout(() => {
    try { controller.abort(); } catch { /* already aborted */ }
  }, timeout);

  try {
    const { body, skipAuth, skipRefresh, ...rest } = options;

    // Build headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(rest.headers as Record<string, string> | undefined),
    };

    // Attach access token if available and not skipped
    if (!skipAuth && _getAccessToken) {
      const token = await _getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: mergeSignals(controller.signal, rest.signal),
    });

    // Handle 401 with auto-refresh (unless skipped)
    if (res.status === 401 && !skipAuth && !skipRefresh && _refreshSession && _logout) {
      // Single-flight refresh: if another request is already refreshing, wait for it
      if (!_refreshPromise) {
        _refreshPromise = _refreshSession().finally(() => {
          _refreshPromise = null;
        });
      }
      const newToken = await _refreshPromise;
      if (newToken) {
        // Retry the request once with the new token
        headers["Authorization"] = `Bearer ${newToken}`;
        const retryRes = await fetch(`${BASE_URL}${path}`, {
          ...rest,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: mergeSignals(controller.signal, rest.signal),
        });

        if (retryRes.ok) {
          if (retryRes.status === 204) return null as T;
          return retryRes.json();
        }

        // If retry still fails, throw
        const retryErr = await retryRes.json().catch(() => ({}));
        throw new ApiError(
          retryErr.detail || retryErr.message || `Request failed: ${retryRes.status}`,
          retryRes.status
        );
      } else {
        // Refresh failed - log out
        await _logout();
        throw new ApiError("Session expired. Please log in again.", 401);
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(
        err.detail || err.message || `Request failed: ${res.status}`,
        res.status
      );
    }

    // DELETE endpoints return 204 No Content
    if (res.status === 204) return null as T;
    return res.json();
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out. Is the backend running?");
    }
    if (controller.signal.aborted) {
      throw new Error("Request timed out. Is the backend running?");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function mergeSignals(signal1: AbortSignal, signal2?: AbortSignal): AbortSignal {
  if (!signal2) return signal1;
  const controller = new AbortController();
  const onAbort = () => {
    controller.abort();
    signal1.removeEventListener("abort", onAbort);
    signal2.removeEventListener("abort", onAbort);
  };
  signal1.addEventListener("abort", onAbort);
  signal2.addEventListener("abort", onAbort);
  return controller.signal;
}

export const apiClient = {
  get: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, { method: "GET", signal }),

  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: "POST", body, signal }),

  put: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: "PUT", body, signal }),

  delete: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, { method: "DELETE", signal }),

  // Raw request with full options for auth endpoints (skip refresh)
  request: <T>(path: string, options: RequestOptions = {}) =>
    request<T>(path, options),
};

export { ApiError };
