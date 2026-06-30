import React, { useState, useMemo, useEffect } from "react";
import { Issue, UserStats } from "../../types";
import { Wrench, CheckCircle2, AlertTriangle, Coins, ShieldCheck, Sparkles, UploadCloud, Star, DollarSign, Clock, ListTodo, ShieldAlert, FileText, CheckSquare, Undo2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FixerViewProps {
  userStats: UserStats;
  issues: Issue[];
  onClaimFixerJob: (id: string) => void;
  onAbandonFixerJob: (id: string) => void;
  onUpdateUserStats: (updated: Partial<UserStats>) => void;
  onDeleteIssue?: (id: string) => void;
  onResolveFixerJob?: (id: string, beforePhoto: string, afterPhoto: string, notes: string[]) => void;
}

export const FixerView: React.FC<FixerViewProps> = ({
  userStats,
  issues,
  onClaimFixerJob,
  onAbandonFixerJob,
  onUpdateUserStats,
  onDeleteIssue,
  onResolveFixerJob
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>("GIGS");
  
  // Photo states per issue ID
  const [beforePhotos, setBeforePhotos] = useState<{ [key: string]: string }>({});
  const [afterPhotos, setAfterPhotos] = useState<{ [key: string]: string }>({});
  
  // AI inspection states
  const [isReviewing, setIsReviewing] = useState<{ [key: string]: boolean }>({});
  const [reviewResults, setReviewResults] = useState<{ [key: string]: any }>({});

  // Responsibility Choice Modal states
  const [pendingClaimGig, setPendingClaimGig] = useState<Issue | null>(null);
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<string[]>([]);
  const [contractSignature, setContractSignature] = useState<string>("");

  // Progress log states (steps & notes logged without proof)
  const [progressSteps, setProgressSteps] = useState<{ [key: string]: boolean[] }>({}); // { issueId: [step1, step2, step3] }
  const [progressNotes, setProgressNotes] = useState<{ [key: string]: string[] }>({}); // { issueId: ["note1", "note2"] }
  const [activeNoteText, setActiveNoteText] = useState<{ [key: string]: string }>({});

  // Filter local fixer jobs
  const availableGigs = useMemo(() => {
    return issues.filter((i) => i.type === "localfixer" && i.status === "Pending" && !i.userCompletedList?.includes(userStats.email));
  }, [issues, userStats.email]);

  const activeMyWork = useMemo(() => {
    return issues.filter((i) => i.type === "localfixer" && i.status === "In Progress" && i.claimedByUserId === userStats.email && !i.userCompletedList?.includes(userStats.email));
  }, [issues, userStats.email]);

  const completedGigs = useMemo(() => {
    return issues.filter((i) => i.type === "localfixer" && (i.status === "Resolved" || i.userCompletedList?.includes(userStats.email)));
  }, [issues, userStats.email]);

  const dynamicEarnings = useMemo(() => {
    return completedGigs.reduce((acc, gig) => {
      const match = gig.payment.match(/₹\s*(\d+)/);
      const amount = match ? parseInt(match[1], 10) : (gig.id === "CIVIQ-006" ? 650 : 800);
      return acc + amount;
    }, 0);
  }, [completedGigs]);

  const dynamicRating = useMemo(() => {
    const completedWithScore = completedGigs.filter(g => g.qualityScore !== undefined);
    if (completedWithScore.length === 0) return 4.9;
    const totalScore = completedWithScore.reduce((acc, g) => acc + (g.qualityScore || 10), 0);
    return (totalScore / completedWithScore.length) / 2;
  }, [completedGigs]);

  const fixerResponsibilities = [
    { id: "f1", label: "🚧 Set up pedestrian safety barricades & signs", desc: "Ensures no bypass traffic enters the live repair zone." },
    { id: "f2", label: "🛠️ Provide industrial-grade cold tarmac & tools", desc: "Complies with standard BBMP structural thickness specifications." },
    { id: "f3", label: "📋 Log on-site engineering progress & level scans", desc: "Logs baseline metrics to CiviQ progress ledger." },
    { id: "f4", label: "♻️ Commit to clean site scrap clearing", desc: "No debris left behind; transport loose grit to ward dumpsters." }
  ];

  // Handle simulated photo captures
  const handleCaptureBefore = (issueId: string) => {
    setBeforePhotos({
      ...beforePhotos,
      [issueId]: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400"
    });
    handleAddProgressNote(issueId, "📸 Base 'Before' audit photograph uploaded successfully.");
  };

  const handleCaptureAfter = (issueId: string) => {
    setAfterPhotos({
      ...afterPhotos,
      [issueId]: "https://images.unsplash.com/photo-1599740831111-e63777d853e8?auto=format&fit=crop&q=80&w=400"
    });
    handleAddProgressNote(issueId, "📸 Completed 'After' repair photograph uploaded successfully.");
  };

  // Run server-side Gemini Quality Inspection Review
  const runAiReview = async (issueId: string) => {
    setIsReviewing({ ...isReviewing, [issueId]: true });
    try {
      const response = await fetch("/api/gemini/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId,
          beforePhoto: beforePhotos[issueId] || "before.jpg",
          afterPhoto: afterPhotos[issueId] || "after.jpg"
        })
      });
      const data = await response.json();
      setReviewResults({
        ...reviewResults,
        [issueId]: data
      });
      
      if (data.approved) {
        handleAddProgressNote(issueId, `⭐ Gemini Inspect Approved! Quality Score: ${data.score}/10. Escrow release authorized.`);
      } else {
        handleAddProgressNote(issueId, `⚠️ Gemini Inspect Defect Alert: ${data.feedback}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReviewing({ ...isReviewing, [issueId]: false });
    }
  };

  // Release escrow payment
  const handleReleasePayment = (issueId: string, amount: number, ratingPoints: number) => {
    const newEarnings = (userStats.fixerEarnings || 0) + amount;
    const newJobsDone = (userStats.fixerJobsDone || 0) + 1;
    onUpdateUserStats({
      fixerEarnings: newEarnings,
      fixerJobsDone: newJobsDone,
      fixerRating: ratingPoints / 2
    });

    if (onResolveFixerJob) {
      onResolveFixerJob(
        issueId,
        beforePhotos[issueId] || "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&q=80",
        afterPhotos[issueId] || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80",
        progressNotes[issueId] || [],
        ratingPoints
      );
    }

    // Clear local lists
    const updatedReview = { ...reviewResults };
    delete updatedReview[issueId];
    setReviewResults(updatedReview);
  };

  // Claim with Modal
  const handleOpenClaimModal = (gig: Issue) => {
    setPendingClaimGig(gig);
    setSelectedResponsibilities([]); // Start completely empty per user requirements
    setContractSignature(""); // Reset signature
  };

  const handleConfirmClaim = () => {
    if (!pendingClaimGig) return;

    onClaimFixerJob(pendingClaimGig.id);

    // Initialize progress steps
    setProgressSteps({
      ...progressSteps,
      [pendingClaimGig.id]: [false, false, false]
    });

    setProgressNotes({
      ...progressNotes,
      [pendingClaimGig.id]: [`💼 Professional Contract Signed by ${contractSignature.trim()}: Escrow locked & SLA countdown clock started.`]
    });

    setPendingClaimGig(null);
    setContractSignature("");
    setActiveSubTab("MY WORK");
  };

  // Progress steps
  const handleToggleStep = (issueId: string, stepIdx: number) => {
    const currentSteps = progressSteps[issueId] || [false, false, false];
    const updated = [...currentSteps];
    updated[stepIdx] = !updated[stepIdx];
    
    setProgressSteps({
      ...progressSteps,
      [issueId]: updated
    });

    const stepNames = [
      "Prepare repair area & excavate loose tarmac",
      "Pour asphalt base coarse & compress level",
      "Seal boundaries & sweep loose grit residue"
    ];
    const stateStr = updated[stepIdx] ? "Marked Complete" : "Deselected";
    handleAddProgressNote(issueId, `⚡ Contractor Progress: "${stepNames[stepIdx]}" ${stateStr}.`);
  };

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

  return (
    <div className="w-full h-full bg-[#070B14] flex flex-col justify-between text-slate-100 select-none relative overflow-hidden">
      
      {/* HEADER STATS CARD */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900/60 p-4 shrink-0 shadow-lg border-b border-indigo-950/45">
        <h2 className="text-sm font-black flex items-center gap-1.5 uppercase tracking-wider text-teal-300">
          <Wrench className="w-5 h-5 text-teal-400" />
          Professional Fixer Guild 🔧
        </h2>
        <p className="text-[10px] text-slate-400 mt-0.5">Claim high/medium severity contractor gigs. Fulfill city SLAs and unlock escrow funds.</p>

        {/* Fixer Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-2 bg-[#080E1A]/60 p-2.5 rounded-2xl border border-teal-950/20 text-center backdrop-blur-sm">
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Earnings</span>
            <span className="block text-sm font-black text-yellow-400 font-mono">₹{dynamicEarnings}</span>
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Gigs Completed</span>
            <span className="block text-sm font-black text-white">{completedGigs.length}</span>
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Fixer Rating</span>
            <span className="block text-[10.5px] font-black text-amber-400 flex items-center justify-center gap-0.5 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {dynamicRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* SUB TABS */}
      <div className="bg-[#0E1524]/60 border-b border-indigo-950/60 p-2 shrink-0 flex gap-1.5 relative z-10">
        {["GIGS", "MY WORK", "COMPLETED"].map((tab) => {
          const isSelected = activeSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center text-center border transition-all ${
                isSelected
                  ? "bg-[#4F46E5] text-white shadow-md border-transparent"
                  : "bg-[#070B14] border-indigo-950 text-slate-400 hover:text-white"
              }`}
            >
              <span>
                {tab === "GIGS" ? "Available Gigs" : tab === "MY WORK" ? `My Active Gigs (${activeMyWork.length})` : "Completed Gigs"}
              </span>
            </button>
          );
        })}
      </div>

      {/* CONTENT LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        
        {/* AVAILABLE GIGS */}
        {activeSubTab === "GIGS" && (
          availableGigs.length === 0 ? (
            <div className="text-center text-slate-400 mt-12 flex flex-col items-center justify-center p-6">
              <ShieldCheck className="w-12 h-12 stroke-[1.5] text-teal-500/40 animate-pulse" />
              <h4 className="text-xs font-black mt-3 text-white">All Gigs Claimed!</h4>
              <p className="text-[10px] text-slate-400 mt-1">Check back later for newly reported ward repair gigs.</p>
            </div>
          ) : (
            availableGigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-[#0E1524]/75 border border-indigo-950/80 rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col group hover:border-teal-500/40 transition-colors"
              >
                {/* Official Dispatch connection */}
                <div className="text-[8px] font-black text-slate-500 flex items-center gap-1 uppercase tracking-wider mb-2 pb-1.5 border-b border-indigo-950/40">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                  Source: Citizen Report #CIV-{gig.id.slice(0, 5).toUpperCase()}
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-black text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded border border-teal-500/20 uppercase tracking-wider">
                    {gig.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-black text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded border border-yellow-500/20 uppercase tracking-wider flex items-center gap-0.5">
                      💸 ₹{gig.id === "CIVIQ-006" ? "650" : "800"} Escrow Held
                    </span>
                    {gig.id === "CIVIQ-006B" && onDeleteIssue && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Are you sure you want to delete the Active Fixer Guild gig completely from the database?")) {
                            onDeleteIssue(gig.id);
                          }
                        }}
                        className="p-1.5 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-lg transition-all active:scale-95"
                        title="Delete Active Fixer Guild"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="text-xs font-black text-white mt-2.5">{gig.title}</h4>
                <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed font-semibold">{gig.description}</p>
                <div className="text-[10px] text-slate-400 mt-3 font-semibold">
                  📍 {gig.address}
                </div>

                {/* What the mission wants & Requirements snippet */}
                <div className="mt-3 p-2 bg-[#070B14] border border-indigo-950/40 rounded-xl text-[9.5px] text-slate-400 leading-normal">
                  <span className="font-extrabold text-teal-400 uppercase block mb-0.5 text-[8.5px]">Contractor Goal:</span>
                  Perform full excavation and cold-asphalt sealing of municipal defect. Strict Gemini AI photogrammetry check applies before escrow release.
                </div>

                <button
                  onClick={() => handleOpenClaimModal(gig)}
                  className="mt-4 w-full h-10 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
                >
                  Sign Contract & Claim Gig
                </button>
              </div>
            ))
          )
        )}

        {/* ACTIVE WORK & QUALITY REVIEW WIZARD */}
        {activeSubTab === "MY WORK" && (
          activeMyWork.length === 0 ? (
            <div className="text-center text-slate-400 mt-12 flex flex-col items-center justify-center p-6">
              <Wrench className="w-12 h-12 stroke-[1.5] text-teal-500/40 animate-pulse" />
              <h4 className="text-xs font-black mt-3 text-white">No Claimed Jobs</h4>
              <p className="text-[10px] text-slate-400 mt-1">Claim a local contractor gig from the 'Available' board to get started.</p>
            </div>
          ) : (
            activeMyWork.map((gig) => {
              const beforePhoto = beforePhotos[gig.id];
              const afterPhoto = afterPhotos[gig.id];
              const isChecking = isReviewing[gig.id];
              const reviewResult = reviewResults[gig.id];
              const escrowAmount = gig.id === "CIVIQ-006" ? 650 : 800;
              const steps = progressSteps[gig.id] || [false, false, false];
              const checkedCount = steps.filter(Boolean).length;
              const progressPct = Math.round((checkedCount / 3) * 100);
              const notes = progressNotes[gig.id] || [];

              return (
                <div
                  key={gig.id}
                  className="bg-[#0E1524]/75 border border-indigo-950/80 rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col space-y-3"
                >
                  {/* Origin connection badge */}
                  <div className="text-[8px] font-black text-slate-500 flex items-center justify-between uppercase tracking-wider pb-1.5 border-b border-indigo-950/40">
                    <span>Source: Citizen Report #CIV-{gig.id.slice(0, 5).toUpperCase()}</span>
                    <span className="text-yellow-400 font-extrabold flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />
                      SLA: 24h Contractor SLA
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-teal-400 uppercase tracking-widest">{gig.category}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-black text-yellow-400 uppercase bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">₹{escrowAmount} LOCKED ESCROW</span>
                      {gig.id === "CIVIQ-006B" && onDeleteIssue && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete the Active Fixer Guild gig completely from the database?")) {
                              onDeleteIssue(gig.id);
                            }
                          }}
                          className="p-1.5 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-lg transition-all active:scale-95"
                          title="Delete Active Fixer Guild"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-white">{gig.title}</h4>
                  <p className="text-[10.5px] text-slate-400 leading-normal font-semibold">{gig.description}</p>

                  {/* 🚧 PROPER STEP PROGRESS MONITOR (WITHOUT PROOF REQUIRED) */}
                  <div className="p-3.5 bg-[#070B14] border border-indigo-950/60 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-teal-300 uppercase tracking-widest flex items-center gap-1">
                        <ListTodo className="w-3.5 h-3.5 text-teal-400" />
                        Contractor Steps (No Proof)
                      </span>
                      <span className="text-[9.5px] font-mono font-black text-teal-400">{progressPct}% Complete</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#05080E] rounded-full overflow-hidden border border-indigo-950/45">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Checkable Contractor Steps */}
                    <div className="space-y-2">
                      {[
                        "Prepare area & excavate loose asphalt",
                        "Pour base coarse & level asphalt patch",
                        "Clean surrounding margins & sweep residue"
                      ].map((stepName, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleToggleStep(gig.id, sIdx)}
                          className="w-full flex items-center gap-2.5 text-left text-[10px] text-slate-300 font-bold hover:text-white transition-colors"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                            steps[sIdx] 
                              ? "bg-teal-600 border-transparent text-white" 
                              : "border-indigo-950 bg-[#05080E]"
                          }`}>
                            {steps[sIdx] && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                          </div>
                          <span className={steps[sIdx] ? "line-through text-slate-500" : ""}>{stepName}</span>
                        </button>
                      ))}
                    </div>

                    {/* STEP NOTE LOG INPUT */}
                    <div className="pt-2 border-t border-indigo-950/40">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-1">Log Engineering Step (No Proof)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. Cleared 2x3ft area, ready to lay aggregate base."
                          value={activeNoteText[gig.id] || ""}
                          onChange={(e) => setActiveNoteText({
                            ...activeNoteText,
                            [gig.id]: e.target.value
                          })}
                          className="flex-1 h-8 px-2.5 bg-[#05080E] border border-indigo-950 rounded-lg text-[10px] text-white focus:outline-none focus:border-teal-500"
                        />
                        <button
                          onClick={() => handleAddProgressNote(gig.id)}
                          className="px-3 bg-teal-950 border border-teal-900 text-teal-300 rounded-lg text-[9px] font-extrabold uppercase hover:text-white hover:bg-teal-900 transition-all"
                        >
                          Log Update
                        </button>
                      </div>
                    </div>

                    {/* NOTES FEED HISTORY */}
                    {notes.length > 0 && (
                      <div className="bg-[#05080E]/40 border border-dashed border-teal-950/40 rounded-xl p-2 max-h-[80px] overflow-y-auto space-y-1">
                        <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest block">Contractor Ledger Logs</span>
                        {notes.map((note, nIdx) => (
                          <p key={nIdx} className="text-[8.5px] text-slate-400 font-semibold leading-relaxed">
                            {note}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Photo attachments before/after */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-indigo-950/50 bg-[#070B14]/40 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
                      {beforePhoto ? (
                        <div className="flex flex-col items-center gap-1">
                          <img src={beforePhoto} alt="before" className="w-20 h-14 object-cover rounded border border-indigo-950" />
                          <span className="text-[8px] font-black uppercase text-teal-400 mt-1">📸 Before Photo</span>
                        </div>
                      ) : (
                        <button onClick={() => handleCaptureBefore(gig.id)} className="flex flex-col items-center text-slate-400 text-[9.5px] font-black uppercase tracking-wider gap-1">
                          <UploadCloud className="w-5 h-5 text-teal-500 animate-pulse" />
                          Upload Before
                        </button>
                      )}
                    </div>

                    <div className="border border-indigo-950/50 bg-[#070B14]/40 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
                      {afterPhoto ? (
                        <div className="flex flex-col items-center gap-1">
                          <img src={afterPhoto} alt="after" className="w-20 h-14 object-cover rounded border border-indigo-950" />
                          <span className="text-[8px] font-black uppercase text-teal-400 mt-1">📸 After Photo</span>
                        </div>
                      ) : (
                        <button onClick={() => handleCaptureAfter(gig.id)} className="flex flex-col items-center text-slate-400 text-[9.5px] font-black uppercase tracking-wider gap-1">
                          <UploadCloud className="w-5 h-5 text-teal-500 animate-pulse" />
                          Upload After
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Gemini Quality Review Inspect */}
                  {beforePhoto && afterPhoto && (
                    <div>
                      {isChecking ? (
                        <div className="bg-teal-950/25 border border-teal-900/40 p-3 rounded-xl flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
                          <span className="text-[10px] font-bold text-teal-400">Gemini AI Inspecting Repair Quality...</span>
                        </div>
                      ) : reviewResult ? (
                        <div className={`p-3 rounded-xl border flex flex-col ${
                          reviewResult.approved
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-rose-500/10 border-rose-500/20"
                        }`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">AI Quality Inspection Report</span>
                            <span className="text-[9px] font-black font-mono text-teal-400">Score: {reviewResult.score}/10</span>
                          </div>
                          
                          <p className="text-[10.5px] font-black text-slate-200">
                            {reviewResult.approved ? "✅ Repair Approved! Workmanship verified." : "❌ Work Insufficient. Edges unsealed."}
                          </p>
                          <p className="text-[9.5px] text-slate-400 mt-1 leading-relaxed italic">
                            Feedback: {reviewResult.feedback}
                          </p>

                          {reviewResult.approved ? (
                            <div className="flex flex-col gap-2 mt-3">
                              <button
                                onClick={() => handleReleasePayment(gig.id, escrowAmount, reviewResult.score)}
                                className="h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                              >
                                <Coins className="w-4 h-4 animate-bounce" />
                                Release ₹{escrowAmount} Escrow Payment
                              </button>
                              <button
                                onClick={() => onAbandonFixerJob(gig.id)}
                                className="h-8 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 border border-rose-500/15 font-black text-[9px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 transition-all"
                              >
                                <Undo2 className="w-3 h-3 text-rose-400 mr-1" />
                                <span>Took by mistake? Undo & Withdraw</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => onAbandonFixerJob(gig.id)}
                                className="flex-1 h-10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 font-black text-[9px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 transition-all"
                              >
                                <Undo2 className="w-3.5 h-3.5 text-rose-500 mr-1" />
                                <span>Undo Claim</span>
                              </button>
                              <button
                                onClick={() => runAiReview(gig.id)}
                                className="flex-[1.5] h-10 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all"
                              >
                                Re-submit
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onAbandonFixerJob(gig.id)}
                            className="flex-1 h-11 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 font-black text-[9px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95"
                          >
                            <Undo2 className="w-3.5 h-3.5 text-rose-500 mr-1" />
                            <span>Undo Claim</span>
                          </button>
                          <button
                            onClick={() => runAiReview(gig.id)}
                            disabled={progressPct < 100}
                            className={`flex-[1.5] h-11 text-white font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all ${
                              progressPct === 100
                                ? "bg-teal-600 hover:bg-teal-500 shadow-teal-500/10 active:scale-95"
                                : "bg-indigo-950 border border-indigo-900/60 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                            {progressPct < 100 ? "Complete Steps" : "Verify with AI"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )
        )}

        {/* COMPLETED GIGS */}
        {activeSubTab === "COMPLETED" && (
          completedGigs.length === 0 ? (
            <div className="text-center text-slate-400 mt-12 flex flex-col items-center justify-center p-6">
              <CheckCircle2 className="w-12 h-12 text-slate-600" />
              <h4 className="text-xs font-black mt-3 text-white">No Completed Gigs</h4>
            </div>
          ) : (
            completedGigs.map((gig) => {
              const match = gig.payment.match(/₹\s*(\d+)/);
              const amount = match ? match[1] : (gig.id === "CIVIQ-006" ? "650" : "800");
              return (
                <div
                  key={gig.id}
                  className="bg-[#0E1524]/60 border border-indigo-950/80 rounded-xl p-3 flex justify-between items-center shadow-sm relative overflow-hidden"
                >
                  <div className="pl-2">
                    <h4 className="text-xs font-black text-slate-200 line-clamp-1">{gig.title}</h4>
                    <span className="text-[9px] text-teal-400 font-extrabold block mt-0.5">💸 Escrow Settled & Disbursed (₹{amount})</span>
                    <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">Origin Report: #CIV-{gig.id.slice(0, 5).toUpperCase()}</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                </div>
              );
            })
          )
        )}

      </div>

      {/* RESPONSIBILITY CHOICE MODAL */}
      <AnimatePresence>
        {pendingClaimGig && (
          <div className="absolute inset-0 bg-black/75 z-50 flex flex-col justify-end animate-fade-in">
            <div className="flex-1" onClick={() => setPendingClaimGig(null)} />
            
            <div className="bg-[#0E1524] rounded-t-3xl border-t border-teal-500/30 p-5 space-y-4 animate-slide-up max-h-[85%] overflow-y-auto">
              
              {/* Header */}
              <div className="flex justify-between items-start pb-2 border-b border-indigo-950/40">
                <div>
                  <span className="text-[8px] font-black bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                    Sign Professional Guild Contract 🔧
                  </span>
                  <h3 className="text-xs font-black text-white mt-2">{pendingClaimGig.title}</h3>
                </div>
                <button 
                  onClick={() => setPendingClaimGig(null)}
                  className="text-slate-500 hover:text-white font-bold text-xs p-1"
                >
                  ✕
                </button>
              </div>

              {/* Connected details */}
              <div className="bg-[#070B14] p-3 rounded-xl border border-indigo-950/80 text-[10px] space-y-1">
                <span className="text-teal-400 font-black uppercase tracking-wider block text-[8px]">WARD ENGINEER CONTRACT ASSIGNMENT:</span>
                <p className="text-slate-400 font-semibold leading-relaxed">
                  Dispatched under municipal resolution code by BBMP Ward Office from original citizen report <span className="text-white">#CIV-{pendingClaimGig.id.slice(0, 5).toUpperCase()}</span>.
                </p>
              </div>

              {/* Choice of Responsibilities checklist */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Review Guild Contract Responsibilities</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    selectedResponsibilities.length === fixerResponsibilities.length 
                      ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}>
                    {selectedResponsibilities.length === fixerResponsibilities.length ? "All Responsibilities Verified ✓" : `${selectedResponsibilities.length}/${fixerResponsibilities.length} Checked`}
                  </span>
                </div>
                <p className="text-[8.5px] text-slate-500 leading-normal">
                  You must review and tick each of the core engineering responsibilities before signing the professional contract:
                </p>

                <div className="space-y-2 mt-2">
                  {fixerResponsibilities.map((resp) => {
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
                            ? "bg-teal-500/10 border-teal-500 text-white"
                            : "bg-[#070B14] border-indigo-950 text-slate-400 hover:border-indigo-900"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          isChecked ? "bg-teal-500 border-transparent text-white" : "border-indigo-900 bg-[#05080E]"
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
              {selectedResponsibilities.length === fixerResponsibilities.length && (
                <div className="p-3 bg-[#070B14] border border-teal-500/30 rounded-xl space-y-2 animate-fade-in">
                  <label className="block text-[9px] font-black text-teal-400 uppercase tracking-widest">
                    🖋️ Digital Signature Authorization
                  </label>
                  <p className="text-[8.5px] text-slate-400 font-semibold">
                    Type your full name to sign this municipal service Level Agreement contract:
                  </p>
                  <input
                    type="text"
                    value={contractSignature}
                    onChange={(e) => setContractSignature(e.target.value)}
                    placeholder="Type full name to sign (e.g. Rajesh Kumar)"
                    className="w-full p-2.5 bg-[#0A0F1D] border border-teal-950/80 focus:border-teal-500 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                  {contractSignature.trim() && (
                    <div className="text-[9.5px] text-teal-400 font-mono font-black border-t border-teal-950/60 pt-1.5 flex justify-between">
                      <span>✓ Digitally Signed: {contractSignature}</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Deadline reminder and warning */}
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 rounded-xl text-[9.5px] font-semibold leading-relaxed flex gap-2.5 items-start">
                <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black block uppercase text-[8.5px] tracking-wider mb-0.5">Guild SLA Contractor Policy</span>
                  By accepting this professional gig, you commit to resolve the defect within the <b>24-hour contractor SLA</b> and pass the Gemini AI photogrammetry review.
                </div>
              </div>

              {/* Accept & start duty */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmClaim}
                  disabled={selectedResponsibilities.length !== fixerResponsibilities.length || !contractSignature.trim()}
                  className={`w-full h-11 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all ${
                    (selectedResponsibilities.length === fixerResponsibilities.length && contractSignature.trim())
                      ? "bg-teal-600 hover:bg-teal-500 active:scale-98 cursor-pointer shadow-lg shadow-teal-500/10"
                      : "bg-[#0E1524]/60 border border-indigo-950/80 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {selectedResponsibilities.length !== fixerResponsibilities.length
                    ? `Verify Responsibilities (${selectedResponsibilities.length}/${fixerResponsibilities.length})`
                    : !contractSignature.trim()
                    ? "Type Name to Sign Contract"
                    : "Sign Contract & Start Work"
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
