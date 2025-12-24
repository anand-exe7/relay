import { Project, Task, User, Message, Notification } from '@/types';

// Placeholder API functions - ready to be connected to a real backend

export const api = {
  // Project operations
  async createProject(name: string): Promise<Project> {
    console.log('[API] createProject:', name);
    // Placeholder: return mock data
    return {
      id: `project-${Date.now()}`,
      name,
      joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      members: [{ id: 'user-1', name: 'You', email: 'you@example.com' }],
      adminId: 'user-1',
      createdAt: new Date(),
    };
  },

  async joinProject(code: string): Promise<Project | null> {
    console.log('[API] joinProject:', code);
    // Placeholder: would validate code and return project
    return null;
  },

  async getProjects(): Promise<Project[]> {
    console.log('[API] getProjects');
    // Placeholder: return empty or mock list
    return [];
  },

  async generateJoinCode(projectId: string): Promise<string> {
    console.log('[API] generateJoinCode:', projectId);
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  // Task operations
  async createTask(projectId: string, title: string): Promise<Task> {
    console.log('[API] createTask:', { projectId, title });
    return {
      id: `task-${Date.now()}`,
      projectId,
      title,
      status: 'todo',
      createdAt: new Date(),
    };
  },

  async assignTask(taskId: string, userId: string): Promise<Task> {
    console.log('[API] assignTask:', { taskId, userId });
    // Placeholder: would return updated task
    return {} as Task;
  },

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    console.log('[API] updateTaskStatus:', { taskId, status });
    // Placeholder: would return updated task
    return {} as Task;
  },

  async getTasks(projectId: string): Promise<Task[]> {
    console.log('[API] getTasks:', projectId);
    return [];
  },

  // Chat operations
  async sendMessage(projectId: string, text: string): Promise<Message> {
    console.log('[API] sendMessage:', { projectId, text });
    return {
      id: `msg-${Date.now()}`,
      projectId,
      sender: { id: 'user-1', name: 'You', email: 'you@example.com' },
      text,
      timestamp: new Date(),
    };
  },

  async getMessages(projectId: string): Promise<Message[]> {
    console.log('[API] getMessages:', projectId);
    return [];
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    console.log('[API] getNotifications');
    return [];
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    console.log('[API] markNotificationRead:', notificationId);
  },
};