"""
validators.py
-------------
Small, focused validation helper functions used by the route files
before any data is written to the database. Keeping validation here
(instead of inline in every route) makes the routes easier to read
and the validation rules easy to test/reuse.
"""

import re

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MOBILE_REGEX = re.compile(r"^\d{10,15}$")


def is_valid_email(email):
    return bool(email) and bool(EMAIL_REGEX.match(email))


def is_valid_mobile(mobile):
    return bool(mobile) and bool(MOBILE_REGEX.match(mobile))


def validate_employee_payload(data, partial=False):
    """
    Validates the fields required to create/update an employee.

    Args:
        data: dict of incoming JSON fields.
        partial: if True, allows missing fields (used for PUT/edit where
                 the frontend may only send changed fields).

    Returns:
        A list of human-readable error strings. Empty list = valid.
    """
    errors = []
    required_fields = [
        "employee_name",
        "email",
        "mobile_number",
        "department",
        "designation",
    ]

    for field in required_fields:
        if not partial and not data.get(field):
            errors.append(f"'{field}' is required.")

    if data.get("email") and not is_valid_email(data["email"]):
        errors.append("Email address is not valid.")

    if data.get("mobile_number") and not is_valid_mobile(data["mobile_number"]):
        errors.append("Mobile number must be 10-15 digits.")

    if data.get("status") and data["status"] not in ("Active", "Inactive"):
        errors.append("Status must be 'Active' or 'Inactive'.")

    return errors


def validate_attendance_payload(data):
    """
    Validates the fields required to mark attendance.
    """
    errors = []

    if not data.get("employee_id"):
        errors.append("'employee_id' is required.")

    if not data.get("attendance_date"):
        errors.append("'attendance_date' is required.")

    status = data.get("attendance_status")
    if not status:
        errors.append("'attendance_status' is required.")
    elif status not in ("Present", "Absent", "Leave"):
        errors.append("'attendance_status' must be Present, Absent, or Leave.")

    return errors
