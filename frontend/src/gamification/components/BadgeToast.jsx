export default function BadgeToast({ badge, onClose }) {
  if (!badge) {
    return null;
  }

  return (
    <aside className="badge-toast" role="status">
      <span className="badge-toast__icon" aria-hidden="true">
        {badge.icon}
      </span>

      <div className="badge-toast__text">
        <small>Badge unlocked</small>
        <strong>{badge.label}</strong>
      </div>

      <button
        type="button"
        className="badge-toast__close"
        onClick={onClose}
        aria-label="Dismiss badge"
      >
        ×
      </button>
    </aside>
  );
}