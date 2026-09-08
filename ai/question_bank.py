"""
Builds the full 'Programming Languages' course question bank (MCQ +
short-answer) straight from ai/data/languages.csv. This is the one thing
backend/main.py needs to import to serve that course -- OS/DBMS/DSA content
lives separately in backend/course_content.py.
"""

import random

from ai.dataset import LANGUAGES, LIST_FIELDS, tier_for_difficulty
from ai.short_ans import FIELD_QUESTION_TEXT, make_question

# use_cases is a list field and popularity has messy decimals -- both make
# for awkward multiple-choice options, so MCQ sticks to the four fields
# below. Short-answer questions (make_question) still cover every field.
MCQ_FIELDS = ["year_created", "difficulty", "paradigm", "typing"]

MCQ_EXPLANATION_TEXT = {
    "year_created": "{language} was first released in {value}.",
    "difficulty": "In this dataset, {language} carries a difficulty rating of {value}/5.",
    "paradigm": "{language} follows a {value} programming paradigm.",
    "typing": "{language} uses {value} typing.",
}


def _fmt(value) -> str:
    """1991.0 -> '1991', 'Static' -> 'Static'. Keeps MCQ options readable."""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


def _mcq_options(field: str, correct_value) -> list[str]:
    if field in LIST_FIELDS:
        pool = {v for row in LANGUAGES for v in row[field]}
    else:
        pool = {row[field] for row in LANGUAGES}

    distractors = [v for v in pool if _fmt(v) != _fmt(correct_value)]
    random.shuffle(distractors)
    options = [_fmt(v) for v in distractors[:3]] + [_fmt(correct_value)]
    random.shuffle(options)
    return options


def _build_mcq_bank() -> list[dict]:
    questions = []
    for row in LANGUAGES:
        for field in MCQ_FIELDS:
            correct_value = row[field]
            options = _mcq_options(field, correct_value)
            if len(set(options)) < 2:
                continue  # not enough distinct distractors, skip rather than ask a broken question
            questions.append(
                {
                    "id": f"lang-mcq-{row['language'].lower()}-{field}",
                    "courseId": "lang",
                    "mode": "mcq",
                    "tier": tier_for_difficulty(row["difficulty"]),
                    "prompt": FIELD_QUESTION_TEXT[field].format(language=row["language"]),
                    "options": options,
                    "correct_answer": _fmt(correct_value),
                    "explanation": MCQ_EXPLANATION_TEXT[field].format(
                        language=row["language"], value=_fmt(correct_value)
                    ),
                }
            )
    return questions


def _build_short_answer_bank() -> list[dict]:
    return [
        make_question(row["language"], field)
        for row in LANGUAGES
        for field in FIELD_QUESTION_TEXT
    ]


MCQ_QUESTIONS = _build_mcq_bank()
SHORT_ANSWER_QUESTIONS = _build_short_answer_bank()


if __name__ == "__main__":
    print(f"{len(MCQ_QUESTIONS)} MCQ questions, {len(SHORT_ANSWER_QUESTIONS)} short-answer questions")
    for q in MCQ_QUESTIONS[:3]:
        print(q)