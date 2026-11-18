# Full-Stack To-Do List Application (Node.js, Express.js, MongoDB & React.js)

## Overview
This project implements a full-stack **To-Do List application** split into two parts:
1. **Part 1 — Backend API (`backend/`):** Built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** following a clean **Routes → Controller → Service → Model** architecture, complete with centralized error handling and input validation.
2. **Part 2 — Frontend Integration (`frontend/`):** Built with **React.js (Vite)** and **Axios** to communicate seamlessly with the backend CRUD, status toggle, and search endpoints.

---

## Project Architecture & Folder Structure

```text
Todo_FullStack_MERN/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup using Mongoose
│   ├── models/
│   │   └── Task.js               # Mongoose Task Schema & validation rules
│   ├── services/
│   │   └── taskService.js        # Database query logic (CRUD + Search + Filter)
│   ├── controllers/
│   │   └── taskController.js     # Request/response handling & ID/body validation
│   ├── routes/
│   │   └── taskRoutes.js         # Express Router endpoints (/api/tasks)
│   ├── middleware/
│   │   └── errorMiddleware.js    # Centralized 404 & global error handling
│   ├── .env.example              # Environment variable template
│   ├── package.json
│   └── server.js                 # Express server entry point
└── frontend/
    ├── src/
    │   ├── services/
    │   │   └── api.js            # Axios HTTP client & API functions
    │   ├── App.jsx               # Main To-Do UI (Create, Read, Update, Delete, Search)
    │   ├── App.css               # Responsive styles
    │   └── main.jsx              # React DOM root
    ├── .env.example
    └── package.json
```

---

## API Endpoints Reference

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Retrieve all tasks (supports `?search=keyword` and `?completed=true\|false`) | None |
| `GET` | `/api/tasks/:id` | Retrieve a single task by its MongoDB `_id` | None |
| `POST` | `/api/tasks` | Create a new task | `{ "title": "Task name", "description": "...", "priority": "medium" }` |
| `PUT` | `/api/tasks/:id` | Update task details (`title`, `description`, `priority`, `completed`) | `{ "title": "Updated title", "description": "..." }` |
| `PATCH` | `/api/tasks/:id` | Toggle task completion status | `{ "completed": true }` |
| `DELETE` | `/api/tasks/:id` | Delete a task by ID | None |

---

## Environment Variables

### Backend (`backend/.env`)
Create a `.env` file inside the `backend/` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/todo_app
```
*(You can also use a MongoDB Atlas connection string for `MONGO_URI`).*

### Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend/` folder:
```env
VITE_API_URL=http://localhost:5000/api/tasks
```

---

## Setup & Installation Instructions

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```
The Express server will start at `http://localhost:5000` and connect to MongoDB.

### 2. Start the React Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL shown in the terminal (typically `http://localhost:5173`) in your browser.

---

## Testing with Postman
1. **Create Task:** Send a `POST` request to `http://localhost:5000/api/tasks` with header `Content-Type: application/json` and body:
   ```json
   {
     "title": "Finish MongoDB integration",
     "description": "Test CRUD endpoints in Postman",
     "priority": "high"
   }
   ```
2. **Get All / Search Tasks:** Send a `GET` request to `http://localhost:5000/api/tasks` (or `http://localhost:5000/api/tasks?search=MongoDB`).
3. **Update Task Status:** Copy the `_id` from the created task and send a `PATCH` request to `http://localhost:5000/api/tasks/<_id>` with body `{ "completed": true }`.
4. **Delete Task:** Send a `DELETE` request to `http://localhost:5000/api/tasks/<_id>`.

---

## Challenges Faced & How They Were Addressed

1. **Structuring Code with Controller-Service-Routes Pattern:**
   - *Challenge:* Keeping database queries separate from HTTP status code logic.
   - *Solution:* Separated Mongoose queries into `services/taskService.js` and HTTP validation/responses into `controllers/taskController.js`.
2. **Handling Invalid MongoDB ObjectIds:**
   - *Challenge:* Passing a malformed ID in `/api/tasks/:id` caused Mongoose to throw a `CastError` (500 error) instead of a 400 error.
   - *Solution:* Added `mongoose.Types.ObjectId.isValid(id)` checks in the controller before querying the database.
3. **CORS Between React and Express:**
   - *Challenge:* The browser blocked Axios requests from `http://localhost:5173` to `http://localhost:5000`.
   - *Solution:* Configured the `cors` middleware in `backend/server.js`.
4. **Keeping Frontend UI Synchronized:**
   - *Challenge:* Reflecting database updates immediately without reloading the browser page.
   - *Solution:* Used React `useState` updates immediately upon receiving the resolved Axios response from `POST`, `PUT`, `PATCH`, and `DELETE` calls, along with loading and error banners.
