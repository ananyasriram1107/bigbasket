from engine import next_state, level_from_xp

# --- Two correct answers in a row should bump the tier up ---
state = next_state(tier=1, correct_streak=0, wrong_streak=0, correct=True)
assert state["tier"] == 1, "one correct shouldn't bump tier yet"
assert state["correct_streak"] == 1
assert state["xp_earned"] == 10  # tier 1 * 10

state = next_state(tier=1, correct_streak=1, wrong_streak=0, correct=True)
assert state["tier"] == 2, "second correct in a row should bump tier 1 -> 2"
assert state["correct_streak"] == 0, "streak resets after a bump"

# --- Two wrong answers in a row should drop the tier ---
state = next_state(tier=2, correct_streak=0, wrong_streak=0, correct=False)
assert state["tier"] == 2, "one wrong shouldn't drop tier yet"
assert state["wrong_streak"] == 1
assert state["xp_earned"] == 0

state = next_state(tier=2, correct_streak=0, wrong_streak=1, correct=False)
assert state["tier"] == 1, "second wrong in a row should drop tier 2 -> 1"
assert state["wrong_streak"] == 0, "streak resets after a drop"

# --- Tier should never exceed 3 or go below 1 ---
state = next_state(tier=3, correct_streak=1, wrong_streak=0, correct=True)
assert state["tier"] == 3, "tier should cap at 3"

state = next_state(tier=1, correct_streak=0, wrong_streak=1, correct=False)
assert state["tier"] == 1, "tier should floor at 1"

# --- Mixed sequence: a wrong answer should reset the correct streak ---
state = next_state(tier=1, correct_streak=1, wrong_streak=0, correct=False)
assert state["correct_streak"] == 0, "a wrong answer must reset correct_streak"
assert state["wrong_streak"] == 1

# --- XP awarded should scale with tier ---
state = next_state(tier=3, correct_streak=0, wrong_streak=0, correct=True)
assert state["xp_earned"] == 30, "tier 3 correct answer should award 30 xp"

# --- Level curve sanity checks ---
assert level_from_xp(0) == 1
assert level_from_xp(50) == 2
assert level_from_xp(200) == 3
assert level_from_xp(450) == 4

print("All engine tests passed!")