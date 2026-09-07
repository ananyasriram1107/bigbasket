export default function XPBar({ xp, progressPercent, level }) {
  return (
    <section
      className="xp-bar"
      aria-label={`Level ${level}, ${xp} experience points`}
    >
      <div className="xp-bar__header">
        <span>Level {level}</span>
        <span>{xp} XP</span>
      </div>

      <div className="xp-bar__track">
        <div
          className="xp-bar__fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </section>
  );
}