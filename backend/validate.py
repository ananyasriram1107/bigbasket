import json
import sys

def validate(filepath: str) -> bool:
    with open(filepath) as f:
        questions = json.load(f)

    if not isinstance(questions, list):
        print("FAIL: top-level JSON must be a list")
        return False

    seen_ids = set()
    ok = True

    for i, q in enumerate(questions):
        required_keys = {"id", "prompt", "options", "correct_answer", "tier"}
        missing = required_keys - q.keys()
        if missing:
            print(f"FAIL: question at index {i} missing keys: {missing}")
            ok = False
            continue

        if q["id"] in seen_ids:
            print(f"FAIL: duplicate id {q['id']}")
            ok = False
        seen_ids.add(q["id"])

        if not isinstance(q["options"], list) or len(q["options"]) != 4:
            print(f"FAIL: question id {q['id']} must have exactly 4 options")
            ok = False

        if len(set(q["options"])) != len(q["options"]):
            print(f"FAIL: question id {q['id']} has duplicate options")
            ok = False

        if str(q["correct_answer"]) not in [str(o) for o in q["options"]]:
            print(f"FAIL: question id {q['id']} correct_answer not found in its own options")
            ok = False

        if q["tier"] not in (1, 2, 3):
            print(f"FAIL: question id {q['id']} has invalid tier {q['tier']}")
            ok = False

        if not str(q["prompt"]).strip():
            print(f"FAIL: question id {q['id']} has an empty prompt")
            ok = False

    if ok:
        print(f"PASS: {len(questions)} questions validated successfully.")
    return ok


if __name__ == "__main__":
    filepath = sys.argv[1] if len(sys.argv) > 1 else "questions.json"
    success = validate(filepath)
    sys.exit(0 if success else 1)