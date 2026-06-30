import React, { useState, useMemo, useEffect } from "react";
import { Issue, UserStats } from "../../types";
import { Search, SlidersHorizontal, MapPin, ThumbsUp, Bookmark, ChevronLeft, ChevronRight, Play, Grid, ToggleLeft, ToggleRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FeedViewProps {
  issues: Issue[];
  onUpvoteIssue: (id: string) => void;
  onSelectIssue: (issue: Issue) => void;
  onToggleSaveIssue: (id: string) => void;
  onOpenMapAtIssue?: (id: string) => void; // Prop for centering map on click
  userStats?: UserStats;
  onUpdateUserStats?: (updated: Partial<UserStats>) => void;
}

// Modular FeedCard with swipeable/slideable visual media carousel
const FeedCard: React.FC<{
  issue: Issue;
  isSecond?: boolean;
  onSelectIssue: (issue: Issue) => void;
  onUpvoteIssue: (id: string) => void;
  onToggleSaveIssue: (id: string) => void;
  onOpenMapAtIssue?: (id: string) => void;
}> = ({ issue, isSecond, onSelectIssue, onUpvoteIssue, onToggleSaveIssue, onOpenMapAtIssue }) => {
  const [currentMediaIdx, setCurrentMediaIdx] = useState<number>(0);

  // Generate media list for carousel
  const mediaList = useMemo(() => {
    const list: { type: "image" | "video"; url: string; label: string }[] = [];
    
    // 1. Primary Photo
    if (issue.beforePhotoUrl) {
      list.push({ type: "image", url: issue.beforePhotoUrl, label: "Primary Incident Photo" });
    } else {
      const categoryLower = issue.category.toLowerCase();
      let primaryUrl = "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&q=80";
      if (categoryLower.includes("water") || categoryLower.includes("drain") || categoryLower.includes("sewage")) {
        primaryUrl = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80";
      } else if (categoryLower.includes("pothole") || categoryLower.includes("road") || categoryLower.includes("street")) {
        primaryUrl = "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=400&q=80";
      } else if (categoryLower.includes("light") || categoryLower.includes("electric")) {
        primaryUrl = "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=400&q=80";
      } else if (categoryLower.includes("garbage") || categoryLower.includes("waste") || categoryLower.includes("trash")) {
        primaryUrl = "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&q=80";
      }
      list.push({ type: "image", url: primaryUrl, label: "Primary Incident Photo" });
    }

    // 2. Secondary Photo
    let secondaryUrl = "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80";
    const categoryLower = issue.category.toLowerCase();
    if (categoryLower.includes("water") || categoryLower.includes("drain") || categoryLower.includes("sewage")) {
      secondaryUrl = "https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=400&q=80";
    } else if (categoryLower.includes("pothole") || categoryLower.includes("road") || categoryLower.includes("street")) {
      secondaryUrl = "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=400&q=80";
    } else if (categoryLower.includes("light") || categoryLower.includes("electric")) {
      secondaryUrl = "https://images.unsplash.com/photo-1473116763269-255ea7427be2?w=400&q=80";
    } else if (categoryLower.includes("garbage") || categoryLower.includes("waste") || categoryLower.includes("trash")) {
      secondaryUrl = "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&q=80";
    }
    list.push({ type: "image", url: secondaryUrl, label: "Detail Angle Photo" });

    // 3. Resolution Success Photo if resolved
    if (issue.status === "Resolved") {
      if (issue.afterPhotoUrl) {
        list.push({ type: "image", url: issue.afterPhotoUrl, label: "Resolution Success Photo" });
      } else {
        list.push({ type: "image", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80", label: "Resolution Success Photo" });
      }
    }

    // 4. Video Evidence
    const videoUrl = issue.video || "https://assets.mixkit.co/videos/preview/mixkit-flowing-water-under-a-small-bridge-41662-large.mp4";
    list.push({ type: "video", url: videoUrl, label: "Video Evidence (Triage Loop)" });

    return list;
  }, [issue]);

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIdx((prev) => (prev + 1) % mediaList.length);
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIdx((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const severityColor =
    issue.severity === "Critical"
      ? "bg-rose-500"
      : issue.severity === "High"
      ? "bg-orange-500"
      : issue.severity === "Medium"
      ? "bg-amber-500"
      : "bg-emerald-500";

  const isVoted = issue.isVoted;

  return (
    <div
      onClick={() => onSelectIssue(issue)}
      className="issue-card-gradient border border-slate-200/85 dark:border-indigo-950/80 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all relative overflow-hidden flex flex-col gap-3 animate-fade-in group"
    >
      {/* Severity Left indicator strip */}
      <div className={`issue-card-border-strip ${severityColor}`} />

      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[9.5px] font-black text-[#4F46E5] dark:text-[#818CF8] bg-indigo-50 dark:bg-[#1B253D]/40 px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/30 self-start">
            {issue.category}
          </span>
          <span className="text-[9px] font-semibold text-slate-400 mt-1">
            #{issue.id} by {issue.reportedBy || "@citizen"}
          </span>
        </div>
        <div className="flex gap-1.5 items-center">
          {issue.reopenCount && issue.reopenCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Reopened {issue.reopenCount}x
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black text-white ${severityColor}`}>
            {issue.severity}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black bg-slate-100 dark:bg-[#1B253D] text-slate-500 dark:text-slate-400">
            {issue.status}
          </span>
        </div>
      </div>

      {/* HORIZONTALLY DRAGGABLE EVIDENCE GALLERY (ONLY IN SECOND ONE) */}
      {isSecond && (
        <div 
          className="flex gap-2.5 overflow-x-auto pb-1.5 snap-x scrollbar-none select-none scroll-smooth touch-pan-x" 
          onClick={(e) => e.stopPropagation()}
        >
          {mediaList.map((media, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl overflow-hidden border border-slate-200/50 dark:border-indigo-950/40 bg-slate-900 flex-shrink-0 snap-center h-32 ${
                mediaList.length === 1 ? "w-full" : "w-52"
              }`}
            >
              {media.type === "video" ? (
                <div className="relative w-full h-full">
                  {/* Play indicator */}
                  <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center z-10 text-white gap-1 p-2">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shadow animate-pulse">
                      <Play className="w-4 h-4 fill-current text-white pl-0.5" />
                    </div>
                    <span className="text-[7.5px] font-black tracking-widest uppercase bg-black/60 px-1.5 py-0.5 rounded">Video Evidence</span>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80" 
                    alt="video preview" 
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
              ) : (
                <img
                  src={media.url}
                  alt={media.label}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              
              {/* Media label */}
              <span className="absolute top-2 left-2 bg-black/65 backdrop-blur-3xs text-white text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded z-20">
                {media.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Text Details */}
      <div className="space-y-1">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
          {issue.title}
        </h3>
        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-semibold">
          {issue.description}
        </p>
      </div>

      {/* Address & Upvote Section */}
      <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-indigo-950/40 text-[10px] text-slate-400">
        
        {/* STATIC LOCATION ADDRESS */}
        <div className="truncate max-w-[160px] flex items-center gap-1 text-slate-400 font-bold text-left">
          <MapPin className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818CF8] shrink-0" />
          <span className="truncate">{issue.address}</span>
        </div>

        {/* Like & Save Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpvoteIssue(issue.id);
            }}
            className={`flex items-center gap-1 font-extrabold transition-all hover:scale-105 active:scale-95 ${
              isVoted ? "text-[#4F46E5] dark:text-[#818CF8]" : "text-slate-400"
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? "fill-current" : ""}`} />
            <span>{issue.upvotes}</span>
          </button>

          <span className="text-slate-200 dark:text-indigo-950/60 font-light">|</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSaveIssue(issue.id);
            }}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1B253D] transition-colors ${
              issue.isSaved ? "text-amber-500" : "text-slate-400"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${issue.isSaved ? "fill-current" : ""}`} />
          </button>
        </div>

      </div>

    </div>
  );
};

// Skeleton Card
const FeedCardSkeleton = () => (
  <div className="issue-card-gradient border border-slate-200/80 dark:border-indigo-950/80 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col space-y-3">
    <div className="issue-card-border-strip bg-slate-200 dark:bg-slate-800" />
    <div className="flex justify-between items-center">
      <div className="w-16 h-4.5 rounded-md animate-shimmer" />
      <div className="w-20 h-4.5 rounded-full animate-shimmer" />
    </div>
    <div className="w-full h-32 rounded-xl bg-slate-200/40 dark:bg-slate-800/20 animate-shimmer" />
    <div className="w-3/4 h-3.5 rounded animate-shimmer" />
    <div className="space-y-1">
      <div className="w-full h-2.5 rounded animate-shimmer" />
      <div className="w-5/6 h-2.5 rounded animate-shimmer" />
    </div>
  </div>
);

export const FeedView: React.FC<FeedViewProps> = ({ 
  issues, 
  onUpvoteIssue, 
  onSelectIssue, 
  onToggleSaveIssue,
  onOpenMapAtIssue,
  userStats,
  onUpdateUserStats
}) => {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("All"); // Defaults search query empty
  const [showFilterSheet, setShowFilterSheet] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [groupSimilarProblems, setGroupSimilarProblems] = useState<boolean>(false); // Same Problem Clustering toggle
  const [verifiedIssues, setVerifiedIssues] = useState<string[]>([]);
  const [verifiedIssuesHistory, setVerifiedIssuesHistory] = useState<any[]>([]);

  // Safety photo inspection tracking
  const [inspectedPhotos, setInspectedPhotos] = useState<{ [id: string]: { before: boolean; during: boolean; after: boolean } }>({});
  const [activeAuditStep, setActiveAuditStep] = useState<{ [id: string]: "before" | "during" | "after" }>({});

  const handleStepClick = (issueId: string, step: "before" | "during" | "after") => {
    setActiveAuditStep(prev => ({ ...prev, [issueId]: step }));
    setInspectedPhotos(prev => {
      const current = prev[issueId] || { before: false, during: false, after: false };
      return { ...prev, [issueId]: { ...current, [step]: true } };
    });
  };

  // Active Filter states
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const tabs = ["NEARBY", "ALL", "CRITICAL", "IN PROGRESS", "RESOLVED", "VERIFY AUDIT"];

  // Simulated content loading effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, selectedSeverity, selectedCategory, groupSimilarProblems, userStats]);

  // Clean raw search query (normalize "All" text default placeholder)
  const normalizedQuery = searchQuery === "All" ? "" : searchQuery;

  // Filter issues based on tabs, queries, and sheet selections
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (activeTab === "CRITICAL" && issue.severity !== "Critical") return false;
      if (activeTab === "IN PROGRESS" && issue.status !== "In Progress") return false;
      if (activeTab === "RESOLVED" && issue.status !== "Resolved") return false;
      
      if (activeTab === "NEARBY") {
        if (issue.status === "Resolved" || issue.id === "CIVIQ-011") return false;
        
        // Filter specifically by user's residing area or ward
        const areaClean = userStats?.residingArea?.toLowerCase() || "";
        const wardClean = userStats?.ward?.toLowerCase() || "";
        
        const inArea = areaClean && issue.address.toLowerCase().includes(areaClean);
        const inWard = wardClean && (
          issue.address.toLowerCase().includes(wardClean) ||
          (wardClean.match(/\d+/) && issue.address.toLowerCase().includes(wardClean.match(/\d+/)![0]))
        );
        
        if (!inArea && !inWard) return false;
      }

      if (normalizedQuery) {
        const query = normalizedQuery.toLowerCase();
        const inTitle = issue.title.toLowerCase().includes(query);
        const inDesc = issue.description.toLowerCase().includes(query);
        const inAddress = issue.address.toLowerCase().includes(query);
        const inId = issue.id.toLowerCase().includes(query);
        if (!inTitle && !inDesc && !inAddress && !inId) return false;
      }

      if (selectedSeverity !== "All" && issue.severity !== selectedSeverity) return false;
      if (selectedCategory !== "All" && !issue.category.includes(selectedCategory)) return false;

      return true;
    });
  }, [issues, activeTab, normalizedQuery, selectedSeverity, selectedCategory, userStats]);

  // Group locations for required problems (same problem in similar area)
  const clusteredGroups = useMemo(() => {
    if (!groupSimilarProblems) return [];

    const grouped: { [key: string]: Issue[] } = {};
    filteredIssues.forEach((issue) => {
      // General area cluster grouping key
      let area = "General Area";
      if (issue.address.includes("Indiranagar")) area = "Indiranagar";
      else if (issue.address.includes("Koramangala")) area = "Koramangala";
      else if (issue.address.includes("HSR Layout")) area = "HSR Layout";
      else if (issue.address.includes("JP Nagar")) area = "JP Nagar";
      else if (issue.address.includes("Whitefield")) area = "Whitefield";
      else if (issue.address.includes("Silk Board")) area = "Koramangala";

      // Group by Category + Area (Same category problems in same area)
      const groupKey = `${issue.category}-${area}`;
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(issue);
    });

    return Object.entries(grouped).map(([key, spotIssues]) => {
      const [category, area] = key.split("-");
      return {
        key,
        category,
        area,
        spotIssues
      };
    });
  }, [filteredIssues, groupSimilarProblems]);

  return (
    <div className="w-full h-full bg-[#F0F4FF] dark:bg-[#070B14] flex flex-col justify-between text-slate-800 dark:text-slate-100 select-none relative overflow-hidden">
      
      {/* HEADER TABS & SEARCH CONTAINER */}
      <div className="bg-[#F0F4FF] dark:bg-[#070B14] border-b border-slate-200 dark:border-indigo-950 p-4 pb-1.5 shadow-sm shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">Search Reports</h2>
            <p className="text-[9.5px] text-slate-400 mt-0.5 font-semibold">Triage, swipe evidence & trace hotspots</p>
          </div>

          {/* Group Problem Cluster Toggle at Top */}
          <button
            onClick={() => setGroupSimilarProblems(!groupSimilarProblems)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all hover:scale-102 ${
              groupSimilarProblems
                ? "bg-teal-600/15 border-teal-500/35 text-teal-400"
                : "bg-slate-50 dark:bg-[#0E1524] border-slate-200 dark:border-indigo-950 text-slate-400 hover:text-slate-300"
            }`}
            title="Group same problems in the same areas together"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Group Spots</span>
          </button>
        </div>

        {/* Search & Filter Row (Above Tabs) */}
        <div className="flex gap-2 items-center mt-3">
          <div className="flex-1 bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-indigo-950 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports, IDs, locations..."
              value={searchQuery === "All" ? "" : searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none w-full text-slate-800 dark:text-slate-200 font-semibold"
            />
            {searchQuery && searchQuery !== "All" && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            )}
          </div>

          <button
            onClick={() => setShowFilterSheet(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-indigo-950 bg-white dark:bg-[#0E1524] text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-sm relative active:scale-95 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {(selectedSeverity !== "All" || selectedCategory !== "All") && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
            )}
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex gap-4 overflow-x-auto mt-3 pb-1 border-b border-slate-100 dark:border-indigo-950 scrollbar-none snap-x">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 text-xs font-black pb-1.5 border-b-2 snap-start ${
                activeTab === tab
                  ? "border-[#4F46E5] dark:border-[#818CF8] text-[#4F46E5] dark:text-[#818CF8]"
                  : "border-transparent text-slate-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH/FILTER RESULTS LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "VERIFY AUDIT" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[10.5px] font-semibold text-amber-600 dark:text-amber-300 leading-relaxed mb-1 flex gap-2.5 items-start shadow-inner">
              <span className="text-sm shrink-0">🛡️</span>
              <div>
                <span className="font-black block uppercase text-[9px] tracking-wider text-[#4F46E5] dark:text-white">Citizen Audit Ledger</span>
                To maintain standard contractor accountability, citizens must audit and verify resolved work orders. Approving a fix releases escrow funds from RWA reserves to contractors. <b>Auditing grants +50 PTS.</b>
              </div>
            </div>

            {/* List resolved issues for audit */}
            {issues.filter(i => i.status === "Resolved").length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-xs">No resolved work orders require verification right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.filter(i => i.status === "Resolved").map((issue) => {
                  const isVerified = verifiedIssues.includes(issue.id);
                  return (
                    <div 
                      key={issue.id}
                      className="bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-indigo-950 rounded-2xl p-4 shadow-sm space-y-3"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start pb-2 border-b border-slate-150 dark:border-indigo-950/40">
                        <div>
                          <span className="text-[8px] font-black bg-indigo-500/10 text-[#4F46E5] dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                            ID: #{issue.id}
                          </span>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1.5">{issue.title}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider shrink-0 ${
                          isVerified ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {isVerified ? "Approved & Certified" : "Pending Audit"}
                        </span>
                      </div>

                      {/* Description & Contractor details */}
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                        {issue.description}
                      </p>

                      <div className="bg-slate-50 dark:bg-[#070B14] p-3 rounded-xl border border-slate-150 dark:border-indigo-950/40 space-y-1.5">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Contractor Resolution Checklist</span>
                        <ul className="space-y-1">
                          {issue.actionItems && issue.actionItems.map((item, idx) => (
                            <li key={idx} className="text-[9.5px] text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                              <span className="text-emerald-500 font-bold">✓</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Step-by-step visual audit comparison (Required Before/During/After visual checklist) */}
                      {!isVerified && (
                        <div className="border border-slate-150 dark:border-indigo-950 p-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] space-y-3">
                          <div className="flex justify-between items-center pb-1.5 border-b border-slate-150 dark:border-indigo-950/30">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Required Proof Ledger Inspection
                            </span>
                            <span className="text-[8px] font-mono text-amber-500 font-bold">
                              {((inspectedPhotos[issue.id]?.before ? 1 : 0) + (inspectedPhotos[issue.id]?.during ? 1 : 0) + (inspectedPhotos[issue.id]?.after ? 1 : 0))} / 3 Viewed
                            </span>
                          </div>

                          {/* Steps toggle selector */}
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStepClick(issue.id, "before")}
                              className={`py-1 rounded text-[8.5px] font-black uppercase tracking-wider transition-all border ${
                                (activeAuditStep[issue.id] || "before") === "before"
                                  ? "bg-rose-500/10 border-rose-500/40 text-rose-500"
                                  : inspectedPhotos[issue.id]?.before
                                  ? "bg-slate-100 dark:bg-[#0E1524] border-slate-200 dark:border-indigo-950 text-rose-400"
                                  : "bg-slate-100 dark:bg-[#0E1524] border-slate-200 dark:border-indigo-950 text-slate-400"
                              }`}
                            >
                              1. Before {inspectedPhotos[issue.id]?.before && "✓"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStepClick(issue.id, "during")}
                              className={`py-1 rounded text-[8.5px] font-black uppercase tracking-wider transition-all border ${
                                activeAuditStep[issue.id] === "during"
                                  ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                                  : inspectedPhotos[issue.id]?.during
                                  ? "bg-slate-100 dark:bg-[#0E1524] border-slate-200 dark:border-indigo-950 text-amber-400"
                                  : "bg-slate-100 dark:bg-[#0E1524] border-slate-200 dark:border-indigo-950 text-slate-400"
                              }`}
                            >
                              2. Process {inspectedPhotos[issue.id]?.during && "✓"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStepClick(issue.id, "after")}
                              className={`py-1 rounded text-[8.5px] font-black uppercase tracking-wider transition-all border ${
                                activeAuditStep[issue.id] === "after"
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                                  : inspectedPhotos[issue.id]?.after
                                  ? "bg-slate-100 dark:bg-[#0E1524] border-slate-200 dark:border-indigo-950 text-emerald-400"
                                  : "bg-slate-100 dark:bg-[#0E1524] border-slate-200 dark:border-indigo-950 text-slate-400"
                              }`}
                            >
                              3. After {inspectedPhotos[issue.id]?.after && "✓"}
                            </button>
                          </div>

                          {/* Phase Visual Panel */}
                          <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-250 dark:border-indigo-950">
                            {/* Step 1: Before */}
                            {((activeAuditStep[issue.id] || "before") === "before") && (
                              <div className="absolute inset-0 flex flex-col justify-end bg-black/60">
                                <img
                                  src={issue.beforePhotoUrl || "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&q=80"}
                                  alt="Before incident"
                                  className="absolute inset-0 w-full h-full object-cover -z-10"
                                />
                                <div className="p-2 bg-gradient-to-t from-black to-transparent text-[8.5px] text-white">
                                  <span className="font-extrabold text-rose-400 uppercase block tracking-wider">Phase 1: Initial Hazard State</span>
                                  <span>Logged by citizen complainant. Severity category: {issue.severity}.</span>
                                </div>
                              </div>
                            )}

                            {/* Step 2: During */}
                            {(activeAuditStep[issue.id] === "during") && (
                              <div className="absolute inset-0 flex flex-col justify-end bg-black/65">
                                <img
                                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80"
                                  alt="During maintenance work"
                                  className="absolute inset-0 w-full h-full object-cover -z-10"
                                />
                                <div className="p-2 bg-gradient-to-t from-black to-transparent text-[8.5px] text-white">
                                  <span className="font-extrabold text-amber-400 uppercase block tracking-wider">Phase 2: Active Repair Process</span>
                                  <span>BBMP on-site teams clearing blockages and laying structures.</span>
                                </div>
                              </div>
                            )}

                            {/* Step 3: After */}
                            {(activeAuditStep[issue.id] === "after") && (
                              <div className="absolute inset-0 flex flex-col justify-end bg-black/60">
                                <img
                                  src={issue.afterPhotoUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80"}
                                  alt="After completion state"
                                  className="absolute inset-0 w-full h-full object-cover -z-10"
                                />
                                <div className="p-2 bg-gradient-to-t from-black to-transparent text-[8.5px] text-white">
                                  <span className="font-extrabold text-emerald-400 uppercase block tracking-wider">Phase 3: Final Resolution State</span>
                                  <span>Issue fully cleared, sealed, and prepared for citizen safety audit.</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action verification */}
                      {isVerified ? (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold text-center rounded-xl flex flex-col items-center justify-center gap-1">
                          <div className="flex items-center gap-1.5">
                            <span>✅ Approved by citizen {userStats?.name || "Member"}</span>
                          </div>
                          <span className="text-[8.5px] text-slate-400 dark:text-slate-500 font-mono">LEDGER REPROVED: #TX-{issue.id.slice(0, 5).toUpperCase()}-MATCH-829A</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {!(inspectedPhotos[issue.id]?.before && inspectedPhotos[issue.id]?.during && inspectedPhotos[issue.id]?.after) && (
                            <span className="text-[8.5px] text-amber-500 font-bold block text-center bg-amber-500/5 py-1 rounded border border-dashed border-amber-500/20">
                              🔒 Review BEFORE, PROCESS, and AFTER states above to unlock verification
                            </span>
                          )}
                          <div className="flex gap-2">
                            <button
                              disabled={!(inspectedPhotos[issue.id]?.before && inspectedPhotos[issue.id]?.during && inspectedPhotos[issue.id]?.after)}
                              onClick={() => {
                                setVerifiedIssues([...verifiedIssues, issue.id]);
                                if (onUpdateUserStats && userStats) {
                                  onUpdateUserStats({
                                    points: userStats.points + 50
                                  });
                                }
                              }}
                              className={`flex-1 h-9 font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 active:scale-98 ${
                                (inspectedPhotos[issue.id]?.before && inspectedPhotos[issue.id]?.during && inspectedPhotos[issue.id]?.after)
                                  ? "bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
                                  : "bg-slate-100 dark:bg-[#1E2530] text-slate-500 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-indigo-950/40"
                              }`}
                            >
                              <span>Verify fix & Approve Release</span>
                            </button>
                            <button
                              onClick={() => {
                                alert("Incomplete resolution logged. Municipal team notified for re-inspection.");
                              }}
                              className="px-3 h-9 bg-transparent border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 font-black text-[9.5px] uppercase tracking-wider rounded-xl transition-all active:scale-98"
                            >
                              Flag Defect
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "RESOLVED" && (
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10.5px] font-semibold text-indigo-300 leading-relaxed mb-1 flex gap-2.5 items-start animate-fade-in shadow-inner">
            <span className="text-sm shrink-0">📂</span>
            <div>
              <span className="font-black block uppercase text-[9px] tracking-wider text-white">Resolved Case Archives</span>
              Showing all historical resolved municipal reports. You can search by Title, Description, or ID above. If the problem has recurred, inspect the report to **Reopen** it.
            </div>
          </div>
        )}

        {activeTab === "NEARBY" && userStats && (
          <div className="p-3.5 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-[10.5px] font-semibold text-teal-300 leading-relaxed mb-1 flex gap-2.5 items-center animate-fade-in shadow-inner">
            <span className="text-sm shrink-0">📍</span>
            <div>
              <span className="font-black block uppercase text-[9px] tracking-wider text-teal-400">Localized Ward Feed</span>
              Showing active reports inside <span className="text-white font-extrabold">{userStats.ward || "Ward 80"}</span> ({userStats.residingArea || "Indiranagar"}).
            </div>
          </div>
        )}

        {isLoading ? (
          <>
            <FeedCardSkeleton />
            <FeedCardSkeleton />
          </>
        ) : groupSimilarProblems ? (
          /* Render Clustered Problems List */
          clusteredGroups.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Grid className="w-10 h-10 mx-auto opacity-30 stroke-[1.5]" />
              <h4 className="text-xs font-black mt-2">No grouped problem spots</h4>
              <p className="text-[10px] mt-1">Try disabling Group Spots or adjusting search.</p>
            </div>
          ) : (
            clusteredGroups.map((grp) => (
              <div 
                key={grp.key}
                className="bg-white dark:bg-[#0E1524] border border-teal-500/30 rounded-2xl p-4 shadow-sm space-y-3 animate-fade-in"
              >
                {/* Cluster Header */}
                <div className="flex justify-between items-start pb-2 border-b border-slate-100 dark:border-indigo-950/40">
                  <div>
                    <span className="text-[8px] font-black bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded uppercase tracking-widest">
                      Grouped Hotspot: {grp.area}
                    </span>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white mt-1">
                      {grp.category} Problems in {grp.area}
                    </h3>
                  </div>
                  <span className="text-[10px] font-black bg-teal-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                    {grp.spotIssues.length} Spots
                  </span>
                </div>

                {/* Miniature items list inside cluster */}
                <div className="space-y-2">
                  {grp.spotIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => onSelectIssue(issue)}
                      className="p-2.5 bg-slate-50 dark:bg-[#070B14]/80 border border-slate-200/50 dark:border-indigo-950/40 rounded-xl hover:border-indigo-500 cursor-pointer transition-all flex justify-between items-center"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate">{issue.title}</h4>
                        <span className="text-[8.5px] font-mono text-slate-400 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#4F46E5] dark:text-[#818CF8]" />
                          {issue.address}
                        </span>
                      </div>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded text-white shrink-0 ${
                        issue.severity === "Critical" ? "bg-rose-500" : issue.severity === "High" ? "bg-orange-500" : "bg-amber-500"
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )
        ) : filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-12 text-slate-400">
            <SlidersHorizontal className="w-12 h-12 stroke-[1.5] text-[#4F46E5]/40 animate-bounce" />
            <h4 className="text-sm font-black mt-3">No Triage Records Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              {activeTab === "NEARBY" 
                ? `No active issues reported in ${userStats?.ward || "your ward"} yet! Be the first to report an issue.` 
                : "Try adjusting your query filter, tab toggle, or search parameters."}
            </p>
          </div>
        ) : (
          filteredIssues.map((issue, idx) => (
            <FeedCard
              key={issue.id}
              issue={issue}
              isSecond={idx === 1}
              onSelectIssue={onSelectIssue}
              onUpvoteIssue={onUpvoteIssue}
              onToggleSaveIssue={onToggleSaveIssue}
            />
          ))
        )}
      </div>

      {/* FILTER BOTTOM SHEET */}
      {showFilterSheet && (
        <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end">
          <div className="flex-1" onClick={() => setShowFilterSheet(false)} />
          
          <div className="bg-[#F0F4FF] dark:bg-[#070B14] rounded-t-3xl p-6 shadow-2xl space-y-4 animate-slide-up border-t border-slate-200 dark:border-indigo-950">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Filter Triage Grid
              </h3>
              <button
                onClick={() => {
                  setSelectedSeverity("All");
                  setSelectedCategory("All");
                  setShowFilterSheet(false);
                }}
                className="text-[9px] font-black text-rose-500 hover:underline uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>
 
            {/* Severity selection */}
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Severity</span>
              <div className="flex flex-wrap gap-1.5">
                {["All", "Critical", "High", "Medium", "Low"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold ${
                      selectedSeverity === sev
                        ? "bg-[#4F46E5] dark:bg-[#818CF8] text-white shadow"
                        : "bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-indigo-950 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
 
            {/* Category selection */}
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</span>
              <div className="flex flex-wrap gap-1.5">
                {["All", "Roads", "Water", "Lighting", "Sanitation", "Parks", "Safety"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold ${
                      selectedCategory === cat
                        ? "bg-[#4F46E5] dark:bg-[#818CF8] text-white shadow"
                        : "bg-white dark:bg-[#0E1524] border border-slate-200 dark:border-indigo-950 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
 
            <button
              onClick={() => setShowFilterSheet(false)}
              className="w-full h-11 bg-[#4F46E5] dark:bg-[#818CF8] text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
