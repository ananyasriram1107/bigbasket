import React, { useState } from "react";

const COURSES = [
  {
    id: "os",
    title: "Operating Systems",
    short: "OS",
    description: "Processes, memory, scheduling & concurrency",
    icon: "⚙",
  },
  {
    id: "dbms",
    title: "Database Systems",
    short: "DB",
    description: "SQL, transactions, indexing & normalization",
    icon: "▣",
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    short: "DS",
    description: "Trees, graphs, algorithms & complexity",
    icon: "⌘",
  },
];

const MODES = [
  {
    id: "mcq",
    title: "Multiple Choice",
    description: "Choose the correct answer from four options.",
    icon: "✓",
    tag: "QUICK",
  },
  {
    id: "short_answer",
    title: "Short Answer",
    description: "Explain the concept in your own words.",
    icon: "✎",
    tag: "CONCEPT",
  },
];

export default function FrontPage({ onLaunchSession }) {
  const [stage, setStage] = useState("start");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setStage("modes");
  };

  const selectMode = (mode) => {
    onLaunchSession?.({
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      mode: mode.id,
    });
  };

  return (
    <div className="quest-page">
      <div className="quest-bg-grid" />

      <header className="quest-nav">
        <div className="brand">
          <div className="brand-mark">Q</div>
          <div>
            <div className="brand-name">QUESTVERSE</div>
            <div className="brand-sub">ADAPTIVE LEARNING</div>
          </div>
        </div>

        <div className="status">
          <span className="status-dot" />
          SYSTEM ONLINE
        </div>
      </header>

      <main className="quest-main">
        {stage === "start" && (
          <section className="hero">
            <div className="hero-eyebrow">YOUR NEXT CHALLENGE AWAITS</div>

            <h1>
              LEARN.
              <br />
              <span>PLAY.</span>
              <br />
              LEVEL UP.
            </h1>

            <p>
              Master computer science through adaptive challenges that change
              with your performance.
            </p>

            <button
              className="start-button"
              onClick={() => setStage("courses")}
            >
              <span>START ADVENTURE</span>
              <b>→</b>
            </button>

            <div className="hero-stats">
              <div>
                <strong>03</strong>
                <span>COURSES</span>
              </div>
              <div>
                <strong>02</strong>
                <span>GAME MODES</span>
              </div>
              <div>
                <strong>∞</strong>
                <span>CHALLENGES</span>
              </div>
            </div>
          </section>
        )}

        {stage === "courses" && (
          <section className="selection">
            <div className="selection-top">
              <div>
                <div className="step-label">01 / 02</div>
                <h2>Choose your battlefield.</h2>
                <p>Select a subject to begin your quest.</p>
              </div>

              <button
                className="back-button"
                onClick={() => setStage("start")}
              >
                ← BACK
              </button>
            </div>

            <div className="course-grid">
              {COURSES.map((course, index) => (
                <button
                  className="course-card"
                  key={course.id}
                  onClick={() => selectCourse(course)}
                >
                  <div className="card-number">0{index + 1}</div>

                  <div className="course-icon">{course.icon}</div>

                  <div className="course-content">
                    <span className="course-short">{course.short}</span>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                  </div>

                  <div className="card-arrow">↗</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {stage === "modes" && (
          <section className="selection">
            <div className="selection-top">
              <div>
                <div className="step-label">02 / 02</div>
                <h2>Choose your challenge.</h2>
                <p>
                  <span className="selected-course">
                    {selectedCourse?.short}
                  </span>{" "}
                  {selectedCourse?.title}
                </p>
              </div>

              <button
                className="back-button"
                onClick={() => setStage("courses")}
              >
                ← CHANGE
              </button>
            </div>

            <div className="mode-grid">
              {MODES.map((mode) => (
                <button
                  className="mode-card"
                  key={mode.id}
                  onClick={() => selectMode(mode)}
                >
                  <div className="mode-top">
                    <div className="mode-icon">{mode.icon}</div>
                    <span className="mode-tag">{mode.tag}</span>
                  </div>

                  <h3>{mode.title}</h3>
                  <p>{mode.description}</p>

                  <div className="mode-footer">
                    <span>SELECT MODE</span>
                    <b>→</b>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="quest-footer">
        <span>QUESTVERSE v1.0</span>
        <span>ADAPTIVE ENGINE READY</span>
      </footer>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .quest-page {
          min-height: 100vh;
          width: 100%;
          background: #080b12;
          color: #f8fafc;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          position: relative;
          overflow: hidden;
        }

        .quest-bg-grid {
          position: absolute;
          inset: 0;
          opacity: 0.13;
          background-image:
            linear-gradient(#64748b 1px, transparent 1px),
            linear-gradient(90deg, #64748b 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
          pointer-events: none;
        }

        .quest-page::before {
          content: "";
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: #2563eb;
          filter: blur(180px);
          opacity: 0.12;
          top: -250px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .quest-nav {
          height: 76px;
          padding: 0 6vw;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-mark {
          width: 38px;
          height: 38px;
          border: 1px solid #3b82f6;
          display: grid;
          place-items: center;
          font-size: 18px;
          font-weight: 900;
          color: #60a5fa;
          transform: skew(-8deg);
        }

        .brand-name {
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 3px;
        }

        .brand-sub {
          color: #64748b;
          font-size: 8px;
          letter-spacing: 2px;
          margin-top: 2px;
        }

        .status {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 10px #22c55e;
        }

        .quest-main {
          width: min(1100px, 88%);
          min-height: calc(100vh - 136px);
          margin: auto;
          display: flex;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero {
          width: 100%;
          padding: 60px 0;
        }

        .hero-eyebrow,
        .step-label {
          color: #60a5fa;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 3px;
          margin-bottom: 18px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(58px, 9vw, 110px);
          line-height: 0.86;
          letter-spacing: -6px;
          font-weight: 950;
        }

        .hero h1 span {
          color: #3b82f6;
        }

        .hero p {
          max-width: 520px;
          color: #94a3b8;
          font-size: 16px;
          line-height: 1.7;
          margin: 30px 0;
        }

        .start-button {
          border: 1px solid #3b82f6;
          background: #2563eb;
          color: white;
          padding: 17px 22px;
          min-width: 230px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .start-button:hover {
          background: #3b82f6;
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(37, 99, 235, 0.25);
        }

        .start-button b {
          font-size: 20px;
          font-weight: 400;
        }

        .hero-stats {
          margin-top: 65px;
          display: flex;
          gap: 55px;
          border-top: 1px solid #1e293b;
          padding-top: 22px;
          width: fit-content;
        }

        .hero-stats div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .hero-stats strong {
          font-size: 22px;
        }

        .hero-stats span {
          color: #64748b;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .selection {
          width: 100%;
          padding: 45px 0;
        }

        .selection-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .selection-top h2 {
          margin: 0;
          font-size: clamp(32px, 5vw, 54px);
          letter-spacing: -2px;
          line-height: 1;
        }

        .selection-top p {
          color: #64748b;
          margin: 12px 0 0;
          font-size: 14px;
        }

        .selected-course {
          color: #60a5fa;
          font-weight: 900;
        }

        .back-button {
          background: transparent;
          color: #64748b;
          border: 1px solid #334155;
          padding: 11px 16px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: 0.2s;
        }

        .back-button:hover {
          color: white;
          border-color: #64748b;
        }

        .course-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .course-card {
          min-height: 340px;
          padding: 22px;
          background: #0d121c;
          border: 1px solid #1e293b;
          color: white;
          text-align: left;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: 0.25s ease;
        }

        .course-card:hover {
          border-color: #3b82f6;
          background: #101827;
          transform: translateY(-6px);
        }

        .card-number {
          color: #475569;
          font-family: monospace;
          font-size: 11px;
        }

        .course-icon {
          font-size: 48px;
          color: #60a5fa;
          font-weight: 300;
        }

        .course-short {
          color: #3b82f6;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .course-content h3 {
          font-size: 21px;
          margin: 7px 0;
          line-height: 1.15;
        }

        .course-content p {
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
          margin: 0;
        }

        .card-arrow {
          position: absolute;
          right: 20px;
          bottom: 20px;
          color: #475569;
          font-size: 20px;
          transition: 0.2s;
        }

        .course-card:hover .card-arrow {
          color: #60a5fa;
          transform: translate(3px, -3px);
        }

        .mode-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .mode-card {
          background: #0d121c;
          border: 1px solid #1e293b;
          padding: 30px;
          min-height: 300px;
          color: white;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: 0.25s ease;
        }

        .mode-card:hover {
          border-color: #3b82f6;
          background: #101827;
          transform: translateY(-6px);
        }

        .mode-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mode-icon {
          width: 52px;
          height: 52px;
          border: 1px solid #334155;
          display: grid;
          place-items: center;
          font-size: 25px;
          color: #60a5fa;
        }

        .mode-tag {
          color: #64748b;
          border: 1px solid #334155;
          padding: 5px 9px;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .mode-card h3 {
          font-size: 28px;
          margin: 35px 0 10px;
        }

        .mode-card p {
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
          max-width: 400px;
          margin: 0;
        }

        .mode-footer {
          margin-top: auto;
          padding-top: 25px;
          border-top: 1px solid #1e293b;
          display: flex;
          justify-content: space-between;
          color: #64748b;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .mode-card:hover .mode-footer {
          color: #60a5fa;
        }

        .mode-footer b {
          font-size: 18px;
          font-weight: 400;
        }

        .quest-footer {
          height: 60px;
          border-top: 1px solid #1e293b;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 6vw;
          color: #475569;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 2px;
          position: relative;
          z-index: 2;
        }

        @media (max-width: 800px) {
          .course-grid,
          .mode-grid {
            grid-template-columns: 1fr;
          }

          .course-card {
            min-height: 220px;
          }

          .selection-top {
            gap: 20px;
          }

          .hero h1 {
            letter-spacing: -3px;
          }
        }

        @media (max-width: 500px) {
          .quest-nav {
            padding: 0 20px;
          }

          .status {
            display: none;
          }

          .quest-main {
            width: 90%;
          }

          .hero-stats {
            gap: 25px;
          }

          .selection-top {
            flex-direction: column;
          }

          .quest-footer {
            padding: 0 20px;
          }
        }
      `}</style>
    </div>
  );
}