"""
auth_routes.py
--------------
Handles POST /api/auth/login

Flow:
  React login form -> POST /api/auth/login -> look up user in MySQL
  -> verify password hash -> issue JWT -> return it to the frontend.
"""

import mysql.connector
from flask import Blueprint, request

from database.db import run_query
from utils.auth import verify_password, generate_token
from utils.responses import success_response, error_response

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return error_response("Username and password are required.", 400)

    try:
        user = run_query(
            "SELECT id, username, password_hash, role FROM users WHERE username = %s",
            (username,),
            fetch_one=True,
        )
    except mysql.connector.Error:
        return error_response("Unable to reach the database. Please try again later.", 500)

    # Deliberately vague error message -- never reveal whether the
    # username or the password was the one that was wrong.
    if not user or not verify_password(password, user["password_hash"]):
        return error_response("Invalid username or password.", 401)

    token = generate_token(user["id"], user["username"])

    # Never return password_hash to the client
    return success_response(
        {
            "token": token,
            "user": {"id": user["id"], "username": user["username"], "role": user["role"]},
        },
        message="Login successful.",
    )
