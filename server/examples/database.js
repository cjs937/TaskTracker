/**
 * database.js
 * 
 * This file handles all database operations for the TaskTracker application.
 * It uses SQLite3, which is a file-based database that runs locally without requiring
 * a separate database server. The database file will be created as 'database.db' in the
 * server directory.
 * 
 * Main responsibilities:
 * - Establish connection to SQLite database
 * - Initialize database tables (users, projects, task_lists, tasks)
 * - Provide helper functions for common database operations
 * 
 * NOTE: You will need to create the database.db file yourself before running the server.
 * You can do this by running: sqlite3 database.db < schema.sql (if you create a schema.sql file)
 * Or the database will be created automatically when this file first runs.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path - this will be created in the server directory
const DB_PATH = path.join(__dirname, 'database.db');

/**
 * Get a database connection
 * This function creates and returns a new database connection.
 * In a production app, you might want to use connection pooling.
 * 
 * @returns {sqlite3.Database} - SQLite database connection
 */
function getDb() {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
    } else {
      console.log('Connected to SQLite database');
    }
  });
  return db;
}

/**
 * Initialize database tables
 * This function creates all necessary tables if they don't exist.
 * The schema is designed to match the TypeScript interfaces defined in the frontend:
 * - User: id, name, password (in production, hash this!)
 * - Project: id, name, user_id (foreign key to users), tags (stored as JSON string)
 * - TaskList: id, name, project_id (foreign key to projects), created_at
 * - Task: id, title, description, completed, priority, due_date, task_list_id, created_at
 * 
 * @param {sqlite3.Database} db - Database connection
 */
function initializeDatabase(db) {
  // Create users table
  // Stores user authentication information
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err.message);
  });

  // Create projects table
  // Stores project information, linked to users
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      tags TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating projects table:', err.message);
  });

  // Create task_lists table
  // Stores task lists, linked to projects
  db.run(`
    CREATE TABLE IF NOT EXISTS task_lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      project_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating task_lists table:', err.message);
  });

  // Create tasks table
  // Stores individual tasks, linked to task lists
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')),
      due_date TEXT,
      task_list_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_list_id) REFERENCES task_lists(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating tasks table:', err.message);
  });
}

/**
 * Helper function to run a query and return results as a Promise
 * This wraps the SQLite callback pattern in a Promise for easier async/await usage
 * 
 * @param {sqlite3.Database} db - Database connection
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} - Resolves with query results
 */
function query(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Helper function to run a query that doesn't return rows (INSERT, UPDATE, DELETE)
 * 
 * @param {sqlite3.Database} db - Database connection
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} - Resolves when query completes
 */
function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Helper function to get a single row
 * 
 * @param {sqlite3.Database} db - Database connection
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} - Resolves with single row or null
 */
function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = {
  getDb,
  initializeDatabase,
  query,
  run,
  get
};
