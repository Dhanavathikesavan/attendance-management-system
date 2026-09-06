/**
 * Dashboard.jsx
 * Module 4 - Dashboard.
 *
 * Flow: on mount -> dashboardService.getDashboardStats() -> GET
 * /api/dashboard/stats -> Flask runs several COUNT()/GROUP BY queries
 * against MySQL -> returns one JSON object with everything this page
 * needs. All numbers are calculated in the database, not in the browser.
 */
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getDashboardStats } from "../services/dashboardService";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getDashboardStats()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="stat-grid">
        <StatCard label="Total Employees" value={stats.total_employees} accent="blue" />
        <StatCard label="Active Employees" value={stats.active_employees} accent="green" />
        <StatCard label="Present Today" value={stats.present_today} accent="green" />
        <StatCard label="Absent Today" value={stats.absent_today} accent="red" />
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Department-wise Employee Count</h3>

        {stats.department_counts.length === 0 ? (
          <p className="empty-state">No employees yet.</p>
        ) : (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employee Count</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {stats.department_counts.map((row) => {
                  const percent = stats.total_employees
                    ? Math.round((row.count / stats.total_employees) * 100)
                    : 0;
                  return (
                    <tr key={row.department}>
                      <td>{row.department}</td>
                      <td>{row.count}</td>
                      <td>
                        <div style={{ background: "#f1f5f9", borderRadius: 4, overflow: "hidden", width: 160 }}>
                          <div
                            style={{
                              width: `${percent}%`,
                              background: "#2563eb",
                              height: 8,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
