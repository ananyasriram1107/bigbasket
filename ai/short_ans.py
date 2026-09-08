"""
QuestVerse short-answer grading.

Given a question that's really "what does the dataset say about field X of
language Y" and a free-text answer typed by the player, produce an accuracy
score (0-100) and short feedback.

Design: grade deterministically from ai/data/languages.csv FIRST -- that's
what makes the score trustworthy and demo-safe even if Ollama isn't running.
Then, if Ollama is reachable, ask it to (a) sanity-check free-text answers
that plain string matching can't handle well (synonyms like "OOP" for
"Object-oriented") and (b) write the natural-language feedback, grounded
explicitly in the dataset row so it can't hallucinate a different "fact".

grade_short_answer() is the one function the backend/main.py answer route
needs to call.
"""

import json
import re

from ai import ollama_client
from ai.dataset import CATEGORICAL_FIELDS, LIST_FIELDS, NUMERIC_FIELDS, get_language

# How forgiving numeric grading is per field: full credit inside the
# tolerance, then linear falloff to 0 at 3x the tolerance.
NUMERIC_TOLERANCE = {
    "year_created": 2,     # +/-2 years still "basically right"
    "popularity": 5,       # +/-5 percentage points
    "difficulty": 1,       # +/-1 point on the 1-5 scale
}

FIELD_QUESTION_TEXT = {
    "year_created": "What year was {language} created?",
    "popularity": "Roughly what percentage popularity does {language} have in this dataset?",
    "difficulty": "On a scale of 1 (easiest) to 5 (hardest), how difficult is {language} rated?",
    "paradigm": "What programming paradigm does {language} use?",
    "typing": "Is {language} statically or dynamically typed?",
    "use_cases": "Name a typical use case for {language}.",
}


def make_question(language: str, field: str, qid: str | None = None) -> dict:
    """Builds a short-answer question dict for one dataset field of one language."""
    row = get_language(language)
    if row is None:
        raise ValueError(f"Unknown language: {language}")
    from ai.dataset import tier_for_difficulty

    return {
        "id": qid or f"lang-sa-{language.lower()}-{field}",
        "courseId": "lang",
        "mode": "short_answer",
        "language": row["language"],
        "field": field,
        "prompt": FIELD_QUESTION_TEXT[field].format(language=row["language"]),
        "tier": tier_for_difficulty(row["difficulty"]),
    }


def _numeric_score(user_answer: str, correct_value: float, field: str) -> tuple[int, str]:
    match = re.search(r"-?\d+(\.\d+)?", user_answer)
    if not match:
        return 0, "No number found in the answer."
    guess = float(match.group())
    tolerance = NUMERIC_TOLERANCE.get(field, 1)
    diff = abs(guess - correct_value)
    if diff <= tolerance:
        return 100, f"Within tolerance of the correct value ({correct_value})."
    if diff >= tolerance * 3:
        return 0, f"Far from the correct value ({correct_value})."
    # linear falloff between 1x and 3x tolerance
    score = round(100 * (1 - (diff - tolerance) / (tolerance * 2)))
    return max(0, min(100, score)), f"Close to the correct value ({correct_value}), off by {diff:g}."


def _categorical_score(user_answer: str, correct_value: str) -> tuple[int, str]:
    normalized_user = user_answer.strip().lower()
    normalized_correct = correct_value.strip().lower()
    if normalized_correct in normalized_user:
        return 100, f"Matches '{correct_value}'."
    # cheap synonym table for the two categorical fields we actually have
    synonyms = {
        "dynamic": ["dynamically typed", "dynamic typing", "duck typed"],
        "static": ["statically typed", "static typing"],
        "object-oriented": ["oop", "object oriented", "objectoriented"],
        "multi-paradigm": ["multiparadigm", "multi paradigm", "hybrid"],
    }
    for canonical, aliases in synonyms.items():
        if canonical == normalized_correct and any(a in normalized_user for a in aliases):
            return 100, f"Matches '{correct_value}' (recognized synonym)."
    return 0, f"Does not match '{correct_value}' -- deterministic check found no overlap (LLM will double-check)."


def _list_score(user_answer: str, correct_values: list[str]) -> tuple[int, str]:
    normalized_user = user_answer.strip().lower()
    hits = [v for v in correct_values if v.lower() in normalized_user]
    if not hits:
        return 0, f"No overlap with expected use cases: {', '.join(correct_values)}."
    score = round(100 * len(hits) / len(correct_values))
    return score, f"Mentioned: {', '.join(hits)}."


def deterministic_grade(question: dict, user_answer: str) -> dict:
    row = get_language(question["language"])
    field = question["field"]
    correct_value = row[field]

    if field in NUMERIC_FIELDS:
        score, note = _numeric_score(user_answer, correct_value, field)
    elif field in LIST_FIELDS:
        score, note = _list_score(user_answer, correct_value)
    elif field in CATEGORICAL_FIELDS:
        score, note = _categorical_score(user_answer, correct_value)
    else:
        score, note = 0, "Unknown field type."

    return {"accuracy": score, "correct_value": correct_value, "note": note}


_LLM_SYSTEM_PROMPT = """You are a strict but fair grading assistant for a quiz game.
You are given: a question, the single ground-truth fact from the game's dataset
(treat it as authoritative even if it conflicts with what you otherwise know),
the player's free-text answer, and a deterministic pre-check score.
Return ONLY raw JSON, no markdown, matching exactly:
{"accuracy": <integer 0-100>, "feedback": "<one short sentence>"}
Judge semantic correctness (synonyms, paraphrases, partial credit for close
numeric answers), not exact string matching. Do not move the accuracy more
than 20 points away from the deterministic pre-check unless the pre-check is
clearly wrong about a synonym or paraphrase.
"""


def _llm_grade(question: dict, user_answer: str, deterministic: dict) -> dict | None:
    prompt = (
        f"Question: {question['prompt']}\n"
        f"Ground-truth fact: {question['language']}.{question['field']} = {deterministic['correct_value']}\n"
        f"Player's answer: {user_answer!r}\n"
        f"Deterministic pre-check score: {deterministic['accuracy']} ({deterministic['note']})\n"
    )
    try:
        raw = ollama_client.generate(prompt, system=_LLM_SYSTEM_PROMPT)
        parsed = json.loads(raw)
        accuracy = int(parsed["accuracy"])
        feedback = str(parsed["feedback"])
        return {"accuracy": max(0, min(100, accuracy)), "feedback": feedback}
    except (ollama_client.OllamaUnavailable, json.JSONDecodeError, KeyError, ValueError, TypeError):
        return None


def grade_short_answer(question: dict, user_answer: str) -> dict:
    """
    Returns:
        {
          "accuracy": int 0-100,
          "correct": bool,          # accuracy >= PASS_THRESHOLD
          "correct_value": ...,     # what the dataset actually says
          "feedback": str,
          "graded_by": "ollama" | "deterministic",
        }

    Numeric fields (year_created, popularity, difficulty) are unambiguous --
    there's nothing for an LLM to "interpret" about whether 2015 is close to
    1991, so the accuracy score for those ALWAYS comes from the deterministic
    math, and the LLM isn't even called (it was inventing contradictory
    feedback text -- e.g. "accuracy: 100" next to "the answer is incorrect"
    -- with no actual scoring benefit to show for it).

    Categorical/list fields (paradigm, typing, use_cases) only go to the LLM
    when the deterministic keyword check found NOTHING (score 0). If the
    deterministic check already found an exact/synonym match, that's final --
    the LLM never gets a chance to downgrade it. This matters: in testing,
    typing the verbatim-correct answer "Multi-paradigm" got scored 0/incorrect
    by the LLM despite its own feedback admitting it was "a correct
    categorization." Never let the model override a confirmed-correct answer;
    only let it rescue paraphrases the keyword check missed.
    """
    PASS_THRESHOLD = 65

    if not user_answer or not user_answer.strip():
        det = deterministic_grade(question, "")
        return {
            "accuracy": 0,
            "correct": False,
            "correct_value": det["correct_value"],
            "feedback": "No answer provided.",
            "graded_by": "deterministic",
        }

    det = deterministic_grade(question, user_answer)
    field = question["field"]

    # Numeric facts: the math is the final word, no LLM call needed at all.
    if field in NUMERIC_FIELDS:
        return {
            "accuracy": det["accuracy"],
            "correct": det["accuracy"] >= PASS_THRESHOLD,
            "correct_value": det["correct_value"],
            "feedback": det["note"],
            "graded_by": "deterministic",
        }

    # Categorical/list fields: an exact/synonym match is already trustworthy
    # -- don't let the LLM second-guess a confirmed-correct answer.
    if det["accuracy"] >= 100:
        return {
            "accuracy": det["accuracy"],
            "correct": True,
            "correct_value": det["correct_value"],
            "feedback": det["note"],
            "graded_by": "deterministic",
        }

    # Only reached when the keyword check found nothing -- exactly where an
    # LLM can rescue a valid paraphrase/synonym plain matching missed.
    llm_result = _llm_grade(question, user_answer, det)
    if llm_result is not None:
        accuracy = llm_result["accuracy"]
        feedback = llm_result["feedback"]
        graded_by = "ollama"
    else:
        accuracy = det["accuracy"]
        feedback = det["note"]
        graded_by = "deterministic"

    return {
        "accuracy": accuracy,
        "correct": accuracy >= PASS_THRESHOLD,
        "correct_value": det["correct_value"],
        "feedback": feedback,
        "graded_by": graded_by,
    }


if __name__ == "__main__":
    q = make_question("Python", "year_created")
    print(q)
    for guess in ["1991", "1990", "1989", "no idea", "2015"]:
        print(guess, "->", grade_short_answer(q, guess))

    q2 = make_question("C++", "paradigm")
    for guess in ["Multi-paradigm", "OOP only", "object oriented and procedural"]:
        print(guess, "->", grade_short_answer(q2, guess))