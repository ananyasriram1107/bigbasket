export function computeSessionStats(attempts = []) {
  if (!attempts.length) {
    return {
      accuracy: 0,
      totalAnswered: 0,
      correctCount: 0,
      highestTier: 1,
      longestStreak: 0,
      currentStreak: 0,
      avgSpeedSeconds: "0.0",
    };
  }

  let correctCount = 0;
  let highestTier = 1;
  let longestStreak = 0;
  let currentStreak = 0;
  let totalTimeMs = 0;

  attempts.forEach((attempt) => {
    if (attempt.tier > highestTier) highestTier = attempt.tier;
    totalTimeMs += attempt.time_taken_ms || 0;

    if (attempt.correct) {
      correctCount += 1;
      currentStreak += 1;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  });

  return {
    accuracy: Math.round((correctCount / attempts.length) * 100),
    totalAnswered: attempts.length,
    correctCount,
    highestTier,
    longestStreak,
    currentStreak,
    avgSpeedSeconds: (totalTimeMs / attempts.length / 1000).toFixed(1),
  };
}
