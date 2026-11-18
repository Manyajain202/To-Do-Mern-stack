import React, { useState, useEffect } from 'react';
import {
  fetchTasks,
  createNewTask,
  updateTaskDetails,
  toggleTaskStatus,
  removeTask
} from './services/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states for adding a new task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Inline editing states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  // Load tasks from backend
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchTasks(searchQuery, statusFilter);
      setTasks(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to connect to the server. Please make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadTasks();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchTasks('', statusFilter)
      .then((data) => setTasks(data))
      .catch(() => {});
  };

  // 1. Add a new task (POST /api/tasks)
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }

    try {
      setError('');
      const created = await createNewTask({
        title: title.trim(),
        description: description.trim(),
        priority
      });
      setTasks((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating task.');
    }
  };

  // 2. Toggle task completion status (PATCH /api/tasks/:id)
  const handleToggleComplete = async (task) => {
    try {
      setError('');
      const updated = await toggleTaskStatus(task._id, !task.completed);
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating task status.');
    }
  };

  // 3. Start editing a task
  const startEditing = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'medium');
  };

  // 4. Save updated task details (PUT /api/tasks/:id)
  const handleSaveEdit = async (id) => {
    if (!editTitle.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    try {
      setError('');
      const updated = await updateTaskDetails(id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority
      });
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating task details.');
    }
  };

  // 5. Delete a task (DELETE /api/tasks/:id)
  const handleDeleteTask = async (id) => {
    try {
      setError('');
      await removeTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting task.');
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.length - completedCount;

  return (
    <div className="page-wrapper">
      <div className="app-container">
        <header className="app-header">
          <div className="header-top">
            <h1>To-Do List</h1>
            <div className="task-stats">
              <span className="stat-pill">{activeCount} Pending</span>
              <span className="stat-pill done">{completedCount} Done</span>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError('')} className="close-error">
              ✕
            </button>
          </div>
        )}

        {/* Create Task Form */}
        <form className="task-form" onSubmit={handleAddTask}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Add a new task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-title"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="select-priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="Add a short note or description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-desc"
            />
            <button type="submit" className="btn-primary">
              + Add Task
            </button>
          </div>
        </form>

        {/* Search and Filter Bar */}
        <div className="filter-bar">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-secondary">
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="btn-clear"
              >
                Clear
              </button>
            )}
          </form>

          <div className="status-filters">
            <button
              className={statusFilter === '' ? 'active' : ''}
              onClick={() => setStatusFilter('')}
            >
              All
            </button>
            <button
              className={statusFilter === 'false' ? 'active' : ''}
              onClick={() => setStatusFilter('false')}
            >
              Active
            </button>
            <button
              className={statusFilter === 'true' ? 'active' : ''}
              onClick={() => setStatusFilter('true')}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="loading-state">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Start by adding a task above!</p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li
                key={task._id}
                className={`task-item ${task.completed ? 'completed' : ''}`}
              >
                {editingId === task._id ? (
                  <div className="edit-mode">
                    <div className="edit-inputs">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task title"
                      />
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                    />
                    <div className="edit-actions">
                      <button
                        onClick={() => handleSaveEdit(task._id)}
                        className="btn-save"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-left">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        className="task-checkbox"
                      />
                      <div className="task-info">
                        <div className="task-title-row">
                          <span className="task-title">{task.title}</span>
                          <span className={`badge priority-${task.priority}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="task-desc">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="task-actions">
                      <button
                        onClick={() => startEditing(task)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
