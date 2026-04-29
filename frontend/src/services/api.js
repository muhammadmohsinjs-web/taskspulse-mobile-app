import { Platform } from "react-native";
import Constants from "expo-constants";

const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8000`;
  }
  return Platform.select({
    android: "http://10.0.2.2:8000",
    default: "http://localhost:8000",
  });
};

const BASE_URL = getBaseUrl();

const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {"Content-Type": "application/json", ...options.headers},
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Request failed: ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Request timed out. Is the backend running?");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
};

export const getTasks = (skip = 0) => request(`/tasks?skip=${skip}`);

export const createTask = (data) =>
  request("/tasks", {method: "POST", body: JSON.stringify(data)});

export const getTask = (id) => request(`/tasks/${id}`);

export const updateTask = (id, data) =>
  request(`/tasks/${id}`, {method: "PUT", body: JSON.stringify(data)});

export const deleteTask = (id) => request(`/tasks/${id}`, {method: "DELETE"});
