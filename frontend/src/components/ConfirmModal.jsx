/**
 * ConfirmModal.jsx
 * Generic "Are you sure?" confirmation dialog. Used before destructive
 * actions like deleting an employee, per the UI requirement to confirm
 * before delete.
 */
export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = "Delete" }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
