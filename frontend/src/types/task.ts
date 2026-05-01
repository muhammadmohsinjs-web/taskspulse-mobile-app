export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  categoryId: string | null;
  recurrenceRule: string | null;
  completedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRaw {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  category_id: string | null;
  recurrence_rule: string | null;
  completed_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function validateStatus(s: string): Task["status"] {
  const valid: Task["status"][] = ["todo", "in_progress", "done"];
  return valid.includes(s as Task["status"]) ? (s as Task["status"]) : "todo";
}

function validatePriority(p: string): Task["priority"] {
  const valid: Task["priority"][] = ["low", "medium", "high", "urgent"];
  return valid.includes(p as Task["priority"]) ? (p as Task["priority"]) : "medium";
}

export function mapTask(raw: TaskRaw): Task {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    status: validateStatus(raw.status),
    priority: validatePriority(raw.priority),
    dueDate: raw.due_date,
    categoryId: raw.category_id,
    recurrenceRule: raw.recurrence_rule,
    completedAt: raw.completed_at,
    deletedAt: raw.deleted_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  categoryId?: string | null;
  recurrenceRule?: string | null;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  categoryId?: string | null;
  recurrenceRule?: string | null;
  completedAt?: string | null;
}
