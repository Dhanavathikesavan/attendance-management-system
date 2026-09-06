"""
app.py
------
Main Flask application entry point.

Wires together:
  - Flask-CORS (so the React dev server on :5173 can call this API)
  - each feature's Blueprint (auth, employees, attendance, dashboard)
  - a couple of top-level error handlers so unexpected errors never
    leak internal details (like stack traces or SQL errors) to the client.

Run with:
    python app.py
"""

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from routes.auth_routes import auth_bp
from routes.employee_routes import employee_bp
from routes.attendance_routes import attendance_bp
from routes.dashboard_routes import dashboard_bp

app = Flask(__name__)

# Only allow requests from the configured frontend origin
CORS(app, resources={r"/api/*": {"origins": Config.FRONTEND_ORIGIN}})

app.register_blueprint(auth_bp)
app.register_blueprint(employee_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(dashboard_bp)


@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple endpoint to confirm the API is running (useful for Postman)."""
    return jsonify({"success": True, "message": "Attendance Management API is running."})


@app.errorhandler(404)
def handle_404(e):
    return jsonify({"success": False, "message": "The requested resource was not found."}), 404


@app.errorhandler(405)
def handle_405(e):
    return jsonify({"success": False, "message": "This HTTP method is not allowed for this URL."}), 405


@app.errorhandler(500)
def handle_500(e):
    # Never expose the real exception/stack trace to the client
    return jsonify({"success": False, "message": "An unexpected server error occurred."}), 500


if __name__ == "__main__":
    app.run(debug=Config.FLASK_DEBUG, port=5000)
