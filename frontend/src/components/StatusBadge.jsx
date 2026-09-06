/**
 * StatusBadge.jsx
 * Renders a colored pill for employee status or attendance status.
 * Centralizing this means every table/page shows statuses consistently.
 */
export default function StatusBadge({ value }) {
  const colorMap = {
    Active: "badge-green",
    Present: "badge-green",
    Inactive: "badge-gray",
    Absent: "badge-red",
    Leave: "badge-amber",
  };
  const className = colorMap[value] || "badge-gray";
  return <span className={`badge ${className}`}>{value}</span>;
}
