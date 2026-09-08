"""
Grading for the OS/DBMS/DSA short-answer questions in course_content.py.

Concept coverage -- WHICH key ideas the player actually mentioned -- is still
decided deterministically from keyword_clusters. That part has to stay
trustworthy and demo-safe, and a small local LLM has no business being the
judge of whether a fact is present in a paragraph; keyword/alias matching
does that job reliably.

What used to be computer-y ("Missing: Page Faults, CPU Drop") is now handed
to Ollama to turn into a couple of natural, human sentences -- the same way
a TA would talk you through what you got right and what you missed, using
the question's model_answer as the ground truth so the feedback can't drift
from the real explanation. If Ollama isn't running (or returns something we
can't parse), a naturally-phrased fallback sentence is built instead, so the
game never shows the player a raw list of concept labels.
"""

import json

from ai import ollama_client


def _join_naturally(items: list[str]) -> str:
    """['a'] -> 'a'; ['a', 'b'] -> 'a and b'; ['a', 'b', 'c'] -> 'a, b, and c'."""
    items = list(items)
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def _fallback_feedback(user_answer: str, matched: list[str], missing: list[str], correct: bool, model_answer: str) -> str:
    """Natural-language feedback with no LLM involved -- used whenever Ollama isn't reachable."""
    if not user_answer or not user_answer.strip():
        return f"You didn't write anything for this one -- here's the idea in a nutshell: {model_answer}"

    if correct and not missing:
        return f"Nice work -- your answer covers everything it needs to, including {_join_naturally(matched)}."

    if correct:
        return f"Good answer overall. You clearly explained {_join_naturally(matched)}, which is really the heart of it."

    if matched:
        return (
            f"You're on the right track -- you touched on {_join_naturally(matched)}, but the answer is still "
            f"missing a piece. Here's the fuller picture: {model_answer}"
        )

    return f"That doesn't quite capture it yet. Here's what this one is really about: {model_answer}"


_LLM_SYSTEM_PROMPT = """You are a friendly, encouraging computer science tutor giving feedback on a
student's short-answer response. You are given the question, the model/reference answer, the
student's own answer, which key concepts they covered, and which key concepts they missed.
Write 2-3 short sentences of warm, natural, conversational feedback: acknowledge what they got
right, and if anything is missing, explain it in plain human language grounded in the model
answer -- never just list the missing concept names like a computer would, and never invent
facts that aren't in the model answer.
Return ONLY raw JSON, no markdown, matching exactly:
{"feedback": "<your 2-3 sentence feedback>"}
"""


def _llm_feedback(question: dict, user_answer: str, matched: list[str], missing: list[str], correct: bool, model_answer: str):
    prompt = (
        f"Question: {question.get('prompt', '')}\n"
        f"Model answer: {model_answer}\n"
        f"Student's answer: {user_answer!r}\n"
        f"Concepts the student covered: {matched or 'none'}\n"
        f"Concepts the student missed: {missing or 'none'}\n"
        f"Overall correct: {correct}\n"
    )
    try:
        raw = ollama_client.generate(prompt, system=_LLM_SYSTEM_PROMPT)
        parsed = json.loads(raw)
        feedback = str(parsed["feedback"]).strip()
        return feedback or None
    except (ollama_client.OllamaUnavailable, json.JSONDecodeError, KeyError, ValueError, TypeError):
        return None


def grade_keyword_answer(question: dict, user_answer: str) -> dict:
    clusters = question.get("keyword_clusters", [])
    model_answer = question.get("model_answer", "")
    normalized = (user_answer or "").lower()

    matched = []
    missing = []
    for cluster in clusters:
        aliases = cluster.get("aliases", [])
        if any(alias.lower() in normalized for alias in aliases):
            matched.append(cluster["name"])
        else:
            missing.append(cluster["name"])

    threshold = question.get("min_clusters_required", 2)
    total = len(clusters) or 1
    accuracy = round(100 * len(matched) / total)
    correct = len(matched) >= threshold

    if not user_answer or not user_answer.strip():
        feedback = _fallback_feedback("", matched, missing, correct, model_answer)
        graded_by = "deterministic"
    else:
        llm_text = _llm_feedback(question, user_answer, matched, missing, correct, model_answer)
        if llm_text is not None:
            feedback = llm_text
            graded_by = "ollama"
        else:
            feedback = _fallback_feedback(user_answer, matched, missing, correct, model_answer)
            graded_by = "deterministic"

    return {
        "accuracy": accuracy,
        "correct": correct,
        "matched_concepts": matched,
        "missing_concepts": missing,
        "correct_value": model_answer,  # lets the review screen show the reference answer, same as the lang course
        "feedback": feedback,
        "graded_by": graded_by,
    }


if __name__ == "__main__":
    q = {
        "prompt": "Explain how Thrashing occurs in Virtual Memory.",
        "model_answer": "Thrashing happens when there are too many processes competing for too little RAM, causing constant page faults and swapping, which drops CPU utilization because the OS spends its time paging instead of running processes.",
        "keyword_clusters": [
            {"name": "Page Faults", "aliases": ["page fault", "page faults", "paging"]},
            {"name": "Swapping", "aliases": ["swapping", "swap", "disk i/o"]},
            {"name": "CPU Drop", "aliases": ["cpu utilization drops", "low cpu", "cpu idle"]},
        ],
        "min_clusters_required": 2,
    }
    for answer in [
        "Thrashing happens when there are too many page faults and constant swapping, so the cpu is idle.",
        "It's when the computer gets slow.",
        "",
    ]:
        print(answer, "->", grade_keyword_answer(q, answer))