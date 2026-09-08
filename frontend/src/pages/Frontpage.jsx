import React, { useState } from "react";

const COURSES = [
  {
    id: "os",
    title: "Operating Systems",
    code: "CS-301",
    description: "Process scheduling, virtual memory, concurrency & kernel architecture.",
    icon: "⚡",
  },
  {
    id: "dbms",
    title: "Database Systems",
    code: "CS-302",
    description: "Relational algebra, indexing, ACID protocols & transaction recovery.",
    icon: "🗄️",
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    code: "CS-303",
    description: "Dynamic programming, trees, graph theory & asymptotic analysis.",
    icon: "🧠",
  },
];

const MODES = [
  {
    id: "mcq",
    title: "Multiple Choice (MCQ)",
    badge: "Standard",
    detail: "Fast-paced objective questions with dynamic difficulty calibration.",
    icon: "🎯",
  },
  {
    id: "short_answer",
    title: "Short Answers",
    badge: "Concept Engine",
    detail: "Synthesize concise explanations evaluated via semantic concept clusters.",
    icon: "✍️",
  },
];

export default function FrontPage({ onLaunchSession }) {
  const [stage, setStage] = useState("start");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setStage("modes");
  };

  const handleSelectMode = (modeId) => {
    if (onLaunchSession) {
      onLaunchSession({
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        mode: modeId,
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.windowCard}>
        {/* Top Header Bar */}
        <div style={styles.headerBar}>
          <div style={styles.statusGroup}>
            <span style={styles.liveIndicator} />
            <span style={styles.headerTitle}>QUESTVERSE // CALIBRATION PROTOCOL</span>
          </div>
          <div style={styles.stageTag}>
            {stage === "start" && "IDLE_INIT"}
            {stage === "courses" && "SELECT_COURSE"}
            {stage === "modes" && `ARMED // ${selectedCourse?.code}`}
          </div>
        </div>

        {/* Dynamic Card Body */}
        <div style={styles.bodyContent}>
          {stage === "start" && (
            <div style={styles.startSection}>
              <div style={styles.titleBadge}>COGNITIVE ASSESSMENT SUITE</div>
              <h1 style={styles.mainTitle}>QuestVerse</h1>
              <p style={styles.heroSubtitle}>
                Calibrate your computer science depth across automated MCQs and free-form concept explanations.
              </p>
              <button
                onClick={() => setStage("courses")}
                style={styles.hugePrimaryButton}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                START ADVENTURE ▶
              </button>
            </div>
          )}

          {stage === "courses" && (
            <div>
              <div style={styles.modalHeadingRow}>
                <div>
                  <h2 style={styles.stageHeading}>Choose Your Course</h2>
                  <p style={styles.stageDescription}>Select an academic discipline to begin evaluation</p>
                </div>
                <button
                  onClick={() => setStage("start")}
                  style={styles.backButton}
                >
                  ← Back
                </button>
              </div>

              <div style={styles.cardsGrid}>
                {COURSES.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    style={styles.optionCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#0284c7";
                      e.currentTarget.style.backgroundColor = "#f0f9ff";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <div style={styles.cardTitleGroup}>
                        <span style={styles.cardIcon}>{course.icon}</span>
                        <span style={styles.cardTitle}>{course.title}</span>
                      </div>
                      <span style={styles.codePill}>{course.code}</span>
                    </div>
                    <p style={styles.cardDescription}>{course.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage === "modes" && (
            <div>
              <div style={styles.modalHeadingRow}>
                <div>
                  <div style={styles.trackSubtitle}>
                    TRACK: {selectedCourse?.title?.toUpperCase()} ({selectedCourse?.code})
                  </div>
                  <h2 style={styles.stageHeading}>Select Assessment Mode</h2>
                </div>
                <button
                  onClick={() => setStage("courses")}
                  style={styles.backButton}
                >
                  Change Course
                </button>
              </div>

              <div style={styles.cardsGrid}>
                {MODES.map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => handleSelectMode(mode.id)}
                    style={styles.optionCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#059669";
                      e.currentTarget.style.backgroundColor = "#f0fdf4";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <div style={styles.cardTitleGroup}>
                        <span style={styles.cardIcon}>{mode.icon}</span>
                        <span style={styles.cardTitle}>{mode.title}</span>
                      </div>
                      <span style={mode.id === "short_answer" ? styles.modeBadgeGold : styles.modeBadgeBlue}>
                        {mode.badge}
                      </span>
                    </div>
                    <p style={styles.cardDescription}>{mode.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={styles.footerBar}>
          <span>VIRTUAL ACADEMY CALIBRATION // RETRO CS ENGINE</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    boxSizing: "border-box",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  windowCard: {
    width: "100%",
    maxWidth: "800px",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: "20px",
    border: "4px solid #1e293b",
    boxShadow: "0 24px 48px rgba(0,0,0,0.35), 0 8px 0 #0f172a",
    overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  headerBar: {
    backgroundColor: "#0f172a",
    padding: "14px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "3px solid #334155",
  },
  statusGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  liveIndicator: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    boxShadow: "0 0 10px #22c55e",
    display: "inline-block",
  },
  headerTitle: {
    color: "#e2e8f0",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },
  stageTag: {
    color: "#38bdf8",
    fontFamily: "monospace",
    fontSize: "12px",
    fontWeight: "700",
  },
  bodyContent: {
    padding: "36px 32px",
  },
  startSection: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 8px",
  },
  titleBadge: {
    display: "inline-block",
    padding: "6px 16px",
    backgroundColor: "#e2e8f0",
    color: "#334155",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "2px",
    marginBottom: "16px",
  },
  mainTitle: {
    fontSize: "44px",
    fontWeight: "900",
    color: "#0f172a",
    margin: "0 0 12px 0",
  },
  heroSubtitle: {
    fontSize: "15px",
    color: "#475569",
    maxWidth: "520px",
    lineHeight: "1.6",
    margin: "0 0 32px 0",
  },
  hugePrimaryButton: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "3px solid #0369a1",
    boxShadow: "0 6px 0 #075985",
    borderRadius: "14px",
    padding: "18px 48px",
    fontSize: "16px",
    fontWeight: "800",
    letterSpacing: "1px",
    cursor: "pointer",
    transition: "all 0.15s ease-in-out",
  },
  modalHeadingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #e2e8f0",
  },
  stageHeading: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px 0",
  },
  stageDescription: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  trackSubtitle: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    color: "#0284c7",
    marginBottom: "4px",
  },
  backButton: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "2px solid #cbd5e1",
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
  cardsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  optionCard: {
    backgroundColor: "#ffffff",
    border: "2px solid #cbd5e1",
    borderRadius: "14px",
    padding: "20px 22px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: "0 3px 6px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  cardTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  cardIcon: {
    fontSize: "24px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
  },
  codePill: {
    backgroundColor: "#f1f5f9",
    border: "1px solid #cbd5e1",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.5",
    margin: 0,
  },
  modeBadgeBlue: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  modeBadgeGold: {
    backgroundColor: "#fffbeb",
    color: "#b45309",
    border: "1px solid #fde68a",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  footerBar: {
    backgroundColor: "#f8fafc",
    borderTop: "2px solid #e2e8f0",
    padding: "12px 20px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.5px",
  },
};
