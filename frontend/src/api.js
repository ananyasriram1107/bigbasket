import { evaluateShortAnswer } from "./utils/shortAnswerEvaluator";

const API_BASE_URL = "http://127.0.0.1:8000";

export const mockQuestions = [
  // ================= OPERATING SYSTEMS =================
  {
    id: "os-mcq-1",
    courseId: "os",
    mode: "mcq",
    tier: 1,
    prompt: "Which CPU scheduling algorithm gives minimum average waiting time for a given set of processes?",
    options: ["FCFS", "SJF", "Round Robin", "Priority Scheduling"],
    correctAnswer: "SJF",
  },
  {
    id: "os-mcq-2",
    courseId: "os",
    mode: "mcq",
    tier: 2,
    prompt: "What condition occurs when processes spend significantly more time paging than executing instructions?",
    options: ["Starvation", "Deadlock", "Thrashing", "Internal Fragmentation"],
    correctAnswer: "Thrashing",
  },
  {
    id: "os-sa-1",
    courseId: "os",
    mode: "short_answer",
    tier: 2,
    prompt: "Explain how Thrashing occurs in Virtual Memory.",
    min_clusters_required: 2,
    keyword_clusters: [
      { name: "Page Faults", aliases: ["page fault", "page faults", "paging", "high page faults"] },
      { name: "Swapping", aliases: ["swapping", "swap", "disk i/o", "pages in and out"] },
      { name: "CPU Drop", aliases: ["cpu utilization drops", "low cpu", "cpu idle", "cpu underutilization"] },
    ],
  },

  // ================= DATABASE SYSTEMS =================
  {
    id: "dbms-mcq-1",
    courseId: "dbms",
    mode: "mcq",
    tier: 1,
    prompt: "Which ACID property guarantees that all operations in a transaction complete or none do?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correctAnswer: "Atomicity",
  },
  {
    id: "dbms-sa-1",
    courseId: "dbms",
    mode: "short_answer",
    tier: 2,
    prompt: "Define a Foreign Key and its primary purpose.",
    min_clusters_required: 2,
    keyword_clusters: [
      { name: "Referential Integrity", aliases: ["referential integrity", "integrity constraint"] },
      { name: "Primary Key Link", aliases: ["primary key", "references primary", "parent key"] },
      { name: "Table Relationship", aliases: ["relationship between tables", "connects tables", "child table"] },
    ],
  },

  // ================= DATA STRUCTURES & ALGORITHMS =================
  {
    id: "dsa-mcq-1",
    courseId: "dsa",
    mode: "mcq",
    tier: 1,
    prompt: "What is the worst-case runtime complexity of standard QuickSort?",
    options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
    correctAnswer: "O(n²)",
  },
  {
    id: "dsa-sa-1",
    courseId: "dsa",
    mode: "short_answer",
    tier: 2,
    prompt: "Describe how Separate Chaining handles collisions in a Hash Table.",
    min_clusters_required: 2,
    keyword_clusters: [
      { name: "Linked List", aliases: ["linked list", "chain", "linked lists"] },
      { name: "Bucket/Slot", aliases: ["bucket", "slot", "index array"] },
      { name: "Collision Handling", aliases: ["collision", "same hash", "overflow"] },
    ],
  },
];

export function getQuestionsByCourseAndMode(courseId = "os", mode = "mcq") {
  return mockQuestions.filter((q) => q.courseId === courseId && q.mode === mode);
}

export function checkAnswer(question, userAnswer) {
  if (question.mode === "short_answer") {
    return evaluateShortAnswer(userAnswer ?? "", question);
  }
  return {
    passed: String(userAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase(),
    correctAnswer: question.correctAnswer,
  };
}

// Mirrors backend/engine.py's next_state: tier bumps after 2 correct in a
// row, drops after 2 wrong in a row, so the local content bank plays by the
// same adaptive-difficulty rule as the real backend.
function nextAdaptiveState(tier, correctStreak, wrongStreak, correct) {
  if (correct) {
    correctStreak += 1;
    wrongStreak = 0;
    const xpEarned = tier * 10;

    if (correctStreak >= 2) {
      tier = Math.min(3, tier + 1);
      correctStreak = 0;
    }

    return { tier, correctStreak, wrongStreak, xpEarned };
  }

  wrongStreak += 1;
  correctStreak = 0;

  if (wrongStreak >= 2) {
    tier = Math.max(1, tier - 1);
    wrongStreak = 0;
  }

  return { tier, correctStreak, wrongStreak, xpEarned: 0 };
}

// Mirrors backend/engine.py's level_from_xp.
function levelFromXp(totalXp) {
  return Math.floor(Math.sqrt(totalXp / 50)) + 1;
}

async function fetchWithRetry(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response;
  } catch (firstError) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const retryResponse = await fetch(url, options);
    if (!retryResponse.ok) {
      throw new Error("Connection issue. Make sure the backend server is running.");
    }
    return retryResponse;
  }
}

// The real backend (backend/main.py) only knows a generic tier-based
// arithmetic bank -- it has no notion of courseId/mode, so a course+mode
// picked on the front page (OS/DBMS/DSA, MCQ/Short Answer) is served here,
// from the local content bank, instead of hitting the network at all. The
// backend call is kept as a last-resort fallback for course/mode combos
// that don't exist locally.
export async function getFirstQuestion(courseId = "os", mode = "mcq") {
  const localMatches = getQuestionsByCourseAndMode(courseId, mode);
  if (localMatches.length > 0) {
    return localMatches[Math.floor(Math.random() * localMatches.length)];
  }

  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/question/first?courseId=${courseId}&mode=${mode}`
    );
    return await response.json();
  } catch (err) {
    return mockQuestions[0];
  }
}

export async function submitAnswer(payload) {
  const question = mockQuestions.find((q) => q.id === payload.question_id);

  if (question) {
    const evalRes = checkAnswer(question, payload.answer);
    const isCorrect = evalRes.passed;

    const adaptive = nextAdaptiveState(
      payload.tier,
      payload.correct_streak,
      payload.wrong_streak,
      isCorrect
    );
    const newTotalXp = payload.total_xp + adaptive.xpEarned;

    const coursePool = getQuestionsByCourseAndMode(question.courseId, question.mode);
    const otherQuestions = coursePool.filter((q) => q.id !== payload.question_id);
    const nextQ = otherQuestions.length > 0
      ? otherQuestions[Math.floor(Math.random() * otherQuestions.length)]
      : coursePool[0];

    return {
      correct: isCorrect,
      xp_earned: adaptive.xpEarned,
      total_xp: newTotalXp,
      tier: adaptive.tier,
      correct_streak: adaptive.correctStreak,
      wrong_streak: adaptive.wrongStreak,
      level: levelFromXp(newTotalXp),
      level_up: levelFromXp(newTotalXp) > levelFromXp(payload.total_xp),
      next_question: nextQ,
      evaluation: evalRes,
    };
  }

  const response = await fetchWithRetry(`${API_BASE_URL}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await response.json();
}
