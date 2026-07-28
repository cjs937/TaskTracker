/**
 * database.js
 * 
 * This is a template for database operations using SQLite3.
 * It uses SQLite3, which is a file-based database that runs locally without requiring
 * a separate database server.
 * 
 * Main responsibilities:
 * - Establish connection to SQLite database
 * - Initialize database tables (YOU NEED TO ADD YOUR TABLE SCHEMAS)
 * - Provide helper functions for common database operations
 * 
 * NOTE: The database file will be created automatically when this file first runs.
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
 * 
 * @param {sqlite3.Database} db - Database connection
 */
function initializeDatabase(db) {
  console.log("Initializing TaskTracker Database");

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      authority TEXT CHECK (authority IN ("admin", "user", "viewer")) NOT NULL
    )`, (error) => {
      if(error) { console.error("Error creating users table:", error.message); }}
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      tags TEXT,
      description TEXT,
      user_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (error) => {
      if(error) { console.error("Error creating projects table:", error.message); }}
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS task_lists (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      project_id INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`, (error) => {
      if(error) { console.error("Error creating task_lists table:", error.message); }}
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0 NOT NULL,
      priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) NOT NULL,
      due_date TEXT,
      created_at TEXT NOT NULL,
      tags TEXT,
      task_list_id INTEGER NOT NULL,
      FOREIGN KEY (task_list_id) REFERENCES task_lists(id) ON DELETE CASCADE
    )`, (error) => {
      if(error) { console.error("Error creating tasks table:", error.message); }}
  );
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
