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
      {correct ? "✓ Correct!" : "✕ Not quite!"}
    </div>
  );
}