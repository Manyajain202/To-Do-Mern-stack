const mongoose = require('mongoose');
const Task = require('../models/Task');
const { getConnectionStatus } = require('../config/db');

/**
 * Fallback store used only if local MongoDB server is not running during quick local testing.
 * Uses valid Mongoose ObjectId strings so all controller validations work identically.
 */
let memoryTasks = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'Complete Express & MongoDB Backend',
    description: 'Implement Controller, Service, and Routes architecture',
    completed: true,
    priority: 'high',
    dueDate: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'Connect React Frontend using Axios',
    description: 'Test Add, Edit, Toggle Status, Search, and Delete',
    completed: false,
    priority: 'medium',
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Service Layer: Handles all MongoDB database queries and business logic for tasks.
 */

// 1. Get all tasks (supports optional search query and completion status filter)
const getAllTasks = async ({ search, completed }) => {
  if (getConnectionStatus()) {
    const filter = {};

    if (completed !== undefined && completed !== '') {
      filter.completed = completed === 'true';
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    return await Task.find(filter).sort({ createdAt: -1 });
  }

  // Fallback when testing without a running MongoDB daemon
  let result = [...memoryTasks];
  if (completed !== undefined && completed !== '') {
    const isComp = completed === 'true';
    result = result.filter((t) => t.completed === isComp);
  }
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }
  return result;
};

// 2. Get a single task by its MongoDB _id
const getTaskById = async (id) => {
  if (getConnectionStatus()) {
    return await Task.findById(id);
  }
  return memoryTasks.find((t) => t._id === id) || null;
};

// 3. Create a new task
const createTask = async (taskData) => {
  if (getConnectionStatus()) {
    const task = new Task(taskData);
    return await task.save();
  }

  const newTask = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: taskData.title,
    description: taskData.description || '',
    completed: Boolean(taskData.completed),
    priority: taskData.priority || 'medium',
    dueDate: taskData.dueDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryTasks.unshift(newTask);
  return newTask;
};

// 4. Update task details or status by _id
const updateTask = async (id, updateData) => {
  if (getConnectionStatus()) {
    return await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  const index = memoryTasks.findIndex((t) => t._id === id);
  if (index === -1) return null;

  memoryTasks[index] = {
    ...memoryTasks[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  return memoryTasks[index];
};

// 5. Delete a task by _id
const deleteTask = async (id) => {
  if (getConnectionStatus()) {
    return await Task.findByIdAndDelete(id);
  }

  const index = memoryTasks.findIndex((t) => t._id === id);
  if (index === -1) return null;

  const [deleted] = memoryTasks.splice(index, 1);
  return deleted;
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
