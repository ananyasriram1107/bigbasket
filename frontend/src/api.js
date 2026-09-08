import { evaluateShortAnswer } from "./utils/shortAnswerEvaluator"; // Adjust to "./shortAnswerEvaluator" if in the same folder

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
    correctAnswer: "SJF"
  },
  {
    id: "os-mcq-2",
    courseId: "os",
    mode: "mcq",
    tier: 2,
    prompt: "What condition occurs when processes spend significantly more time paging than executing instructions?",
    options: ["Starvation", "Deadlock", "Thrashing", "Internal Fragmentation"],
    correctAnswer: "Thrashing"
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
      { name: "CPU Drop", aliases: ["cpu utilization drops", "low cpu", "cpu idle", "cpu underutilization"] }
    ]
  },

  // ================= DATABASE SYSTEMS =================
  {
    id: "dbms-mcq-1",
    courseId: "dbms",
    mode: "mcq",
    tier: 1,
    prompt: "Which ACID property guarantees that all operations in a transaction complete or none do?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correctAnswer: "Atomicity"
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
      { name: "Table Relationship", aliases: ["relationship between tables", "connects tables", "child table"] }
    ]
  },

  // ================= DATA STRUCTURES & ALGORITHMS =================
  {
    id: "dsa-mcq-1",
    courseId: "dsa",
    mode: "mcq",
    tier: 1,
    prompt: "What is the worst-case runtime complexity of standard QuickSort?",
    options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
    correctAnswer: "O(n²)"
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
      { name: "Collision Handling", aliases: ["collision", "same hash", "overflow"] }
    ]
  }
];

export function getQuestionsByCourseAndMode(courseId = "os", mode = "mcq") {
  return mockQuestions.filter((q) => q.courseId === courseId && q.mode === mode);
}

export function checkAnswer(question, userAnswer) {
  if (question.mode === "short_answer") {
    return evaluateShortAnswer(userAnswer, question);
  }
  return {
    passed: String(userAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase(),
    correctAnswer: question.correctAnswer
  };
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

export async function getFirstQuestion(courseId = "os", mode = "mcq") {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/question/first?courseId=${courseId}&mode=${mode}`
    );
    return await response.json();
  } catch (err) {
    // Fallback directly to client mocks if backend isn't up
    const matches = getQuestionsByCourseAndMode(courseId, mode);
    return matches[0] || mockQuestions[0];
  }
}

export async function submitAnswer(payload) {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (err) {
    // Client-side fallback resolution
    const question = mockQuestions.find((q) => q.id === payload.question_id);
    const evalRes = question ? checkAnswer(question, payload.answer) : { passed: false };
    const isCorrect = evalRes.passed;

    const coursePool = question 
      ? getQuestionsByCourseAndMode(question.courseId, question.mode)
      : mockQuestions;
    const nextQ = coursePool.find((q) => q.id !== payload.question_id) || coursePool[0];

    return {
      correct: isCorrect,
      xp_gained: isCorrect ? 25 : 0,
      tier: isCorrect ? Math.min(payload.tier + 1, 3) : Math.max(payload.tier - 1, 1),
      next_question: nextQ,
      correct_streak: isCorrect ? payload.correct_streak + 1 : 0,
      wrong_streak: isCorrect ? 0 : payload.wrong_streak + 1,
      total_xp: payload.total_xp + (isCorrect ? 25 : 0),
      evaluation: evalRes
    };
  }
}
