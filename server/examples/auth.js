/**
 * routes/auth.js
 * 
 * This file handles authentication-related endpoints.
 * 
 * IMPORTANT SECURITY NOTE: This is a basic implementation for development purposes.
 * In production, you should:
 * - Hash passwords using bcrypt or similar (never store plain text!)
 * - Use JWT (JSON Web Tokens) or sessions for authentication
 * - Implement proper password validation
 * - Add rate limiting to prevent brute force attacks
 * - Use HTTPS only
 * 
 * Endpoints defined here:
 * - POST /api/auth/register - Register a new user
 * - POST /api/auth/login - Login an existing user
 * - POST /api/auth/logout - Logout a user (client-side token removal)
 */

const express = require('express');
const router = express.Router();
const { get, run, query } = require('../database');

/**
 * POST /api/auth/register
 * 
 * Register a new user account.
 * 
 * Request body should contain:
 * - name (required): Username (must be unique)
 * - password (required): Password (will be stored as plain text - NOT SECURE for production!)
 * 
 * Returns: Created user object (without password)
 */
router.post('/register', async (req, res) => {
  try {
    const { name, password } = req.body;

    // Validate required fields
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    // Check if user already exists
    const existingUser = await get(req.db, 'SELECT * FROM users WHERE name = ?', [name]);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Generate a unique ID
    const userId = Date.now().toString();

    // Insert new user
    // WARNING: In production, hash the password before storing!
    const sql = 'INSERT INTO users (id, name, password) VALUES (?, ?, ?)';
    await run(req.db, sql, [userId, name, password]);

    // Fetch and return the created user (without password)
    const newUser = await get(req.db, 'SELECT id, name FROM users WHERE id = ?', [userId]);

    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * POST /api/auth/login
 * 
 * Authenticate a user and return their data.
 * 
 * Request body should contain:
 * - name (required): Username
 * - password (required): Password
 * 
 * Returns: User object with their projects if authentication succeeds
 * 
 * NOTE: This does not implement JWT or session management.
 * In production, you should return a token that the client stores and sends
 * with subsequent requests.
 */
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    // Validate required fields
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    // Find user by name
    const user = await get(req.db, 'SELECT * FROM users WHERE name = ?', [name]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (plain text comparison - NOT SECURE for production!)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Fetch user's projects
    const projects = await query(
      req.db,
      'SELECT * FROM projects WHERE user_id = ? ORDER BY name',
      [user.id]
    );

    // Format projects with parsed tags
    const formattedProjects = projects.map(project => ({
      ...project,
      tags: project.tags ? JSON.parse(project.tags) : []
    }));

    // Return user data without password
    const userData = {
      id: user.id,
      name: user.name,
      projects: formattedProjects
    };

    res.json(userData);
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * POST /api/auth/logout
 * 
 * Logout a user.
 * 
 * NOTE: Since this implementation doesn't use sessions or JWT, logout is handled
 * entirely on the client side by removing the stored user data.
 * This endpoint exists for API completeness and future session management.
 * 
 * Returns: Success message
 */
router.post('/logout', (req, res) => {
  // In a session-based or JWT implementation, you would:
  // - Invalidate the session
  // - Add the JWT to a blacklist
  // - Or simply rely on token expiration
  
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
