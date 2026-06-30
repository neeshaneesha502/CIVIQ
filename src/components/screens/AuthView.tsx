import React, { useState } from "react";

interface AuthViewProps {
  onLoginSuccess: (name: string, email: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    // Simulate Firebase authentication flow
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess("Neesha", "neeshaneesha502@gmail.com");
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-[#070B14] flex flex-col justify-end text-slate-900 relative overflow-hidden select-none">
      {/* Top 40% Background and Logo */}
      <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-indigo-900 via-indigo-950 to-[#070B14] flex flex-col items-center justify-center text-white pb-8">
        <div className="absolute top-[-40%] w-[120%] h-[100%] rounded-full bg-[#4F46E5]/20 blur-3xl" />

        <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center relative border border-white/20 animate-pulse">
          <span className="text-3xl font-black tracking-tighter bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] bg-clip-text text-transparent">
            Q
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight mt-3">CIVIQ</h2>
        <p className="text-indigo-200 text-xs uppercase tracking-widest font-semibold mt-1">
          Community Hero
        </p>
      </div>

      {/* Bottom 65% White Card */}
      <div className="h-[60%] w-full bg-[#F0F4FF] dark:bg-[#070B14] rounded-t-[322px] rounded-t-3xl shadow-2xl relative z-10 flex flex-col justify-between p-8 pt-10 border-t border-white/10 animate-slide-up">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to CIVIQ
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Report. Verify. Resolve. Bengaluru.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] flex items-center gap-1 shadow-sm">
              🤖 AI Analysis
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] flex items-center gap-1 shadow-sm">
              🗺️ Live Map
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] flex items-center gap-1 shadow-sm">
              🏆 Civic Points
            </span>
          </div>
        </div>

        {/* Action Button Area */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-14 bg-white dark:bg-[#0E1524] hover:bg-slate-50 dark:hover:bg-[#1B253D] border border-slate-200 dark:border-indigo-950 rounded-2xl flex items-center justify-center gap-3 shadow-md active:scale-95 transition-all duration-150 relative overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-[#4F46E5] border-t-transparent animate-spin" />
                <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">
                  Connecting Securely...
                </span>
              </div>
            ) : (
              <>
                {/* Simulated Google Logo Icon */}
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.63-.35-1.3-.35-1.99z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-slate-800 dark:text-slate-100 font-bold text-sm">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-normal px-4">
            By signing in, you agree to Bengaluru's RWA Community Guidelines and
            CIVIQ's Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
