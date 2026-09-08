export default function AnswerFlash({ status }) {
  if (!status) {
    return null;
  }

  const correct = status === "correct";
  return (
    <div
      className={
        correct
          ? "answer-flash answer-flash--correct"
          : "answer-flash answer-flash--wrong"
      }
      role="status"
    >
      <div className="answer-flash__panel">
        {correct && <div className="answer-flash__stars" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </div>}
        <div className="answer-flash__content">
          <strong>{correct ? "YOU WIN!" : "TRY AGAIN!"}</strong>
        </div>
        {correct && <div className="xp-boost" aria-label="10 experience points earned">
          <span>XP BOOST!</span>
          <strong>+10</strong>
          <i aria-hidden="true">✦</i>
        </div>}
      </div>
    </div>
  );
}
