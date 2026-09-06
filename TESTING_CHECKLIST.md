# Testing Checklist — Mini Attendance Management System

All items below were manually verified end-to-end (Flask + a live MySQL
instance, via `curl`) before this project was considered complete. The
frontend was also verified to build with zero errors (`npm run build`).

Use this same checklist to re-verify after pulling the project onto your own
machine.

## Authentication

- [x] Login with correct credentials succeeds and returns a JWT (`200`)
- [x] Login with incorrect password is rejected (`401`)
- [x] Requests to protected routes without a token are rejected (`401`)
- [x] Requests with an invalid/expired token are rejected (`401`)
- [x] Logout clears the stored token and redirects to `/login`

## Employees

- [x] Add a new employee (`201`)
- [x] View the employee list (`200`)
- [x] View a single employee's details (`200`)
- [x] Edit an employee's information (`200`)
- [x] Delete an employee, with a confirmation prompt before deleting
- [x] Search employees by name / ID / email / department (`?search=`)
- [x] Filter employees by status (`?status=`)
- [x] Validation: required fields enforced (frontend + backend)
- [x] Validation: invalid email format rejected (`400`)
- [x] Validation: invalid mobile number rejected (`400`)
- [x] Duplicate email rejected (`409`)
- [x] Fetching a non-existent employee returns `404`

## Attendance

- [x] Mark attendance for an employee (`201`)
- [x] View attendance records (`200`)
- [x] Filter attendance by date and by status
- [x] Attendance summary shows correct Present/Absent/Leave/Total counts
- [x] Employee-wise attendance history loads correctly, including an
      attendance percentage
- [x] Duplicate attendance for the same employee + date is rejected (`409`)
- [x] Marking attendance for a non-existent employee is rejected (`404`)
- [x] Invalid attendance status is rejected (`400`)
- [x] Check-in/check-out `TIME` values round-trip correctly as `"HH:MM:SS"`
      strings in the JSON response (this previously crashed with a 500 error
      due to a `timedelta` serialization bug — now fixed in `db.py`)

## Dashboard

- [x] Total Employees count is correct
- [x] Active Employees count is correct
- [x] Present Today count is correct
- [x] Absent Today count is correct
- [x] Department-wise employee counts are correct and sum to the total

## API

- [x] All endpoints tested directly with `curl` against a live MySQL database
- [x] All endpoints also available in the Postman collection
      (`postman/attendance-management.postman_collection.json`)
- [x] Consistent JSON response shape (`success`, `data`, `message`) across
      every endpoint
- [x] Correct HTTP status codes used throughout (`200`, `201`, `400`, `401`,
      `404`, `409`, `500`)

## Database

- [x] `database/attendance.sql` runs cleanly on a fresh MySQL/MariaDB install
- [x] All three tables (`users`, `employees`, `attendance`) are created with
      the correct columns, types, and constraints
- [x] Foreign key relationship (`attendance.employee_id → employees.employee_id`)
      works, including `ON DELETE CASCADE` (verified: deleting an employee
      removes their attendance rows)
- [x] `UNIQUE` constraints work (duplicate email, duplicate
      employee+date attendance both rejected by the database)
- [x] Seed data loads correctly (default admin user + sample employees/attendance)
- [x] Dedicated `attendance_user` MySQL account is created by the script and
      used by the backend instead of `root`

## Frontend

- [x] `npm run build` completes with zero errors or warnings
- [x] All pages render without console errors: Login, Dashboard, Employees,
      Employee Form (add/edit), Employee Details, Attendance, Attendance
      History
- [x] Protected routes redirect to `/login` when not authenticated
- [x] Loading indicators shown while data is being fetched
- [x] Success and error messages shown after form submissions
- [x] Confirmation modal shown before deleting an employee
- [x] Responsive layout (sidebar collapses to a horizontal bar on small screens)

## Known Issues Fixed During Development

| Issue | Fix |
|-------|-----|
| MySQL/MariaDB `root` account restricted to socket-only auth in some environments | Added a dedicated `attendance_user` MySQL account (created by `attendance.sql`) that the backend connects as instead of `root` |
| `mysql-connector-python` returns `TIME` columns (`check_in_time`, `check_out_time`) as Python `timedelta`, which Flask's JSON encoder can't serialize — caused a `500` error on any attendance response containing a time value | Added `_serialize_row()`/`_serialize_value()` helpers in `backend/database/db.py` that convert `timedelta` to `"HH:MM:SS"` strings before any query result is returned |

## Remaining / Optional (Not Blocking)

- [ ] Add actual screenshots to the `screenshots/` folder before submission
- [ ] Automated test suite (pytest / React Testing Library) — noted as a
      future improvement in the README, not required for this assessment
