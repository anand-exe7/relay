// src/types/index.ts - Add missing fields
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
  description?: string;
  status: 'todo' | 'doing' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: User;
  dueDate?: Date;
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
  type: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

export type TaskStatus = Task['status'];