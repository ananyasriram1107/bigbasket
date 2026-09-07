import { useEffect, useRef, useState } from "react";

const QUESTION_SECONDS = 15;

export default function PlayScreen({ gameState, onAnswer }) {
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const submittedRef = useRef(false);

  const question = gameState.currentQuestion;

  useEffect(() => {
    setSecondsLeft(QUESTION_SECONDS);
    submittedRef.current = false;
  }, [question?.id]);

  useEffect(() => {
    if (!question || gameState.isLoading) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          clearInterval(intervalId);

          if (!submittedRef.current) {
            submittedRef.current = true;
            onAnswer(null, true);
          }

          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [question?.id, gameState.isLoading, onAnswer]);

  function chooseAnswer(answer) {
    if (gameState.isLoading || submittedRef.current) {
      return;
    }

    submittedRef.current = true;
    onAnswer(answer, false);
  }

  if (gameState.isLoading && !question) {
    return <main className="loading-screen">Loading your first question…</main>;
  }

  if (!question) {
    return (
      <main className="loading-screen">
        No question is available. Please restart the game.
      </main>
    );
  }

  return (
    <main className="play-screen">
      <header className="game-header">
        <div>
          <span className="eyebrow">Player</span>
          <strong>{gameState.name}</strong>
        </div>

        <div>
          <span className="eyebrow">Tier</span>
          <strong>{gameState.tier}</strong>
        </div>

        <div>
          <span className="eyebrow">XP</span>
          <strong>{gameState.totalXp}</strong>
        </div>

        <div className={secondsLeft <= 5 ? "timer timer--urgent" : "timer"}>
          <span className="eyebrow">Time</span>
          <strong>{secondsLeft}s</strong>
        </div>
      </header>

      {gameState.error && (
        <p className="connection-error">{gameState.error}</p>
      )}

      {gameState.lastResult && (
        <p
          className={
            gameState.lastResult.correct
              ? "answer-feedback answer-feedback--correct"
              : "answer-feedback answer-feedback--wrong"
          }
        >
          {gameState.lastResult.correct
            ? `Correct! +${gameState.lastResult.xp_earned} XP`
            : "Not quite — try the next one!"}
        </p>
      )}

      <section className="question-card">
        <p className="question-number">
          Question {gameState.questionCount + 1}
        </p>

        <h1>{question.prompt}</h1>

        <div className="answer-options">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => chooseAnswer(option)}
              disabled={gameState.isLoading}
            >
              {option}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}