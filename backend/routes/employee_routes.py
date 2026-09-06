"""
employee_routes.py
-------------------
Implements Module 2 - Employee Management APIs:

  POST   /api/employees              -> create employee
  GET    /api/employees              -> list employees (supports ?search=)
  GET    /api/employees/<id>         -> get one employee
  PUT    /api/employees/<id>         -> update employee
  DELETE /api/employees/<id>         -> delete employee
"""

import mysql.connector
from flask import Blueprint, request

from database.db import run_query
from utils.auth import token_required
from utils.validators import validate_employee_payload
from utils.responses import success_response, error_response

employee_bp = Blueprint("employees", __name__, url_prefix="/api/employees")


@employee_bp.route("", methods=["POST"])
@token_required
def create_employee():
    data = request.get_json(silent=True) or {}

    errors = validate_employee_payload(data)
    if errors:
        return error_response(" ".join(errors), 400)

    try:
        new_id = run_query(
            """
            INSERT INTO employees
                (employee_name, email, mobile_number, department, designation, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                data["employee_name"].strip(),
                data["email"].strip().lower(),
                data["mobile_number"].strip(),
                data["department"].strip(),
                data["designation"].strip(),
                data.get("status", "Active"),
            ),
            commit=True,
        )
    except mysql.connector.IntegrityError:
        # Triggered by the UNIQUE constraint on employees.email
        return error_response("An employee with this email already exists.", 409)
    except mysql.connector.Error:
        return error_response("Could not create employee due to a server error.", 500)

    employee = run_query(
        "SELECT * FROM employees WHERE employee_id = %s", (new_id,), fetch_one=True
    )
    return success_response(employee, "Employee created successfully.", 201)


@employee_bp.route("", methods=["GET"])
@token_required
def list_employees():
    search = request.args.get("search", "").strip()
    department = request.args.get("department", "").strip()
    status = request.args.get("status", "").strip()

    query = "SELECT * FROM employees WHERE 1=1"
    params = []

    if search:
        # Search by name, ID, email, or department (Module 2 requirement)
        query += """ AND (
            employee_name LIKE %s
            OR email LIKE %s
            OR department LIKE %s
            OR employee_id = %s
        )"""
        like_term = f"%{search}%"
        # If search isn't a valid integer, employee_id = %s just won't match anything
        search_as_id = search if search.isdigit() else -1
        params.extend([like_term, like_term, like_term, search_as_id])

    if department:
        query += " AND department = %s"
        params.append(department)

    if status:
        query += " AND status = %s"
        params.append(status)

    query += " ORDER BY employee_id DESC"

    try:
        employees = run_query(query, tuple(params), fetch_all=True)
    except mysql.connector.Error:
        return error_response("Could not fetch employees due to a server error.", 500)

    return success_response(employees, "Employees fetched successfully.")


@employee_bp.route("/<int:employee_id>", methods=["GET"])
@token_required
def get_employee(employee_id):
    try:
        employee = run_query(
            "SELECT * FROM employees WHERE employee_id = %s", (employee_id,), fetch_one=True
        )
    except mysql.connector.Error:
        return error_response("Could not fetch employee due to a server error.", 500)

    if not employee:
        return error_response("Employee not found.", 404)

    return success_response(employee, "Employee fetched successfully.")


@employee_bp.route("/<int:employee_id>", methods=["PUT"])
@token_required
def update_employee(employee_id):
    data = request.get_json(silent=True) or {}

    existing = run_query(
        "SELECT * FROM employees WHERE employee_id = %s", (employee_id,), fetch_one=True
    )
    if not existing:
        return error_response("Employee not found.", 404)

    errors = validate_employee_payload(data, partial=True)
    if errors:
        return error_response(" ".join(errors), 400)

    # Merge incoming fields with existing values so a partial update works
    updated = {
        "employee_name": data.get("employee_name", existing["employee_name"]),
        "email": data.get("email", existing["email"]),
        "mobile_number": data.get("mobile_number", existing["mobile_number"]),
        "department": data.get("department", existing["department"]),
        "designation": data.get("designation", existing["designation"]),
        "status": data.get("status", existing["status"]),
    }

    try:
        run_query(
            """
            UPDATE employees
            SET employee_name = %s, email = %s, mobile_number = %s,
                department = %s, designation = %s, status = %s
            WHERE employee_id = %s
            """,
            (
                updated["employee_name"].strip(),
                updated["email"].strip().lower(),
                updated["mobile_number"].strip(),
                updated["department"].strip(),
                updated["designation"].strip(),
                updated["status"],
                employee_id,
            ),
            commit=True,
        )
    except mysql.connector.IntegrityError:
        return error_response("Another employee with this email already exists.", 409)
    except mysql.connector.Error:
        return error_response("Could not update employee due to a server error.", 500)

    employee = run_query(
        "SELECT * FROM employees WHERE employee_id = %s", (employee_id,), fetch_one=True
    )
    return success_response(employee, "Employee updated successfully.")


@employee_bp.route("/<int:employee_id>", methods=["DELETE"])
@token_required
def delete_employee(employee_id):
    existing = run_query(
        "SELECT employee_id FROM employees WHERE employee_id = %s", (employee_id,), fetch_one=True
    )
    if not existing:
        return error_response("Employee not found.", 404)

    try:
        # ON DELETE CASCADE on the attendance table removes their
        # attendance history automatically.
        run_query("DELETE FROM employees WHERE employee_id = %s", (employee_id,), commit=True)
    except mysql.connector.Error:
        return error_response("Could not delete employee due to a server error.", 500)

    return success_response(None, "Employee deleted successfully.")
