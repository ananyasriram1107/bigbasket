export default function StreakFlame({ streak, label }) {
  if (streak < 2) {
    return null;
  }

  const intensity = Math.min(streak, 5);

  return (
    <div className={`streak-flame streak-flame--${intensity}`}>
      <span aria-hidden="true">🔥</span>
      <strong>{streak}</strong>
      {label && <span>{label}</span>}
    </div>
  );
}