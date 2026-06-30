import React, { useState, useMemo } from "react";
import { UserStats, Issue } from "../../types";
import { bengaluruAreasAndWards } from "../../data/bengaluruData";
import { 
  User, 
  Settings, 
  ClipboardList, 
  ChevronRight, 
  ChevronLeft,
  BookOpen, 
  Award, 
  ShieldCheck, 
  Mail, 
  Clock,
  ThumbsUp,
  Bookmark,
  MessageSquare,
  Bell,
  Lock,
  Download,
  Trash2,
  Check,
  MapPin,
  Plus,
  Menu,
  ChevronDown,
  X,
  Search,
  Wrench,
  Compass,
  ListTodo,
  ShieldAlert,
  ArrowRight,
  Undo2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfileViewProps {
  userStats: UserStats;
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onNavigateToTab: (tab: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onTriggerKotlinExplorer: () => void;
  onResetApp: () => void;
  onUpdateUserStats: (updated: Partial<UserStats>) => void;
  onAbandonMission?: (id: string) => void;
  onAbandonFixerJob?: (id: string) => void;
  onDeleteIssue?: (id: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userStats,
  issues,
  onSelectIssue,
  onNavigateToTab,
  darkMode,
  onToggleDarkMode,
  onTriggerKotlinExplorer,
  onResetApp,
  onUpdateUserStats,
  onAbandonMission,
  onAbandonFixerJob,
  onDeleteIssue
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  
  // settingsActiveView: null (feed), "SETTINGS_INDEX", "ACCOUNT_CENTRE", "ACTIVITY_HISTORY"
  const [settingsActiveView, setSettingsActiveView] = useState<"SETTINGS_INDEX" | "ACCOUNT_CENTRE" | "ACTIVITY_HISTORY" | null>(null);
  const [activityCategory, setActivityCategory] = useState<"LIKES" | "SAVED" | "COMMENTS">("LIKES");

  // Notifications preferences local states
  const [pushAlerts, setPushAlerts] = useState(true);
  const [emailBulletins, setEmailBulletins] = useState(false);
  const [smsBulletins, setSmsBulletins] = useState(true);

  // Account management local states
  const [name, setName] = useState(userStats.name);
  const [email, setEmail] = useState(userStats.email);
  const [password, setPassword] = useState("••••••••");
  const [residingArea, setResidingArea] = useState(userStats.residingArea || "Vasanth Nagar");
  const [ward, setWard] = useState(userStats.ward || "Ward 78 (BBMP)");

  // Handle bi-directional area input change
  const handleAreaChange = (val: string) => {
    setResidingArea(val);
    const match = bengaluruAreasAndWards.find(
      (item) => item.area.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      setWard(match.ward);
    }
  };

  // Handle bi-directional ward input change
  const handleWardChange = (val: string) => {
    setWard(val);
    const match = bengaluruAreasAndWards.find(
      (item) => item.ward.toLowerCase() === val.trim().toLowerCase() ||
                item.ward.toLowerCase().replace(/\s+/g, "") === val.trim().toLowerCase().replace(/\s+/g, "")
    );
    if (match) {
      setResidingArea(match.area);
    }
  };

  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const [isDataExported, setIsDataExported] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRelocatePresets, setShowRelocatePresets] = useState(false);
  const [wardSearch, setWardSearch] = useState("");

  // 2-Step Safe / 2FA Confirmation state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [input2FACode, setInput2FACode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [pendingProfileData, setPendingProfileData] = useState<any>(null);

  // Local Profile progress logs state
  const [localDutySteps, setLocalDutySteps] = useState<{ [key: string]: boolean[] }>({});
  const [localDutyNotes, setLocalDutyNotes] = useState<{ [key: string]: string[] }>({});
  const [localActiveNoteText, setLocalActiveNoteText] = useState<{ [key: string]: string }>({});

  // Filter reports filed by the user
  const userReports = useMemo(() => {
    return issues.filter((issue) => issue.isUserReported === true);
  }, [issues]);

  // Liked reports (upvoted issues)
  const likedReports = useMemo(() => {
    return issues.filter((issue) => issue.isVoted === true);
  }, [issues]);

  // Saved reports
  const savedReports = useMemo(() => {
    return issues.filter((issue) => issue.isSaved === true);
  }, [issues]);

  // Comments written by user
  const userCommentedReports = useMemo(() => {
    return issues.filter((issue) => 
      issue.comments && issue.comments.some((c) => c.author === userStats.name)
    );
  }, [issues, userStats.name]);

  // Active Citizen Duties claimed by user
  const myActiveDuties = useMemo(() => {
    return issues.filter((i) => i.status === "In Progress" && i.claimedByUserId === userStats.email);
  }, [issues, userStats.email]);

  const handleSaveAccountInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residingArea.trim() || !ward.trim()) {
      setSaveError("Residing Area & Ward are compulsory!");
      setTimeout(() => setSaveError(null), 4000);
      return;
    }
    setSaveError(null);
    
    // Trigger 2FA modal first instead of direct save
    setPendingProfileData({ name, email, residingArea, ward, password });
    setInput2FACode("");
    setVerificationError("");
    setShow2FAModal(true);
  };

  const handleVerify2FA = () => {
    // Standard secure code verification
    const code = input2FACode.replace(/\s+/g, "");
    if (code !== "829401") {
      setVerificationError("Invalid Safe Key. Please use the demo safe code: 829 401");
      return;
    }

    // Authorize & save changes
    onUpdateUserStats({
      name: pendingProfileData.name,
      email: pendingProfileData.email,
      residingArea: pendingProfileData.residingArea,
      ward: pendingProfileData.ward
    });

    setShow2FAModal(false);
    setPendingProfileData(null);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 3000);
  };

  const handleExportData = () => {
    setIsDataExported(true);
    setTimeout(() => setIsDataExported(false), 4000);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ userStats, filedReportsCount: userReports.length }));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${userStats.name.replace(/\s+/g, "_")}_citizen_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Local step check handling directly in profile
  const handleToggleLocalStep = (dutyId: string, sIdx: number) => {
    const currentSteps = localDutySteps[dutyId] || [false, false, false];
    const updated = [...currentSteps];
    updated[sIdx] = !updated[sIdx];
    setLocalDutySteps({
      ...localDutySteps,
      [dutyId]: updated
    });

    const stepTitles = ["Site inspection done", "Active maintenance underway", "Site clearing finalized"];
    const statusText = updated[sIdx] ? "Marked Complete" : "Deselected";
    handleAddLocalNote(dutyId, `⚡ Progress Update: "${stepTitles[sIdx]}" ${statusText}.`);
  };

  const handleAddLocalNote = (dutyId: string, customText?: string) => {
    const text = customText || localActiveNoteText[dutyId] || "";
    if (!text.trim()) return;

    const currentNotes = localDutyNotes[dutyId] || [];
    setLocalDutyNotes({
      ...localDutyNotes,
      [dutyId]: [...currentNotes, `${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • ${text}`]
    });

    if (!customText) {
      setLocalActiveNoteText({
        ...localActiveNoteText,
        [dutyId]: ""
      });
    }
  };

  return (
    <div className="w-full h-full bg-[#070B14] flex flex-col text-slate-100 select-none overflow-hidden relative">
      
      {/* TOP HEADER SECTION */}
      <div className="bg-[#070B14] border-b border-indigo-950 p-4 shrink-0 flex items-center justify-between relative z-30">
        
        {/* Left corner Plus button */}
        <button
          onClick={() => onNavigateToTab("Report")}
          className="p-2 rounded-xl bg-[#0E1524] border border-indigo-950/80 text-[#818CF8] hover:bg-indigo-950/40 hover:scale-105 active:scale-95 transition-all shadow-sm"
          title="File New Report"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>

        {/* Middle Username Dropdown button */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="px-3 py-1.5 rounded-xl bg-[#0E1524]/50 border border-indigo-950/80 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-indigo-950/20 active:scale-98 transition-all"
          >
            <span>{userStats.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#818CF8] transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""}`} />
          </button>

          {/* User dropdown content */}
          <AnimatePresence>
            {showUserDropdown && (
              <>
                {/* Backdrop overlay to close */}
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowUserDropdown(false)} 
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute left-1/2 -translate-x-1/2 mt-1.5 bg-[#0E1524] border border-indigo-950 rounded-xl p-1 shadow-2xl z-40 w-36 flex flex-col"
                >
                  <button
                    onClick={() => {
                      setSettingsActiveView("ACCOUNT_CENTRE");
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[9px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-indigo-950/40 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#818CF8]" />
                    Account Centre
                  </button>
                  <div className="h-px bg-indigo-950/60 my-0.5" />
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onResetApp();
                    }}
                    className="w-full text-left px-3 py-2 text-[9px] font-black uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-950/10 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Right corner Hamburger button */}
        <button
          onClick={() => setSettingsActiveView("SETTINGS_INDEX")}
          className="p-2 rounded-xl bg-[#0E1524] border border-indigo-950/80 text-[#818CF8] hover:bg-indigo-950/40 hover:scale-105 active:scale-95 transition-all shadow-sm"
          title="Open Settings"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* MAIN VIEW: CHOSEN AS DEDICATED PROFILE DASHBOARD */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <div className="space-y-4">
          
          {/* HERO PROFILE CARD */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-white font-extrabold text-lg shadow-inner shrink-0">
                {userStats.name[0] || "N"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs font-black text-white">{userStats.name}</h3>
                  <span className="text-[7.5px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Verified Citizen
                  </span>
                </div>
                <p className="text-[9.5px] text-indigo-200 mt-0.5 flex items-center gap-1 truncate font-semibold">
                  <Mail className="w-3 h-3 text-indigo-300 shrink-0" />
                  {userStats.email}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-bold flex items-center gap-1">
                  <span>📍 {userStats.residingArea || "Vasanth Nagar"}</span>
                  <span className="text-slate-600">•</span>
                  <span>{userStats.ward || "Ward 78 (BBMP)"}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="block text-[7px] font-black uppercase tracking-widest text-indigo-300">Civic Balance</span>
                <span className="block text-xs font-black text-teal-400 mt-0.5">{userStats.points} PTS</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="block text-[7px] font-black uppercase tracking-widest text-indigo-300">Active Rank</span>
                <span className="block text-[10px] font-extrabold text-indigo-100 mt-0.5 truncate">{userStats.badge}</span>
              </div>
            </div>
          </div>

          {/* 🎯 PLEDGED CAUSES TRACK PANEL */}
          <div className="bg-[#0E1524] border border-indigo-950/80 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-indigo-950/45">
              <h3 className="text-[10px] font-black text-[#818CF8] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                Pledged Causes Track 🎯
              </h3>
              <span className="text-[8.5px] font-mono font-bold text-slate-500">2 Causes Supported</span>
            </div>

            <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
              Track the construction and match progress of infrastructure causes you contributed points to. For every point, partners deposit ₹0.50 matching cash.
            </p>

            <div className="space-y-3 pt-1">
              {/* Cause 1: Solar Streetlight */}
              <div className="p-3 bg-[#070B14] rounded-xl border border-indigo-950/60 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">
                      Solar Streetlight 💡
                    </span>
                    <h4 className="text-[10.5px] font-black text-white mt-1.5">Indiranagar Dark Lane LED Installation</h4>
                  </div>
                  <span className="text-[8px] font-mono font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    Pledged: 200 PTS
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                    <span>COMMUNITY FUNDING PROGRESS</span>
                    <span className="text-teal-400 font-black">82% (Matched ₹12,400 / ₹15,000)</span>
                  </div>
                  <div className="w-full h-1 bg-[#05080E] rounded-full overflow-hidden border border-indigo-950/40">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-teal-400" style={{ width: "82%" }} />
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[8px] text-slate-400 font-semibold bg-[#0E1524]/60 p-1.5 rounded border border-indigo-950/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span><b>Current Status:</b> Contractor assigned. Civil excavation underway.</span>
                </div>
              </div>

              {/* Cause 2: Native Tree Canopy */}
              <div className="p-3 bg-[#070B14] rounded-xl border border-indigo-950/60 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      Tree Plantation 🌳
                    </span>
                    <h4 className="text-[10.5px] font-black text-white mt-1.5">Honge Canopy Plantation (Defence Park)</h4>
                  </div>
                  <span className="text-[8px] font-mono font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Pledged: 300 PTS
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                    <span>COMMUNITY FUNDING PROGRESS</span>
                    <span className="text-emerald-400 font-black">100% (Matched ₹8,000 / ₹8,000)</span>
                  </div>
                  <div className="w-full h-1 bg-[#05080E] rounded-full overflow-hidden border border-indigo-950/40">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: "100%" }} />
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[8px] text-emerald-300 font-semibold bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><b>Current Status:</b> Completed & Verified! Saplings fully geo-tagged.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 👥 NEW: ACTIVE CITIZEN DUTIES BOARD (Missions & Gigs) */}
          <div className="bg-[#0E1524] border border-indigo-950/80 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-indigo-950/45">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                My Active Duties ({myActiveDuties.length})
              </h3>
            </div>

            {myActiveDuties.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-indigo-950/40 rounded-xl space-y-2 p-4">
                <Compass className="w-6 h-6 mx-auto text-slate-600" />
                <div>
                  <h4 className="text-xs font-black text-slate-300">No Active Assignments</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed max-w-[200px] mx-auto font-medium">
                    You haven't claimed any volunteer missions or professional gigs yet.
                  </p>
                </div>
                <div className="flex gap-1.5 justify-center mt-1">
                  <button
                    onClick={() => onNavigateToTab("Volunteer")}
                    className="px-2.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-[8.5px] rounded-lg uppercase tracking-wider transition-all"
                  >
                    Volunteer Board
                  </button>
                  <button
                    onClick={() => onNavigateToTab("Fixer")}
                    className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-[8.5px] rounded-lg uppercase tracking-wider transition-all"
                  >
                    Fixer Guild
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {myActiveDuties.map((duty) => {
                  const isVol = duty.severity === "Low";
                  const steps = localDutySteps[duty.id] || [false, false, false];
                  const checkCount = steps.filter(Boolean).length;
                  const pct = Math.round((checkCount / 3) * 100);
                  const logs = localDutyNotes[duty.id] || [];

                  return (
                    <div 
                      key={duty.id}
                      className="p-3 bg-[#070B14] rounded-xl border border-indigo-950/70 space-y-2.5"
                    >
                      {/* Connection Dispatch Label */}
                      <div className="text-[7.5px] font-black text-slate-500 flex justify-between uppercase tracking-wider pb-1 border-b border-indigo-950/30">
                        <span>Source: User Report #CIV-{duty.id.slice(0, 5).toUpperCase()}</span>
                        <span className="text-[#818CF8] font-bold">Official Triage Active</span>
                      </div>

                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            isVol ? "bg-indigo-500/10 text-[#818CF8]" : "bg-teal-500/10 text-teal-400"
                          }`}>
                            {isVol ? "👥 Volunteer Mission" : "🔧 Guild Contractor"}
                          </span>
                          <h4 className="text-xs font-black text-white mt-1.5 truncate">{duty.title}</h4>
                        </div>
                        <span className="text-[10px] font-black font-mono text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                          {isVol ? "+100 PTS" : `₹${duty.id === "CIVIQ-006" ? "650" : "800"} Escrow`}
                        </span>
                      </div>

                      {/* SLA Timers */}
                      <div className="flex items-center gap-1 text-[9px] text-rose-400 font-extrabold bg-rose-500/5 p-1.5 rounded-lg border border-rose-500/10">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span>SLA Time remaining: {isVol ? "12h" : "24h"} Contract Deadline</span>
                      </div>

                      {/* Step check logging WITHOUT proof */}
                      <div className="p-2.5 bg-[#0E1524]/50 border border-indigo-950 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                            <ListTodo className="w-3 h-3 text-indigo-400" />
                            Log Steps (No Proof)
                          </span>
                          <span className="text-[8.5px] font-mono font-black text-teal-400">{pct}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-[#05080E] rounded-full overflow-hidden border border-indigo-950/45">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-teal-400" style={{ width: `${pct}%` }} />
                        </div>

                        {/* Checklist */}
                        <div className="space-y-1.5">
                          {["Inspect Site Anomaly", "Clear waste & patch parameters", "Verify finished clearance"].map((st, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleToggleLocalStep(duty.id, sIdx)}
                              className="w-full flex items-center gap-2 text-[9.5px] text-slate-300 font-bold hover:text-white text-left"
                            >
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                steps[sIdx] ? "bg-indigo-600 border-transparent text-white" : "border-indigo-900 bg-[#05080E]"
                              }`}>
                                {steps[sIdx] && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className={steps[sIdx] ? "line-through text-slate-500 font-medium" : ""}>{st}</span>
                            </button>
                          ))}
                        </div>

                        {/* STATUS JOURNAL ENTRY (NO PROOF) */}
                        <div className="pt-1.5 border-t border-indigo-950/35">
                          <div className="flex gap-1.5">
                            <input 
                              type="text"
                              placeholder="Write custom progress log note..."
                              value={localActiveNoteText[duty.id] || ""}
                              onChange={(e) => setLocalActiveNoteText({
                                ...localActiveNoteText,
                                [duty.id]: e.target.value
                              })}
                              className="flex-1 h-7 px-2 bg-[#05080E] border border-indigo-950 rounded-lg text-[9px] text-white focus:outline-none"
                            />
                            <button 
                              onClick={() => handleAddLocalNote(duty.id)}
                              className="px-2.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-900 rounded-lg text-[8px] font-extrabold uppercase"
                            >
                              Add Log
                            </button>
                          </div>
                        </div>

                        {/* Logs display */}
                        {logs.length > 0 && (
                          <div className="bg-[#05080E]/40 p-2 rounded-lg border border-dashed border-indigo-950/60 max-h-[60px] overflow-y-auto space-y-1">
                            {logs.map((lg, lIdx) => (
                              <p key={lIdx} className="text-[8px] text-slate-400 font-medium leading-relaxed">• {lg}</p>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Forward action links to claim boards to wrap up with photos */}
                      <div className="space-y-1.5 mt-2">
                        <button
                          onClick={() => onNavigateToTab(isVol ? "Volunteer" : "Fixer")}
                          className="w-full h-8 bg-indigo-600/10 hover:bg-indigo-600/20 text-[#818CF8] border border-indigo-500/20 text-[9px] font-extrabold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 transition-all"
                        >
                          <span>Go to {isVol ? "Volunteer Board" : "Fixer Guild"} to upload proof</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => {
                            if (isVol) {
                              onAbandonMission && onAbandonMission(duty.id);
                            } else {
                              onAbandonFixerJob && onAbandonFixerJob(duty.id);
                            }
                          }}
                          className="w-full h-8 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 border border-rose-500/15 text-[9px] font-extrabold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Undo2 className="w-3 h-3 text-rose-400" />
                          <span>Took by mistake? Undo & Withdraw</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CITIZEN REPORTS MODULE */}
          <div className="bg-[#0E1524] border border-indigo-950/80 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-indigo-950/45">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-[#818CF8]" />
                My Filed Reports ({userReports.length})
              </h3>
            </div>

            {userReports.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-indigo-950/40 rounded-xl space-y-2 p-4">
                <ClipboardList className="w-6 h-6 mx-auto text-slate-500" />
                <div>
                  <h4 className="text-xs font-black text-slate-300">No Reports Filed Yet</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed max-w-[200px] mx-auto font-medium">
                    Report a pothole or other city hazard to begin tracking.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab("Report")}
                  className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-[9px] rounded-lg shadow-sm transition-all mx-auto uppercase tracking-wider mt-1"
                >
                  Report Now
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {userReports.map((report) => {
                  const statusColor = 
                    report.status === "Pending" 
                      ? "text-amber-500 bg-amber-500/10" 
                      : report.status === "In Progress" 
                      ? "text-blue-500 bg-blue-500/10" 
                      : "text-emerald-500 bg-emerald-500/10";

                  return (
                    <div
                      key={report.id}
                      onClick={() => onSelectIssue(report)}
                      className="p-2.5 rounded-xl border border-indigo-950/60 bg-[#070B14] hover:bg-indigo-950/30 cursor-pointer transition-all flex gap-3 items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-indigo-950 shrink-0">
                          {report.beforePhotoUrl || report.beforePhoto ? (
                            <img 
                              src={report.beforePhotoUrl || report.beforePhoto} 
                              alt="preview" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-indigo-950/30 flex items-center justify-center text-[#818CF8]">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-black text-white truncate max-w-[150px]">{report.title}</h4>
                          <span className="text-[8.5px] font-mono text-slate-500 block">ID: #{report.id.slice(0, 5).toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${statusColor}`}>
                          {report.status}
                        </span>
                        {onDeleteIssue && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to permanently delete your reported post "${report.title}"?`)) {
                                onDeleteIssue(report.id);
                              }
                            }}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-lg transition-all active:scale-95"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick info footer */}
          <div className="text-center py-2 text-[8.5px] text-slate-600 font-bold space-y-1">
            <p>CiviQ Central Ward Clearing Registry © 2026</p>
            <p>Secure database nodes synced with BBMP central directories</p>
          </div>

        </div>
      </div>

      {/* SETTINGS OVERLAYS */}
      <AnimatePresence>
        {settingsActiveView && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="absolute inset-0 bg-[#070B14] z-40 flex flex-col"
          >
            {/* 1. MAIN SETTINGS INDEX */}
            {settingsActiveView === "SETTINGS_INDEX" && (
              <>
                {/* Header */}
                <div className="p-4 border-b border-indigo-950 flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setSettingsActiveView(null)}
                    className="p-1.5 rounded-lg hover:bg-indigo-950/40 text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-black uppercase tracking-wider text-white">Application Settings</span>
                </div>

                {/* Option list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                  
                  {/* Account options */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block pl-2">Profile & Security</span>
                    <div className="bg-[#0E1524] border border-indigo-950/80 rounded-2xl divide-y divide-indigo-950/60 overflow-hidden shadow-sm">
                      <button
                        onClick={() => setSettingsActiveView("ACCOUNT_CENTRE")}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-950/20 flex justify-between items-center transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-[#818CF8]" />
                          <div>
                            <span className="block text-xs font-bold text-slate-200">Account details</span>
                            <span className="block text-[8px] text-slate-500 font-semibold mt-0.5">Manage residing area, ward, name, and email</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </button>

                      <button
                        onClick={() => setSettingsActiveView("ACTIVITY_HISTORY")}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-950/20 flex justify-between items-center transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ClipboardList className="w-4 h-4 text-[#818CF8]" />
                          <div>
                            <span className="block text-xs font-bold text-slate-200">Your Activity History</span>
                            <span className="block text-[8px] text-slate-500 font-semibold mt-0.5">Audit upvotes, comments, and bookmarked issues</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {/* System & display config */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block pl-2">Preferences</span>
                    <div className="bg-[#0E1524] border border-indigo-950/80 rounded-2xl p-4 space-y-3.5 shadow-sm">
                      
                      

                      {/* Push alerts */}
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="block text-xs font-bold text-slate-200">Live Ward Advisories</span>
                          <span className="block text-[8px] text-slate-500 font-semibold">Instant notification of severe localized clearings</span>
                        </div>
                        <button
                          onClick={() => setPushAlerts(!pushAlerts)}
                          className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                            pushAlerts ? "bg-[#4F46E5]" : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                            pushAlerts ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 🚨 NEW: MODERATOR FLAG NOTIFICATIONS */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block pl-2">⚠️ MODERATOR FLAG SYSTEM</span>
                    <div className="bg-[#0E1524] border border-indigo-950/80 rounded-2xl p-4 space-y-3 shadow-sm">
                      <p className="text-[8.5px] text-slate-400 font-semibold leading-relaxed">
                        If any of your comments are flagged by other citizens or municipal workers, real-time alerts appear here:
                      </p>

                      {userStats.reportedCommentsNotifications && userStats.reportedCommentsNotifications.length > 0 ? (
                        <div className="space-y-2">
                          {userStats.reportedCommentsNotifications.map((notif, idx) => {
                            const isByMe = notif.isReportedByMe;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  const matchingIssue = issues.find(i => i.id === notif.issueId);
                                  if (matchingIssue) {
                                    onSelectIssue(matchingIssue);
                                  }
                                }}
                                className={`bg-[#070B14] border rounded-xl p-3 space-y-1.5 text-[9.5px] cursor-pointer transition-all ${
                                  isByMe 
                                    ? "border-sky-500/30 hover:bg-sky-500/5 hover:border-sky-500/60" 
                                    : "border-rose-500/20 hover:bg-rose-500/5 hover:border-rose-500/60"
                                }`}
                                title="Click to view original report"
                              >
                                <div className="flex justify-between items-center text-[8px] font-bold">
                                  <span className={isByMe ? "text-sky-400" : "text-rose-400"}>
                                    {isByMe ? "🛡️ COMMENT REPORTED BY YOU" : "🚨 COMMENT FLAGGED FOR REVIEW"}
                                  </span>
                                  <span className="font-mono text-slate-500">{notif.date}</span>
                                </div>
                                <p className="text-slate-300 font-bold">
                                  {isByMe ? (
                                    <>
                                      You reported a comment by <span className="text-amber-400">@{notif.reportedAuthor || "Anonymous"}</span> on <span className="text-[#818CF8]">"{notif.issueTitle}"</span>:
                                    </>
                                  ) : (
                                    <>
                                      Your comment on <span className="text-[#818CF8]">"{notif.issueTitle}"</span> was reported:
                                    </>
                                  )}
                                </p>
                                <div className={`p-2 border rounded text-slate-400 italic ${
                                  isByMe ? "bg-sky-500/5 border-sky-500/10" : "bg-rose-500/5 border-rose-500/10"
                                }`}>
                                  "{notif.commentText}"
                                </div>
                                <div className="flex justify-between items-center text-[8.5px] mt-1 text-slate-500 font-medium">
                                  {isByMe ? (
                                    <span>Status: Pending inspector review. Thank you for maintaining civic decorum.</span>
                                  ) : (
                                    <span>Status: Under verification. Only you can see this alert.</span>
                                  )}
                                  <span className="text-indigo-400 font-black uppercase text-[8px] animate-pulse">🔍 View Report →</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-[9px] font-semibold bg-[#070B14] rounded-xl border border-indigo-950">
                          ✅ No reported or flagged comments on your account.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 📦 NEW: OPEN-SOURCE CREDITS */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block pl-2">Open Source Tech Ledger</span>
                    <div className="bg-[#0E1524] border border-indigo-950/80 rounded-2xl p-4 space-y-3 shadow-sm">
                      <p className="text-[8.5px] text-slate-400 font-semibold leading-relaxed">
                        CIVIQ runs entirely on a highly optimized, state-of-the-art open source engineering stack:
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div className="p-2 bg-[#070B14] rounded-lg border border-indigo-950/60">
                          <span className="block font-black text-white">React & Vite</span>
                          <span className="block text-[7.5px] text-slate-500 mt-0.5">High-speed client virtual DOM</span>
                        </div>
                        <div className="p-2 bg-[#070B14] rounded-lg border border-indigo-950/60">
                          <span className="block font-black text-white">Tailwind CSS</span>
                          <span className="block text-[7.5px] text-slate-500 mt-0.5">Hardware graphics acceleration</span>
                        </div>
                        <div className="p-2 bg-[#070B14] rounded-lg border border-indigo-950/60">
                          <span className="block font-black text-white">Lucide Icons</span>
                          <span className="block text-[7.5px] text-slate-500 mt-0.5">Unified design Taxonomy Set</span>
                        </div>
                        <div className="p-2 bg-[#070B14] rounded-lg border border-[#4F46E5]/20">
                          <span className="block font-black text-teal-400">Motion React</span>
                          <span className="block text-[7.5px] text-slate-500 mt-0.5">Physical spring interactions</span>
                        </div>
                      </div>

                      <div className="text-[7.5px] text-slate-500 font-mono text-center border-t border-indigo-950/45 pt-2">
                        License: MIT / Apache 2.0 • Bengaluru Tech Council Core © 2026
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* 2. DEDICATED NATIVE ACCOUNT CENTRE SUB-PAGE */}
            {settingsActiveView === "ACCOUNT_CENTRE" && (
              <>
                {/* Header */}
                <div className="p-4 border-b border-indigo-950 flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setSettingsActiveView("SETTINGS_INDEX")}
                    className="p-1.5 rounded-lg hover:bg-indigo-950/40 text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-black uppercase tracking-wider text-white">Account Centre</span>
                </div>

                {/* Form Scroll Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                  {/* Compulsory Area Warn Banner */}
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-300 leading-relaxed flex gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-black block uppercase mb-0.5 text-[9.5px]">Residence Verification Requirement</span>
                      Your resides area and ward assignment are mandatory settings. They verify you as a local stakeholder for nearby municipal clearings and fixer gigs.
                    </div>
                  </div>

                  {/* Feedback line */}
                  {isSavedFeedback && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-extrabold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                      <Check className="w-4 h-4 shrink-0" />
                      Account settings saved & synchronized!
                    </div>
                  )}

                  {saveError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-extrabold text-rose-400 flex items-center gap-1.5 animate-fade-in">
                      <X className="w-4 h-4 shrink-0" />
                      {saveError}
                    </div>
                  )}

                  <form onSubmit={handleSaveAccountInfo} className="bg-[#0E1524] border border-indigo-950/80 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div>
                      <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">Citizen Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-9 px-3 bg-[#070B14] border border-indigo-950 rounded-xl text-xs focus:outline-none focus:border-[#818CF8] text-white font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-9 px-3 bg-[#070B14] border border-indigo-950 rounded-xl text-xs focus:outline-none focus:border-[#818CF8] text-white font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-9 px-3 bg-[#070B14] border border-indigo-950 rounded-xl text-xs focus:outline-none focus:border-[#818CF8] text-white font-semibold"
                      />
                    </div>

                    {/* COMPULSORY LOCATION FIELDS */}
                    <div className="p-3 bg-[#070B14] border border-indigo-950/60 rounded-xl space-y-2.5">
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest block">Compulsory Ward Residence</span>
                      
                      {/* RELOCATION ASSISTANCE SELECTOR */}
                      <div className="p-2.5 bg-[#4F46E5]/10 border border-indigo-500/20 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] font-black text-indigo-300 uppercase tracking-wider">Relocated to a different ward?</span>
                          <button
                            type="button"
                            onClick={() => setShowRelocatePresets(!showRelocatePresets)}
                            className="text-[8.5px] font-black uppercase text-[#818CF8] hover:underline flex items-center gap-1"
                          >
                            📍 {showRelocatePresets ? "Hide" : "Update Area & Ward"}
                          </button>
                        </div>
                        
                        {showRelocatePresets && (
                          <div className="space-y-2 animate-fade-in pt-1 border-t border-indigo-950/30">
                            <p className="text-[8px] text-slate-400 font-bold leading-relaxed">
                              This info must be visible when you opt to change address. Type or search your new resident ward/suburb to sync:
                            </p>
                            
                            {/* SEARCH INPUT FIELD WITH LOOKUP ICON */}
                            <div className="relative flex items-center">
                              <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-500" />
                              <input
                                type="text"
                                placeholder="Type to search ward or suburb..."
                                value={wardSearch}
                                onChange={(e) => setWardSearch(e.target.value)}
                                className="w-full h-8 pl-8 pr-2.5 bg-[#070B14] border border-indigo-950 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#818CF8]"
                              />
                              {wardSearch && (
                                <button
                                  type="button"
                                  onClick={() => setWardSearch("")}
                                  className="absolute right-2 text-[10px] text-slate-500 hover:text-slate-300 px-1 font-bold"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            {/* FILTERED PRESETS GRID */}
                            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                              {bengaluruAreasAndWards.filter(item => 
                                item.area.toLowerCase().includes(wardSearch.toLowerCase()) || 
                                item.ward.toLowerCase().includes(wardSearch.toLowerCase())
                              ).map((item, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setResidingArea(item.area);
                                    setWard(item.ward);
                                    setWardSearch("");
                                    setShowRelocatePresets(false);
                                  }}
                                  className={`p-1.5 rounded text-left border text-[8.5px] transition-all flex flex-col ${
                                    residingArea === item.area
                                      ? "bg-[#4F46E5]/25 border-[#818CF8] text-white"
                                      : "bg-[#0E1524] border-indigo-950 text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  <span className="font-extrabold text-slate-200">{item.area}</span>
                                  <span className="text-[7.5px] text-slate-400 font-semibold mt-0.5">{item.ward}</span>
                                </button>
                              ))}

                              {/* Allow creating custom ward search options */}
                              {wardSearch && !bengaluruAreasAndWards.some(item => 
                                item.area.toLowerCase() === wardSearch.toLowerCase() || 
                                item.ward.toLowerCase() === wardSearch.toLowerCase()
                              ) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const formattedWard = wardSearch.toLowerCase().startsWith("ward") 
                                      ? wardSearch 
                                      : `Ward ${wardSearch}`;
                                    setResidingArea(wardSearch);
                                    setWard(formattedWard);
                                    setWardSearch("");
                                    setShowRelocatePresets(false);
                                  }}
                                  className="col-span-2 p-2 rounded text-left border border-dashed border-teal-500/30 bg-teal-500/5 text-teal-400 text-[8.5px] hover:bg-teal-500/10 transition-all flex flex-col"
                                >
                                  <span className="font-black">✨ Set custom area/ward:</span>
                                  <span className="text-[7.5px] opacity-80">"{wardSearch}"</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[8px] font-extrabold text-[#818CF8] uppercase block mb-1">Residing Area / Suburb</label>
                        <input
                          type="text"
                          value={residingArea}
                          onChange={(e) => handleAreaChange(e.target.value)}
                          placeholder="e.g. Indiranagar, Koramangala"
                          className="w-full h-8 px-2.5 bg-[#0E1524] border border-indigo-950 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-white font-semibold"
                          required
                        />
                        {/* Auto-suggestions for Area */}
                        {residingArea.trim() && !bengaluruAreasAndWards.some(i => i.area.toLowerCase() === residingArea.trim().toLowerCase()) && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {bengaluruAreasAndWards
                              .filter(i => i.area.toLowerCase().includes(residingArea.toLowerCase()))
                              .slice(0, 3)
                              .map((item, idx) => (
                                <button
                                  type="button"
                                  key={idx}
                                  onClick={() => {
                                    setResidingArea(item.area);
                                    setWard(item.ward);
                                  }}
                                  className="px-2 py-0.5 bg-indigo-950/40 border border-indigo-500/20 text-[8px] text-[#818CF8] font-bold rounded-lg hover:bg-[#4F46E5]/25 transition-all"
                                >
                                  📍 {item.area} ({item.ward})
                                </button>
                              ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[8px] font-extrabold text-[#818CF8] uppercase block mb-1">BBMP Ward Number / Ward Name</label>
                        <input
                          type="text"
                          value={ward}
                          onChange={(e) => handleWardChange(e.target.value)}
                          placeholder="e.g. Ward 78 (Vasanth Nagar)"
                          className="w-full h-8 px-2.5 bg-[#0E1524] border border-indigo-950 rounded-lg text-xs focus:outline-none focus:border-amber-500 text-white font-semibold"
                          required
                        />
                        {/* Auto-suggestions for Ward */}
                        {ward.trim() && !bengaluruAreasAndWards.some(i => i.ward.toLowerCase() === ward.trim().toLowerCase()) && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {bengaluruAreasAndWards
                              .filter(i => i.ward.toLowerCase().includes(ward.toLowerCase()))
                              .slice(0, 3)
                              .map((item, idx) => (
                                <button
                                  type="button"
                                  key={idx}
                                  onClick={() => {
                                    setResidingArea(item.area);
                                    setWard(item.ward);
                                  }}
                                  className="px-2 py-0.5 bg-indigo-950/40 border border-indigo-500/20 text-[8px] text-[#818CF8] font-bold rounded-lg hover:bg-[#4F46E5]/25 transition-all"
                                >
                                  📍 {item.ward} ({item.area})
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-9 bg-[#4F46E5] hover:bg-[#6366F1] text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                    >
                      Save Account Changes
                    </button>
                  </form>

                  {/* Extra Data Export or Delete Profile actions */}
                  <div className="bg-[#0E1524] border border-indigo-950/80 rounded-2xl p-4 space-y-2 shadow-sm">
                    <button
                      onClick={handleExportData}
                      className="w-full h-8.5 bg-[#070B14] hover:bg-indigo-950/25 text-slate-200 font-bold text-[9px] uppercase tracking-wider rounded-lg border border-indigo-950 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isDataExported ? "Data Exported!" : "Export Citizen Data"}
                    </button>

                    <button
                      onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                      className="w-full h-8.5 bg-transparent text-rose-500 font-bold text-[9px] uppercase tracking-wider rounded-lg border border-rose-950/40 hover:bg-rose-950/10 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Civic Profile
                    </button>

                    {showDeleteConfirm && (
                      <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-900/35 space-y-2 text-[9px] text-rose-300 mt-2">
                        <span className="font-bold block">Are you absolutely sure? This will delete all filed reports and points.</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              onResetApp();
                              setShowDeleteConfirm(false);
                              setSettingsActiveView(null);
                            }}
                            className="px-3 py-1 bg-rose-600 text-white rounded font-extrabold"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1 bg-slate-800 text-slate-300 rounded font-extrabold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 3. ACTIVITY LOG LIST VIEW */}
            {settingsActiveView === "ACTIVITY_HISTORY" && (
              <>
                {/* Header */}
                <div className="p-4 border-b border-indigo-950 flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setSettingsActiveView("SETTINGS_INDEX")}
                    className="p-1.5 rounded-lg hover:bg-indigo-950/40 text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-black uppercase tracking-wider text-white">Your Activity History</span>
                </div>

                {/* Log Scroll Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                  {/* Segmented select tab pills */}
                  <div className="flex bg-[#0E1524] p-1 rounded-xl border border-indigo-950/60 shrink-0">
                    <button
                      onClick={() => setActivityCategory("LIKES")}
                      className={`flex-1 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        activityCategory === "LIKES"
                          ? "bg-[#1B253D] text-[#818CF8]"
                          : "text-slate-400"
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      Likes ({likedReports.length})
                    </button>
                    <button
                      onClick={() => setActivityCategory("SAVED")}
                      className={`flex-1 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        activityCategory === "SAVED"
                          ? "bg-[#1B253D] text-[#818CF8]"
                          : "text-slate-400"
                      }`}
                    >
                      <Bookmark className="w-3 h-3" />
                      Saved ({savedReports.length})
                    </button>
                    <button
                      onClick={() => setActivityCategory("COMMENTS")}
                      className={`flex-1 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        activityCategory === "COMMENTS"
                          ? "bg-[#1B253D] text-[#818CF8]"
                          : "text-slate-400"
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      Comments ({userCommentedReports.length})
                    </button>
                  </div>

                  {/* Likes Category log content */}
                  {activityCategory === "LIKES" && (
                    <div className="space-y-2">
                      {likedReports.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">
                          <ThumbsUp className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                          No liked reports yet
                        </div>
                      ) : (
                        likedReports.map((report) => (
                          <div
                            key={report.id}
                            onClick={() => {
                              onSelectIssue(report);
                              setSettingsActiveView(null);
                            }}
                            className="p-2.5 border border-indigo-950 bg-[#0E1524] rounded-xl flex items-center justify-between hover:bg-indigo-950/20 cursor-pointer transition-all"
                          >
                            <div className="min-w-0">
                              <span className="text-[8px] text-[#818CF8] font-bold block uppercase">{report.category}</span>
                              <h4 className="text-[11px] font-bold text-white truncate max-w-[220px]">{report.title}</h4>
                            </div>
                            <ThumbsUp className="w-3.5 h-3.5 text-[#818CF8] fill-current shrink-0 mr-1" />
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Saved Category log content */}
                  {activityCategory === "SAVED" && (
                    <div className="space-y-2">
                      {savedReports.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">
                          <Bookmark className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                          No saved reports yet
                        </div>
                      ) : (
                        savedReports.map((report) => (
                          <div
                            key={report.id}
                            onClick={() => {
                              onSelectIssue(report);
                              setSettingsActiveView(null);
                            }}
                            className="p-2.5 border border-indigo-950 bg-[#0E1524] rounded-xl flex items-center justify-between hover:bg-indigo-950/20 cursor-pointer transition-all"
                          >
                            <div className="min-w-0">
                              <span className="text-[8px] text-[#818CF8] font-bold block uppercase">{report.category}</span>
                              <h4 className="text-[11px] font-bold text-white truncate max-w-[220px]">{report.title}</h4>
                            </div>
                            <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0 mr-1" />
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Comments Category log content */}
                  {activityCategory === "COMMENTS" && (
                    <div className="space-y-2.5">
                      {userCommentedReports.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">
                          <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                          No written comments yet
                        </div>
                      ) : (
                        userCommentedReports.map((report) => {
                          const userComment = report.comments?.find((c) => c.author === userStats.name);
                          return (
                            <div
                              key={report.id}
                              onClick={() => {
                                onSelectIssue(report);
                                setSettingsActiveView(null);
                              }}
                              className="p-3 border border-indigo-950 bg-[#0E1524] rounded-xl hover:bg-indigo-950/20 cursor-pointer transition-all space-y-1.5"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] text-indigo-400 font-bold block uppercase">{report.category}</span>
                                <span className="text-[7.5px] text-slate-500 font-mono">{userComment?.date}</span>
                              </div>
                              <h4 className="text-[10.5px] font-bold text-white truncate">{report.title}</h4>
                              <p className="text-[10px] text-slate-300 italic bg-[#070B14] p-1.5 rounded border border-indigo-950/30 line-clamp-2 leading-relaxed">
                                &ldquo;{userComment?.text}&rdquo;
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔐 2-STEP SECURITY CONFIRMATION MODAL */}
      <AnimatePresence>
        {show2FAModal && pendingProfileData && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#0E1524] border border-[#818CF8]/30 rounded-2xl p-5 max-w-xs w-full space-y-4 shadow-2xl relative">
              <div className="text-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#818CF8] mx-auto text-lg">
                  🔐
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">2-Step Secure Authorization</h3>
                <p className="text-[9px] text-slate-400 leading-normal font-semibold">
                  We must verify that you yourself are requesting these sensitive account metadata changes (Name, Email, or Password) before writing them to the ledger.
                </p>
              </div>

              {/* Input */}
              <div className="space-y-1">
                <label className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block text-center">Enter 6-Digit Safe Key</label>
                <input
                  type="text"
                  placeholder="e.g. 000 000"
                  value={input2FACode}
                  onChange={(e) => setInput2FACode(e.target.value)}
                  className="w-full h-9 bg-[#070B14] border border-indigo-950 rounded-xl text-center font-mono text-sm tracking-widest text-white focus:outline-none focus:border-[#818CF8]"
                  maxLength={7}
                  required
                />
                
                {verificationError && (
                  <span className="text-[8.5px] text-rose-500 font-extrabold text-center block mt-1 leading-normal">
                    {verificationError}
                  </span>
                )}
                
                <p className="text-[8px] text-indigo-400 font-bold text-center mt-2.5">
                  🔑 Demo Safe Key: Enter <span className="underline font-black text-white">829 401</span> to authorize.
                </p>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShow2FAModal(false);
                    setPendingProfileData(null);
                  }}
                  className="h-9 bg-[#070B14] hover:bg-slate-800 text-slate-400 font-black text-[9px] uppercase tracking-wider rounded-xl transition-colors border border-indigo-950"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerify2FA}
                  className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-wider rounded-xl shadow-md transition-colors"
                >
                  Verify Key
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
