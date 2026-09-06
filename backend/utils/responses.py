"""
responses.py
------------
Tiny helpers so every API returns JSON in the same consistent shape:

    { "success": true,  "data": ..., "message": "..." }
    { "success": false, "message": "..." }

This makes the frontend's API-handling code simpler because it can
always expect the same envelope regardless of which endpoint it called.
"""

from flask import jsonify


def success_response(data=None, message="Success", status_code=200):
    body = {"success": True, "message": message}
    if data is not None:
        body["data"] = data
    return jsonify(body), status_code


def error_response(message="Something went wrong", status_code=400):
    return jsonify({"success": False, "message": message}), status_code
