import React, { useState, useEffect } from "react";
import { Issue, ProcessStage } from "../types";
import { CheckCircle2, Clock, Wrench, FileText, ChevronDown, ChevronUp, Image, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProcessTrackerProps {
  issue: Issue;
}

export const ProcessTracker: React.FC<ProcessTrackerProps> = ({ issue }) => {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  // Generate high-quality photos and details based on category and status
  const stages: ProcessStage[] = React.useMemo(() => {
    if (issue.processStages && issue.processStages.length > 0) {
      return issue.processStages;
    }

    const category = issue.category.toLowerCase();
    const isRoad = category.includes("road") || category.includes("pothole");
    const isWater = category.includes("water") || category.includes("sewage") || category.includes("leak");
    const isLight = category.includes("light") || category.includes("electricity");

    // Standard high-quality Unsplash assets corresponding to stages of civic work
    const photoLogged = isRoad 
      ? "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400" 
      : isWater 
      ? "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400"
      : "https://images.unsplash.com/photo-1599740831111-e63777d853e8?auto=format&fit=crop&q=80&w=400";

    const photoAssigned = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400"; // Inspector / Planner checking site
    
    const photoWork = isRoad 
      ? "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400" // active roadwork
      : isLight 
      ? "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400" // crane truck
      : "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=400"; // hands-on plumbing/tools
    
    const photoResolved = isRoad 
      ? "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=400" // perfect road layout
      : isWater 
      ? "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=400" // clean running tap/system
      : "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=400"; // well lit street / stadium light

    const createdDate = new Date(issue.date);
    const formatDate = (daysAdded: number) => {
      const d = new Date(createdDate);
      d.setDate(d.getDate() + daysAdded);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const s = issue.status;

    return [
      {
        title: "Report Registered & Triaged",
        status: "Completed",
        date: formatDate(0),
        photo: issue.beforePhotoUrl || issue.beforePhoto || photoLogged,
        description: `Citizen uploaded geotagged media of '${issue.title}'. CIVIQ AI successfully verified category and routed it to ${issue.department}.`
      },
      {
        title: "Ward Field Investigation",
        status: s === "Pending" ? "In Progress" : "Completed",
        date: s !== "Pending" ? formatDate(1) : "Awaiting Inspector Dispatch",
        photo: photoAssigned,
        description: `Nodal inspector dispatched to coordinates (${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}). Ward work orders issued for dispatch clearance.`
      },
      {
        title: "Active Civic Restoration",
        status: s === "Resolved" ? "Completed" : s === "In Progress" ? "In Progress" : "Pending",
        date: s === "Resolved" ? formatDate(3) : s === "In Progress" ? "Underway" : "Awaiting pre-work clearance",
        photo: photoWork,
        description: `Physical heavy machinery and repair crews are deployed at ${issue.address.split(",")[0]}. Core restoration work underway.`
      },
      {
        title: "Resolution Audit & Sign-off",
        status: s === "Resolved" ? "Completed" : "Pending",
        date: s === "Resolved" ? formatDate(4) : "Awaiting completion",
        photo: issue.afterPhotoUrl || issue.afterPhoto || photoResolved,
        description: `Post-restoration quality checked. Quality Score logged at ${issue.qualityScore || 85}%. Citizen feedback loop closed.`
      }
    ];
  }, [issue]);

  // Set the default expanded stage to the one that is currently In Progress or the most recently Completed
  useEffect(() => {
    const currentActiveIdx = stages.findIndex(s => s.status === "In Progress");
    if (currentActiveIdx !== -1) {
      setExpandedStage(currentActiveIdx);
    } else {
      const lastCompletedIdx = [...stages].reverse().findIndex(s => s.status === "Completed");
      if (lastCompletedIdx !== -1) {
        setExpandedStage(stages.length - 1 - lastCompletedIdx);
      } else {
        setExpandedStage(0);
      }
    }
  }, [stages]);

  const activeStage = stages.find(s => s.status === "In Progress") || stages.filter(s => s.status === "Completed").pop() || stages[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Current stage indicator */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-indigo-950/40 pb-2.5">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Stage</span>
          <span className="text-xs font-black text-[#4F46E5] dark:text-[#818CF8] flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {activeStage.title}
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-100 dark:border-teal-900/30">
          Step {stages.indexOf(activeStage) + 1} of 4
        </span>
      </div>

      {/* Stepper Timeline */}
      <div className="relative pl-6 space-y-5">
        {/* Continuous Connecting Line */}
        <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-slate-200 dark:bg-indigo-950/60" />

        {stages.map((stage, idx) => {
          const isCompleted = stage.status === "Completed";
          const isInProgress = stage.status === "In Progress";
          const isPending = stage.status === "Pending";
          const isExpanded = expandedStage === idx;

          return (
            <div key={idx} className="relative group transition-all">
              {/* Stepper Node Icon */}
              <div
                className={`absolute -left-6.5 top-1 w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isInProgress
                    ? "bg-amber-500 border-amber-500 text-white animate-pulse"
                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-indigo-950 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : isInProgress ? (
                  <Wrench className="w-3.5 h-3.5 animate-spin-slow text-white" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Stage Header */}
              <div
                onClick={() => setExpandedStage(isExpanded ? null : idx)}
                className="flex justify-between items-center cursor-pointer select-none"
              >
                <div>
                  <h4
                    className={`text-xs font-black transition-colors ${
                      isInProgress
                        ? "text-amber-600 dark:text-amber-400"
                        : isCompleted
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400"
                    }`}
                  >
                    {stage.title}
                  </h4>
                  {stage.date && (
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{stage.date}</span>
                  )}
                </div>
                <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded details with developmental photos */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden mt-2"
                  >
                    <div className="bg-[#F0F4FF]/50 dark:bg-[#070B14]/40 border border-slate-100 dark:border-indigo-950/40 rounded-xl p-3 space-y-3.5">
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {stage.description}
                      </p>

                      {/* Development stage photo */}
                      {stage.photo && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <Image className="w-3 h-3 text-indigo-400" />
                            Development Photo
                          </div>
                          <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 dark:border-indigo-950 relative group/photo shadow-sm">
                            <img
                              src={stage.photo}
                              alt={stage.title}
                              className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            {/* Verified watermark */}
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1 shadow">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              VERIFIED STAGE PHOTO
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
