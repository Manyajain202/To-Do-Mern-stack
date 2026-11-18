import axios from 'axios';

// Base URL points to our Express.js backend API (defaults to localhost:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tasks';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 1. Retrieve all tasks (with optional search keyword and completion filter)
export const fetchTasks = async (search = '', completed = '') => {
  const params = {};
  if (search) params.search = search;
  if (completed !== '') params.completed = completed;

  const response = await api.get('/', { params });
  return response.data.data;
};

// 2. Create a new task
export const createNewTask = async (taskData) => {
  const response = await api.post('/', taskData);
  return response.data.data;
};

// 3. Update task details (PUT /api/tasks/:id)
export const updateTaskDetails = async (id, updatedFields) => {
  const response = await api.put(`/${id}`, updatedFields);
  return response.data.data;
};

// 4. Update task completion status (PATCH /api/tasks/:id)
export const toggleTaskStatus = async (id, completed) => {
  const response = await api.patch(`/${id}`, { completed });
  return response.data.data;
};

// 5. Delete a task (DELETE /api/tasks/:id)
export const removeTask = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};
