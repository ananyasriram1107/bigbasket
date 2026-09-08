export function evaluateShortAnswer(userAnswer = "", question) {
  if (!userAnswer.trim()) {
    return {
      passed: false,
      accuracy: 0,
      matchedKeywords: [],
      missingKeywords: question.keyword_clusters?.map(c => c.name) || [],
      feedback: "No input provided."
    };
  }

  const normalized = userAnswer.toLowerCase();
  const clusters = question.keyword_clusters || [];
  const matched = [];
  const missing = [];

  clusters.forEach((cluster) => {
    const hasMatch = (cluster.aliases || []).some((alias) =>
      normalized.includes(alias.toLowerCase())
    );
    if (hasMatch) {
      matched.push(cluster.name);
    } else {
      missing.push(cluster.name);
    }
  });

  const threshold = question.min_clusters_required || 2;
  const passed = matched.length >= threshold;
  const total = clusters.length || 1;
  const accuracy = Math.round((matched.length / total) * 100);

  return {
    passed,
    accuracy,
    matchedKeywords: matched,
    missingKeywords: missing,
    feedback: passed
      ? `Mastery verified! Key conceptual terms detected: ${matched.join(", ")}.`
      : `Response missing foundational terms: ${missing.slice(0, 2).join(", ")}.`
  };
}
