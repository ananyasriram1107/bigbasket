import React from 'react';
import { COURSES } from '../courses';
import { BADGES } from '../gamification/badges';
import { loadProgress, loadEarnedBadges } from '../utils/progressStore';

export default function Dashboard({ gameState, session, onBackToGame }) {
  const progress = loadProgress();
  const earnedBadgeCodes = loadEarnedBadges();

  const topics = COURSES.map((course) => {
    const courseProgress = progress[course.id];
    const mastery = courseProgress?.accuracy ?? 0;
    const status = !courseProgress
      ? "Not Attempted"
      : mastery >= 80
      ? "Mastered"
      : "In Progress";

    return {
      name: course.title,
      tier: courseProgress?.highestTier ?? 1,
      mastery,
      status,
    };
  });

  const badges = BADGES.map((b) => ({
    ...b,
    unlocked: earnedBadgeCodes.includes(b.code),
  }));

  const attemptedCourses = topics.filter((t) => t.status !== "Not Attempted");
  const overallMastery = attemptedCourses.length
    ? Math.round(
        attemptedCourses.reduce((sum, t) => sum + t.mastery, 0) / attemptedCourses.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex justify-center items-center font-sans">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">

        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Learner Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-1">Adaptive Skill Map & Engine Telemetry</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
              Level {gameState.level} {gameState.name || "Adventurer"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{gameState.totalXp} Total XP</p>
          </div>
        </div>

        {/* AI Learning Intelligence Banner */}
        <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-violet-950/40 border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              AI Diagnostic State
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
              Real-Time EMA
            </span>
          </div>
          <p className="text-sm font-medium text-slate-200 mt-2">
            Status: <span className="text-emerald-400 font-semibold">
              Tier {gameState.tier} · {session?.courseTitle || "No course played yet"}
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {gameState.wrongStreak >= 2
              ? "Engine detected repeated misses and stepped the tier down to rebuild fundamentals."
              : gameState.correctStreak >= 3
              ? "Engine detected a strong streak and scaled difficulty up to keep the challenge sharp."
              : "Engine is calibrating difficulty based on your live answer accuracy."}
          </p>
        </div>

        {/* Topic Mastery Bars */}
        <div className="mb-6 space-y-4">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>Curriculum Mastery</span>
            <span className="text-slate-500 normal-case font-medium">Avg {overallMastery}%</span>
          </h2>
          {topics.map((t, idx) => (
            <div key={idx} className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-200">
                  {t.name}
                </span>
                <span className={t.mastery >= 80 ? "text-emerald-400" : t.status === "Not Attempted" ? "text-slate-500" : "text-amber-400"}>
                  {t.status === "Not Attempted" ? "Not Attempted" : `${t.mastery}%`}
                </span>
              </div>
              <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    t.mastery >= 80 ? "bg-emerald-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${t.mastery}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Badges Shelf */}
        <div className="mb-6">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">
            Earned Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((b) => (
              <div
                key={b.code}
                className={`p-3 rounded-xl border text-center transition-all ${
                  b.unlocked
                    ? "bg-slate-800/80 border-indigo-500/40"
                    : "bg-slate-900/40 border-slate-800/40 opacity-40 grayscale"
                }`}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="text-xs font-bold text-slate-200">{b.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onBackToGame}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          Return to Quest Map
        </button>
      </div>
    </div>
  );
}
