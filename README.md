# Mini Attendance Management System

A full-stack web application that lets an administrator log in, manage employees,
mark and review attendance, and see attendance statistics on a dashboard.

**Stack:** React (Vite) → Flask REST API → MySQL

---

## 1. Project Overview

This is a small, interview-friendly CRUD application built around one core idea:
an admin manages a list of **employees**, and records daily **attendance** against
them. The **dashboard** summarizes both.

### Objective

Give a hiring manager a realistic, working example of end-to-end feature delivery:
a React frontend that talks to a Flask REST API, which reads and writes to a
normalized MySQL database, with proper authentication, validation and error
handling throughout.

## 2. Features

- **Authentication** — admin login backed by a hashed password in MySQL, protected
  API routes via JWT.
- **Employee Management** — add, view, search, edit, delete employees; view a
  single employee's details.
- **Attendance Management** — mark attendance (Present/Absent/Leave) with
  check-in/check-out times, view all records with date/status filters, see a
  running summary, and view one employee's full attendance history (with an
  attendance % calculation).
- **Dashboard** — total/active employees, present/absent today, and a
  department-wise employee breakdown, all calculated in the database.
- **Validation & error handling** — on both frontend and backend, with
  consistent JSON error responses and meaningful HTTP status codes.

## 3. Technology Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite, React Router, plain CSS |
| Backend   | Python, Flask, Flask-CORS, PyJWT |
| Database  | MySQL (via mysql-connector-python) |
| Auth      | Werkzeug password hashing + JWT |
| Tooling   | Postman collection, `.env` based configuration |

No TypeScript, no Next.js, no Node backend, no MongoDB — kept intentionally simple.

## 4. Architecture

```
 ┌───────────────┐        HTTPS/JSON        ┌───────────────┐        SQL        ┌───────────────┐
 │  React (Vite) │  ───────────────────────▶ │  Flask REST   │ ─────────────────▶ │     MySQL     │
 │  :5173        │ ◀─────────────────────── │  API :5000    │ ◀───────────────── │  attendance_db│
 └───────────────┘                          └───────────────┘                    └───────────────┘
```

- The **React app** never talks to MySQL directly — it only calls the Flask API.
- **Flask** validates every request, runs parameterized SQL queries, and returns
  a consistent JSON envelope: `{ "success": true/false, "data": ..., "message": ... }`.
- **MySQL** is the single source of truth; all dashboard/summary numbers are
  calculated there, not in the browser.

## 5. Database Design

Three tables: `users`, `employees`, `attendance`.

```
employees (1) ───────────< (many) attendance
   employee_id                     employee_id (FK)
```

- **users** — admin login credentials. Passwords are stored as
  `pbkdf2:sha256` hashes (via Werkzeug), never in plain text.
- **employees** — the single source of truth for employee data (name, email,
  mobile, department, designation, status).
- **attendance** — one row per employee per date. It stores only `employee_id`,
  never the employee's name — that's what keeps the schema **normalized**: if an
  employee's name changed, we'd only update one row in `employees`, not every
  attendance record they ever had.

Constraints used:
- `PRIMARY KEY` on each table's id column.
- `UNIQUE` on `employees.email` (no duplicate emails) and on
  `(employee_id, attendance_date)` in `attendance` (no duplicate attendance for
  the same employee on the same day — enforced by the database, not just the app).
- `FOREIGN KEY (attendance.employee_id) REFERENCES employees(employee_id)`
  with `ON DELETE CASCADE` — deleting an employee also removes their attendance
  history, so we never end up with "orphan" rows pointing at a deleted employee.
  (See "Future Improvements" for why a real production system might prefer
  soft-deletes instead.)
- `CHECK (CHAR_LENGTH(mobile_number) >= 10)` on employees.
- `created_at`/`updated_at` audit columns on every table.

## 6. Database Relationships

One employee can have many attendance records (one-to-many). There is no
many-to-many relationship in this schema, which keeps it simple to reason about
and to explain.

## 7. API Endpoints

All responses are JSON in the shape `{ "success": bool, "data"?: ..., "message": str }`.
All routes except `/auth/login` and `/health` require
`Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST   | `/api/auth/login` | Log in, returns a JWT + user info |
| POST   | `/api/employees` | Create an employee |
| GET    | `/api/employees` | List employees (supports `?search=`, `?department=`, `?status=`) |
| GET    | `/api/employees/<id>` | Get one employee |
| PUT    | `/api/employees/<id>` | Update an employee |
| DELETE | `/api/employees/<id>` | Delete an employee |
| POST   | `/api/attendance` | Mark attendance |
| GET    | `/api/attendance` | List attendance (supports `?date=`, `?status=`) |
| GET    | `/api/attendance/summary` | Present/Absent/Leave counts |
| GET    | `/api/attendance/employee/<id>` | One employee's attendance history |
| GET    | `/api/dashboard/stats` | Dashboard statistics |
| GET    | `/api/health` | Health check (no auth) |

## 8. Folder Structure

```
attendance-management-system/
├── backend/
│   ├── app.py                 # Flask app entry point
│   ├── config.py              # Loads .env into a Config class
│   ├── requirements.txt
│   ├── .env.example
│   ├── database/
│   │   └── db.py              # Connection + query helper (with SQL-injection-safe params)
│   ├── routes/                # One blueprint per module
│   │   ├── auth_routes.py
│   │   ├── employee_routes.py
│   │   ├── attendance_routes.py
│   │   └── dashboard_routes.py
│   └── utils/
│       ├── auth.py            # Password hashing + JWT
│       ├── validators.py      # Backend input validation
│       └── responses.py       # Consistent JSON response helpers
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx / App.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── hooks/useAuth.js
│   │   ├── services/          # One file per API resource (api.js is the shared base)
│   │   ├── components/        # Sidebar, Topbar, StatCard, StatusBadge, etc.
│   │   ├── pages/              # Login, Dashboard, Employees, Attendance, ...
│   │   └── utils/validators.js
│   └── package.json
│
├── database/
│   └── attendance.sql          # Full schema + seed data, runnable from scratch
│
├── postman/
│   └── attendance-management.postman_collection.json
│
├── README.md
├── INTERVIEW_GUIDE.md
├── TESTING_CHECKLIST.md
└── .gitignore
```

## 9. Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- MySQL 8.x (or MariaDB 10.x) running locally

## 10. Database Setup

```bash
mysql -u root -p < database/attendance.sql
```

This script:
1. Drops and recreates the `attendance_db` database.
2. Creates a dedicated `attendance_user` MySQL account (password `attendance_pass`)
   scoped to just this database — the app doesn't need to connect as `root`.
3. Creates all three tables with constraints and indexes.
4. Seeds a default admin user and a handful of sample employees/attendance rows.

> Change the `attendance_user` password in both the SQL script and your `.env`
> before using this anywhere beyond local development.

## 11. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit .env with your local DB credentials
python app.py
```

The API runs on **http://localhost:5000**.

### Environment Variables (`backend/.env`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `attendance_user` |
| `DB_PASSWORD` | MySQL password | `attendance_pass` |
| `DB_NAME` | Database name | `attendance_db` |
| `FLASK_DEBUG` | Enable Flask debug mode | `True` |
| `JWT_SECRET_KEY` | Secret used to sign JWTs | *(long random string)* |
| `JWT_EXPIRY_HOURS` | Token lifetime | `8` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## 12. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env    # defaults already point at http://localhost:5000/api
npm run dev
```

The app runs on **http://localhost:5173**.

## 13. How to Run the Application

1. Start MySQL and import `database/attendance.sql` (once).
2. In one terminal: `cd backend && python app.py`
3. In another terminal: `cd frontend && npm run dev`
4. Open **http://localhost:5173** in your browser.

## 14. Default Login

| Username | Password |
|----------|----------|
| `admin`  | `Admin@123` |

## 15. Screenshots

_Add screenshots of the Login, Dashboard, Employees, and Attendance pages here
before submitting, e.g. `screenshots/dashboard.png`._

## 16. Future Improvements

- **Soft-delete employees** instead of hard-deleting (`status = 'Archived'`)
  so attendance history is preserved even after an employee leaves, instead of
  relying on `ON DELETE CASCADE`.
- **Pagination** on the employees and attendance tables for large datasets.
- **Refresh tokens** instead of a single long-lived JWT.
- **Role-based access** (e.g. a read-only "viewer" role vs "admin").
- **CSV export** for attendance reports.
- **Automated tests** (pytest for the backend, React Testing Library for the frontend).
- **Connection pooling** instead of opening a new MySQL connection per request.

## 17. Interview Preparation

See **[INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md)** for a full explanation of the
project, request flows, and 40+ likely interview questions with answers.

See **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** for the manual test
checklist used to verify every mandatory feature before submission.
