"""
attendance_routes.py
---------------------
Implements Module 3 - Attendance Management APIs:

  POST /api/attendance                       -> mark attendance
  GET  /api/attendance                       -> list attendance records
  GET  /api/attendance/summary               -> present/absent/leave counts
  GET  /api/attendance/employee/<employee_id> -> one employee's history
"""

import mysql.connector
from flask import Blueprint, request

from database.db import run_query
from utils.auth import token_required
from utils.validators import validate_attendance_payload
from utils.responses import success_response, error_response

attendance_bp = Blueprint("attendance", __name__, url_prefix="/api/attendance")


@attendance_bp.route("", methods=["POST"])
@token_required
def mark_attendance():
    data = request.get_json(silent=True) or {}

    errors = validate_attendance_payload(data)
    if errors:
        return error_response(" ".join(errors), 400)

    employee = run_query(
        "SELECT employee_id FROM employees WHERE employee_id = %s",
        (data["employee_id"],),
        fetch_one=True,
    )
    if not employee:
        return error_response("Employee not found.", 404)

    try:
        new_id = run_query(
            """
            INSERT INTO attendance
                (employee_id, attendance_date, check_in_time, check_out_time, attendance_status)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                data["employee_id"],
                data["attendance_date"],
                data.get("check_in_time") or None,
                data.get("check_out_time") or None,
                data["attendance_status"],
            ),
            commit=True,
        )
    except mysql.connector.IntegrityError:
        # Triggered by the UNIQUE(employee_id, attendance_date) constraint
        return error_response(
            "Attendance for this employee on this date has already been recorded.", 409
        )
    except mysql.connector.Error:
        return error_response("Could not mark attendance due to a server error.", 500)

    record = run_query(
        "SELECT * FROM attendance WHERE attendance_id = %s", (new_id,), fetch_one=True
    )
    return success_response(record, "Attendance marked successfully.", 201)


@attendance_bp.route("", methods=["GET"])
@token_required
def list_attendance():
    date_filter = request.args.get("date", "").strip()
    status_filter = request.args.get("status", "").strip()

    # We JOIN to employees only to display the employee's name in the
    # table -- the attendance table itself never stores the name.
    query = """
        SELECT a.*, e.employee_name, e.department
        FROM attendance a
        JOIN employees e ON a.employee_id = e.employee_id
        WHERE 1=1
    """
    params = []

    if date_filter:
        query += " AND a.attendance_date = %s"
        params.append(date_filter)

    if status_filter:
        query += " AND a.attendance_status = %s"
        params.append(status_filter)

    query += " ORDER BY a.attendance_date DESC, a.attendance_id DESC"

    try:
        records = run_query(query, tuple(params), fetch_all=True)
    except mysql.connector.Error:
        return error_response("Could not fetch attendance due to a server error.", 500)

    return success_response(records, "Attendance records fetched successfully.")


@attendance_bp.route("/summary", methods=["GET"])
@token_required
def attendance_summary():
    try:
        totals = run_query(
            """
            SELECT
                COUNT(*) AS total_records,
                SUM(CASE WHEN attendance_status = 'Present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN attendance_status = 'Absent'  THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN attendance_status = 'Leave'   THEN 1 ELSE 0 END) AS leave_count
            FROM attendance
            """,
            fetch_one=True,
        )
    except mysql.connector.Error:
        return error_response("Could not fetch attendance summary due to a server error.", 500)

    # SUM() returns None instead of 0 when there are no rows at all
    for key in ("present_count", "absent_count", "leave_count", "total_records"):
        totals[key] = totals[key] or 0

    return success_response(totals, "Attendance summary fetched successfully.")


@attendance_bp.route("/employee/<int:employee_id>", methods=["GET"])
@token_required
def employee_attendance_history(employee_id):
    employee = run_query(
        "SELECT employee_id, employee_name FROM employees WHERE employee_id = %s",
        (employee_id,),
        fetch_one=True,
    )
    if not employee:
        return error_response("Employee not found.", 404)

    try:
        history = run_query(
            """
            SELECT * FROM attendance
            WHERE employee_id = %s
            ORDER BY attendance_date DESC
            """,
            (employee_id,),
            fetch_all=True,
        )
    except mysql.connector.Error:
        return error_response("Could not fetch attendance history due to a server error.", 500)

    return success_response(
        {"employee": employee, "history": history},
        "Employee attendance history fetched successfully.",
    )
