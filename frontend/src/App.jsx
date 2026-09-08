import { useEffect, useReducer, useRef, useState } from "react";
import FrontPage from "./pages/FrontPage"; // If FrontPage is directly in src, use: "./FrontPage"
import NameEntry from "./components/NameEntry";
import PlayScreen from "./components/PlayScreen";
import { getFirstQuestion, submitAnswer } from "./api";
import { gameReducer, initialGameState } from "./gameReducer";
import "./App.css";

export default function App() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const questionStartedAtRef = useRef(Date.now());
  const [session, setSession] = useState(null); // Tracks { courseId, courseTitle, mode }

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
      // Passes the user's chosen course and mode to the question loader
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
        },
      });
    } catch (error) {
      dispatch({
        type: "REQUEST_FAILED",
        payload: { message: error.message },
      });
    }
  }

  // Stage 1 & 2: Show Start + Course/Mode Selection
  if (!session) {
    return <FrontPage onLaunchSession={handleLaunchSession} />;
  }

  // Stage 3: Show Name Entry
  if (!gameState.started) {
    return <NameEntry onStart={startGame} loading={gameState.isLoading} />;
  }

  // Stage 4: Run the Game
  return <PlayScreen gameState={gameState} onAnswer={handleAnswer} />;
}
