import React, { useMemo, useState, useEffect } from "react";
import { Issue, UserStats } from "../../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { 
  Activity, ShieldCheck, TrendingUp, Sliders, Sparkles, MapPin, Award, 
  CheckCircle, Clock, Search, AlertTriangle, AlertOctagon, Users, RefreshCw, ChevronDown
} from "lucide-react";
import { bengaluruAreasAndWards } from "../../data/bengaluruData";

interface DashboardViewProps {
  issues: Issue[];
  userStats: UserStats;
  onUpdateUserStats?: (updated: Partial<UserStats>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  issues, 
  userStats, 
  onUpdateUserStats 
}) => {
  const [budgetAllocation, setBudgetAllocation] = useState<number>(75);
  
  // Dynamic area and ward states
  const [selectedArea, setSelectedArea] = useState<string>(userStats.residingArea || "Indiranagar");
  const [selectedWard, setSelectedWard] = useState<string>(userStats.ward || "Ward 80");
  const [areaSearchQuery, setAreaSearchQuery] = useState<string>("");
  const [showAreaDropdown, setShowAreaDropdown] = useState<boolean>(false);
  const [saveLocationFeedback, setSaveLocationFeedback] = useState<boolean>(false);

  // Auto-sync dashboard area with user's residing area on load or when residing area changes
  useEffect(() => {
    if (userStats.residingArea) {
      setSelectedArea(userStats.residingArea);
    }
    if (userStats.ward) {
      setSelectedWard(userStats.ward);
    }
  }, [userStats.residingArea, userStats.ward]);

  // Bi-directional linkage: when selectedArea changes, update selectedWard
  const handleAreaSelect = (areaName: string) => {
    const match = bengaluruAreasAndWards.find(
      (item) => item.area.toLowerCase() === areaName.toLowerCase()
    );
    if (match) {
      setSelectedArea(match.area);
      setSelectedWard(match.ward);
    } else {
      setSelectedArea(areaName);
    }
    setAreaSearchQuery("");
    setShowAreaDropdown(false);
  };

  // Bi-directional linkage: when selectedWard changes, update selectedArea
  const handleWardSelect = (wardName: string) => {
    const match = bengaluruAreasAndWards.find(
      (item) => item.ward.toLowerCase() === wardName.toLowerCase()
    );
    if (match) {
      setSelectedArea(match.area);
      setSelectedWard(match.ward);
    } else {
      setSelectedWard(wardName);
    }
    setShowAreaDropdown(false);
  };

  // Trigger updating User's Profile Residing Area from the Dashboard
  const handleSetAsResidingArea = () => {
    if (onUpdateUserStats) {
      onUpdateUserStats({
        residingArea: selectedArea,
        ward: selectedWard
      });
      setSaveLocationFeedback(true);
      setTimeout(() => setSaveLocationFeedback(false), 2500);
    }
  };

  // Dynamic Filtering of issues based on selected area or ward
  const filteredIssues = useMemo(() => {
    const areaLower = selectedArea.toLowerCase();
    const wardLower = selectedWard.toLowerCase();
    return issues.filter((issue) => {
      const addrMatch = issue.address.toLowerCase().includes(areaLower) || 
                        issue.title.toLowerCase().includes(areaLower) ||
                        issue.description.toLowerCase().includes(areaLower);
      const wardMatch = issue.assignedTo?.toLowerCase().includes(wardLower) ||
                        issue.address.toLowerCase().includes(wardLower);
      return addrMatch || wardMatch;
    });
  }, [issues, selectedArea, selectedWard]);

  // SLA compliance calculation specifically for the filtered area
  const slaCompliance = useMemo(() => {
    const resolved = filteredIssues.filter((i) => i.status === "Resolved");
    if (resolved.length === 0) {
      // Benchmark fallback if no issues resolved yet
      const baseMap: { [key: string]: number } = {
        Indiranagar: 94.6,
        Koramangala: 91.2,
        Marathahalli: 88.4,
        "JP Nagar": 92.1,
        Whitefield: 85.3
      };
      return baseMap[selectedArea] || 90.0;
    }
    const onTime = resolved.filter((i) => i.hoursPassed <= i.sla).length;
    return Math.round((onTime / resolved.length) * 1000) / 10;
  }, [filteredIssues, selectedArea]);

  // Dynamic resolution rate for filtered area
  const resolutionRate = useMemo(() => {
    if (filteredIssues.length === 0) {
      const baseMap: { [key: string]: number } = {
        Indiranagar: 78,
        Koramangala: 82,
        Marathahalli: 65,
        "JP Nagar": 74,
        Whitefield: 60
      };
      return baseMap[selectedArea] || 70;
    }
    const resolved = filteredIssues.filter((i) => i.status === "Resolved").length;
    return Math.round((resolved / filteredIssues.length) * 100);
  }, [filteredIssues, selectedArea]);

  // Ward Safety Score (dynamic letter grade / percentage based on open vs resolved hazards)
  const safetyScore = useMemo(() => {
    const total = filteredIssues.length;
    if (total === 0) return 96; // Excellent if clean
    const unresolved = filteredIssues.filter((i) => i.status !== "Resolved");
    const criticalCount = unresolved.filter((i) => i.severity === "Critical").length;
    const highCount = unresolved.filter((i) => i.severity === "High").length;
    const mediumCount = unresolved.filter((i) => i.severity === "Medium").length;
    const lowCount = unresolved.filter((i) => i.severity === "Low").length;

    const penalty = (criticalCount * 25) + (highCount * 12) + (mediumCount * 6) + (lowCount * 3);
    return Math.max(15, 100 - penalty);
  }, [filteredIssues]);

  const safetyGrade = useMemo(() => {
    if (safetyScore >= 92) return "A+";
    if (safetyScore >= 85) return "A";
    if (safetyScore >= 78) return "B+";
    if (safetyScore >= 70) return "B";
    if (safetyScore >= 60) return "C+";
    if (safetyScore >= 50) return "C";
    return "D-";
  }, [safetyScore]);

  // Dispatched crews actively fixing issues (In Progress status represents on-site repairs)
  const dispatchedCrewsCount = useMemo(() => {
    const activeInProgress = filteredIssues.filter((i) => i.status === "In Progress").length;
    // Base dispatch teams + active ones
    return Math.max(1, activeInProgress + (selectedArea.length % 3) + 1);
  }, [filteredIssues, selectedArea]);

  // Active hazards list
  const activeIssuesCount = useMemo(() => {
    return filteredIssues.filter((i) => i.status !== "Resolved").length;
  }, [filteredIssues]);

  // Critical Alerts list for safety detour warning
  const criticalAlerts = useMemo(() => {
    return filteredIssues.filter((i) => i.status !== "Resolved" && i.severity === "Critical");
  }, [filteredIssues]);

  // Civic Engagement Level Meter
  const engagementIndex = useMemo(() => {
    const baseVal = 65 + (selectedArea.length % 15);
    const reportCount = filteredIssues.length;
    const upvotesCount = filteredIssues.reduce((sum, i) => sum + i.upvotes, 0);
    const bonus = Math.min(20, (reportCount * 1.5) + (upvotesCount * 0.1));
    return Math.min(99, Math.round(baseVal + bonus));
  }, [filteredIssues, selectedArea]);

  // Recharts BarChart data grouped by Category
  const categoryData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    const targetIssues = filteredIssues.length > 0 ? filteredIssues : issues;
    targetIssues.forEach((i) => {
      const catClean = i.category.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();
      counts[catClean] = (counts[catClean] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredIssues, issues]);

  // Recharts PieChart data grouped by Severity
  const severityData = useMemo(() => {
    const counts: { [key: string]: number } = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const targetIssues = filteredIssues.length > 0 ? filteredIssues : issues;
    targetIssues.forEach((i) => {
      if (counts[i.severity] !== undefined) {
        counts[i.severity]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredIssues, issues]);

  const COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];

  // 5-Month resolution timeline trend
  const timelineData = useMemo(() => {
    return [
      { name: "Feb", compliance: Math.max(76, Math.round(slaCompliance - 14)) },
      { name: "Mar", compliance: Math.max(79, Math.round(slaCompliance - 9)) },
      { name: "Apr", compliance: Math.max(83, Math.round(slaCompliance - 5)) },
      { name: "May", compliance: Math.max(87, Math.round(slaCompliance - 2)) },
      { name: "Jun", compliance: Math.round(slaCompliance) }
    ];
  }, [slaCompliance]);

  // Filter matched items for search suggestions
  const suggestedAreas = useMemo(() => {
    if (!areaSearchQuery.trim()) return [];
    return bengaluruAreasAndWards.filter(
      (item) => 
        item.area.toLowerCase().includes(areaSearchQuery.toLowerCase()) || 
        item.ward.toLowerCase().includes(areaSearchQuery.toLowerCase())
    );
  }, [areaSearchQuery]);

  return (
    <div className="w-full h-full bg-[#070B14] overflow-y-auto px-4 py-6 text-slate-100 select-none pb-24">
      
      {/* HEADER SECTION */}
      <div className="mb-6">
        <h2 className="text-md font-black text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          CIVIQ Bengaluru Dashboard
        </h2>
        <p className="text-[10px] text-slate-400 mt-0.5">Real-time Ward Health, safety audits & citizen engagement index</p>
      </div>

      {/* BI-DIRECTIONAL AREA & WARD PICKER / SEARCH */}
      <div className="bg-[#0E1524] border border-indigo-950 p-4 rounded-2xl shadow-md mb-6 space-y-4 relative">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
            Target Neighborhood Inspector
          </span>
          {userStats.residingArea && (
            <span className="text-[8.5px] font-bold text-indigo-400 flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              📍 My Reside: {userStats.residingArea} ({userStats.ward})
            </span>
          )}
        </div>

        {/* Dynamic Area Search Input */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Area or Ward in Bengaluru..."
              value={areaSearchQuery}
              onChange={(e) => {
                setAreaSearchQuery(e.target.value);
                setShowAreaDropdown(true);
              }}
              onFocus={() => setShowAreaDropdown(true)}
              className="w-full h-9 pl-9 pr-4 bg-[#070B14] border border-indigo-950 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* Search suggestions dropdown */}
          {showAreaDropdown && (areaSearchQuery.trim() || showAreaDropdown) && (
            <div className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-[#0E1524] border border-indigo-900 rounded-xl shadow-2xl z-20 p-1.5 divide-y divide-indigo-950/40">
              {suggestedAreas.length > 0 ? (
                suggestedAreas.map((item) => (
                  <button
                    key={item.area}
                    onClick={() => handleAreaSelect(item.area)}
                    className="w-full text-left p-2 hover:bg-indigo-950/40 transition-colors flex justify-between items-center text-[11px] font-semibold text-slate-200"
                  >
                    <span>📍 {item.area}</span>
                    <span className="text-[9px] text-indigo-400 uppercase font-bold">{item.ward}</span>
                  </button>
                ))
              ) : areaSearchQuery.trim() ? (
                <div className="p-3 text-center text-[10px] text-slate-500 font-medium">
                  No matching registered Bengaluru wards.
                </div>
              ) : (
                <div className="p-1">
                  <span className="block text-[7.5px] font-black text-slate-500 uppercase tracking-widest p-1">Popular Registered Areas</span>
                  {bengaluruAreasAndWards.slice(0, 5).map((item) => (
                    <button
                      key={item.area}
                      onClick={() => handleAreaSelect(item.area)}
                      className="w-full text-left p-1.5 hover:bg-indigo-950/40 transition-colors flex justify-between items-center text-[10.5px] font-semibold text-slate-300"
                    >
                      <span>{item.area}</span>
                      <span className="text-[8px] text-slate-500 uppercase font-mono">{item.ward}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bi-directional Linkage Dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider block">Bengaluru Area</span>
            <div className="relative">
              <select
                value={selectedArea}
                onChange={(e) => handleAreaSelect(e.target.value)}
                className="w-full h-8 px-2.5 bg-[#070B14] border border-indigo-950 rounded-lg text-[11px] text-white font-bold focus:outline-none focus:border-emerald-500 appearance-none pr-8 cursor-pointer"
              >
                {bengaluruAreasAndWards.map((item) => (
                  <option key={item.area} value={item.area} className="bg-[#0E1524]">
                    {item.area}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider block">BBMP Ward Number</span>
            <div className="relative">
              <select
                value={selectedWard}
                onChange={(e) => handleWardSelect(e.target.value)}
                className="w-full h-8 px-2.5 bg-[#070B14] border border-indigo-950 rounded-lg text-[11px] text-white font-bold focus:outline-none focus:border-emerald-500 appearance-none pr-8 cursor-pointer"
              >
                {bengaluruAreasAndWards.map((item) => (
                  <option key={item.ward} value={item.ward} className="bg-[#0E1524]">
                    {item.ward}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Save Setting / Back to My Ward Action */}
        <div className="flex gap-2 pt-1 border-t border-indigo-950/30">
          {(selectedArea !== userStats.residingArea || selectedWard !== userStats.ward) ? (
            <>
              <button
                onClick={handleSetAsResidingArea}
                className="flex-1 h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-[9.5px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3 h-3" />
                {saveLocationFeedback ? "Location Set!" : "Set as Residing Area"}
              </button>
              <button
                onClick={() => {
                  setSelectedArea(userStats.residingArea || "Indiranagar");
                  setSelectedWard(userStats.ward || "Ward 80");
                }}
                className="px-3 h-8 bg-transparent border border-indigo-950 hover:bg-indigo-950/30 text-slate-300 text-[9.5px] font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Reset
              </button>
            </>
          ) : (
            <div className="w-full text-center text-[9px] font-semibold text-slate-500 py-1 flex items-center justify-center gap-1.5">
              <span>🟢 Viewing reside target: <b>{selectedArea}</b></span>
            </div>
          )}
        </div>
      </div>

      {/* REAL-TIME WARD HEALTH & STATUS CARD (WARD SAFETY SCORE, ACTIVE HAZARDS, DISPATCHED CREWS, CRITICAL ALERTS) */}
      <div className="bg-[#0E1524] border border-indigo-950 rounded-2xl p-4 shadow-md mb-6 space-y-4">
        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block pb-1 border-b border-indigo-950/40">
          Real-Time Ward Health & Status
        </span>

        {/* safety grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Safety score */}
          <div className="bg-[#070B14] p-3 rounded-xl border border-indigo-950 flex flex-col justify-between items-center text-center">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Ward Safety Score</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{safetyGrade}</span>
            <span className="text-[7.5px] font-mono font-bold text-slate-500 mt-1 block">{safetyScore}% Compliance</span>
          </div>

          {/* Active issues count */}
          <div className="bg-[#070B14] p-3 rounded-xl border border-indigo-950 flex flex-col justify-between items-center text-center">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Active Hazards</span>
            <span className="text-2xl font-black text-amber-500 mt-1 block">{activeIssuesCount}</span>
            <span className="text-[7.5px] font-mono font-bold text-slate-500 mt-1 block">Unresolved Logs</span>
          </div>

          {/* Dispatched crews */}
          <div className="bg-[#070B14] p-3 rounded-xl border border-indigo-950 flex flex-col justify-between items-center text-center">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Dispatched Crews</span>
            <span className="text-2xl font-black text-[#818CF8] mt-1 block">{dispatchedCrewsCount}</span>
            <span className="text-[7.5px] font-mono font-bold text-slate-500 mt-1 block">Active On-Site Teams</span>
          </div>
        </div>

        {/* Critical Alerts Detours Section */}
        <div className="space-y-2">
          <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest block">Critical Hazard Alerts</span>
          {criticalAlerts.length > 0 ? (
            <div className="space-y-2">
              {criticalAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl flex gap-2.5 items-start animate-pulse"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-black text-rose-400 uppercase tracking-wider block">DETOUR REQUIRED: #{alert.id}</span>
                    <span className="text-[10px] font-black text-white block">{alert.title}</span>
                    <span className="text-[9px] text-slate-300 font-semibold leading-relaxed block">{alert.urgencyReason}</span>
                    <span className="text-[8px] text-rose-400 font-bold block mt-1">📍 Near: {alert.address}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl flex gap-2.5 items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-[9.5px] font-bold text-slate-300">
                <span className="font-extrabold text-emerald-400 uppercase block text-[8px] tracking-wider">No Active Threat Advisories</span>
                All major roads clear of life-threatening issues in {selectedArea}.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CIVIC ENGAGEMENT LEVEL METER */}
      <div className="bg-[#0E1524] border border-indigo-950 rounded-2xl p-4 shadow-md mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
              Civic Engagement Level
            </span>
            <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">
              Citizen reporting, upvotes, verifications & discussion ratios
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-emerald-400">{engagementIndex}%</span>
            <span className="text-[7.5px] text-slate-400 uppercase block font-bold font-mono">Engagement Index</span>
          </div>
        </div>

        {/* Visual custom engagement progress indicators */}
        <div className="space-y-3">
          {/* Report Filing activity */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-300">
              <span>Citizen Filing Activity (Log Volume)</span>
              <span className="font-mono text-indigo-400">{Math.min(95, 45 + (filteredIssues.length * 5))}%</span>
            </div>
            <div className="w-full h-1.5 bg-indigo-950/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(95, 45 + (filteredIssues.length * 5))}%` }}
              />
            </div>
          </div>

          {/* Verification activity */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-300">
              <span>Resolution Audit Verification Rate</span>
              <span className="font-mono text-teal-400">{Math.min(99, 58 + (filteredIssues.filter(i => i.status === "Resolved").length * 8))}%</span>
            </div>
            <div className="w-full h-1.5 bg-indigo-950/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(99, 58 + (filteredIssues.filter(i => i.status === "Resolved").length * 8))}%` }}
              />
            </div>
          </div>

          {/* Comments & Discussions */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-300">
              <span>Discussions & Comment Freq</span>
              <span className="font-mono text-[#818CF8]">{Math.min(95, 38 + (filteredIssues.filter(i => i.comments && i.comments.length > 0).length * 10))}%</span>
            </div>
            <div className="w-full h-1.5 bg-indigo-950/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(95, 38 + (filteredIssues.filter(i => i.comments && i.comments.length > 0).length * 10))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHT NUMERICS STATS ROW */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#0E1524] border border-indigo-950 p-4 rounded-2xl shadow-md flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SLA Compliance</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-black text-emerald-400">{slaCompliance}%</span>
            <span className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> +1.2%
            </span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1 block">Selected Area SLA Target: 24-72h</span>
        </div>

        <div className="bg-[#0E1524] border border-indigo-950 p-4 rounded-2xl shadow-md flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Resolution Rate</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-xl font-black text-[#818CF8]">{resolutionRate}%</span>
            <span className="text-[8px] font-semibold text-[#818CF8] ml-1">Success</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1 block">Active Resolved Ratio</span>
        </div>
      </div>

      {/* CHART 1: INCIDENT VOLUME BY CATEGORY */}
      <div className="bg-[#0E1524] border border-indigo-950 rounded-2xl p-4 shadow-md mb-6">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">
          Incident Volume by Category
        </span>
        <div className="w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={8} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={8} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0E1524", borderColor: "#1E1B4B", borderRadius: "12px" }}
                itemStyle={{ color: "#E2E8F0" }}
                cursor={{ fill: "rgba(255,255,255,0.02)" }} 
              />
              <Bar dataKey="value" fill="#818CF8" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2 & 3 CONTAINER (HALF GRIDS) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Severity split pie */}
        <div className="bg-[#0E1524] border border-indigo-950 rounded-2xl p-3 shadow-md flex flex-col justify-between">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            Severity Split
          </span>
          <div className="w-full h-24 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={18} outerRadius={28} paddingAngle={4}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0E1524", borderColor: "#1E1B4B", borderRadius: "12px", fontSize: "10px" }}
                  itemStyle={{ color: "#E2E8F0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[7.5px] mt-2 border-t border-indigo-950/45 pt-2">
            <span className="text-rose-400 font-bold">Critical</span>
            <span className="text-amber-400 font-bold">High</span>
            <span className="text-blue-400 font-bold">Medium</span>
            <span className="text-emerald-400 font-bold">Low</span>
          </div>
        </div>

        {/* Timeline Line Chart */}
        <div className="bg-[#0E1524] border border-indigo-950 rounded-2xl p-3 shadow-md flex flex-col justify-between">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
            SLA Compliance Trend
          </span>
          <div className="w-full h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={8} tickLine={false} axisLine={false} domain={[60, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0E1524", borderColor: "#1E1B4B", borderRadius: "12px", fontSize: "10px" }}
                  itemStyle={{ color: "#E2E8F0" }}
                />
                <Line type="monotone" dataKey="compliance" stroke="#818CF8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[8px] text-center text-slate-500 mt-1 font-mono">5-Month Trend Percentage</span>
        </div>
      </div>

      {/* CITY BUDGET ALLOCATION SLIDER (INTERACTIVE SIMULATOR) */}
      <div className="bg-[#0E1524] border border-indigo-950 rounded-2xl p-4 shadow-md mb-6 space-y-3">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block flex items-center justify-between">
          <span>RWA Community Funding Ratio</span>
          <span className="text-[#818CF8] font-bold font-mono">{budgetAllocation}% Local Fixers</span>
        </span>
        <input
          type="range"
          min="10"
          max="100"
          value={budgetAllocation}
          onChange={(e) => setBudgetAllocation(Number(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-[7px] text-slate-500 font-semibold uppercase tracking-wider">
          <span>More Govt Projects (BBMP)</span>
          <span>More Local Fixers Gigs</span>
        </div>
      </div>

    </div>
  );
};
