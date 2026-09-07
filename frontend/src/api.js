const USE_MOCK = true;

const mockQuestions = [
  {
    id: "mock-1",
    prompt: "What is 4 + 5?",
    options: ["7", "8", "9", "10"],
    correctAnswer: "9",
  },
  {
    id: "mock-2",
    prompt: "What is 7 − 3?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
  },
  {
    id: "mock-3",
    prompt: "What is 6 + 8?",
    options: ["12", "13", "14", "15"],
    correctAnswer: "14",
  },
];

let mockQuestionIndex = 0;

function publicQuestion(question) {
  return {
    id: question.id,
    prompt: question.prompt,
    options: question.options,
  };
}

export async function getFirstQuestion() {
  if (!USE_MOCK) {
    throw new Error("Real backend is not connected yet.");
  }

  mockQuestionIndex = 0;
  return publicQuestion(mockQuestions[mockQuestionIndex]);
}

export async function submitAnswer(payload) {
  if (!USE_MOCK) {
    throw new Error("Real backend is not connected yet.");
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const currentQuestion = mockQuestions.find(
    (question) => question.id === payload.question_id
  );

  if (!currentQuestion) {
    throw new Error("Question was not found.");
  }

  const correct = payload.answer === currentQuestion.correctAnswer;

  let correctStreak = correct ? payload.correct_streak + 1 : 0;
  let wrongStreak = correct ? 0 : payload.wrong_streak + 1;
  let tier = payload.tier;

  if (correctStreak >= 2) {
    tier = Math.min(3, tier + 1);
    correctStreak = 0;
  }

  if (wrongStreak >= 2) {
    tier = Math.max(1, tier - 1);
    wrongStreak = 0;
  }

  const xpEarned = correct ? tier * 10 : 0;
  const totalXp = payload.total_xp + xpEarned;
  const level = Math.floor(Math.sqrt(totalXp / 50)) + 1;

  mockQuestionIndex = (mockQuestionIndex + 1) % mockQuestions.length;

  return {
    correct,
    xp_earned: xpEarned,
    total_xp: totalXp,
    tier,
    correct_streak: correctStreak,
    wrong_streak: wrongStreak,
    level,
    level_up: false,
    next_question: publicQuestion(mockQuestions[mockQuestionIndex]),
  };
}