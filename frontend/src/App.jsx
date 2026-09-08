import { useEffect, useReducer, useRef, useState } from "react";
import FrontPage from "./pages/FrontPage";
import NameEntry from "./components/NameEntry";
import PlayScreen from "./components/PlayScreen";
import { getFirstQuestion, submitAnswer } from "./api";
import { gameReducer, initialGameState } from "./gameReducer";
import { QUEST_LENGTH } from "./questConfig";
import "./App.css";

function WorldMotion() {
  return (
    <div className="world-motion" aria-hidden="true">
      <i className="world-motion__leaf world-motion__leaf--one" />
      <i className="world-motion__leaf world-motion__leaf--two" />
      <i className="world-motion__spark world-motion__spark--one" />
      <i className="world-motion__spark world-motion__spark--two" />
    </div>
  );
}

export default function App() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const questionStartedAtRef = useRef(Date.now());
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (gameState.currentQuestion?.id) {
      questionStartedAtRef.current = Date.now();
    }
  }, [gameState.currentQuestion?.id]);

  function handleLaunchSession(config) {
    setSession(config);
  }

  async function startGame(name) {
    dispatch({
      type: "START_GAME",
      payload: {
        name,
        courseId: session?.courseId,
        mode: session?.mode,
      },
    });

    try {
      const question = await getFirstQuestion(session?.courseId, session?.mode);
      dispatch({
        type: "QUESTION_LOADED",
        payload: { question },
      });
    } catch (error) {
      dispatch({
        type: "REQUEST_FAILED",
        payload: { message: error.message },
      });
    }
  }

  async function handleAnswer(answer, timedOut) {
    if (!gameState.currentQuestion || gameState.isLoading) {
      return;
    }

    dispatch({ type: "ANSWER_SUBMITTING" });

    const timeTakenMs = timedOut
      ? 15000
      : Date.now() - questionStartedAtRef.current;

    const payload = {
      question_id: gameState.currentQuestion.id,
      answer,
      tier: gameState.tier,
      correct_streak: gameState.correctStreak,
      wrong_streak: gameState.wrongStreak,
      total_xp: gameState.totalXp,
      time_taken_ms: timeTakenMs,
      mode: session?.mode || "mcq",
    };

    try {
      const result = await submitAnswer(payload);
      dispatch({
        type: "ANSWER_RESULT",
        payload: {
          ...result,
          time_taken_ms: timeTakenMs,
          gameComplete: gameState.questionCount + 1 >= QUEST_LENGTH,
        },
      });
    } catch (error) {
      dispatch({
        type: "REQUEST_FAILED",
        payload: { message: error.message },
      });
    }
  }

  // 1. Stage 1 & 2: FrontPage (Start, Course, Mode)
  if (!session) {
    return <FrontPage onLaunchSession={handleLaunchSession} />;
  }

  // 2. Stage 3: Name Entry
  if (!gameState.started) {
    return <><WorldMotion /><NameEntry onStart={startGame} loading={gameState.isLoading} /></>;
  }

  // 3. Stage 4: Play Screen
  return <><WorldMotion /><PlayScreen gameState={gameState} onAnswer={handleAnswer} /></>;
}
