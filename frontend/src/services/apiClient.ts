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
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const timer = setTimeout(() => {
    try { controller.abort(); } catch { /* already aborted */ }
  }, timeout);

  try {
    const { body, ...rest } = options;
    const res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...rest.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: mergeSignals(controller.signal, rest.signal),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(
        err.detail || err.message || `Request failed: ${res.status}`,
        res.status
      );
    }

    // DELETE endpoints return 204 No Content with no response body.
    // Callers (tasksApi.delete, habitsApi.delete, etc.) are typed Promise<void>
    // and discard the return value, so null is safe in practice.
    // If a non-DELETE endpoint ever returns 204 unexpectedly, callers
    // that cast to a concrete type (e.g. TaskRaw) would get null at runtime.
    if (res.status === 204) return null as T;
    return res.json();
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof Error && e.name === "AbortError") {
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
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) => request<T>(path, { method: "POST", body, signal }),
  put: <T>(path: string, body?: unknown, signal?: AbortSignal) => request<T>(path, { method: "PUT", body, signal }),
  delete: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: "DELETE", signal }),
};

export { ApiError };
