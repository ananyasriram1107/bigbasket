"""
QuestVerse AI Dataset Loader
Loads the local programming-languages dataset (ai/data/languages.csv) once at
import time and exposes small lookup helpers used by the short-answer grader
and question generator. No pandas dependency on purpose -- csv + stdlib is
plenty for 5 rows and keeps the install footprint tiny for a hackathon laptop.
"""

import csv
import os

_CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "languages.csv")

# Fields that are numbers vs free text / categorical -- the grader treats
# these differently (numeric closeness vs string/keyword matching).
NUMERIC_FIELDS = {"difficulty", "popularity", "year_created"}
LIST_FIELDS = {"use_cases"}          # semicolon-separated
CATEGORICAL_FIELDS = {"paradigm", "typing"}


def _coerce(field: str, value: str):
    if field in NUMERIC_FIELDS:
        try:
            return float(value)
        except ValueError:
            return value
    if field in LIST_FIELDS:
        return [v.strip() for v in value.split(";") if v.strip()]
    return value.strip()


def load_languages(path: str = _CSV_PATH) -> list[dict]:
    with open(path, newline="") as f:
        reader = csv.DictReader(f)
        rows = []
        for row in reader:
            rows.append({field: _coerce(field, val) for field, val in row.items()})
        return rows


LANGUAGES = load_languages()
LANGUAGES_BY_NAME = {row["language"].lower(): row for row in LANGUAGES}


def get_language(name: str) -> dict | None:
    """Case-insensitive lookup, e.g. get_language('python')."""
    return LANGUAGES_BY_NAME.get(name.strip().lower())


def tier_for_difficulty(difficulty: float) -> int:
    """Maps the dataset's 1-5 difficulty scale onto the game's 1-3 tier scale."""
    if difficulty <= 2:
        return 1
    if difficulty == 3:
        return 2
    return 3


if __name__ == "__main__":
    for row in LANGUAGES:
        print(row)