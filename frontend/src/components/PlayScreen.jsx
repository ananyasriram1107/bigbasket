import { useEffect, useRef, useState } from "react";
import XPBar from "../gamification/components/XPBar";
import StreakFlame from "../gamification/components/StreakFlame";
import AnswerFlash from "../gamification/components/AnswerFlash";
import BadgeToast from "../gamification/components/BadgeToast";
import { useGamification } from "../gamification/useGamification";
import { QUEST_LENGTH } from "../questConfig";
import explorerSprite from "../assets/mascot-correct.png";

const QUESTION_SECONDS = 15;

export default function PlayScreen({ gameState, onAnswer }) {
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const [flashStatus, setFlashStatus] = useState(null);
  const submittedRef = useRef(false);

  const question = gameState.currentQuestion;
  const progress = Math.min(gameState.questionCount / QUEST_LENGTH, 1);

  const {
    progressPercent,
    streakLabel,
    activeBadge,
    dismissBadge,
  } = useGamification(gameState);

  useEffect(() => {
    setSecondsLeft(QUESTION_SECONDS);
    submittedRef.current = false;
  }, [question?.id]);

  useEffect(() => {
    if (!question || gameState.isLoading || gameState.gameComplete) {
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

  useEffect(() => {
    if (!gameState.lastResult) {
      return undefined;
    }

    setFlashStatus(gameState.lastResult.correct ? "correct" : "wrong");

    const timerId = setTimeout(() => {
      setFlashStatus(null);
    }, 3000);

    return () => clearTimeout(timerId);
  }, [gameState.lastResult]);

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

  if (!question && !gameState.gameComplete) {
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

        <XPBar
          xp={gameState.totalXp}
          level={gameState.level}
          progressPercent={progressPercent}
        />

        <div className={secondsLeft <= 5 ? "timer timer--urgent" : "timer"}>
          <span className="eyebrow">Time</span>
          <strong>{secondsLeft}s</strong>
        </div>
      </header>

      <StreakFlame
        streak={gameState.correctStreak}
        label={streakLabel}
      />

      <AnswerFlash status={flashStatus} />

      <BadgeToast badge={activeBadge} onClose={dismissBadge} />

      {gameState.error && (
        <p className="connection-error">{gameState.error}</p>
      )}

      <section className="quest-journey" aria-label={`Quest progress: ${gameState.questionCount} of ${QUEST_LENGTH} questions`}>
        <div className="quest-ambience quest-ambience--one" aria-hidden="true">
          <i className="ambient-star ambient-star--one" />
          <i className="ambient-star ambient-star--two" />
          <i className="ambient-leaf ambient-leaf--one" />
          <i className="ambient-flower ambient-flower--one" />
        </div>
        <div className="quest-ambience quest-ambience--two" aria-hidden="true">
          <i className="ambient-star ambient-star--one" />
          <i className="ambient-star ambient-star--two" />
          <i className="ambient-leaf ambient-leaf--one" />
          <i className="ambient-flower ambient-flower--one" />
        </div>
        <div className="quest-journey__path" />
        <div className="quest-journey__milestones" aria-hidden="true">
          {Array.from({ length: QUEST_LENGTH }, (_, index) => (
            <span className={index < gameState.questionCount ? "is-cleared" : ""} key={index} />
          ))}
        </div>
        <div className="pixel-explorer" style={{ "--journey-position": `${7 + progress * 79}%` }} aria-hidden="true">
          <img className="pixel-explorer__sprite" src={explorerSprite} alt="" />
        </div>
        <div className={gameState.gameComplete ? "treasure-chest treasure-chest--open" : "treasure-chest"} aria-label={gameState.gameComplete ? "Opened treasure" : "Treasure ahead"}>
          <span className="treasure-chest__lid" />
          <span className="treasure-chest__base" />
          {gameState.gameComplete && <span className="treasure-chest__glow" aria-hidden="true" />}
        </div>
      </section>

      {gameState.gameComplete ? (
        <section className="quest-complete" aria-live="polite">
          <div className="pixel-confetti" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => <i key={index} style={{ "--confetti-index": index }} />)}
          </div>
          <p>Quest complete</p>
          <h1>Treasure unlocked!</h1>
          <strong>{gameState.totalXp} XP</strong>
          <span>You reached the treasure chest.</span>
        </section>
      ) : <section className="question-card">
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
      </section>}
    </main>
  );
}
