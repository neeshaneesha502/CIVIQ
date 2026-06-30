import React, { useState, useMemo } from "react";
import { Issue } from "../../types";
import { ShieldCheck, Lock, Unlock, AlertTriangle, Trash2, Send, Radio, FileCheck } from "lucide-react";

interface AdminViewProps {
  issues: Issue[];
  onAdminResolve: (id: string) => void;
  onAdminDelete: (id: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  issues,
  onAdminResolve,
  onAdminDelete
}) => {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "1234") {
      setIsAuthorized(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect PIN. Admin privileges restricted.");
    }
  };

  // Filter high/critical active issues
  const adminIssues = useMemo(() => {
    return issues.filter((i) => (i.severity === "Critical" || i.severity === "High") && i.status !== "Resolved");
  }, [issues]);

  return (
    <div className="w-full h-full bg-[#F4F7F6] dark:bg-[#0B1310] flex flex-col text-slate-800 dark:text-slate-100 select-none overflow-hidden">
      
      {/* LOCKED SCREEN STATE */}
      {!isAuthorized ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-slate-900 border border-teal-100 dark:border-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-md mb-6 animate-bounce">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white text-center">BBMP Official Portal</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[220px] text-center">
            Requires secure verification. Please enter your Ward Officer authorization code.
          </p>

          <form onSubmit={handleLogin} className="w-full max-w-[260px] mt-6 space-y-4">
            <div className="flex flex-col gap-1.5 text-center">
              <input
                type="password"
                placeholder="Enter Authorization PIN..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 text-center p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:border-teal-600 text-sm font-bold tracking-[8px]"
                maxLength={4}
              />
              <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                Demo code is: <span className="text-teal-600 dark:text-teal-400 font-mono">1234</span>
              </span>
            </div>

            {authError && (
              <p className="text-[10px] text-rose-500 font-extrabold text-center bg-rose-50 dark:bg-rose-950/20 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-teal-600 dark:bg-teal-500 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all"
            >
              Verify Credentials
            </button>
          </form>
        </div>
      ) : (
        /* AUTHORIZED PORTAL STATE */
        <div className="flex-1 flex flex-col justify-between h-full animate-fade-in overflow-y-auto p-4 space-y-5">
          
          {/* Admin header */}
          <div className="flex justify-between items-center bg-teal-600 text-white rounded-2xl p-4 shadow-md shrink-0">
            <div>
              <h2 className="text-sm font-black flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Ward Officer 502
              </h2>
              <span className="text-[9px] text-teal-200 mt-0.5 block font-mono">BBMP CENTRAL COMMAND</span>
            </div>
            <button
              onClick={() => {
                setIsAuthorized(false);
                setPassword("");
              }}
              className="px-2.5 py-1 text-[9px] font-bold bg-white/10 border border-white/20 hover:bg-white/20 rounded-md"
            >
              Log Out
            </button>
          </div>

          {/* ACTIVE DISPATCH LIST */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              High Priority Ward Incidents ({adminIssues.length})
            </h3>

            {adminIssues.length === 0 ? (
              <div className="text-center text-slate-400 py-12 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <FileCheck className="w-10 h-10 text-emerald-500/40" />
                <h4 className="text-xs font-black mt-3">Priority Grid Clear</h4>
                <p className="text-[10px] text-slate-400 mt-1">All active critical/high severity reports are fully triaged.</p>
              </div>
            ) : (
              adminIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden"
                >
                  {/* Left priority border */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${issue.severity === "Critical" ? "bg-rose-500" : "bg-orange-500"}`} />

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-teal-600 bg-teal-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-teal-100 dark:border-slate-800">
                        {issue.category}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1.5">{issue.title}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black text-white ${issue.severity === "Critical" ? "bg-rose-500" : "bg-orange-500"}`}>
                      {issue.severity}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{issue.description}</p>
                  <span className="text-[9px] text-slate-400 block">📍 {issue.address}</span>

                  {/* Actions footer */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onAdminResolve(issue.id)}
                      className="h-9 bg-emerald-600 dark:bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      Dispatch & Resolve
                    </button>
                    <button
                      onClick={() => onAdminDelete(issue.id)}
                      className="h-9 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 font-extrabold text-[10px] rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Spam
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* BROADCAST BOX */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-4 h-4 text-teal-500" />
              Broadcast Ward Alert
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Alert text (e.g., Heavy rain flood warning in Indiranagar)..."
                className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] focus:outline-none focus:border-teal-600 text-slate-800 dark:text-white"
              />
              <button
                type="button"
                className="px-3 bg-teal-600 text-white font-bold rounded-xl flex items-center justify-center active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
