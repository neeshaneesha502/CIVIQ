import React, { useEffect } from "react";

interface SplashViewProps {
  onComplete: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-[#070B14] to-[#070B14] flex flex-col justify-between items-center p-8 text-white relative overflow-hidden select-none animate-fade-in">
      {/* Background visual glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#4F46E5]/15 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-[#6366F1]/10 blur-3xl" />

      {/* Spacer */}
      <div />

      {/* Main Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-3xl bg-white shadow-2xl shadow-indigo-500/30 flex items-center justify-center relative border border-white/20 scale-100 animate-pulse">
          <span className="text-5xl font-black tracking-tighter bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] bg-clip-text text-transparent">
            Q
          </span>
          {/* Subtle dynamic ring */}
          <div className="absolute inset-0 rounded-3xl border border-indigo-400/20 animate-ping opacity-75" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mt-2 text-white">
          CIVIQ
        </h1>
        <p className="text-indigo-200 text-sm font-medium tracking-widest uppercase">
          Community Hero
        </p>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3">
        <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          📍 Bengaluru
        </span>
        <span className="text-[10px] text-indigo-300/60 font-mono tracking-wider">
          Vibe2Ship Hackathon 2026
        </span>
      </div>
    </div>
  );
};
