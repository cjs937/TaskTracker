# TaskTracker
A full-stack task management app with projects, task lists, and tasks,
Built to gain experience with React & Typescript, and explore client-server networking architecture.

![Login Page](./screenshots/loginpage.png) 
![Task List View](./screenshots/tasklists.png) 
![Task Modal](./screenshots/taskmodal.png)

## Tech Stack
- Frontend: React, Tailwind
- Backend: Node.js, Express
- Database: SQLite
- Auth: JWT-based

## Architecture
The data model follows a Users → Projects → Task Lists → Tasks hierarchy. This enables SQL's delete cascade behavior to clean up downstream data when their parents are deleted.
The server has API request routes that represent each type in this hierarchy. This split keeps things decoupled and reduces clutter in their respective files. Server auth uses JWTs stored in localStorage for easy access. In the future tokens would probably be more secure as cookies instead.
Because this is a learning project, it uses a local SQLite database. This would probably change to another more robust SQL engine if it were moved to production.

## Future Work
- **Task Tags**: Currently unimplemented, but data is there in TS and on the database. A fuller implementation would allow users to manage their tags per-project, assign those tags to tasks, and edit available tags in a separate tag manager modal.
- **All Task Data**: There is also task data that's unrepresented on the site, but data is also set up for use. A fuller implementation would allow users to view and edit this data.
- **User Authority**: Users have authority data that is also unused. In the future I would authenticate certain API requests by checking the user's authority to perform these actions, block data from users of certain authority levels, and create an admin panel with additional admin-level features.
- **Better Client Architecture**: The client architecture has some clunky logic that is harmed by the way it was structured. A lot of the [useEffects] and data refresh functions were added out of necessity as afterthoughts, and a lot of data is being requested from the server in places where it could have been cached. In the future the way data is passed through the app and updated visually should be planned out a bit more. 
- **Prepare for Build**: The project isn't quite ready to build for deployment. Some updates are needed to prepare it for this.

## Running Locally
1 - Install dependencies
Open the console at the root folder and run:

```bash
npm run install:all
```

2 - Create JWT secret

Create a file in the server folder named .env. In that folder make an entry named [JWT_SECRET]
Then run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy & paste that result as the value for [JWT_SECRET] 

```js
JWT_SECRET=(Generated Value)
```
If you want to change the default server port from 3001, make another entry named [PORT] and set it to the port of your choice.

3 - Start server and client

Starting from the root, open a terminal and run:
```bash
cd server
npm run dev
```
Then open another terminal and run:
```bash
cd client
npm run dev
```
Then you can either press (o + enter) in the client terminal or navigate to http://localhost:5173/ bring up a window with the website.

4 - Make stuff

From here you can register an account and play around with the app! If you want to change any project & task related text fields, double click on them and they should allow editing. The database should be local in a file called "database.db" in the server file.
