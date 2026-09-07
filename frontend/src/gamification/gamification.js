export function computeLevel(totalXp) {
  return Math.floor(Math.sqrt(totalXp / 50)) + 1;
}

export function xpProgress(totalXp) {
  const level = computeLevel(totalXp);

  const currentLevelXp = 50 * (level - 1) ** 2;
  const nextLevelXp = 50 * level ** 2;

  const progress =
    ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  return Math.max(0, Math.min(100, progress));
}

export function streakBonusLabel(streak) {
  if (streak >= 5) {
    return "🔥 x1.5";
  }

  if (streak >= 3) {
    return "🔥 x1.2";
  }

  return "";
}