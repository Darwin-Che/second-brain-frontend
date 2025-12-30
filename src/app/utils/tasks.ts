// Utility functions for interacting with the /tasks API

export interface Task {
  task_name: string;
  hours_per_week: number;
}

import { getApiUrl } from "./api";
import { authFetch } from "./authFetch";

export async function fetchTasks(): Promise<Task[]> {
  const res = await authFetch(getApiUrl("/api/v1/tasks"));
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function addTask(task: Task): Promise<void> {
  const res = await authFetch(getApiUrl("/api/v1/tasks/add"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) {
    let msg = "Failed to add task";
    try {
      const data = await res.json();
      if (data && data.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
}

export async function editTask(task: Task): Promise<void> {
  const res = await authFetch(getApiUrl("/api/v1/tasks/edit"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) {
    let msg = "Failed to edit task";
    try {
      const data = await res.json();
      if (data && data.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
}
