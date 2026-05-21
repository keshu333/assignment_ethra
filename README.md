# SyncPlan | Full-Stack Team Task Manager

SyncPlan is a premium, production-ready Full-Stack Team Task Manager designed to provide seamless project coordination, task tracking, and team collaboration. It features a stunning modern glassmorphic UI, dynamic Kanban boards, interactive analytics, and robust role-based access control.

## 🚀 Features

### Authentication & Authorization
- Secure JWT-based authentication
- Password hashing with bcrypt
- Role-Based Access Control (Admin / Member)
- Persistent sessions and protected routes

### Dashboard Analytics
- Real-time workspace statistics
- Interactive SVG-based progress rings and priority distribution charts
- Workspace activity timeline logging
- Quick access to high-priority pending tasks

### Project Management
- Create, edit, and delete projects (Admin)
- Assign team members to specific projects
- Set and track project deadlines
- Visual progress bars based on task completion

### Task Coordination
- Dual-view interface: Interactive Drag-and-Drop Kanban Board and classic List View
- Filter by project, priority, and search by title
- Detailed task side-panels with description, due dates, and assignments
- Real-time comment system and activity logging
- File attachment tracking (mock/URL-based)

### Team Directory
- Manage organization members and their roles
- Invite new team members with default credentials
- Revoke access and clean up associated tasks automatically

### Schedule Calendar
- Custom interactive calendar grid
- Highlighted days with impending task deadlines
- Click-to-audit details pane for specific dates

## 🛠️ Technology Stack

**Frontend:**
- React.js + Vite
- Tailwind CSS v4 (Pure CSS configuration)
- React Router DOM v7
- Axios (with automated token interceptors)
- Context API (Auth, Theme, and Toast notifications)
- Framer Motion (Micro-animations)
- Lucide React (Premium Iconography)

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas URI)

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5005
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=supersecret123key_teamtaskmanager
JWT_EXPIRE=30d
NODE_ENV=development
```

*(Note: The frontend expects the backend API at `http://localhost:5005/api` by default. This is configured in `frontend/src/services/api.js`)*

### 3. Seed the Database

Populate the database with sample projects, tasks, team members, and comments to instantly see the dashboard in action:

```bash
cd backend
npm run seed
```

**Demo Credentials:**
- **Admin:** `admin@test.com` / `password123`
- **Member:** `member@test.com` / `password123`

### 4. Run the Application

**Start Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

## 🌐 API Documentation

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/auth/register` | POST | Public | Register a new user |
| `/api/auth/login` | POST | Public | Authenticate user & get token |
| `/api/auth/me` | GET | Private | Get current user details |
| `/api/projects` | GET | Private | Get projects (Filtered by user access) |
| `/api/projects` | POST | Admin | Create a new project |
| `/api/projects/:id` | PUT/DELETE | Admin | Update/Delete project |
| `/api/tasks` | GET | Private | Get tasks (Supports query filters) |
| `/api/tasks` | POST | Admin | Create a new task |
| `/api/tasks/:id` | PUT | Private | Update task (Members can only update status) |
| `/api/tasks/:id/comments` | POST | Private | Add a comment to a task |
| `/api/tasks/:id/attachments` | POST | Private | Attach a file link to a task |
| `/api/users` | GET | Private | Get all team members |
| `/api/users/profile` | PUT | Private | Update own profile |
| `/api/users/role/:id` | PUT | Admin | Change member's role |

## 🚀 Deployment Guide

### Frontend (Vercel)
1. Build the project: `cd frontend && npm run build`
2. Push your repository to GitHub.
3. Import the project into Vercel.
4. Set the Framework Preset to **Vite**.
5. Update `src/services/api.js` to point `API_BASE_URL` to your production backend URL before deploying, or use Vercel Environment Variables.
6. Deploy!

### Backend (Railway)
1. Push your backend code to GitHub.
2. Create a new project in [Railway.app](https://railway.app/).
3. Provision a **MongoDB Database** service within your Railway project.
4. Deploy the backend from your GitHub repository.
5. Add the following Environment Variables in Railway:
   - `MONGO_URI` (Use the internal connection string provided by the Railway MongoDB service)
   - `JWT_SECRET`
   - `PORT` (Railway assigns this automatically)
6. Redeploy the backend.

## 📸 Screenshots

*(Add screenshots of your stunning Glassmorphic Dashboard, Kanban Board, and Dark Mode here)*

---
*Developed as a comprehensive full-stack task management solution.*
