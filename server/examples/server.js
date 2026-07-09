/**
 * server.js
 * 
 * This is the main entry point for the TaskTracker backend API.
 * It sets up an Express server that handles HTTP requests from the frontend.
 * 
 * Main responsibilities:
 * - Configure Express middleware (CORS, body parsing)
 * - Set up API routes
 * - Start the HTTP server
 * - Initialize the database
 * 
 * The server will run on port 3001 by default (frontend runs on port 5173)
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { getDb, initializeDatabase } = require('./database');

// Import route handlers
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const authRoutes = require('./routes/auth');

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware configuration
// CORS (Cross-Origin Resource Sharing) allows the frontend (on a different port)
// to communicate with this backend. Without this, browsers would block the requests.
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from the Vite dev server
  credentials: true
}));

// body-parser parses incoming request bodies in JSON format
// This makes req.body available in our route handlers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database and get connection
const db = getDb();
initializeDatabase(db);

// Make database connection available to all routes via middleware
// This attaches the db connection to every request object
app.use((req, res, next) => {
  req.db = db;
  next();
});

// API Routes
// All routes are prefixed with /api to distinguish them from other endpoints
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint - useful for testing if the server is running
app.get('/', (req, res) => {
  res.json({ message: 'TaskTracker API is running' });
});

// Error handling middleware
// This catches any errors that occur in route handlers and sends a proper error response
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
// The server listens on the specified port for incoming HTTP requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
