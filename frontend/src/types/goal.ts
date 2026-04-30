export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string | null;
  color: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalRaw {
  id: string;
  title: string;
  description: string;
  target_date: string | null;
  color: string;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  created_at: string;
  updated_at: string;
}

export function mapGoal(raw: GoalRaw): Goal {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    targetDate: raw.target_date,
    color: raw.color,
    progress: raw.progress,
    totalTasks: raw.total_tasks,
    completedTasks: raw.completed_tasks,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export interface GoalCreatePayload {
  title: string;
  description?: string;
  targetDate?: string | null;
  color?: string;
}

export interface GoalUpdatePayload {
  title?: string;
  description?: string;
  targetDate?: string | null;
  color?: string;
}

export interface GoalTaskLink {
  id: string;
  goalId: string;
  taskId: string;
}

export interface GoalTaskLinkRaw {
  id: string;
  goal_id: string;
  task_id: string;
}

export function mapGoalTaskLink(raw: GoalTaskLinkRaw): GoalTaskLink {
  return {
    id: raw.id,
    goalId: raw.goal_id,
    taskId: raw.task_id,
  };
}
