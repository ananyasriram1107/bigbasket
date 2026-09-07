import { useEffect, useReducer, useRef } from "react";
import NameEntry from "./components/NameEntry";
import PlayScreen from "./components/PlayScreen";
import { getFirstQuestion, submitAnswer } from "./api";
import { gameReducer, initialGameState } from "./gameReducer";
import "./App.css";

export default function App() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const questionStartedAtRef = useRef(Date.now());

  useEffect(() => {
    if (gameState.currentQuestion?.id) {
      questionStartedAtRef.current = Date.now();
    }
  }, [gameState.currentQuestion?.id]);

  async function startGame(name) {
    dispatch({ type: "START_GAME", payload: { name } });

    try {
      const question = await getFirstQuestion();

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

  if (!gameState.started) {
    return <NameEntry onStart={startGame} loading={gameState.isLoading} />;
  }

  return <PlayScreen gameState={gameState} onAnswer={handleAnswer} />;
}