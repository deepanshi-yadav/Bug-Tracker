# Bug Tracker – MERN Stack Application

A web-based Bug Tracking and Project Management application that helps teams manage projects, report bugs, assign tasks, and track issue progress through a Kanban board.

## Features

- **User Authentication:** Register and login with JWT-based authentication.
- **Project Management:** Create, view, update, and delete projects.
- **Team Management:** Add and remove team members from projects.
- **Ticket Management:** Create, edit, delete, and assign tickets.
- **Kanban Board:** Track tickets through To Do, In Progress, and Done statuses.
- **Comments:** Add comments to tickets.
- **Search and Filters:** Filter tickets by status, priority, and assignee, and search by keywords.
- **Responsive UI:** Access the application on desktop and mobile devices.

## Technology Stack

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3
- React Router

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt

**Database**
- MongoDB
- Mongoose

**Tools**
- Visual Studio Code
- Postman
- Git and GitHub

## Project Structure

```text
BugTracker/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── pages/
│       ├── router/
│       ├── App.jsx
│       └── main.jsx
│
└── .gitignore
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/deepanshi-yadav/Bug-Tracker.git
cd Bug-Tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
node server.js
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Project Purpose

This project was developed to understand full-stack web development, REST API integration, database management, authentication, project collaboration, and Kanban-based issue tracking.

## Author

**Deepanshi Yadav**

GitHub: https://github.com/deepanshi-yadav
