export const BADGES = [
  {
    code: "FIRST_CORRECT",
    label: "First Win",
    icon: "⭐",
    condition: (previousState, newState) =>
      !previousState.hasEverBeenCorrect &&
      newState.lastResult?.correct === true,
  },
  {
    code: "STREAK_3",
    label: "On Fire",
    icon: "🔥",
    condition: (previousState, newState) =>
      previousState.correctStreak < 3 && newState.correctStreak >= 3,
  },
  {
    code: "TIER_3",
    label: "Top Tier",
    icon: "🏆",
    condition: (previousState, newState) =>
      previousState.tier < 3 && newState.tier >= 3,
  },
];

export function checkBadges(previousState, newState, earnedBadgeCodes = []) {
  return BADGES.filter((badge) => {
    const alreadyEarned = earnedBadgeCodes.includes(badge.code);

    return !alreadyEarned && badge.condition(previousState, newState);
  });
}