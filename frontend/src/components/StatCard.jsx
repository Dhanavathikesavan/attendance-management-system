/**
 * StatCard.jsx
 * One dashboard statistic (e.g. "Total Employees: 12").
 * `accent` picks the color used for the big number.
 */
export default function StatCard({ label, value, accent = "blue" }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
