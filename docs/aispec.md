# QuestVerse Learning Intelligence Specification

## 1. Content Architecture
- Static Bank (`content/questions.json`): 60 validated questions across Tiers 1–3.
- Fallback Resolver: Defaults to static bank on Groq API timeout (>2.5s) or parse failure.

## 2. Mastery & Performance
- Performance ($P$): Speed-weighted correctness ($P \in [0.0, 1.0]$).
- Mastery EMA: $Mastery_t = 0.8 \times Mastery_{t-1} + 0.2 \times P$

## 3. Interventions
- 2 consecutive wrong answers -> Step down tier + trigger hint.
- 3 consecutive correct answers -> Step up tier + trigger Boss Question.
