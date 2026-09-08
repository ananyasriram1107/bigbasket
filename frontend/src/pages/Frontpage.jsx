import React, { useState } from "react";
import explorerSprite from "../assets/mascot-correct.png";

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
    <div className="pixel-quest-page">
      <div className="pixel-stars">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>

      <header className="pixel-header">
        <div className="pixel-logo">
          <div className="pixel-logo-box">Q</div>
          <span>QUESTVERSE</span>
        </div>

        <div className="pixel-coins">
          <span>◆</span>
          READY
        </div>
      </header>

      <main className="pixel-content">

        {/* START SCREEN */}
        {stage === "start" && (
          <section className="start-screen">

            <div className="start-text">
              <div className="pixel-small-title">
                ★ WELCOME ADVENTURER ★
              </div>

              <h1>
                QUEST
                <br />
                <span>VERSE</span>
              </h1>

              <p>
                Your learning adventure begins here.
                <br />
                Choose your path, answer challenges,
                <br />
                and level up your knowledge.
              </p>

              <button
                className="pixel-start"
                onClick={() => setStage("courses")}
              >
                START QUEST
                <span>▶</span>
              </button>
            </div>

            <div className="pixel-world">

              <div className="moon" />

              <div className="mountain mountain-back" />
              <div className="mountain mountain-front" />

              <div className="quest-road">
                <div className="road-node node-1">1</div>
                <div className="road-node node-2">2</div>
                <div className="road-node node-3">3</div>
              </div>

              <img
                src={explorerSprite}
                alt="Explorer"
                className="pixel-explorer"
              />

              <div className="treasure">
                <div className="treasure-top" />
                <div className="treasure-body">
                  <span>◆</span>
                </div>
              </div>

              <div className="grass">
                <span>✦</span>
                <span>✿</span>
                <span>✦</span>
                <span>❀</span>
                <span>✦</span>
                <span>✿</span>
                <span>✦</span>
              </div>
            </div>

          </section>
        )}

        {/* COURSE SCREEN */}
        {stage === "courses" && (
          <section className="selection-screen">

            <div className="selection-heading">
              <div>
                <div className="pixel-small-title">
                  QUEST 01
                </div>

                <h2>CHOOSE YOUR PATH</h2>

                <p>
                  Select a subject for your adventure.
                </p>
              </div>

              <button
                className="pixel-back"
                onClick={() => setStage("start")}
              >
                ◀ BACK
              </button>
            </div>

            <div className="course-grid">
              {COURSES.map((course, index) => (
                <button
                  className="pixel-card"
                  key={course.id}
                  onClick={() => selectCourse(course)}
                >
                  <div className="card-number">
                    LEVEL 0{index + 1}
                  </div>

                  <div className="card-icon">
                    {course.icon}
                  </div>

                  <div className="card-info">
                    <span>{course.short}</span>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                  </div>

                  <div className="card-action">
                    ENTER
                    <b>▶</b>
                  </div>
                </button>
              ))}
            </div>

          </section>
        )}

        {/* MODE SCREEN */}
        {stage === "modes" && (
          <section className="selection-screen">

            <div className="selection-heading">
              <div>
                <div className="pixel-small-title">
                  QUEST 02
                </div>

                <h2>CHOOSE YOUR CHALLENGE</h2>

                <p>
                  <strong>{selectedCourse?.short}</strong>{" "}
                  {selectedCourse?.title}
                </p>
              </div>

              <button
                className="pixel-back"
                onClick={() => setStage("courses")}
              >
                ◀ CHANGE
              </button>
            </div>

            <div className="mode-grid">
              {MODES.map((mode) => (
                <button
                  className="pixel-mode-card"
                  key={mode.id}
                  onClick={() => selectMode(mode)}
                >
                  <div className="mode-icon">
                    {mode.icon}
                  </div>

                  <div className="mode-tag">
                    {mode.tag}
                  </div>

                  <h3>{mode.title}</h3>

                  <p>{mode.description}</p>

                  <div className="mode-action">
                    START CHALLENGE
                    <b>▶</b>
                  </div>
                </button>
              ))}
            </div>

          </section>
        )}

      </main>

      <footer className="pixel-footer">
        <span>QUESTVERSE</span>
        <span>★ YOUR ADVENTURE AWAITS ★</span>
      </footer>

      <style>{`

        * {
          box-sizing: border-box;
        }

        .pixel-quest-page {
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          position: relative;

          background:
            linear-gradient(
              180deg,
              #87c9ef 0%,
              #a9daf5 42%,
              #c7e7d0 42%,
              #c7e7d0 100%
            );

          color: #26384f;

          font-family:
            "Trebuchet MS",
            "Arial Black",
            sans-serif;
        }

        /* PIXEL OVERLAY */

        .pixel-quest-page::before {
          content: "";
          position: absolute;
          inset: 0;

          background-image:
            linear-gradient(
              rgba(255,255,255,0.12) 2px,
              transparent 2px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.12) 2px,
              transparent 2px
            );

          background-size: 32px 32px;
          pointer-events: none;
        }

        .pixel-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .pixel-stars i {
          position: absolute;
          width: 7px;
          height: 7px;
          background: #fff5b5;
          box-shadow: 3px 3px 0 rgba(64,83,109,0.2);
        }

        .pixel-stars i:nth-child(1) {
          top: 15%;
          left: 13%;
        }

        .pixel-stars i:nth-child(2) {
          top: 27%;
          left: 38%;
        }

        .pixel-stars i:nth-child(3) {
          top: 18%;
          right: 28%;
        }

        .pixel-stars i:nth-child(4) {
          top: 36%;
          right: 12%;
        }

        .pixel-stars i:nth-child(5) {
          top: 55%;
          left: 8%;
        }

        .pixel-stars i:nth-child(6) {
          top: 48%;
          right: 42%;
        }

        /* HEADER */

        .pixel-header {
          height: 82px;
          padding: 0 6vw;

          display: flex;
          align-items: center;
          justify-content: space-between;

          background: rgba(255,255,255,0.35);

          border-bottom: 4px solid #40536d;

          position: relative;
          z-index: 5;
        }

        .pixel-logo {
          display: flex;
          align-items: center;
          gap: 14px;

          font-size: 20px;
          font-weight: 900;
          letter-spacing: 3px;
        }

        .pixel-logo-box {
          width: 44px;
          height: 44px;

          display: grid;
          place-items: center;

          background: #75afe5;
          color: white;

          border: 4px solid #40536d;
          box-shadow: 5px 5px 0 #40536d;

          font-size: 22px;
        }

        .pixel-coins {
          display: flex;
          align-items: center;
          gap: 10px;

          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .pixel-coins span {
          color: #e6b84e;
          font-size: 17px;
        }

        /* MAIN */

        .pixel-content {
          width: min(1150px, 88%);
          min-height: calc(100vh - 142px);
          margin: auto;

          display: flex;
          align-items: center;

          position: relative;
          z-index: 2;
        }

        /* START */

        .start-screen {
          width: 100%;

          display: grid;
          grid-template-columns: 0.9fr 1.1fr;

          gap: 55px;
          align-items: center;
        }

        .start-text {
          padding: 40px 0;
        }

        .pixel-small-title {
          color: #527eaa;

          font-size: 12px;
          font-weight: 900;

          letter-spacing: 2px;

          margin-bottom: 20px;
        }

        .start-text h1 {
          margin: 0;

          font-family:
            "Arial Black",
            "Trebuchet MS",
            sans-serif;

          font-size: clamp(70px, 9vw, 125px);

          line-height: 0.78;

          letter-spacing: -6px;

          color: #34465e;

          text-shadow:
            5px 5px 0 rgba(64,83,109,0.18);
        }

        .start-text h1 span {
          color: #5799d6;
        }

        .start-text p {
          margin: 32px 0;

          color: #60748a;

          font-size: 16px;
          line-height: 1.7;
        }

        .pixel-start {
          min-width: 260px;

          padding: 18px 22px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          background: #70a9df;
          color: white;

          border: 4px solid #40536d;
          box-shadow: 6px 6px 0 #40536d;

          font-family: inherit;
          font-size: 13px;
          font-weight: 900;

          letter-spacing: 2px;

          cursor: pointer;

          transition: 0.15s;
        }

        .pixel-start:hover {
          transform: translate(3px, 3px);
          box-shadow: 3px 3px 0 #40536d;
          background: #609bd4;
        }

        .pixel-start span {
          font-size: 16px;
        }

        /* WORLD */

        .pixel-world {
          height: 490px;

          position: relative;

          border: 5px solid #40536d;

          background:
            linear-gradient(
              180deg,
              #91cef0 0%,
              #bce3f6 63%,
              #9bcf73 63%,
              #9bcf73 100%
            );

          box-shadow: 9px 9px 0 #40536d;

          overflow: hidden;
        }

        .moon {
          position: absolute;

          width: 75px;
          height: 75px;

          top: 40px;
          right: 60px;

          background: #ffe59a;

          border: 5px solid #40536d;

          box-shadow:
            6px 6px 0 #40536d;
        }

        .mountain {
          position: absolute;

          bottom: 175px;

          width: 0;
          height: 0;

          border-left: 170px solid transparent;
          border-right: 170px solid transparent;
          border-bottom: 210px solid #75a9b7;
        }

        .mountain-back {
          left: -70px;
          opacity: 0.65;
        }

        .mountain-front {
          right: -40px;
          border-bottom-color: #6699a9;
        }

        /* PATH */

        .quest-road {
          position: absolute;

          left: 7%;
          right: 7%;
          bottom: 135px;

          height: 145px;
        }

        .quest-road::before {
          content: "";

          position: absolute;

          left: 5%;
          right: 5%;
          top: 60px;

          height: 18px;

          background: #d5b37a;

          border-top: 4px solid #806a4d;
          border-bottom: 4px solid #806a4d;

          transform: rotate(-8deg);
        }

        .road-node {
          position: absolute;
          z-index: 3;

          width: 50px;
          height: 50px;

          display: grid;
          place-items: center;

          background: #fff1c7;

          border: 4px solid #40536d;

          box-shadow: 5px 5px 0 #40536d;

          font-size: 15px;
          font-weight: 900;
        }

        .node-1 {
          left: 3%;
          top: 70px;
        }

        .node-2 {
          left: 46%;
          top: 42px;
        }

        .node-3 {
          right: 3%;
          top: 8px;
        }

        /* CHARACTER */

        .pixel-explorer {
          position: absolute;

          width: 120px;
          height: 120px;

          object-fit: contain;

          image-rendering: pixelated;

          left: 39%;
          bottom: 145px;

          z-index: 5;

          filter:
            drop-shadow(6px 6px 0 rgba(64,83,109,0.3));

          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-9px);
          }
        }

        /* CHEST */

        .treasure {
          position: absolute;

          right: 9%;
          bottom: 115px;

          width: 72px;
          height: 62px;

          z-index: 4;
        }

        .treasure-top {
          width: 72px;
          height: 25px;

          background: #d69a52;

          border: 5px solid #40536d;

          position: absolute;
          top: 0;
        }

        .treasure-body {
          position: absolute;

          width: 72px;
          height: 42px;

          bottom: 0;

          background: #c98643;

          border: 5px solid #40536d;
        }

        .treasure-body span {
          position: absolute;

          left: 25px;
          top: 9px;

          color: #ffe08a;

          font-size: 14px;
        }

        /* GRASS */

        .grass {
          position: absolute;

          bottom: 0;
          left: 0;
          right: 0;

          height: 92px;

          background: #8ec66d;

          border-top: 5px solid #40536d;

          display: flex;
          align-items: center;
          justify-content: space-around;

          color: #568b52;

          font-size: 24px;
        }

        /* SELECTION */

        .selection-screen {
          width: 100%;
          padding: 45px 0;
        }

        .selection-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          margin-bottom: 38px;
        }

        .selection-heading h2 {
          margin: 0;

          font-size: clamp(38px, 5vw, 65px);

          line-height: 0.9;

          letter-spacing: -3px;

          color: #34465e;
        }

        .selection-heading p {
          margin: 12px 0 0;

          color: #667a90;

          font-size: 15px;
        }

        .selection-heading p strong {
          color: #5799d6;
        }

        .pixel-back {
          padding: 13px 18px;

          background: #fff4d5;

          border: 4px solid #40536d;
          box-shadow: 4px 4px 0 #40536d;

          color: #40536d;

          font-family: inherit;

          font-size: 10px;
          font-weight: 900;

          cursor: pointer;
        }

        .pixel-back:hover {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #40536d;
        }

        /* COURSE CARDS */

        .course-grid {
          display: grid;

          grid-template-columns: repeat(3, 1fr);

          gap: 18px;
        }

        .pixel-card {
          min-height: 350px;

          padding: 24px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          text-align: left;

          background: #fff4d8;

          border: 5px solid #40536d;

          box-shadow: 7px 7px 0 #40536d;

          color: #34465e;

          font-family: inherit;

          cursor: pointer;

          transition: 0.15s;
        }

        .pixel-card:hover {
          transform: translate(3px, 3px);

          box-shadow: 4px 4px 0 #40536d;

          background: #fff9e9;
        }

        .card-number {
          color: #8190a1;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 1px;
        }

        .card-icon {
          font-size: 58px;

          color: #5799d6;

          text-shadow:
            4px 4px 0 rgba(64,83,109,0.15);
        }

        .card-info span {
          color: #5799d6;

          font-size: 11px;
          font-weight: 900;

          letter-spacing: 2px;
        }

        .card-info h3 {
          margin: 8px 0;

          font-size: 23px;

          line-height: 1.1;
        }

        .card-info p {
          margin: 0;

          color: #718196;

          font-size: 13px;

          line-height: 1.5;
        }

        .card-action {
          padding-top: 18px;

          border-top: 3px dashed #c8d0d8;

          display: flex;
          justify-content: space-between;

          color: #60748a;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 1px;
        }

        .card-action b {
          color: #5799d6;
        }

        /* MODES */

        .mode-grid {
          display: grid;

          grid-template-columns: repeat(2, 1fr);

          gap: 22px;
        }

        .pixel-mode-card {
          min-height: 320px;

          padding: 30px;

          position: relative;

          text-align: left;

          background: #fff4d8;

          border: 5px solid #40536d;

          box-shadow: 7px 7px 0 #40536d;

          color: #34465e;

          font-family: inherit;

          cursor: pointer;

          transition: 0.15s;
        }

        .pixel-mode-card:hover {
          transform: translate(3px, 3px);

          box-shadow: 4px 4px 0 #40536d;

          background: #fff9e9;
        }

        .mode-icon {
          width: 65px;
          height: 65px;

          display: grid;
          place-items: center;

          background: #bce0f5;

          border: 4px solid #40536d;

          box-shadow: 4px 4px 0 #40536d;

          color: #5799d6;

          font-size: 30px;
        }

        .mode-tag {
          position: absolute;

          right: 25px;
          top: 30px;

          padding: 7px 10px;

          background: #ffe19a;

          border: 3px solid #40536d;

          font-size: 9px;

          font-weight: 900;

          color: #6d5b32;
        }

        .pixel-mode-card h3 {
          margin: 42px 0 12px;

          font-size: 30px;
        }

        .pixel-mode-card p {
          margin: 0 0 30px;

          color: #718196;

          font-size: 14px;

          line-height: 1.6;
        }

        .mode-action {
          padding-top: 18px;

          border-top: 3px dashed #c8d0d8;

          display: flex;
          justify-content: space-between;

          color: #60748a;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 1px;
        }

        .mode-action b {
          color: #5799d6;
        }

        /* FOOTER */

        .pixel-footer {
          height: 60px;

          padding: 0 6vw;

          display: flex;
          justify-content: space-between;
          align-items: center;

          background: rgba(255,255,255,0.35);

          border-top: 4px solid #40536d;

          position: relative;
          z-index: 5;

          color: #718196;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 1px;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {

          .start-screen {
            grid-template-columns: 1fr;
          }

          .pixel-world {
            height: 380px;
          }

          .course-grid,
          .mode-grid {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 550px) {

          .pixel-header {
            padding: 0 20px;
          }

          .pixel-coins {
            display: none;
          }

          .pixel-content {
            width: 90%;
          }

          .start-text h1 {
            font-size: 65px;
            letter-spacing: -4px;
          }

          .selection-heading {
            flex-direction: column;
            gap: 20px;
          }

          .selection-heading h2 {
            font-size: 40px;
          }

          .pixel-footer {
            padding: 0 20px;
          }

        }

      `}</style>
    </div>
  );
}