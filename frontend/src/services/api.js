const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Project endpoints
export const projectService = {
  getProjects: () => api.get('/projects'),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

// Task endpoints
export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
  addAttachment: (id, attachment) => api.post(`/tasks/${id}/attachments`, attachment),
};

// Team / User endpoints
export const userService = {
  getUsers: () => api.get('/users'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  updateRole: (id, role) => api.put(`/users/role/${id}`, { role }),
  removeUser: (id) => api.delete(`/users/${id}`),
};

export default api;
