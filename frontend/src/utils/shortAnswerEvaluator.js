export function evaluateShortAnswer(userAnswer = "", question) {
  if (!userAnswer.trim()) {
    return {
      passed: false,
      accuracy: 0,
      matchedKeywords: [],
      missingKeywords: question.ideal_keywords || [],
      feedback: "No input provided."
    };
  }

  const normalized = userAnswer.toLowerCase();
  const matched = [];
  const missing = [];

  (question.ideal_keywords || []).forEach((kw) => {
    if (normalized.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const threshold = question.threshold || 2;
  const passed = matched.length >= threshold;
  const accuracy = Math.round((matched.length / question.ideal_keywords.length) * 100);

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
