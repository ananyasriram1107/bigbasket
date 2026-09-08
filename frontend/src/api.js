const API_BASE_URL = "http://127.0.0.1:8000";

async function fetchWithRetry(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    return response;
  } catch (firstError) {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const retryResponse = await fetch(url, options);

    if (!retryResponse.ok) {
      throw new Error(
        "Connection issue. Make sure the backend server is running."
      );
    }

    return retryResponse;
  }
}

export async function getFirstQuestion() {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/question/first`
  );

  return response.json();
}

export async function submitAnswer(payload) {
  const response = await fetchWithRetry(`${API_BASE_URL}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

import { evaluateShortAnswer } from "./shortAnswerEvaluator";

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

export function getQuestionsByCourseAndMode(courseId, mode) {
  return mockQuestions.filter(q => q.courseId === courseId && q.mode === mode);
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
