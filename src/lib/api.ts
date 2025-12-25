// src/lib/api.ts - Add console logs for debugging
import axios from 'axios';
import { Project, Task, User, Message, Notification } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL); // Debug log

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url); // Debug log
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status); // Debug log
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data); // Debug log
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth operations
  async register(name: string, email: string, password: string) {
    console.log('Registering user:', email);
    const { data } = await apiClient.post('/auth/register', { name, email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async login(email: string, password: string) {
    console.log('Logging in user:', email);
    const { data } = await apiClient.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async getCurrentUser() {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Rest of the API methods remain the same...
  async getProjects(): Promise<Project[]> {
    const { data } = await apiClient.get('/projects');
    return data;
  },

  async createProject(name: string): Promise<Project> {
    const { data } = await apiClient.post('/projects', { name });
    return data;
  },

  async getProjectById(id: string): Promise<Project> {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  async joinProject(joinCode: string): Promise<Project> {
    const { data } = await apiClient.post('/projects/join', { joinCode });
    return data;
  },

  async generateJoinCode(projectId: string): Promise<string> {
    const { data } = await apiClient.post(`/projects/${projectId}/generate-code`);
    return data.joinCode;
  },

  async getTasks(projectId: string): Promise<Task[]> {
    const { data } = await apiClient.get(`/tasks/project/${projectId}`);
    return data;
  },

  async createTask(projectId: string, taskData: { 
    title: string; 
    description?: string; 
    priority?: string; 
    assignedTo?: string;
    dueDate?: Date;
  }): Promise<Task> {
    const { data } = await apiClient.post(`/tasks/project/${projectId}`, taskData);
    return data;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data } = await apiClient.put(`/tasks/${taskId}`, updates);
    return data;
  },

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    const { data } = await apiClient.patch(`/tasks/${taskId}/status`, { status });
    return data;
  },

  async assignTask(taskId: string, assignedTo: string): Promise<Task> {
    const { data } = await apiClient.patch(`/tasks/${taskId}/assign`, { assignedTo });
    return data;
  },

  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  async getMessages(projectId: string): Promise<Message[]> {
    const { data } = await apiClient.get(`/messages/project/${projectId}`);
    return data;
  },

  async sendMessage(projectId: string, text: string): Promise<Message> {
    const { data } = await apiClient.post(`/messages/project/${projectId}`, { text });
    return data;
  },

  async getNotifications(): Promise<Notification[]> {
    const { data } = await apiClient.get('/notifications');
    return data;
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },
};