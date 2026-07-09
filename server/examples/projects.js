/**
 * routes/projects.js
 * 
 * This file defines all API endpoints related to project operations.
 * It handles CRUD operations for projects and their associated task lists.
 * 
 * Endpoints defined here:
 * - GET /api/projects - Get all projects or filter by user
 * - GET /api/projects/:id - Get a specific project with its task lists
 * - POST /api/projects - Create a new project
 * - PUT /api/projects/:id - Update an existing project
 * - DELETE /api/projects/:id - Delete a project
 * - GET /api/projects/:id/tasklists - Get all task lists for a project
 * - POST /api/projects/:id/tasklists - Create a new task list in a project
 */

const express = require('express');
const router = express.Router();
const { query, run, get } = require('../database');

/**
 * GET /api/projects
 * 
 * Retrieve projects. Can filter by user_id query parameter.
 * 
 * Query parameters:
 * - user_id (optional): Filter projects by user
 * 
 * Returns: Array of project objects
 */
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    let sql;
    let params;

    if (user_id) {
      // Get projects for a specific user
      sql = 'SELECT * FROM projects WHERE user_id = ? ORDER BY name';
      params = [user_id];
    } else {
      // Get all projects (you might want to restrict this in production)
      sql = 'SELECT * FROM projects ORDER BY name';
      params = [];
    }

    const projects = await query(req.db, sql, params);
    
    // Parse tags from JSON string to array
    const formattedProjects = projects.map(project => ({
      ...project,
      tags: project.tags ? JSON.parse(project.tags) : []
    }));

    res.json(formattedProjects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/projects/:id
 * 
 * Retrieve a single project by its ID, including all its task lists and tasks.
 * This is a more complex query that joins multiple tables to get the full project structure.
 * 
 * URL parameters:
 * - id: The project ID
 * 
 * Returns: Project object with nested task lists and tasks
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the project
    const project = await get(req.db, 'SELECT * FROM projects WHERE id = ?', [id]);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all task lists for this project
    const taskLists = await query(
      req.db, 
      'SELECT * FROM task_lists WHERE project_id = ? ORDER BY created_at DESC',
      [id]
    );

    // For each task list, get its tasks
    const taskListsWithTasks = await Promise.all(
      taskLists.map(async (taskList) => {
        const tasks = await query(
          req.db,
          'SELECT * FROM tasks WHERE task_list_id = ? ORDER BY created_at DESC',
          [taskList.id]
        );

        return {
          ...taskList,
          createdAt: new Date(taskList.created_at),
          tasks: tasks.map(task => ({
            ...task,
            completed: task.completed === 1,
            dueDate: task.due_date ? new Date(task.due_date) : null,
            createdAt: new Date(task.created_at)
          }))
        };
      })
    );

    // Format the project object
    const formattedProject = {
      ...project,
      tags: project.tags ? JSON.parse(project.tags) : [],
      taskLists: taskListsWithTasks
    };

    res.json(formattedProject);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * POST /api/projects
 * 
 * Create a new project.
 * 
 * Request body should contain:
 * - name (required): Project name
 * - user_id (required): ID of the user who owns this project
 * - tags (optional): Array of tag strings
 * 
 * Returns: Created project object
 */
router.post('/', async (req, res) => {
  try {
    const { name, user_id, tags } = req.body;

    // Validate required fields
    if (!name || !user_id) {
      return res.status(400).json({ error: 'Name and user_id are required' });
    }

    // Generate a unique ID
    const id = Date.now().toString();

    const sql = `
      INSERT INTO projects (id, name, user_id, tags)
      VALUES (?, ?, ?, ?)
    `;

    const params = [
      id,
      name,
      user_id,
      tags ? JSON.stringify(tags) : null
    ];

    await run(req.db, sql, params);

    // Fetch and return the created project
    const createdProject = await get(req.db, 'SELECT * FROM projects WHERE id = ?', [id]);
    
    const formattedProject = {
      ...createdProject,
      tags: createdProject.tags ? JSON.parse(createdProject.tags) : []
    };

    res.status(201).json(formattedProject);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * PUT /api/projects/:id
 * 
 * Update an existing project.
 * 
 * URL parameters:
 * - id: The project ID
 * 
 * Request body can contain:
 * - name
 * - tags
 * 
 * Returns: Updated project object
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tags } = req.body;

    // Build the UPDATE query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(tags));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    const sql = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
    
    await run(req.db, sql, params);

    // Fetch and return the updated project
    const updatedProject = await get(req.db, 'SELECT * FROM projects WHERE id = ?', [id]);
    
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const formattedProject = {
      ...updatedProject,
      tags: updatedProject.tags ? JSON.parse(updatedProject.tags) : []
    };

    res.json(formattedProject);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

/**
 * DELETE /api/projects/:id
 * 
 * Delete a project. This will also delete all associated task lists and tasks
 * due to the ON DELETE CASCADE foreign key constraint.
 * 
 * URL parameters:
 * - id: The project ID
 * 
 * Returns: Success message
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'DELETE FROM projects WHERE id = ?';
    const result = await run(req.db, sql, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

/**
 * GET /api/projects/:id/tasklists
 * 
 * Get all task lists for a specific project.
 * 
 * URL parameters:
 * - id: The project ID
 * 
 * Returns: Array of task list objects
 */
router.get('/:id/tasklists', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = 'SELECT * FROM task_lists WHERE project_id = ? ORDER BY created_at DESC';
    const taskLists = await query(req.db, sql, [id]);
    
    const formattedTaskLists = taskLists.map(taskList => ({
      ...taskList,
      createdAt: new Date(taskList.created_at)
    }));

    res.json(formattedTaskLists);
  } catch (err) {
    console.error('Error fetching task lists:', err);
    res.status(500).json({ error: 'Failed to fetch task lists' });
  }
});

/**
 * POST /api/projects/:id/tasklists
 * 
 * Create a new task list within a project.
 * 
 * URL parameters:
 * - id: The project ID
 * 
 * Request body should contain:
 * - name (required): Task list name
 * 
 * Returns: Created task list object
 */
router.post('/:id/tasklists', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const taskListId = Date.now().toString();
    const createdAt = new Date().toISOString();

    const sql = `
      INSERT INTO task_lists (id, name, project_id, created_at)
      VALUES (?, ?, ?, ?)
    `;

    await run(req.db, sql, [taskListId, name, id, createdAt]);

    const createdTaskList = await get(req.db, 'SELECT * FROM task_lists WHERE id = ?', [taskListId]);
    
    const formattedTaskList = {
      ...createdTaskList,
      createdAt: new Date(createdTaskList.created_at)
    };

    res.status(201).json(formattedTaskList);
  } catch (err) {
    console.error('Error creating task list:', err);
    res.status(500).json({ error: 'Failed to create task list' });
  }
});

module.exports = router;
