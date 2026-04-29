const BASE_URL = "http://10.0.2.2:8000";

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {"Content-Type": "application/json"},
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

export const getTasks = (skip = 0) => request(`/tasks?skip=${skip}`);

export const createTask = (data) =>
  request("/tasks", {method: "POST", body: JSON.stringify(data)});

export const getTask = (id) => request(`/tasks/${id}`);

export const updateTask = (id, data) =>
  request(`/tasks/${id}`, {method: "PUT", body: JSON.stringify(data)});

export const deleteTask = (id) => request(`/tasks/${id}`, {method: "DELETE"});
