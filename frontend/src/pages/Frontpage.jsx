import React, { useState } from 'react';

const COURSES = [
  {
    id: 'os',
    title: 'Operating Systems',
    code: 'CS-301',
    description: 'Process scheduling, virtual memory, concurrency & kernel architecture.',
  },
  {
    id: 'dbms',
    title: 'Database Systems',
    code: 'CS-302',
    description: 'Relational algebra, indexing, ACID protocols & transaction recovery.',
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    code: 'CS-303',
    description: 'Dynamic programming, trees, graph theory & asymptotic analysis.',
  },
];

const MODES = [
  {
    id: 'mcq',
    title: 'Multiple Choice (MCQ)',
    tag: 'Deterministic',
    badge: 'Standard',
    detail: 'Fast-paced objective questions with dynamic difficulty calibration.',
  },
  {
    id: 'short_answer',
    title: 'Short Answers',
    tag: 'Keyword Extraction',
    badge: 'LLM Evaluated',
    detail: 'Synthesize concise explanations. Graded via semantic keyword coverage.',
  },
];

export default function FrontPage({ onLaunchSession }) {
  const [stage, setStage] = useState('start');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setStage('modes');
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
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center p-4 sm:p-8 select-none font-sans text-slate-900 overflow-hidden">
      {/* Retro Pixel Meadow Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-bottom pointer-events-none -z-10"
        style={{
          backgroundImage: "url('/backgrounds/meadow-pixel.png')",
          backgroundColor: '#38bdf8'
        }}
      />

      {/* Telemetry Header */}
      <header className="w-full max-w-xl flex justify-between items-center bg-white/95 border border-slate-300 rounded-xl px-4 py-2.5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
            System Online
          </span>
        </div>
        <div className="text-[11px] font-mono font-medium text-slate-500">
          {stage === 'start' && 'IDLE'}
          {stage === 'courses' && 'SELECT_COURSE'}
          {stage === 'modes' && `READY // ${selectedCourse?.code}`}
        </div>
      </header>

      {/* Main Box */}
      <main className="w-full max-w-lg my-auto flex flex-col items-center">
        {stage === 'start' && (
          <div className="w-full text-center flex flex-col items-center gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-700 bg-white/80 px-3 py-1 rounded border border-slate-300">
                Cognitive Assessment Protocol
              </span>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                QuestVerse
              </h1>
            </div>

            <button
              onClick={() => setStage('courses')}
              className="w-48 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md active:translate-y-0.5 transition-all cursor-pointer tracking-wide"
            >
              Start
            </button>
          </div>
        )}

        {stage === 'courses' && (
          <div className="w-full bg-white/95 border border-slate-300 rounded-2xl p-6 shadow-md backdrop-blur-sm">
            <div className="mb-5 pb-3 border-b border-slate-100 flex justify-between items-baseline">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Choose Course
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an academic track to evaluate
                </p>
              </div>
              <button
                onClick={() => setStage('start')}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-700 underline cursor-pointer"
              >
                Back
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {COURSES.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleSelectCourse(course)}
                  className="w-full p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50/80 transition-all text-left group cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-black">
                      {course.title}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {course.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {course.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'modes' && (
          <div className="w-full bg-white/95 border border-slate-300 rounded-2xl p-6 shadow-md backdrop-blur-sm">
            <div className="mb-5 pb-3 border-b border-slate-100 flex justify-between items-baseline">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {selectedCourse.code}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Assessment Mode
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedCourse.title}
                </p>
              </div>
              <button
                onClick={() => setStage('courses')}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-700 underline cursor-pointer"
              >
                Change Course
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleSelectMode(mode.id)}
                  className="w-full p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50/80 transition-all text-left flex flex-col gap-1 cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-900">
                      {mode.title}
                    </span>
                    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                      mode.id === 'short_answer'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {mode.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    {mode.detail}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center py-2">
        <span className="text-[10px] font-mono tracking-widest text-slate-600 bg-white/70 px-2 py-1 rounded">
          CALIBRATION ENGINE // CS ASSESSMENT PROTOCOL
        </span>
      </footer>
    </div>
  );
}
