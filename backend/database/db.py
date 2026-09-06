"""
db.py
-----
A small helper around mysql-connector-python.

Rather than scattering `mysql.connector.connect(...)` calls across every
route file, every route asks this module for a connection. This keeps
database credentials and connection logic in exactly one place.

We open a fresh connection per request and close it right after --
simple and easy to reason about for a project of this size. In a
larger production app you would switch this to a connection pool.
"""

from datetime import timedelta

import mysql.connector
from mysql.connector import Error
from config import Config


def _serialize_value(value):
    """
    mysql-connector-python returns MySQL TIME columns (like
    check_in_time/check_out_time) as Python `timedelta` objects, not
    strings. Flask's JSON encoder doesn't know how to serialize those,
    which crashes the response with a 500 error. This converts any
    timedelta into a plain "HH:MM:SS" string so every route can safely
    return query results straight to jsonify().
    """
    if isinstance(value, timedelta):
        total_seconds = int(value.total_seconds())
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    return value


def _serialize_row(row):
    if row is None:
        return None
    return {key: _serialize_value(value) for key, value in row.items()}


def get_db_connection():
    """
    Returns a new MySQL connection using the credentials from Config.
    Raises mysql.connector.Error if the connection cannot be made --
    callers should catch this and return a safe 500 error to the client.
    """
    return mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
    )


def run_query(query, params=None, fetch_one=False, fetch_all=False, commit=False):
    """
    Convenience helper that opens a connection, runs one query safely
    with parameter binding (prevents SQL injection), and closes the
    connection again.

    Args:
        query: SQL string with %s placeholders.
        params: tuple of values to bind to the placeholders.
        fetch_one: return a single row (dict) if True.
        fetch_all: return all rows (list of dicts) if True.
        commit: commit the transaction (for INSERT/UPDATE/DELETE).

    Returns:
        - a dict if fetch_one=True
        - a list of dicts if fetch_all=True
        - the last inserted row id if commit=True and it was an INSERT
        - None otherwise
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())

        result = None
        if fetch_one:
            result = _serialize_row(cursor.fetchone())
        elif fetch_all:
            result = [_serialize_row(row) for row in cursor.fetchall()]

        if commit:
            connection.commit()
            result = cursor.lastrowid

        return result
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()
