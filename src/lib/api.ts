// src/lib/api.ts - Axios API client with enhanced debugging
import axios, { AxiosError } from 'axios';
import { Project, Task, User, Message, Notification } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔌 API URL:', API_URL);
console.log('🔌 Environment:', import.meta.env.MODE);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} [${response.status}]`);
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    console.error(`❌ API Error: ${error.config?.url} [${status}]`, data?.error || data?.message || error.message);

    if (status === 401) {
      console.warn('🔐 Unauthorized - Logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (status === 0 || error.message === 'Network Error') {
      console.error('🌐 Network error - Is the backend server running?');
    }

    return Promise.reject(error);
  }
);

export const api = {
  // Auth operations
  async register(name: string, email: string, password: string) {
    try {
      console.log('👤 Registering user:', email);
      const { data } = await apiClient.post('/auth/register', { name, email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('✨ Registration successful');
      }
      return data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      console.log('🔑 Logging in user:', email);
      const { data } = await apiClient.post('/auth/login', { email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('✨ Login successful');
      }
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
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

  async setProjectGitHub(projectId: string, repoOwner: string, repoName: string, token: string): Promise<Project> {
    const { data } = await apiClient.put(`/projects/${projectId}/github`, { repoOwner, repoName, token });
    return data;
  },

  async getProjectGitHub(projectId: string): Promise<{ repoOwner: string; repoName: string; token: string; connected: boolean }> {
    const { data } = await apiClient.get(`/projects/${projectId}/github`);
    return data;
  },
};