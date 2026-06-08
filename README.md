# Jisa Proto - Tactical Project & Issue Management System

Jisa Proto is a modern, high-performance project and issue management platform designed with a sleek, high-tech tactical dashboard aesthetic ("Mission Control"). It allows teams to organize projects, track tasks (issues), manage team members, and collaborate via comments in a secure, containerized environment.

---

## 🚀 Key Features

* **Tactical Dashboard**: Full overview of project health, real-time activity, and squad metrics.
* **Project & Member Management**: Group tasks by project, assign roles, and collaborate with team members.
* **Issue Tracking**: Create, assign, prioritize, and update tasks dynamically (similar to Jira/Linear).
* **Interactive Comments**: Threaded discussion on individual issues to maintain context.
* **Secure Authentication**: Session-based login with JSON Web Tokens (JWT), token rotation, and password reset flows.

---

## 🛠️ Technology Stack & Rationale

Jisa Proto is built with a decoupled client-server architecture using modern, production-grade technologies:

### 1. Frontend (Client)
* **Next.js (App Router) & React**: Chosen for server-side rendering (SSR), optimized build performance, and an intuitive directory-based routing system.
* **Redux Toolkit**: Centralized state management for authentication, project selections, and issues, preventing prop-drilling and ensuring UI predictability.
* **Redux Persist**: Automatically saves auth sessions and critical app states to local storage, keeping users logged in across page refreshes.
* **TailwindCSS**: Used for rapid UI prototyping and consistent styling. Enabled the creation of the application's unique neon tactical aesthetic (dark modes, cybernetic grids, and micro-animations).
* **Lucide React**: Lightweight vector icon library that fits the clean, tactical design language.

### 2. Backend (Server)
* **Node.js & Express**: Provides a lightweight, fast, and scalable event-driven framework to handle API requests.
* **TypeScript**: Used throughout the backend to enforce strict type-safety, catch bugs early in development, and provide autocompletion.
* **MySQL**: Relational database chosen to enforce strong data integrity using foreign keys (e.g., automatically deleting user sessions and comments when a user is deleted via `ON DELETE CASCADE`).
* **JWT (JSON Web Tokens)**: Implements secure, stateless authentication using short-lived Access Tokens and long-lived Refresh Tokens stored in the database.
* **Bcrypt**: Used to securely hash and salt user passwords before storing them.
* **Express Validator**: Validates incoming request payloads on the server level, securing the endpoints from malformed data.
* **Nodemailer**: Integrates email sending capabilities to handle password reset verification links.
* **tsc-alias**: Resolves compiler-only path aliases (like `@src/*`) into actual relative paths inside the `/dist` production output.

### 3. Containerization & DevOps
* **Docker & Docker Compose**: Containers package the frontend, backend, and MySQL database separately. This ensures the entire application runs identically across developer environments and production servers with a single command.

---

## ⚙️ Project Structure

```text
├── backend/            # Express API server (TypeScript)
│   ├── src/
│   │   ├── config/     # Database setup & initialization scripts
│   │   ├── controllers/# Route controllers (request handling)
│   │   ├── middleware/ # Auth validation, rate limiters, etc.
│   │   ├── repositories/# Database queries & repository layer
│   │   ├── services/   # Business logic layer
│   │   └── utils/      # JWT, Mailers, and Helper functions
│   ├── Dockerfile
│   └── package.json
│
├── frontend/           # Next.js Client App (React)
│   ├── app/            # App router pages (dashboard, login, register)
│   ├── store/          # Redux Toolkit store and slices
│   ├── utils/          # API endpoints and network configurations
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml  # Docker multi-container orchestrator
```

---

## 🏃 Getting Started

### Prerequisites
* [Docker](https://www.docker.com/) and Docker Compose installed.
* Node.js v20+ (if running locally without Docker).

### Option A: Run via Docker (Recommended)
This starts the MySQL database, backend server, and frontend web client together.

1. Ensure port `3306` (MySQL), `5000` (Backend API), and `3000` (Frontend Client) are free on your machine.
2. Spin up the containers:
   ```bash
   docker compose up --build
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Option B: Run Locally for Development

#### 1. Database Setup
Ensure you have a MySQL server running locally, and create a database named `project_manager`.

#### 2. Backend Config & Run
1. Go into the backend folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file from the environment variables defined in `docker-compose.yml`:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=project_manager
   JWT_SECRET=superkey
   JWT_REFRESH_SECRET=superrefresh
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server (runs with hot reloading via `tsx`):
   ```bash
   npm run dev
   ```

#### 3. Frontend Config & Run
1. Open a new terminal and go into the frontend folder:
   ```bash
   cd frontend
   ```
2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
