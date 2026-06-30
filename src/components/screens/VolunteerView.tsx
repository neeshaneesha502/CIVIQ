import React, { useState, useMemo, useEffect } from "react";
import { Issue, UserStats } from "../../types";
import { Award, Compass, CheckCircle2, ChevronRight, Camera, UploadCloud, Flame, Star, Trophy, Clock, ListTodo, ShieldAlert, Sparkles, Navigation, CheckSquare, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VolunteerViewProps {
  userStats: UserStats;
  issues: Issue[];
  onClaimMission: (id: string) => void;
  onAbandonMission: (id: string) => void;
  onResolveMission: (id: string, beforePhoto: string, afterPhoto: string, notes: string[]) => void;
  onUpdateUserStats: (updated: Partial<UserStats>) => void;
}

export const VolunteerView: React.FC<VolunteerViewProps> = ({
  userStats,
  issues,
  onClaimMission,
  onAbandonMission,
  onResolveMission,
  onUpdateUserStats
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>("AVAILABLE");
  const [uploadedProof, setUploadedProof] = useState<{ [key: string]: string }>({});
  
  // Responsibility Choice Modal states
  const [pendingClaimMission, setPendingClaimMission] = useState<Issue | null>(null);
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<string[]>([]);
  const [contractSignature, setContractSignature] = useState<string>("");
  
  // Progress log states (steps & notes logged without proof)
  const [progressSteps, setProgressSteps] = useState<{ [key: string]: boolean[] }>({}); // { issueId: [step1, step2, step3] }
  const [progressNotes, setProgressNotes] = useState<{ [key: string]: string[] }>({}); // { issueId: ["note1", "note2"] }
  const [activeNoteText, setActiveNoteText] = useState<{ [key: string]: string }>({});

  const tabs = ["AVAILABLE", "MY MISSIONS", "COMPLETED", "LEADERBOARD"];

  // Default responsibility options for missions
  const volunteerResponsibilities = [
    { id: "r1", label: "🧹 Gather cleanup broom & biodegradable bags", desc: "Keep tools ready and dispose of debris cleanly." },
    { id: "r2", label: "🦺 Wear high-visibility community vest", desc: "Maintains personal safety next to traffic lanes." },
    { id: "r3", label: "📢 Log periodic progress updates to neighbors", desc: "Let locals know the status via CiviQ feed." },
    { id: "r4", label: "🌱 Pledge zero-waste eco-friendly disposal", desc: "No dumping; take bagged debris directly to BBMP centers." }
  ];

  // Filter issues based on active sub tab
  const availableMissions = useMemo(() => {
    return issues.filter((i) => i.severity === "Low" && i.status === "Pending" && !i.claimedByUserId && !i.userCompletedList?.includes(userStats.email));
  }, [issues, userStats.email]);

  const myMissions = useMemo(() => {
    return issues.filter((i) => i.severity === "Low" && i.status === "In Progress" && i.claimedByUserId === userStats.email && !i.userCompletedList?.includes(userStats.email));
  }, [issues, userStats.email]);

  const completedMissions = useMemo(() => {
    return issues.filter((i) => i.severity === "Low" && (i.status === "Resolved" || i.userCompletedList?.includes(userStats.email)));
  }, [issues, userStats.email]);

  // Simulate picking a proof photo
  const handleProofPhoto = (issueId: string) => {
    setUploadedProof({
      ...uploadedProof,
      [issueId]: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600"
    });

    // Automatically append progress note
    handleAddProgressNote(issueId, "📸 Final resolution photo uploaded! Submitting to BBMP Verification Portal.");
  };

  // Claim process with modal
  const handleOpenClaimModal = (mission: Issue) => {
    setPendingClaimMission(mission);
    setSelectedResponsibilities([]); // Start completely empty per user requirements
    setContractSignature(""); // Reset signature
  };

  const handleConfirmClaim = () => {
    if (!pendingClaimMission) return;
    
    // Trigger claim in parent
    onClaimMission(pendingClaimMission.id);
    
    // Initialize progress steps for this mission (3 steps unchecked by default)
    setProgressSteps({
      ...progressSteps,
      [pendingClaimMission.id]: [false, false, false]
    });

    // Add initial status note
    setProgressNotes({
      ...progressNotes,
      [pendingClaimMission.id]: [`📋 Mission Claimed & Signed by Volunteer ${contractSignature.trim()}: Selected responsibilities & initialized community countdown clock.`]
    });

    setPendingClaimMission(null);
    setContractSignature("");
    setActiveSubTab("MY MISSIONS");
  };

  // Progress Logging: Steps ticking
  const handleToggleStep = (issueId: string, stepIdx: number) => {
    const currentSteps = progressSteps[issueId] || [false, false, false];
    const updated = [...currentSteps];
    updated[stepIdx] = !updated[stepIdx];
    
    setProgressSteps({
      ...progressSteps,
      [issueId]: updated
    });

    // Log progress note automatically
    const stepNames = [
      "Arrived on site and evaluated scope",
      "Secured safety boundaries & gathered equipment",
      "Completed main physical clearing / repairs"
    ];
    const stateStr = updated[stepIdx] ? "Marked Done" : "Deselected";
    handleAddProgressNote(issueId, `⚡ Step Update: "${stepNames[stepIdx]}" ${stateStr}.`);
  };

  // Progress Logging: Notes typing
  const handleAddProgressNote = (issueId: string, noteText?: string) => {
    const text = noteText || activeNoteText[issueId] || "";
    if (!text.trim()) return;

    const currentNotes = progressNotes[issueId] || [];
    setProgressNotes({
      ...progressNotes,
      [issueId]: [...currentNotes, `${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • ${text}`]
    });

    if (!noteText) {
      setActiveNoteText({
        ...activeNoteText,
        [issueId]: ""
      });
    }
  };

  const leaderboard = [
    { rank: 1, name: "Pranav M.", missions: 14, points: 1400, avatar: "P" },
    { rank: 2, name: "Suresh Hegde", missions: 11, points: 1100, avatar: "S" },
    { rank: 3, name: "Anisha Patil", missions: 9, points: 900, avatar: "A" },
    { rank: 4, name: "Vinay R.", missions: 8, points: 800, avatar: "V" },
    { rank: 5, name: "Neha Sen", missions: 6, points: 600, avatar: "N" }
  ];

  return (
    <div className="w-full h-full bg-[#070B14] flex flex-col justify-between text-slate-100 select-none relative overflow-hidden">
      
      {/* HEADER STATS CONTAINER */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900/60 p-4 shrink-0 shadow-lg border-b border-indigo-950/40">
        <h2 className="text-sm font-black flex items-center gap-1.5 uppercase tracking-wider text-indigo-300">
          <Award className="w-5 h-5 text-[#818CF8]" />
          Volunteer Duty Dispatch 👥
        </h2>
        <p className="text-[10px] text-slate-400 mt-0.5">Claim civic reports triaged by officials, solve them, and earn community credits.</p>

        {/* User volunteer stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2 bg-[#080E1A]/60 p-2.5 rounded-2xl border border-indigo-950/40 text-center backdrop-blur-sm">
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Completed</span>
            <span className="block text-sm font-black text-white">{completedMissions.length}</span>
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Earned Pts</span>
            <span className="block text-sm font-black text-teal-400">+{completedMissions.length * 100} PTS</span>
          </div>
          <div className="truncate">
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Duty Badge</span>
            <span className="block text-[10px] font-extrabold mt-0.5 text-[#818CF8] truncate">
              {completedMissions.length >= 3 ? "City Protector Pro" : userStats.badge}
            </span>
          </div>
        </div>
      </div>

      {/* SUB TAB SELECTORS */}
      <div className="bg-[#0E1524]/60 border-b border-indigo-950/60 p-2 shrink-0 flex gap-1.5 relative z-10">
        {tabs.map((tab) => {
          const isSelected = activeSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-2 rounded-xl text-[8.5px] font-black uppercase tracking-wider flex items-center justify-center text-center border transition-all ${
                isSelected
                  ? "bg-[#4F46E5] text-white shadow-md border-transparent"
                  : "bg-[#070B14] border-indigo-950 text-slate-400 hover:text-white"
              }`}
            >
              <span>
                {tab === "MY MISSIONS" ? `Active Duty (${myMissions.length})` : tab}
              </span>
            </button>
          );
        })}
      </div>

      {/* CONTENT LIST PANEL */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        
        {/* AVAILABLE MISSIONS */}
        {activeSubTab === "AVAILABLE" && (
          availableMissions.length === 0 ? (
            <div className="text-center text-slate-400 mt-12 flex flex-col items-center justify-center p-6">
              <CheckCircle2 className="w-12 h-12 stroke-[1.5] text-indigo-500/40" />
              <h4 className="text-xs font-black mt-3 text-white">All Clear in Bengaluru!</h4>
              <p className="text-[10px] text-slate-400 mt-1">There are no pending low-severity volunteer missions right now.</p>
            </div>
          ) : (
            availableMissions.map((mission) => (
              <div
                key={mission.id}
                className="bg-[#0E1524]/75 border border-indigo-950/80 rounded-2xl p-4 shadow-md relative overflow-hidden group hover:border-[#4F46E5]/40 transition-colors"
              >
                {/* Connection to original user report */}
                <div className="text-[8px] font-black text-slate-500 flex items-center gap-1 uppercase tracking-wider mb-2 pb-1.5 border-b border-indigo-950/40">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                  Source: Citizen Report #CIV-{mission.id.slice(0, 5).toUpperCase()}
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-black text-[#818CF8] bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                    {mission.category}
                  </span>
                  <span className="text-[8px] font-black text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded border border-teal-500/20 uppercase tracking-wider">
                    🏅 +100 pts
                  </span>
                </div>

                <h4 className="text-xs font-black text-white mt-2.5">{mission.title}</h4>
                <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed font-semibold">{mission.description}</p>
                
                <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1.5 font-medium">
                  <span>📍 {mission.address}</span>
                </div>

                {/* What the mission wants & Requirements snippet */}
                <div className="mt-3 p-2 bg-[#070B14] border border-indigo-950/40 rounded-xl text-[9.5px] text-slate-400 leading-normal">
                  <span className="font-extrabold text-[#818CF8] uppercase block mb-0.5 text-[8.5px]">Mission Goal:</span>
                  Remove trash and sweep pavement clean. Must log status updates on-site before posting resolution photo.
                </div>

                <button
                  onClick={() => handleOpenClaimModal(mission)}
                  className="mt-4 w-full h-10 bg-[#4F46E5] hover:bg-[#6366F1] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
                >
                  Accept Mission Duty
                </button>
              </div>
            ))
          )
        )}

        {/* MY ACTIVE MISSIONS */}
        {activeSubTab === "MY MISSIONS" && (
          myMissions.length === 0 ? (
            <div className="text-center text-slate-400 mt-12 flex flex-col items-center justify-center p-6">
              <Compass className="w-12 h-12 stroke-[1.5] text-indigo-500/40 animate-pulse" />
              <h4 className="text-xs font-black mt-3 text-white">No Active Volunteer Duties</h4>
              <p className="text-[10px] text-slate-400 mt-1">Claim a mission from the 'Available' tab to begin cleaning your neighborhood.</p>
            </div>
          ) : (
            myMissions.map((mission) => {
              const hasPhoto = uploadedProof[mission.id];
              const steps = progressSteps[mission.id] || [false, false, false];
              const checkedCount = steps.filter(Boolean).length;
              const progressPct = Math.round((checkedCount / 3) * 100);
              const notes = progressNotes[mission.id] || [];

              return (
                <div
                  key={mission.id}
                  className="bg-[#0E1524]/75 border border-indigo-950/80 rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col gap-3"
                >
                  {/* Origin connection label */}
                  <div className="text-[8px] font-black text-slate-500 flex items-center justify-between uppercase tracking-wider pb-1.5 border-b border-indigo-950/40">
                    <span>Source: Citizen Report #CIV-{mission.id.slice(0, 5).toUpperCase()}</span>
                    <span className="text-rose-400 font-extrabold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-500" />
                      SLA Deadline: 12h Remaining
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-[#818CF8] uppercase tracking-widest">{mission.category}</span>
                    <span className="text-[8px] font-mono font-black text-yellow-400 uppercase bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">ACTIVE COMMUNITY DUTY</span>
                  </div>

                  <h4 className="text-xs font-black text-white">{mission.title}</h4>
                  <p className="text-[10.5px] text-slate-400 leading-normal font-semibold">{mission.description}</p>

                  {/* CHOSEN RESPONSIBILITIES RECAP */}
                  <div className="p-2.5 bg-[#070B14] border border-indigo-950/40 rounded-xl space-y-1">
                    <span className="text-[8px] font-black text-[#818CF8] uppercase tracking-wider block">Assigned Responsibilities</span>
                    <p className="text-[9.5px] text-slate-300 font-bold leading-normal">
                      🧹 Equipment prep, 📢 Progress updates, 🚮 Eco-disposal
                    </p>
                  </div>

                  {/* 🚨 PROPER PROGRESS TRACKER (WITHOUT PHOTO PROOF REQUIRED) */}
                  <div className="p-3.5 bg-[#070B14] border border-indigo-950/60 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                        <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
                        Step Progress (No Proof Required)
                      </span>
                      <span className="text-[9.5px] font-mono font-black text-teal-400">{progressPct}% Complete</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#05080E] rounded-full overflow-hidden border border-indigo-950/45">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Checkable Steps */}
                    <div className="space-y-2">
                      {[
                        "Assess site scope on arrival",
                        "Setup cones & bag municipal waste",
                        "Finish physical clearance"
                      ].map((stepName, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleToggleStep(mission.id, sIdx)}
                          className="w-full flex items-center gap-2.5 text-left text-[10px] text-slate-300 font-bold hover:text-white transition-colors"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                            steps[sIdx] 
                              ? "bg-indigo-600 border-transparent text-white" 
                              : "border-indigo-900 bg-[#05080E]"
                          }`}>
                            {steps[sIdx] && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                          </div>
                          <span className={steps[sIdx] ? "line-through text-slate-500" : ""}>{stepName}</span>
                        </button>
                      ))}
                    </div>

                    {/* STEP NOTE LOG INPUT */}
                    <div className="pt-2 border-t border-indigo-950/40">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-1">Log Step/Status Update (No Proof)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. Arrived on-site, starting trash cleanup now."
                          value={activeNoteText[mission.id] || ""}
                          onChange={(e) => setActiveNoteText({
                            ...activeNoteText,
                            [mission.id]: e.target.value
                          })}
                          className="flex-1 h-8 px-2.5 bg-[#05080E] border border-indigo-950 rounded-lg text-[10px] text-white focus:outline-none focus:border-[#818CF8]"
                        />
                        <button
                          onClick={() => handleAddProgressNote(mission.id)}
                          className="px-3 bg-indigo-950 border border-indigo-900 text-indigo-300 rounded-lg text-[9px] font-extrabold uppercase hover:text-white hover:bg-indigo-900 transition-all"
                        >
                          Log Update
                        </button>
                      </div>
                    </div>

                    {/* NOTES FEED HISTORY */}
                    {notes.length > 0 && (
                      <div className="bg-[#05080E]/40 border border-dashed border-indigo-950/50 rounded-xl p-2 max-h-[80px] overflow-y-auto space-y-1">
                        <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block">Progress Log History</span>
                        {notes.map((note, nIdx) => (
                          <p key={nIdx} className="text-[8.5px] text-slate-400 font-semibold leading-relaxed">
                            {note}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RESOLUTION PHOTO UPLOAD */}
                  <div className="border border-indigo-950/50 bg-[#070B14]/40 rounded-xl p-3 flex flex-col items-center justify-center">
                    {hasPhoto ? (
                      <div className="w-full flex flex-col items-center gap-2">
                        <img src={uploadedProof[mission.id]} alt="proof" className="w-24 h-16 object-cover rounded-lg border border-indigo-950" />
                        <span className="text-[9px] font-bold text-teal-400 flex items-center gap-1">✅ Resolution Proof Synced Successfully</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleProofPhoto(mission.id)}
                        className="flex flex-col items-center text-slate-400 hover:text-slate-200 transition-colors gap-1.5"
                      >
                        <Camera className="w-6 h-6 text-indigo-400 animate-pulse" />
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-300">Upload Final Proof Photo</span>
                        <p className="text-[8px] text-slate-500 font-semibold">Needed for audit clearance and point credit</p>
                      </button>
                    )}
                  </div>

                  {/* FINAL RESOLUTION DISPATCH */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAbandonMission(mission.id)}
                      className="flex-1 h-10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all active:scale-95"
                    >
                      Abandon Duty
                    </button>
                    <button
                      onClick={() => onResolveMission(
                        mission.id,
                        mission.beforePhotoUrl || "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&q=80",
                        uploadedProof[mission.id] || "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600",
                        progressNotes[mission.id] || []
                      )}
                      disabled={!hasPhoto || progressPct < 100}
                      className={`flex-[1.5] h-10 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md transition-all ${
                        hasPhoto && progressPct === 100
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse active:scale-95"
                          : "bg-indigo-950 border border-indigo-900/60 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {progressPct < 100 ? "Complete Steps" : !hasPhoto ? "Upload Photo" : "Submit Mission"}
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}

        {/* COMPLETED MISSIONS */}
        {activeSubTab === "COMPLETED" && (
          completedMissions.length === 0 ? (
            <div className="text-center text-slate-400 mt-12 flex flex-col items-center justify-center p-6">
              <CheckCircle2 className="w-12 h-12 text-indigo-500/30" />
              <h4 className="text-xs font-black mt-3 text-white">No Completed Missions</h4>
            </div>
          ) : (
            completedMissions.map((mission) => (
              <div
                key={mission.id}
                className="bg-[#0E1524]/60 border border-indigo-950/80 rounded-xl p-3 flex justify-between items-center shadow-sm relative overflow-hidden"
              >
                <div className="pl-2">
                  <h4 className="text-xs font-black text-slate-200 line-clamp-1">{mission.title}</h4>
                  <span className="text-[8.5px] text-teal-400 font-extrabold block mt-0.5">🏅 +100 Points Earned & Verified</span>
                  <span className="text-[7.5px] text-slate-500 font-semibold block mt-0.5">Origin Report: #CIV-{mission.id.slice(0, 5).toUpperCase()}</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
              </div>
            ))
          )
        )}

        {/* LEADERBOARD */}
        {activeSubTab === "LEADERBOARD" && (
          <div className="bg-[#0E1524]/60 border border-indigo-950/80 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              Top Volunteer Heroes This Month
            </h3>
            <div className="divide-y divide-indigo-950/40">
              {leaderboard.map((item) => (
                <div key={item.rank} className="flex items-center justify-between py-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-black text-xs text-slate-500">#{item.rank}</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/20">
                      {item.avatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{item.name}</h4>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">{item.missions} Missions completed</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-teal-400">+{item.points} Pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* RESPONSIBILITY CHOICE MODAL */}
      <AnimatePresence>
        {pendingClaimMission && (
          <div className="absolute inset-0 bg-black/75 z-50 flex flex-col justify-end animate-fade-in">
            <div className="flex-1" onClick={() => setPendingClaimMission(null)} />
            
            <div className="bg-[#0E1524] rounded-t-3xl border-t border-[#4F46E5]/30 p-5 space-y-4 animate-slide-up max-h-[85%] overflow-y-auto">
              
              {/* Header */}
              <div className="flex justify-between items-start pb-2 border-b border-indigo-950/40">
                <div>
                  <span className="text-[8px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                    Accept Volunteer Duty Assignment 👥
                  </span>
                  <h3 className="text-xs font-black text-white mt-2">{pendingClaimMission.title}</h3>
                </div>
                <button 
                  onClick={() => setPendingClaimMission(null)}
                  className="text-slate-500 hover:text-white font-bold text-xs p-1"
                >
                  ✕
                </button>
              </div>

              {/* Connected details */}
              <div className="bg-[#070B14] p-3 rounded-xl border border-indigo-950/80 text-[10px] space-y-1">
                <span className="text-[#818CF8] font-black uppercase tracking-wider block text-[8px]">OFFICIAL DISPATCH LINK:</span>
                <p className="text-slate-400 font-semibold leading-relaxed">
                  Authorized by BBMP Indiranagar Ward Office from original citizen report <span className="text-white">#CIV-{pendingClaimMission.id.slice(0, 5).toUpperCase()}</span>.
                </p>
              </div>

              {/* Choice of Responsibilities checklist */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Choose Your Assigned Responsibilities</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    selectedResponsibilities.length === volunteerResponsibilities.length 
                      ? "bg-indigo-500/10 text-[#818CF8] border border-indigo-500/20" 
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}>
                    {selectedResponsibilities.length === volunteerResponsibilities.length ? "All Responsibilities Verified ✓" : `${selectedResponsibilities.length}/${volunteerResponsibilities.length} Checked`}
                  </span>
                </div>
                <p className="text-[8.5px] text-slate-500 leading-normal">
                  You must review and tick each of the specific responsibilities you will actively handle during this public clearing mission:
                </p>

                <div className="space-y-2 mt-2">
                  {volunteerResponsibilities.map((resp) => {
                    const isChecked = selectedResponsibilities.includes(resp.id);
                    return (
                      <button
                        key={resp.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedResponsibilities(selectedResponsibilities.filter(id => id !== resp.id));
                          } else {
                            setSelectedResponsibilities([...selectedResponsibilities, resp.id]);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left flex gap-3 transition-all ${
                          isChecked
                            ? "bg-indigo-500/10 border-[#4F46E5] text-white"
                            : "bg-[#070B14] border-indigo-950 text-slate-400 hover:border-indigo-900"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked ? "bg-[#4F46E5] border-transparent text-white" : "border-indigo-900 bg-[#05080E]"
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold block text-slate-200">{resp.label}</span>
                          <span className="text-[8.5px] text-slate-400 font-semibold block mt-0.5">{resp.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Digital Signature section */}
              {selectedResponsibilities.length === volunteerResponsibilities.length && (
                <div className="p-3 bg-[#070B14] border border-[#4F46E5]/30 rounded-xl space-y-2 animate-fade-in">
                  <label className="block text-[9px] font-black text-[#818CF8] uppercase tracking-widest">
                    🖋️ Digital Signature Authorization
                  </label>
                  <p className="text-[8.5px] text-slate-400 font-semibold">
                    Type your full name to sign this civic duty commitment contract:
                  </p>
                  <input
                    type="text"
                    value={contractSignature}
                    onChange={(e) => setContractSignature(e.target.value)}
                    placeholder="Type full name to sign (e.g. Anisha Patil)"
                    className="w-full p-2.5 bg-[#0A0F1D] border border-indigo-950/80 focus:border-[#4F46E5] rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                  {contractSignature.trim() && (
                    <div className="text-[9.5px] text-[#818CF8] font-mono font-black border-t border-indigo-950/60 pt-1.5 flex justify-between">
                      <span>✓ Digitally Signed: {contractSignature}</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Deadline reminder and warning */}
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-[9.5px] font-semibold leading-relaxed flex gap-2.5 items-start">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black block uppercase text-[8.5px] tracking-wider mb-0.5">Strict SLA Expiry Policy</span>
                  Once accept duty, you are supposed to complete it under the <b>12-hour deadline</b> or post proof. Abandoning claimed ward clearing roles triggers a temporary local cooldown.
                </div>
              </div>

              {/* Accept & start duty */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmClaim}
                  disabled={selectedResponsibilities.length !== volunteerResponsibilities.length || !contractSignature.trim()}
                  className={`w-full h-11 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all ${
                    (selectedResponsibilities.length === volunteerResponsibilities.length && contractSignature.trim())
                      ? "bg-indigo-600 hover:bg-indigo-500 active:scale-98 cursor-pointer shadow-lg shadow-indigo-500/10"
                      : "bg-[#0E1524]/60 border border-indigo-950/80 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {selectedResponsibilities.length !== volunteerResponsibilities.length
                    ? `Verify Responsibilities (${selectedResponsibilities.length}/${volunteerResponsibilities.length})`
                    : !contractSignature.trim()
                    ? "Type Name to Sign Contract"
                    : "Accept Duty & Start Clock"
                  }
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
