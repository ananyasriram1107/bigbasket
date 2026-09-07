"""
QuestVerse Adaptive Insights Engine
Handles performance weighting, mastery updates, misconception diagnostics,
and intervention selection based on attempt history.
"""

def evaluate_performance(correct: bool, time_taken_ms: int) -> float:
    """Calculates speed-weighted performance score."""
    if not correct:
        return 0.0
    if time_taken_ms <= 5000:
        return 1.0
    if time_taken_ms <= 15000:
        return 0.85
    return 0.70

def detect_misconception(attempts: list) -> str:
    """Identifies root cause failure patterns from incorrect answers."""
    wrongs = [a for a in attempts if not a.get("correct", False)]
    if len(wrongs) < 2:
        return "None"
    
    last_two_tiers = [w.get("tier", 1) for w in wrongs[-2:]]
    if last_two_tiers == [2, 2]:
        return "Multi-step Operation Hesitation"
    if last_two_tiers == [3, 3]:
        return "Variable Isolation / Sign Confusion"
    return "Arithmetic Computation Fatigue"

def compute_adaptive_state(old_mastery: float, attempts: list) -> dict:
    """
    Updates mastery EMA (0.8 * old + 0.2 * perf) and decides intervention:
    PRACTICE, HINT_AND_STEP_DOWN, CHALLENGE_BOSS, or TOPIC_ADVANCE.
    """
    if not attempts:
        return {
            "mastery": old_mastery,
            "intervention": "PRACTICE",
            "misconception": "None",
            "recommended_tier": 1,
            "reason": "Baseline assessment initialized."
        }

    latest = attempts[-1]
    perf = evaluate_performance(
        latest.get("correct", False), 
        latest.get("time_taken_ms", 8000)
    )
    # Exponential Moving Average specified in section 8.3
    new_mastery = round((0.8 * old_mastery) + (0.2 * perf), 2)

    # Calculate streaks
    wrong_streak = 0
    for a in reversed(attempts):
        if not a.get("correct", False):
            wrong_streak += 1
        else:
            break

    correct_streak = 0
    for a in reversed(attempts):
        if a.get("correct", False):
            correct_streak += 1
        else:
            break

    misconception = detect_misconception(attempts)
    current_tier = latest.get("tier", 1)

    # Adaptive intervention decision tree
    if wrong_streak >= 2:
        intervention = "HINT_AND_STEP_DOWN"
        rec_tier = max(1, current_tier - 1)
        reason = f"Detected {misconception}. Lowering tier to rebuild confidence."
    elif correct_streak >= 3:
        intervention = "CHALLENGE_BOSS"
        rec_tier = min(3, current_tier + 1)
        reason = "High accuracy streak. Elevating to Boss Encounter."
    elif new_mastery >= 0.8:
        intervention = "TOPIC_ADVANCE"
        rec_tier = min(3, current_tier + 1)
        reason = "Mastery threshold achieved (>= 0.80)."
    else:
        intervention = "PRACTICE"
        rec_tier = current_tier
        reason = "Skill equilibrium stable. Continuing current tier."

    return {
        "mastery": new_mastery,
        "intervention": intervention,
        "misconception": misconception,
        "recommended_tier": rec_tier,
        "reason": reason
    }
