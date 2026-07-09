# TaskTracker Backend Server

This is the backend API for the TaskTracker application. It provides RESTful endpoints for managing users, projects, task lists, and tasks.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework for building the API
- **SQLite3** - File-based database (no separate database server needed)
- **CORS** - Enables cross-origin requests from the frontend

## Project Structure

```
server/
├── package.json          # Dependencies and scripts
├── server.js             # Main entry point, Express server setup
├── database.js           # Database connection and schema initialization
├── routes/
│   ├── auth.js           # Authentication endpoints (register, login)
│   ├── projects.js       # Project CRUD endpoints
│   └── tasks.js          # Task CRUD endpoints
└── database.db           # SQLite database file (you create this)
```

## Setup Instructions

### 1. Install Dependencies

Navigate to the server directory and install the required packages:

```bash
cd server
npm install
```

This will install:
- `express` - Web server framework
- `sqlite3` - SQLite database driver
- `cors` - Cross-origin resource sharing middleware
- `body-parser` - Parse JSON request bodies

### 2. Create the Database

**You need to create the database file yourself.** The database will be automatically initialized with the correct schema when you first run the server, but you need to create the empty file first.

#### Option 1: Let the server create it (simplest)
The database file will be created automatically when you first run `node server.js`. The tables will be initialized automatically by the `initializeDatabase()` function in `database.js`.

#### Option 2: Create it manually with SQLite CLI
If you have SQLite installed on your system:

```bash
cd server
sqlite3 database.db
```

Then in the SQLite prompt, you can verify the tables were created after running the server:
```sql
.tables
```

Type `.quit` to exit.

### 3. Start the Server

```bash
npm start
```

Or directly:
```bash
node server.js
```

The server will start on `http://localhost:3001`

You should see:
```
Connected to SQLite database
Server is running on http://localhost:3001
API endpoints available at http://localhost:3001/api
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ name, password }`
  - Returns: User object (without password)

- `POST /api/auth/login` - Login a user
  - Body: `{ name, password }`
  - Returns: User object with their projects

- `POST /api/auth/logout` - Logout a user

### Projects

- `GET /api/projects` - Get all projects (or filter by `?user_id=...`)
- `GET /api/projects/:id` - Get a specific project with task lists and tasks
- `POST /api/projects` - Create a new project
  - Body: `{ name, user_id, tags? }`
- `PUT /api/projects/:id` - Update a project
  - Body: `{ name?, tags? }`
- `DELETE /api/projects/:id` - Delete a project
- `GET /api/projects/:id/tasklists` - Get task lists for a project
- `POST /api/projects/:id/tasklists` - Create a task list in a project
  - Body: `{ name }`

### Tasks

- `GET /api/tasks` - Get all tasks (or filter by `?task_list_id=...`)
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
  - Body: `{ title, description?, priority?, dueDate?, task_list_id }`
- `PUT /api/tasks/:id` - Update a task
  - Body: `{ title?, description?, completed?, priority?, dueDate? }`
- `DELETE /api/tasks/:id` - Delete a task

## Database Schema

### users
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, UNIQUE, NOT NULL)
- `password` (TEXT, NOT NULL) - ⚠️ Plain text in development, hash in production!

### projects
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `user_id` (TEXT, FOREIGN KEY → users.id)
- `tags` (TEXT) - JSON string array

### task_lists
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `project_id` (TEXT, FOREIGN KEY → projects.id)
- `created_at` (TEXT, NOT NULL)

### tasks
- `id` (TEXT, PRIMARY KEY)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `completed` (INTEGER, DEFAULT 0) - 0 or 1
- `priority` (TEXT) - 'low', 'medium', or 'high'
- `due_date` (TEXT)
- `task_list_id` (TEXT, FOREIGN KEY → task_lists.id)
- `created_at` (TEXT, NOT NULL)

## Security Notes

⚠️ **This is a development implementation with known security issues:**

1. **Passwords are stored in plain text** - In production, always hash passwords using bcrypt or similar
2. **No authentication middleware** - The API doesn't verify user identity on requests
3. **No rate limiting** - Vulnerable to brute force attacks
4. **CORS allows all requests from localhost** - Fine for development, restrict in production

For a production deployment, implement:
- Password hashing (bcrypt)
- JWT or session-based authentication
- Authentication middleware to protect routes
- Rate limiting
- HTTPS only
- Input validation and sanitization

## Testing the API

You can test the API using tools like:
- Postman
- curl
- Browser (for GET requests)

Example with curl:

```bash
# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"password"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"password"}'

# Create a project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","user_id":"1","tags":["work","important"]}'
```

## Running with the Frontend

The frontend (Vite dev server) runs on port 5173 by default.
The backend runs on port 3001.

The CORS configuration in `server.js` allows requests from `http://localhost:5173`.

To run both servers:
1. Terminal 1: `cd client && npm run dev`
2. Terminal 2: `cd server && npm start`

Or use the root package.json scripts (if configured):
```bash
npm run dev:all
```
