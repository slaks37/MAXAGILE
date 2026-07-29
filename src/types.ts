export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  type: string;
}

export interface Status {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  order: number;
}

export interface AppUser {
  id: string;
  username: string;
  name: string;
  color: string;
  role?: string;
}

export interface CustomFieldDef {
  id: string;
  workspaceId: string;
  name: string;
  type: "text" | "number" | "select" | "date" | "checkbox";
  options?: string | null;
  order: number;
}

export interface WorkItem {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  statusId: string | null;
  dueDate?: string;
  labels?: string | null;
  subtasks?: string | null;
  activities?: string | null;
  createdAt: string;
  status?: Status;
  workspace?: Workspace;
  assigneeId?: string | null;
  assignee?: { id: string; name: string; color: string } | null;
  isMilestone?: boolean;
  customFields?: string | null;
  blockedBy?: string[];
}
