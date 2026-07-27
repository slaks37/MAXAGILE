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
}
