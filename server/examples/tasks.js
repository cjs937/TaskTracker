/**
 * routes/tasks.js
 * 
 * This file defines all API endpoints related to task operations.
 * It handles CRUD (Create, Read, Update, Delete) operations for tasks.
 * 
 * Endpoints defined here:
 * - GET /api/tasks - Get all tasks or filter by task list
 * - GET /api/tasks/:id - Get a specific task by ID
 * - POST /api/tasks - Create a new task
 * - PUT /api/tasks/:id - Update an existing task
 * - DELETE /api/tasks/:id - Delete a task
 * 
 * Each endpoint uses the database connection (req.db) that was attached
 * by the middleware in server.js
 */

const express = require('express');
const router = express.Router();
const { query, run, get } = require('../database');

/**
 * GET /api/tasks
 * 
 * Retrieve tasks. Can filter by task_list_id query parameter.
 * If no task_list_id is provided, returns all tasks (you might want to restrict this).
 * 
 * Query parameters:
 * - task_list_id (optional): Filter tasks by task list
 * 
 * Returns: Array of task objects
 */
router.get('/', async (req, res) => {
  try {
    const { task_list_id } = req.query;
    let sql;
    let params;

    if (task_list_id) {
      // Get tasks for a specific task list
      // This includes a JOIN to get the task list name
      sql = `
        SELECT t.*, tl.name as task_list_name 
        FROM tasks t
        JOIN task_lists tl ON t.task_list_id = tl.id
        WHERE t.task_list_id = ?
        ORDER BY t.created_at DESC
      `;
      params = [task_list_id];
    } else {
      // Get all tasks (you might want to add user filtering here in production)
      sql = `
        SELECT t.*, tl.name as task_list_name 
        FROM tasks t
        JOIN task_lists tl ON t.task_list_id = tl.id
        ORDER BY t.created_at DESC
      `;
      params = [];
    }

    const tasks = await query(req.db, sql, params);
    
    // Convert the completed field from integer (0/1) to boolean
    // SQLite stores booleans as integers, so we convert them for the frontend
    const formattedTasks = tasks.map(task => ({
      ...task,
      completed: task.completed === 1,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      createdAt: new Date(task.created_at)
    }));

    res.json(formattedTasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/tasks/:id
 * 
 * Retrieve a single task by its ID.
 * 
 * URL parameters:
 * - id: The task ID
 * 
 * Returns: Single task object or 404 if not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT t.*, tl.name as task_list_name 
      FROM tasks t
      JOIN task_lists tl ON t.task_list_id = tl.id
      WHERE t.id = ?
    `;
    
    const task = await get(req.db, sql, [id]);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Format the task object
    const formattedTask = {
      ...task,
      completed: task.completed === 1,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      createdAt: new Date(task.created_at)
    };

    res.json(formattedTask);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

/**
 * POST /api/tasks
 * 
 * Create a new task.
 * 
 * Request body should contain:
 * - title (required): Task title
 * - description (optional): Task description
 * - priority (optional): 'low', 'medium', or 'high'
 * - dueDate (optional): Due date as ISO string
 * - task_list_id (required): ID of the task list this task belongs to
 * 
 * Returns: Created task object
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, task_list_id } = req.body;

    // Validate required fields
    if (!title || !task_list_id) {
      return res.status(400).json({ error: 'Title and task_list_id are required' });
    }

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    // Generate a unique ID (in production, you might use UUID or auto-increment)
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    const sql = `
      INSERT INTO tasks (id, title, description, completed, priority, due_date, task_list_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      title,
      description || null,
      0, // completed defaults to false (0)
      priority || 'medium',
      dueDate || null,
      task_list_id,
      createdAt
    ];

    await run(req.db, sql, params);

    // Fetch and return the created task
    const createdTask = await get(req.db, 'SELECT * FROM tasks WHERE id = ?', [id]);
    
    const formattedTask = {
      ...createdTask,
      completed: createdTask.completed === 1,
      dueDate: createdTask.due_date ? new Date(createdTask.due_date) : null,
      createdAt: new Date(createdTask.created_at)
    };

    res.status(201).json(formattedTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * PUT /api/tasks/:id
 * 
 * Update an existing task.
 * 
 * URL parameters:
 * - id: The task ID
 * 
 * Request body can contain any of:
 * - title
 * - description
 * - completed
 * - priority
 * - dueDate
 * 
 * Returns: Updated task object
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, priority, dueDate } = req.body;

    // Build the UPDATE query dynamically based on provided fields
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      params.push(completed ? 1 : 0);
    }
    if (priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ error: 'Priority must be low, medium, or high' });
      }
      updates.push('priority = ?');
      params.push(priority);
    }
    if (dueDate !== undefined) {
      updates.push('due_date = ?');
      params.push(dueDate);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id); // Add id for WHERE clause

    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    
    await run(req.db, sql, params);

    // Fetch and return the updated task
    const updatedTask = await get(req.db, 'SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const formattedTask = {
      ...updatedTask,
      completed: updatedTask.completed === 1,
      dueDate: updatedTask.due_date ? new Date(updatedTask.due_date) : null,
      createdAt: new Date(updatedTask.created_at)
    };

    res.json(formattedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * DELETE /api/tasks/:id
 * 
 * Delete a task.
 * 
 * URL parameters:
 * - id: The task ID
 * 
 * Returns: Success message
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'DELETE FROM tasks WHERE id = ?';
    const result = await run(req.db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
