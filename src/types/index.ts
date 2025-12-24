export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  joinCode: string;
  members: User[];
  adminId: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  assignedTo?: User;
  createdAt: Date;
}

export interface Message {
  id: string;
  projectId: string;
  sender: User;
  text: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'task_assigned' | 'project_completed';
  message: string;
  read: boolean;
  timestamp: Date;
}

export type TaskStatus = Task['status'];