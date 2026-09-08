import React from 'react';

export default function ResultsInsights({ stats, onRestart }) {
  const getInsightNarrative = (accuracy, highestTier, streak) => {
    if (accuracy >= 80 && highestTier === 3) {
      return "Mastery Achieved: Algorithmic difficulty scaled to Peak Tier 3 under continuous streak momentum.";
    }
    if (streak >= 3) {
      return "Flow State Triggered: 3+ correct answers triggered Boss Question difficulty scaling.";
    }
    return "Adaptive Recovery: Fallback hints actively calibrated tier balance on missed questions.";
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-2xl backdrop-blur-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-violet-400 uppercase">
          Quest Summary
        </h2>
        <p className="text-xs text-slate-400 mt-1">Adaptive Performance Analytics</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50">
          <span className="text-xs text-slate-400 block font-medium">Accuracy</span>
          <span className="text-2xl font-extrabold text-emerald-400">{stats.accuracy}%</span>
          <span className="text-[10px] text-slate-500 block">{stats.correctCount}/{stats.totalAnswered} Correct</span>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50">
          <span className="text-xs text-slate-400 block font-medium">Highest Tier</span>
          <span className="text-2xl font-extrabold text-indigo-400">Tier {stats.highestTier}</span>
          <span className="text-[10px] text-slate-500 block">
            {stats.highestTier === 3 ? "Boss Grade" : "Intermediate"}
          </span>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50">
          <span className="text-xs text-slate-400 block font-medium">Longest Streak</span>
          <span className="text-2xl font-extrabold text-amber-400">🔥 {stats.longestStreak}</span>
          <span className="text-[10px] text-slate-500 block">Consecutive Wins</span>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50">
          <span className="text-xs text-slate-400 block font-medium">Avg Speed</span>
          <span className="text-2xl font-extrabold text-cyan-400">{stats.avgSpeedSeconds}s</span>
          <span className="text-[10px] text-slate-500 block">Response Velocity</span>
        </div>
      </div>

      <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 mb-6">
        <span className="text-[11px] font-semibold tracking-wide text-indigo-300 uppercase block mb-1">
          Engine Diagnostics
        </span>
        <p className="text-xs text-slate-300 leading-relaxed">
          {getInsightNarrative(stats.accuracy, stats.highestTier, stats.longestStreak)}
        </p>
      </div>

      <button
        onClick={onRestart}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-sm uppercase tracking-wider cursor-pointer"
      >
        View Skill Dashboard
      </button>
    </div>
  );
}