import React, { useMemo, useState, useEffect } from "react";
import { Issue, UserStats } from "../../types";
import { AlertOctagon, Bell, Flame, ChevronRight, Compass, ShieldAlert, Award, Star, Zap, Bookmark, User, ThumbsUp, MapPin, X, Check, Wrench, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HomeViewProps {
  userStats: UserStats;
  issues: Issue[];
  onNavigateToTab: (tab: string) => void;
  onUpvoteIssue: (id: string) => void;
  onSelectIssue: (issue: Issue) => void;
  onToggleSaveIssue: (id: string) => void;
}

const CriticalAlertSkeleton = () => (
  <div className="flex-shrink-0 w-72 issue-card-gradient border border-slate-200 dark:border-indigo-950/80 rounded-2xl p-4 shadow-sm flex flex-col space-y-3 relative overflow-hidden">
    <div className="issue-card-border-strip bg-rose-500 animate-pulse" />
    <div className="flex justify-between items-center">
      <div className="w-16 h-4 rounded-full animate-shimmer" />
      <div className="w-24 h-4 rounded animate-shimmer" />
    </div>
    <div className="w-3/4 h-4 rounded animate-shimmer" />
    <div className="space-y-1.5">
      <div className="w-full h-2.5 rounded animate-shimmer" />
      <div className="w-5/6 h-2.5 rounded animate-shimmer" />
    </div>
    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-indigo-950/50 flex justify-between items-center">
      <div className="w-32 h-3 rounded animate-shimmer" />
      <div className="w-12 h-3 rounded animate-shimmer" />
    </div>
  </div>
);

const NearbyIssueSkeleton = () => (
  <div className="issue-card-gradient border border-slate-200/80 dark:border-indigo-950/80 rounded-2xl p-4 flex gap-3 shadow-sm relative overflow-hidden">
    <div className="issue-card-border-strip bg-slate-200 dark:bg-slate-800" />
    <div className="flex-1 min-w-0 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="w-16 h-3.5 rounded animate-shimmer" />
        <div className="w-10 h-3.5 rounded-full animate-shimmer" />
      </div>
      <div className="w-2/3 h-3.5 rounded animate-shimmer" />
      <div className="w-full h-2.5 rounded animate-shimmer" />
      <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-indigo-950/50">
        <div className="w-24 h-3 rounded animate-shimmer" />
        <div className="w-10 h-3 rounded animate-shimmer" />
      </div>
    </div>
  </div>
);

const CommunityHeroSkeleton = () => (
  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-100 dark:border-indigo-950/60 shadow-sm">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="w-8 h-8 rounded-full animate-shimmer" />
      <div className="space-y-1 flex-1">
        <div className="w-24 h-3 rounded animate-shimmer" />
        <div className="w-16 h-2.5 rounded animate-shimmer" />
      </div>
    </div>
    <div className="space-y-1 text-right">
      <div className="w-12 h-3 rounded animate-shimmer ml-auto" />
      <div className="w-16 h-2.5 rounded animate-shimmer ml-auto" />
    </div>
  </div>
);

export const HomeView: React.FC<HomeViewProps> = ({
  userStats,
  issues,
  onNavigateToTab,
  onUpvoteIssue,
  onSelectIssue,
  onToggleSaveIssue
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  // Determine time of day greeting
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Mock Citizen Notifications
  const mockNotifications = [
    { id: 1, text: "Ward 151 Dispatch: Action team dispatched to reported pothole.", type: "dispatch", time: "10m ago" },
    { id: 2, text: "Status Resolved: Clear debris on Inner Ring Road marked RESOLVED.", type: "resolved", time: "2h ago" },
    { id: 3, text: "Earned 50 Points: Your validation on 'Broken Street Light' has been verified.", type: "points", time: "1d ago" },
    { id: 4, text: "Critical Alert: Severe water clogging near Indiranagar Metro Station.", type: "alert", time: "2d ago" }
  ];

  // Filter critical/emergency issues for alerts
  const criticalIssues = useMemo(() => {
    return issues.filter((i) => i.severity === "Critical" && i.status !== "Resolved");
  }, [issues]);

  // Filter 3 nearest issues (by ID or list order)
  const nearbyIssues = useMemo(() => {
    return issues.filter((i) => i.status !== "Resolved").slice(0, 3);
  }, [issues]);

  // Calculate issue counts for health card
  const stats = useMemo(() => {
    const pending = issues.filter((i) => i.status === "Pending").length;
    const progress = issues.filter((i) => i.status === "In Progress").length;
    const resolved = issues.filter((i) => i.status === "Resolved").length;
    return { pending, progress, resolved };
  }, [issues]);

  // Top community heroes mockup data
  const communityHeroes = [
    { rank: "🥇", name: "Ananth Ram", points: 850, badge: "Ward Warden", color: "from-yellow-400 to-amber-600" },
    { rank: "🥈", name: "Deepa K.", points: 720, badge: "Civic Knight", color: "from-slate-300 to-slate-400" },
    { rank: "🥉", name: "Rohan Gowda", points: 610, badge: "Street Hero", color: "from-amber-600 to-amber-800" },
  ];

  return (
    <div className="w-full h-full bg-[#F0F4FF] dark:bg-[#070B14] overflow-y-auto px-4 py-6 text-slate-800 dark:text-slate-100 select-none relative">
      
      {/* Notifications Drawer/Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#070B14]/80 backdrop-blur-sm z-50 p-4 flex flex-col justify-start pt-16"
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="bg-[#0E1524] border border-indigo-950 rounded-2xl p-4 shadow-2xl max-w-sm mx-auto w-full space-y-4"
            >
              <div className="flex justify-between items-center border-b border-indigo-950/65 pb-2">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#818CF8]" />
                  Citizen Alerts
                </h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className="p-2.5 rounded-xl border border-indigo-950/60 bg-[#070B14] hover:bg-indigo-950/20 transition-all flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      {notif.type === "dispatch" && <Zap className="w-3.5 h-3.5 text-blue-400" />}
                      {notif.type === "resolved" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      {notif.type === "points" && <Award className="w-3.5 h-3.5 text-amber-400" />}
                      {notif.type === "alert" && <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-300 font-medium leading-relaxed">{notif.text}</p>
                      <span className="text-[8px] text-slate-500 font-mono block mt-1">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowNotifications(false)}
                className="w-full py-2 bg-[#1B253D] hover:bg-[#2A3754] text-[#818CF8] font-black text-[9px] uppercase tracking-wider rounded-lg transition-colors border border-indigo-950"
              >
                Dismiss All Alerts
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. GREETING HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl tracking-tight text-slate-900 dark:text-white leading-tight">
            <span className="block text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider">{greeting},</span>
            <span className="block text-2xl font-black mt-0.5 text-slate-900 dark:text-white">{userStats.name}</span>
          </h2>
          <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8] bg-indigo-50 dark:bg-[#1B253D] px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] animate-pulse" />
            📍 {userStats.ward || "Ward 80"}, {userStats.residingArea || "Indiranagar"}
          </span>
        </div>
        <button 
          onClick={() => setShowNotifications(true)}
          className="p-2.5 rounded-xl bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 text-slate-600 dark:text-slate-300 relative shadow-sm hover:scale-105 active:scale-95 transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-indigo-950" />
        </button>
      </div>

      {/* 2. CITY HEALTH SCORE CARD */}
      <div className="w-full bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-indigo-950 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden mb-6">
        {/* Glow rings */}
        <div className="absolute top-[-40%] right-[-10%] w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-[-30%] left-[-10%] w-36 h-36 rounded-full bg-indigo-500/20 blur-xl" />

        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-indigo-100 uppercase">
              Bengaluru Infrastructure Health
            </span>
            <span className="text-[11px] font-medium text-indigo-100 mt-1">
              Real-time Ward Triage Index
            </span>
          </div>
          <div className="flex items-baseline gap-0.5 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <span className="text-3xl font-black">67</span>
            <span className="text-xs font-semibold text-indigo-200">/100</span>
          </div>
        </div>

        {/* Mini stats bars */}
        <div className="mt-6 flex gap-2">
          <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-2.5 backdrop-blur-sm text-center">
            <span className="block text-[10px] font-semibold uppercase text-indigo-100">Pending</span>
            <span className="block text-lg font-black mt-0.5 text-amber-300">{stats.pending}</span>
          </div>
          <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-2.5 backdrop-blur-sm text-center">
            <span className="block text-[10px] font-semibold uppercase text-indigo-100">Fixes</span>
            <span className="block text-lg font-black mt-0.5 text-blue-300">{stats.progress}</span>
          </div>
          <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-2.5 backdrop-blur-sm text-center">
            <span className="block text-[10px] font-semibold uppercase text-indigo-100">Resolved</span>
            <span className="block text-lg font-black mt-0.5 text-emerald-300">{stats.resolved}</span>
          </div>
        </div>


      </div>

      {/* 3. QUICK ACTIONS GRID (2 columns) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => onNavigateToTab("Fixer")}
          className="bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-[#1B253D] text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center mb-2.5 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-all">
            <Wrench className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Fixer Gigs</span>
          <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Bids & Repairs</span>
        </button>

        <button
          onClick={() => onNavigateToTab("Volunteer")}
          className="bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-[#1B253D] text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center mb-2.5 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-all">
            <Award className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Volunteer Board</span>
          <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Earn Civic Points</span>
        </button>

        <button
          onClick={() => onNavigateToTab("CivicInfo")}
          className="bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-[#1B253D] text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center mb-2.5 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-all">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">CIVIQ Guide</span>
          <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Rank & Points Info</span>
        </button>

        <button
          onClick={() => onNavigateToTab("Dashboard")}
          className="bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-[#1B253D] text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center mb-2.5 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-all">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Analytics Hub</span>
          <span className="text-[10px] text-slate-400 mt-0.5 font-medium">AI Risk Prediction</span>
        </button>
      </div>

      {/* 4. CRITICAL ALERTS (only shown if Critical issues exist or loading) */}
      {(isLoading || criticalIssues.length > 0) && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-extrabold text-sm uppercase tracking-wide mb-3">
            <Flame className="w-5 h-5 animate-pulse" />
            Active Emergencies (Critical)
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {isLoading ? (
              <>
                <CriticalAlertSkeleton />
                <CriticalAlertSkeleton />
              </>
            ) : (
              criticalIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="flex-shrink-0 w-72 issue-card-gradient border border-slate-200 dark:border-indigo-950/80 rounded-2xl p-4 shadow-sm flex flex-col space-y-3 relative overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-98 transition-all"
                >
                  {/* Left/top severity indicator strip */}
                  <div className="issue-card-border-strip bg-rose-500" />

                  <div className="flex justify-between items-center z-10">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#1B253D] border border-indigo-100 dark:border-indigo-900/30 text-[9px] font-black tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
                      By {issue.reportedBy || "@citizen"}
                    </span>
                    <span className="text-[10px] font-mono text-rose-500 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Anger Index: {issue.angerIndex}%
                    </span>
                  </div>

                  <div className="z-10">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{issue.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-normal">
                      {issue.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-indigo-950/50 flex justify-between items-center text-[10px] z-10">
                    <span className="font-semibold text-slate-400 truncate max-w-[150px]">
                      📍 {issue.address}
                    </span>
                    <span className="font-bold text-[#4F46E5] dark:text-[#818CF8]">Inspect →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. NEAR YOU SECTION */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Issues Near You
          </h3>
          <span className="text-[11px] font-extrabold text-[#4F46E5] dark:text-[#818CF8] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#1B253D] border border-indigo-100 dark:border-indigo-900/30">
            Within 2.5 km
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading ? (
            <>
              <NearbyIssueSkeleton />
              <NearbyIssueSkeleton />
              <NearbyIssueSkeleton />
            </>
          ) : (
            nearbyIssues.map((issue) => {
              const isVoted = issue.isVoted;
              const severityColor =
                issue.severity === "Critical"
                  ? "bg-rose-500"
                  : issue.severity === "High"
                  ? "bg-orange-500"
                  : issue.severity === "Medium"
                  ? "bg-emerald-500"
                  : "bg-emerald-500";

              return (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="issue-card-gradient border border-slate-200/80 dark:border-indigo-950/80 rounded-2xl p-4 flex gap-3 shadow-sm hover:shadow-md cursor-pointer transition-all relative overflow-hidden group"
                >
                  {/* Left severity indicator strip */}
                  <div className={`issue-card-border-strip ${severityColor}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#4F46E5] dark:text-[#818CF8] truncate">
                          {issue.category}
                        </span>
                        <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                          by {issue.reportedBy || "@citizen"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black text-white ${severityColor}`}>
                          {issue.severity}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
                      {issue.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                      {issue.description}
                    </p>
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100 dark:border-indigo-950 text-[10px] text-slate-400">
                      <span className="truncate max-w-[140px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {issue.address}
                      </span>
                      
                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* Vote Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpvoteIssue(issue.id);
                          }}
                          className={`flex items-center gap-1 font-bold transition-all hover:scale-105 active:scale-95 ${
                            isVoted ? "text-[#4F46E5] dark:text-[#818CF8]" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? "fill-current" : ""}`} />
                          <span>{issue.upvotes}</span>
                        </button>

                        <span className="text-slate-200 dark:text-indigo-950/60 font-light">|</span>

                        {/* Save Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaveIssue(issue.id);
                          }}
                          className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1B253D] transition-colors ${
                            issue.isSaved ? "text-amber-500" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${issue.isSaved ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => onNavigateToTab("Feed")}
          className="mt-2.5 w-full text-center text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline"
        >
          View All Feed Issues →
        </button>
      </div>

      {/* 6. COMMUNITY HEROES */}
      <div className="bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 rounded-3xl p-4 shadow-sm mb-6">
        <h3 className="text-md font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          Top Citizens This Week
        </h3>

        <div className="flex flex-col gap-2">
          {isLoading ? (
            <>
              <CommunityHeroSkeleton />
              <CommunityHeroSkeleton />
              <CommunityHeroSkeleton />
            </>
          ) : (
            communityHeroes.map((hero, idx) => (
              <div
                key={hero.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-100 dark:border-indigo-950"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{hero.rank}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {hero.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{hero.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {hero.badge}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#4F46E5] dark:text-[#818CF8]">+{hero.points} pts</span>
                  <span className="block text-[9px] text-slate-400">Award pending</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
