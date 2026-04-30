import { Platform } from "react-native";

const getBaseUrl = (): string => {
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
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(
        err.detail || `Request failed: ${res.status}`,
        res.status
      );
    }

    if (res.status === 204) return null as T;
    return res.json();
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if ((e as Error).name === "AbortError") {
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
