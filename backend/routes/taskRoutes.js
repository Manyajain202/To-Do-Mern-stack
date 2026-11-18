const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

/**
 * Routes Layer: Maps RESTful endpoints to controller functions.
 * Base URL: /api/tasks
 */

// GET /api/tasks (Retrieve all tasks / search tasks) & POST /api/tasks (Create task)
router.route('/').get(getTasks).post(createTask);

// GET /api/tasks/:id, PUT /api/tasks/:id, PATCH /api/tasks/:id, DELETE /api/tasks/:id
router
  .route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
