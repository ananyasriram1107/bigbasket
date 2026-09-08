import { useEffect, useRef, useState } from "react";
import { checkBadges } from "./badges";
import { streakBonusLabel, xpProgress } from "./gamification";
import { addEarnedBadges } from "../utils/progressStore";

export function useGamification(gameState) {
  const previousStateRef = useRef(gameState);
  const earnedBadgeCodesRef = useRef([]);
  const [activeBadge, setActiveBadge] = useState(null);

  useEffect(() => {
    const previousState = previousStateRef.current;

    if (gameState.lastResult) {
      const newBadges = checkBadges(
        previousState,
        gameState,
        earnedBadgeCodesRef.current
      );

      if (newBadges.length > 0) {
        const badge = newBadges[0];

        const newCodes = newBadges.map((item) => item.code);
        earnedBadgeCodesRef.current = [
          ...earnedBadgeCodesRef.current,
          ...newCodes,
        ];
        addEarnedBadges(newCodes);

        setActiveBadge(badge);
      }
    }

    previousStateRef.current = gameState;
  }, [gameState]);

  return {
    progressPercent: xpProgress(gameState.totalXp),
    streakLabel: streakBonusLabel(gameState.correctStreak),
    activeBadge,
    dismissBadge: () => setActiveBadge(null),
  };
}