"""
Turns a user-uploaded PDF into a playable QuestVerse course.

Pipeline: extract text (pypdf) -> generate MCQ + short-answer questions
grounded in that text -> persist to disk (uploaded_courses.json) so the
course survives a server restart, the same way course_content.py's
built-in courses are always available.

Question generation tries the local LLM (Ollama) first -- it can actually
read and reason about the uploaded material -- and falls back to a
deterministic, non-AI heuristic (pull out fact-bearing sentences, blank out
a key term for MCQ, use the sentence itself as the short-answer reference)
whenever Ollama isn't running or returns something unusable. That mirrors
every other AI feature in this codebase (ai/short_ans.py, keyword_grader.py):
never let a missing local model turn into a hard failure.

Short-answer questions from a PDF course are graded exactly the same way as
OS/DBMS/DSA's: keyword_grader.grade_keyword_answer() only cares that the
question has "keyword_clusters" + "model_answer", regardless of where the
question came from.
"""

import io
import json
import random
import re
import time
from pathlib import Path
from typing import Optional

from pypdf import PdfReader

from ai import ollama_client

UPLOADS_FILE = Path(__file__).parent / "uploaded_courses.json"

MAX_CHARS_FOR_PROMPT = 6000   # keep the LLM prompt small enough to run fast on a CPU laptop
MIN_TEXT_CHARS = 200          # below this, there's not enough material to make real questions
N_MCQ = 6
N_SHORT_ANSWER = 4

STOPWORDS = {
    "the", "and", "for", "are", "but", "not", "you", "with", "this", "that",
    "from", "have", "has", "had", "was", "were", "will", "would", "could",
    "should", "their", "there", "which", "when", "where", "what", "who",
    "into", "than", "then", "them", "they", "your", "these", "those", "such",
    "also", "each", "more", "most", "some", "any", "all", "can", "may",
    "its", "his", "her", "our", "over", "under", "between", "about", "being",
    "been", "while", "after", "before", "because", "however", "within",
}


class PdfProcessingError(Exception):
    """Raised for any user-facing failure: unreadable PDF, no extractable text, etc."""


# ---------------------------------------------------------------- extraction

def extract_text(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
    except Exception as e:
        raise PdfProcessingError(f"Could not read this file as a PDF: {e}") from e

    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception:
            raise PdfProcessingError("This PDF is password-protected and can't be read.") from None

    pages_text = []
    for page in reader.pages:
        try:
            pages_text.append(page.extract_text() or "")
        except Exception:
            continue

    text = "\n".join(pages_text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()

    if len(text) < MIN_TEXT_CHARS:
        raise PdfProcessingError(
            "Couldn't find enough readable text in that PDF -- it might be a scanned "
            "image without a text layer."
        )

    return text


# ------------------------------------------------------- LLM-based generation

QUESTION_GEN_SYSTEM_PROMPT = """You are a quiz question generator for QuestVerse, a study app.
You will be given source material extracted from a PDF the user uploaded.
Generate quiz questions STRICTLY grounded in that material -- never invent
facts that aren't in the text, and never reference "the document" or "the
text" in a question's prompt; ask about the actual subject matter instead.

Return ONLY raw JSON, no markdown fences, matching exactly this shape:
{
  "mcq": [
    {"prompt": "...", "options": ["...", "...", "...", "..."], "correct_answer": "...", "explanation": "...", "tier": 1}
  ],
  "short_answer": [
    {"prompt": "...", "model_answer": "...", "tier": 1,
     "keyword_clusters": [{"name": "...", "aliases": ["...", "..."]}]}
  ]
}

Rules:
- correct_answer must be an exact copy of one of that question's 4 options.
- tier is 1 (basic recall), 2 (applied understanding), or 3 (nuanced/harder) -- mix all three across the set.
- Each short-answer question needs 2-4 keyword_clusters. Each cluster names ONE
  distinct idea the model_answer covers, with 2-4 alternate phrasings/synonyms
  a student might use for it -- these are used to check free-text answers.
- Write exactly 6 MCQ questions and 4 short-answer questions.
"""


def _validate_generated(mcq: list, short_answer: list) -> bool:
    if not mcq and not short_answer:
        return False

    for q in mcq:
        if not isinstance(q, dict):
            return False
        if not {"prompt", "options", "correct_answer"}.issubset(q.keys()):
            return False
        if not isinstance(q["options"], list) or len(q["options"]) < 2:
            return False
        if q["correct_answer"] not in q["options"]:
            return False

    for q in short_answer:
        if not isinstance(q, dict):
            return False
        if not {"prompt", "model_answer", "keyword_clusters"}.issubset(q.keys()):
            return False
        if not isinstance(q["keyword_clusters"], list) or not q["keyword_clusters"]:
            return False

    return True


def _generate_with_llm(text: str) -> Optional[dict]:
    if not ollama_client.is_running():
        return None

    prompt = f"Source material:\n\n{text[:MAX_CHARS_FOR_PROMPT]}\n\nGenerate the questions now."

    try:
        raw = ollama_client.generate(prompt, system=QUESTION_GEN_SYSTEM_PROMPT, timeout=45)
        parsed = json.loads(raw)
        mcq = parsed.get("mcq", [])
        short_answer = parsed.get("short_answer", [])
        if not _validate_generated(mcq, short_answer):
            return None
        return {"mcq": mcq, "short_answer": short_answer}
    except (ollama_client.OllamaUnavailable, json.JSONDecodeError, KeyError, ValueError, TypeError):
        return None


# ------------------------------------------------- deterministic fallback

_WORD_RE = re.compile(r"[A-Za-z][A-Za-z\-']{3,}")
_NUMBER_RE = re.compile(r"\b\d[\d,.]*%?\b")
_SENTENCE_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])")


def _split_sentences(text: str) -> list[str]:
    sentences = [s.strip() for s in _SENTENCE_RE.split(text) if 40 <= len(s.strip()) <= 260]
    if len(sentences) >= 3:
        return sentences
    # No clean sentence boundaries found (e.g. bullet-heavy text) -- fall
    # back to splitting on any period/newline instead of giving up.
    return [s.strip() for s in re.split(r"[.\n]", text) if 40 <= len(s.strip()) <= 260]


def _key_terms(sentence: str) -> list[str]:
    seen = set()
    terms = []
    for word in _WORD_RE.findall(sentence):
        lowered = word.lower()
        if lowered in STOPWORDS or lowered in seen:
            continue
        seen.add(lowered)
        terms.append(word)
    terms.sort(key=lambda w: (not w[0].isupper(), -len(w)))
    return terms


def _generate_deterministic(text: str) -> dict:
    sentences = _split_sentences(text)
    random.shuffle(sentences)

    all_terms: set[str] = set()
    for sentence in sentences:
        all_terms.update(t for t in _key_terms(sentence) if len(t) > 3)
    all_numbers = _NUMBER_RE.findall(text)

    mcq = []
    used_answers: set[str] = set()
    used_sentences: set[str] = set()

    for sentence in sentences:
        if len(mcq) >= N_MCQ:
            break

        numbers = _NUMBER_RE.findall(sentence)
        terms = [t for t in _key_terms(sentence) if len(t) > 3]

        answer = next((c for c in numbers + terms if c not in used_answers), None)
        if not answer:
            continue

        is_number = answer in numbers
        distractor_pool = [c for c in (all_numbers if is_number else list(all_terms)) if c != answer]
        random.shuffle(distractor_pool)
        distractors = list(dict.fromkeys(distractor_pool))[:3]
        if len(distractors) < 3:
            continue

        used_answers.add(answer)
        used_sentences.add(sentence)
        blanked = sentence.replace(answer, "_____", 1)
        options = distractors + [answer]
        random.shuffle(options)

        mcq.append({
            "prompt": f"Fill in the blank: {blanked}",
            "options": options,
            "correct_answer": answer,
            "explanation": sentence,
            "tier": 1 + (len(mcq) % 3),
        })

    short_answer = []
    for sentence in sentences:
        if len(short_answer) >= N_SHORT_ANSWER:
            break
        if sentence in used_sentences:
            continue

        terms = [t for t in _key_terms(sentence) if len(t) > 4][:3]
        if len(terms) < 2:
            continue

        clusters = [{"name": t.title(), "aliases": [t.lower()]} for t in terms]
        short_answer.append({
            "prompt": f"In your own words, explain what the material says about {terms[0].lower()}.",
            "model_answer": sentence,
            "min_clusters_required": min(2, len(clusters)),
            "keyword_clusters": clusters,
            "tier": 1 + (len(short_answer) % 3),
        })
        used_sentences.add(sentence)

    return {"mcq": mcq, "short_answer": short_answer}


# ------------------------------------------------------------- course assembly

def _slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug or "custom"


def build_course(title: str, text: str) -> dict:
    generated = _generate_with_llm(text)
    generated_by = "ollama"
    if generated is None:
        generated = _generate_deterministic(text)
        generated_by = "deterministic"

    if not generated["mcq"] and not generated["short_answer"]:
        raise PdfProcessingError(
            "Couldn't generate any questions from this PDF -- try a document with more prose content."
        )

    base_slug = _slugify(title)
    course_id = f"custom-{base_slug}-{int(time.time())}"

    questions = []
    for i, q in enumerate(generated["mcq"]):
        questions.append({
            "id": f"{course_id}-mcq-{i}",
            "courseId": course_id,
            "mode": "mcq",
            "tier": max(1, min(3, int(q.get("tier") or 1))),
            "prompt": q["prompt"],
            "options": q["options"],
            "correct_answer": q["correct_answer"],
            "explanation": q.get("explanation", ""),
        })
    for i, q in enumerate(generated["short_answer"]):
        clusters = q["keyword_clusters"]
        questions.append({
            "id": f"{course_id}-sa-{i}",
            "courseId": course_id,
            "mode": "short_answer",
            "tier": max(1, min(3, int(q.get("tier") or 1))),
            "prompt": q["prompt"],
            "model_answer": q["model_answer"],
            "min_clusters_required": q.get("min_clusters_required") or min(2, len(clusters)),
            "keyword_clusters": clusters,
        })

    mcq_count = sum(1 for q in questions if q["mode"] == "mcq")
    sa_count = sum(1 for q in questions if q["mode"] == "short_answer")

    return {
        "id": course_id,
        "title": title,
        "short": (base_slug[:4] or "pdf").upper(),
        "description": f"Custom course from your PDF -- {mcq_count} MCQ, {sa_count} short answer.",
        "icon": "📄",
        "generatedBy": generated_by,
        "questions": questions,
    }


def course_metadata(course: dict) -> dict:
    """Strips the full question bank -- just enough for the front-page course card."""
    return {
        "id": course["id"],
        "title": course["title"],
        "short": course["short"],
        "description": course["description"],
        "icon": course["icon"],
        "mcqCount": sum(1 for q in course["questions"] if q["mode"] == "mcq"),
        "shortAnswerCount": sum(1 for q in course["questions"] if q["mode"] == "short_answer"),
    }


# ------------------------------------------------------------------ persistence

def load_uploaded_courses() -> list[dict]:
    if not UPLOADS_FILE.exists():
        return []
    try:
        with open(UPLOADS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def save_uploaded_course(course: dict) -> None:
    courses = load_uploaded_courses()
    courses.append(course)
    with open(UPLOADS_FILE, "w", encoding="utf-8") as f:
        json.dump(courses, f, indent=2)


def process_pdf_upload(file_bytes: bytes, title: str) -> dict:
    """The one function backend/main.py's upload route needs to call."""
    text = extract_text(file_bytes)
    course = build_course(title.strip() or "Custom Upload", text)
    save_uploaded_course(course)
    return course
