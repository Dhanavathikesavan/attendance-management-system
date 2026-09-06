"""
config.py
---------
Loads configuration values from the .env file into simple Python
variables. Keeping this in one place means no other file needs to
know how the values are stored (env vars, defaults, etc).
"""

import os
from dotenv import load_dotenv

# Load variables from a ".env" file (if present) into the process environment
load_dotenv()


class Config:
    # --- Database settings ---
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "attendance_db")

    # --- Flask settings ---
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"

    # --- JWT settings ---
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-me")
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "8"))

    # --- CORS ---
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
