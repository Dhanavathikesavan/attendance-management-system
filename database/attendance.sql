-- =====================================================================
-- Mini Attendance Management System - Database Setup Script
-- =====================================================================
-- Run this script on a fresh MySQL server to create the database,
-- tables, constraints, indexes, and seed data.
--
-- Usage:
--   mysql -u root -p < attendance.sql
-- =====================================================================

DROP DATABASE IF EXISTS attendance_db;
CREATE DATABASE attendance_db;
USE attendance_db;

-- ---------------------------------------------------------------------
-- Application database user
-- The Flask backend connects as this user instead of "root", which is
-- good practice: the app only gets the privileges it actually needs on
-- this one database, nothing more.
-- Change this password before using this project outside of local dev.
-- ---------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'attendance_user'@'%' IDENTIFIED BY 'attendance_pass';
GRANT ALL PRIVILEGES ON attendance_db.* TO 'attendance_user'@'%';
FLUSH PRIVILEGES;

-- ---------------------------------------------------------------------
-- Table: users
-- Stores administrator login credentials.
-- Passwords are stored as PBKDF2-SHA256 hashes, never in plain text.
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'admin',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Table: employees
-- Stores employee master data. This is the single source of truth
-- for employee details -- attendance records only store employee_id,
-- never the employee's name/email/etc, to avoid data duplication
-- (this is what keeps the schema normalized).
-- ---------------------------------------------------------------------
CREATE TABLE employees (
    employee_id     INT AUTO_INCREMENT PRIMARY KEY,
    employee_name   VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    mobile_number   VARCHAR(15)  NOT NULL,
    department      VARCHAR(50)  NOT NULL,
    designation     VARCHAR(50)  NOT NULL,
    status          ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_mobile_number CHECK (CHAR_LENGTH(mobile_number) >= 10)
);

-- Index to speed up searches by name/department (Module 2 - Search Employees)
CREATE INDEX idx_employee_name ON employees (employee_name);
CREATE INDEX idx_department ON employees (department);
CREATE INDEX idx_status ON employees (status);

-- ---------------------------------------------------------------------
-- Table: attendance
-- Stores one attendance record per employee per date.
-- References employees.employee_id (one employee -> many attendance rows).
--
-- ON DELETE CASCADE: if an employee is permanently removed, their
--   attendance history is removed with them so we never end up with
--   "orphan" attendance rows pointing at a non-existent employee.
--   (In a real production system you would likely soft-delete employees
--   instead of hard-deleting, precisely to preserve attendance history --
--   this is called out as a future improvement in the README.)
-- ON UPDATE CASCADE: if employee_id ever changed, dependent attendance
--   rows would automatically follow it.
-- ---------------------------------------------------------------------
CREATE TABLE attendance (
    attendance_id     INT AUTO_INCREMENT PRIMARY KEY,
    employee_id       INT  NOT NULL,
    attendance_date   DATE NOT NULL,
    check_in_time     TIME NULL,
    check_out_time    TIME NULL,
    attendance_status ENUM('Present', 'Absent', 'Leave') NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Prevents duplicate attendance for the same employee on the same date
    CONSTRAINT uq_employee_date UNIQUE (employee_id, attendance_date)
);

-- Index to speed up dashboard "present today / absent today" queries
CREATE INDEX idx_attendance_date ON attendance (attendance_date);
CREATE INDEX idx_attendance_status ON attendance (attendance_status);

-- ---------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------

-- Default admin user
-- username: admin
-- password: Admin@123
-- (this hash was generated using Werkzeug password hashing)
INSERT INTO users (username, password_hash, role) VALUES
('admin', 'pbkdf2:sha256:1000000$fAP5yXRDvtR8L8Hk$24e09f8e90a2090c00f62fe7c8e9bc87a57a1db9744b439b8522c9d854a4afd0', 'admin');

-- Sample employees
INSERT INTO employees (employee_name, email, mobile_number, department, designation, status) VALUES
('Ananya Sharma',  'ananya.sharma@example.com',  '9876543210', 'IT',      'Software Engineer',   'Active'),
('Rahul Verma',    'rahul.verma@example.com',    '9876543211', 'HR',      'HR Executive',        'Active'),
('Priya Nair',     'priya.nair@example.com',     '9876543212', 'Finance', 'Accountant',          'Active'),
('Karthik Iyer',   'karthik.iyer@example.com',   '9876543213', 'Sales',   'Sales Executive',     'Active'),
('Sneha Reddy',    'sneha.reddy@example.com',    '9876543214', 'IT',      'QA Engineer',         'Inactive');

-- Sample attendance for today (adjust date if needed after import)
INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, attendance_status) VALUES
(1, CURDATE(), '09:05:00', '18:02:00', 'Present'),
(2, CURDATE(), '09:15:00', '18:00:00', 'Present'),
(3, CURDATE(), NULL, NULL, 'Absent'),
(4, CURDATE(), NULL, NULL, 'Leave');
