import json
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from engine import next_state, level_from_xp
from typing import Optional

app = FastAPI()

class AnswerRequest(BaseModel):
    question_id: int
    answer: str
    tier: int
    correct_streak: int
    wrong_streak: int
    total_xp: int

@app.get("/questions/all")
def get_all_questions(tier: Optional[int] = None):
    """Debug-only: full question data including correct_answer, for validating content."""
    if tier is not None:
        return QUESTIONS_BY_TIER.get(tier, [])
    return ALL_QUESTIONS
    
# Wide open for hackathon speed — tighten later if it ever matters
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Question bank: load once at startup, keep in memory ----
with open("questions.json") as f:
    ALL_QUESTIONS = json.load(f)

QUESTIONS_BY_ID = {q["id"]: q for q in ALL_QUESTIONS}
QUESTIONS_BY_TIER = {1: [], 2: [], 3: []}
for q in ALL_QUESTIONS:
    QUESTIONS_BY_TIER[q["tier"]].append(q)


def public_question(q: dict) -> dict:
    """Strip the answer before sending a question to the client."""
    return {"id": q["id"], "prompt": q["prompt"], "options": q["options"], "tier": q["tier"]}


def random_question_for_tier(tier: int, exclude_id: int | None = None) -> dict:
    pool = QUESTIONS_BY_TIER.get(tier) or []
    if not pool:
        # fallback: nearest tier that actually has questions
        for fallback_tier in (2, 1, 3):
            if QUESTIONS_BY_TIER.get(fallback_tier):
                pool = QUESTIONS_BY_TIER[fallback_tier]
                break
    candidates = [q for q in pool if q["id"] != exclude_id] or pool
    return random.choice(candidates)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/question/first")
def get_first_question():
    q = random_question_for_tier(1)
    return public_question(q)


from fastapi import HTTPException

@app.post("/answer")
def submit_answer(payload: AnswerRequest):
    question = QUESTIONS_BY_ID.get(payload.question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Unknown question_id")

    safe_tier = max(1, min(3, payload.tier))   # clamp against bad/stale input

    is_correct = str(payload.answer).strip().lower() == str(question["correct_answer"]).strip().lower()

    result = next_state(
        tier=safe_tier,
        correct_streak=payload.correct_streak,
        wrong_streak=payload.wrong_streak,
        correct=is_correct,
    )

    new_total_xp = payload.total_xp + result["xp_earned"]
    old_level = level_from_xp(payload.total_xp)
    new_level = level_from_xp(new_total_xp)

    next_q = random_question_for_tier(result["tier"], exclude_id=payload.question_id)

    return {
        "correct": is_correct,
        "xp_earned": result["xp_earned"],
        "total_xp": new_total_xp,
        "tier": result["tier"],
        "correct_streak": result["correct_streak"],
        "wrong_streak": result["wrong_streak"],
        "level": new_level,
        "level_up": new_level > old_level,
        "next_question": public_question(next_q),
    }