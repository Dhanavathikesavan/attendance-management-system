"""
dashboard_routes.py
--------------------
Implements Module 4 - Dashboard API:

  GET /api/dashboard/stats

All statistics are calculated in MySQL (not on the frontend) so the
numbers are always correct even if many browsers are open at once.
"""

import mysql.connector
from flask import Blueprint

from database.db import run_query
from utils.auth import token_required
from utils.responses import success_response, error_response

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/stats", methods=["GET"])
@token_required
def dashboard_stats():
    try:
        total_employees = run_query(
            "SELECT COUNT(*) AS count FROM employees", fetch_one=True
        )["count"]

        active_employees = run_query(
            "SELECT COUNT(*) AS count FROM employees WHERE status = 'Active'",
            fetch_one=True,
        )["count"]

        present_today = run_query(
            """
            SELECT COUNT(*) AS count FROM attendance
            WHERE attendance_date = CURDATE() AND attendance_status = 'Present'
            """,
            fetch_one=True,
        )["count"]

        absent_today = run_query(
            """
            SELECT COUNT(*) AS count FROM attendance
            WHERE attendance_date = CURDATE() AND attendance_status = 'Absent'
            """,
            fetch_one=True,
        )["count"]

        department_counts = run_query(
            """
            SELECT department, COUNT(*) AS count
            FROM employees
            GROUP BY department
            ORDER BY count DESC
            """,
            fetch_all=True,
        )
    except mysql.connector.Error:
        return error_response("Could not calculate dashboard statistics.", 500)

    return success_response(
        {
            "total_employees": total_employees,
            "active_employees": active_employees,
            "present_today": present_today,
            "absent_today": absent_today,
            "department_counts": department_counts,
        },
        "Dashboard statistics fetched successfully.",
    )
