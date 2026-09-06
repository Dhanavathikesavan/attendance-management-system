"""
auth.py
-------
Helpers for password hashing and JWT token creation/verification.

How authentication works in this project:
1. The admin's password is never stored in plain text -- only a
   Werkzeug-generated hash is stored in users.password_hash.
2. On login, we hash the submitted password the same way and let
   Werkzeug compare it safely against the stored hash.
3. On successful login we issue a short-lived JWT containing the
   user's id and username. The frontend stores this token and sends
   it back as "Authorization: Bearer <token>" on every protected request.
4. The @token_required decorator below checks that header, verifies
   the token's signature and expiry, and rejects the request with a
   401 if anything is wrong.
"""

from functools import wraps
from datetime import datetime, timedelta, timezone

import jwt
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from config import Config


def hash_password(plain_password):
    return generate_password_hash(plain_password, method="pbkdf2:sha256")


def verify_password(plain_password, password_hash):
    return check_password_hash(password_hash, plain_password)


def generate_token(user_id, username):
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")


def decode_token(token):
    """Returns the decoded payload, or raises jwt exceptions if invalid/expired."""
    return jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])


def token_required(f):
    """
    Decorator for protecting Flask routes with JWT authentication.
    Usage:
        @app.route("/api/employees")
        @token_required
        def get_employees():
            ...
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "Missing or invalid authorization token."}), 401

        token = auth_header.split(" ", 1)[1]

        try:
            payload = decode_token(token)
            request.current_user = payload  # available to the route if needed
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Session expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid authentication token."}), 401

        return f(*args, **kwargs)

    return decorated
