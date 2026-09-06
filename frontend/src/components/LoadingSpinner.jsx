/**
 * LoadingSpinner.jsx
 * A tiny reusable spinner shown while a page/table is fetching data.
 */
export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="spinner-center">
      <div className="spinner" role="status" aria-label={label} />
    </div>
  );
}
