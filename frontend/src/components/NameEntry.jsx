import { useState } from "react";

export default function NameEntry({ onStart, loading, courseTitle }) {
  const [name, setName] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const cleanName = name.trim();

    if (!cleanName || loading) {
      return;
    }

    onStart(cleanName);
  }

  return (
    <main className="name-entry">
      <section className="name-entry__card">
        <p className="eyebrow">Adaptive Learning Quest</p>
        <h1>{courseTitle || "QuestVerse"}</h1>
        <p>Answer questions, earn XP, and level up.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="player-name">What should we call you?</label>

          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            maxLength={30}
            autoFocus
          />

          <button type="submit" disabled={!name.trim() || loading}>
            {loading ? "Starting…" : "Start Game"}
          </button>
        </form>
      </section>
    </main>
  );
}