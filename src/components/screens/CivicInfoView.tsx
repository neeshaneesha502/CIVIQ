import React, { useState, useEffect } from "react";
import { Award, Zap, Sparkles, TrendingUp, Gift, ChevronRight, Check, ShieldCheck, Heart, Info, ArrowLeft, CreditCard, Ticket, Lock, RefreshCw, CheckCircle2, UserCheck, AlertCircle, BookOpen, Clock, ListChecks, HelpCircle, ArrowRight, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CivicInfoViewProps {
  userPoints: number;
  onUpdatePoints?: (change: number) => void;
  onBackToHome?: () => void;
}

export const CivicInfoView: React.FC<CivicInfoViewProps> = ({ 
  userPoints: initialPoints,
  onUpdatePoints,
  onBackToHome 
}) => {
  const [points, setPoints] = useState(initialPoints);
  useEffect(() => {
    setPoints(initialPoints);
  }, [initialPoints]);
  const [activeMainTab, setActiveMainTab] = useState<"GUIDE" | "REWARDS" | "RANKS">("GUIDE");
  const [redeemedItem, setRedeemedItem] = useState<string | null>(null);
  const [selectedCauseId, setSelectedCauseId] = useState<string | null>(null);

  const causesImpactData: Record<string, {
    title: string;
    totalContributed: number;
    contributorsCount: number;
    impactQuantity: string;
    description: string;
    progress: number;
    locations: string[];
    recentActivity: string[];
    imageUrl: string;
  }> = {
    "r0": {
      title: "IMPS Direct Bank Account Transfer",
      totalContributed: 45000,
      contributorsCount: 90,
      impactQuantity: "₹22,500 cash cleared to local contributors",
      description: "Direct bank payouts rewarding active civic heroes. Funds are settled via standard IMPS protocols directly to registered citizen bank nodes.",
      progress: 100,
      locations: ["All Bengaluru Wards", "Indiranagar (18 claims)", "Koramangala (22 claims)"],
      recentActivity: [
        "Neesha cashed out 500 PTS (₹250) - 1 hour ago",
        "Rohan G. cashed out 500 PTS (₹250) - 1 day ago",
        "Suresh M. cashed out 1000 PTS (₹500) - 2 days ago"
      ],
      imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80"
    },
    "r1": {
      title: "Solar Streetlight Offset",
      totalContributed: 4800,
      contributorsCount: 24,
      impactQuantity: "16 Eco LED poles active",
      description: "Co-funding eco-friendly solar-powered LED lamp posts across dark alleys and vulnerable pedestrian lanes in Ward 80.",
      progress: 80,
      locations: ["12th Main Indiranagar (4 active)", "HAL 2nd Stage (6 active)", "Double Road Alley (6 active)"],
      recentActivity: [
        "Rohan K. contributed 200 PTS - 3 hours ago",
        "Priya S. contributed 200 PTS - Yesterday",
        "Nodal inspector marked Solar Pole #16 live - 2 days ago"
      ],
      imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80"
    },
    "r2": {
      title: "1-Week BMTC Transit Pass",
      totalContributed: 16800,
      contributorsCount: 42,
      impactQuantity: "42 transit riders funded",
      description: "Encouraging eco-friendly public commuting across Bengaluru by subsidizing BMTC weekly tickets using civic activity points.",
      progress: 95,
      locations: ["Kempagowda Bus Station routes", "Indiranagar-Whitefield BMTC lines"],
      recentActivity: [
        "Amit P. redeemed Weekly Pass - 4 hours ago",
        "Neesha redeemed Weekly Pass - 1 day ago",
        "BMTC Smart Gateway synced 42 total claims - 3 days ago"
      ],
      imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=400&q=80"
    },
    "r3": {
      title: "Plant a Native Tree Sapling",
      totalContributed: 7200,
      contributorsCount: 48,
      impactQuantity: "24 Trees geo-tagged",
      description: "Certified indigenous Honge and Neem saplings planted in critical grey corridors. Each tree is planted, watered, and tracked with full visual geo-tags.",
      progress: 60,
      locations: ["Defence Colony Park (10 Honge)", "Indiranagar Metro Green Belt (8 Neem)", "6th Main Roadside (6 Honge)"],
      recentActivity: [
        "Ananth R. contributed 300 PTS - 5 hours ago",
        "Deepa K. contributed 300 PTS - 1 day ago",
        "Sapling #24 planted at Metro Belt - 3 days ago"
      ],
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80"
    },
    "r4": {
      title: "Fixer Escrow Service Fee Waiver",
      totalContributed: 3150,
      contributorsCount: 21,
      impactQuantity: "21 fixer fee waivers settled",
      description: "Waiving coordination service fees on neighborhood fixer contracts, ensuring more revenue goes straight to local repair mechanics and plumbers.",
      progress: 70,
      locations: ["Ward 80 maintenance projects", "Koramangala repair hubs"],
      recentActivity: [
        "Kiran V. waived 150 PTS coordination fee - 10 hours ago",
        "Shiva Kumar (Electrician) received 100% direct bid - 2 days ago"
      ],
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"
    }
  };

  // Bank Cash-out state
  const [showBankForm, setShowBankForm] = useState<boolean>(false);
  const [bankAccNo, setBankAccNo] = useState<string>("");
  const [bankIFSC, setBankIFSC] = useState<string>("");
  const [bankHolder, setBankHolder] = useState<string>("Neesha");
  const [bankName, setBankName] = useState<string>("State Bank of India");
  const [isBankProcessing, setIsBankProcessing] = useState<boolean>(false);
  const [bankReceipt, setBankReceipt] = useState<any | null>(null);

  // Active Vouchers Wallet state
  const [activeVouchers, setActiveVouchers] = useState<any[]>([
    {
      id: "v-1",
      title: "BMTC Transit Weekly Pass",
      code: "CIVIQ-PASS-4921",
      otc: "394 204",
      redeemedDate: "Yesterday",
      status: "Active & Validated",
      type: "transit",
      cost: 400
    }
  ]);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  // Official verification console state
  const [officialCode, setOfficialCode] = useState<string>("");
  const [isOfficialVerifying, setIsOfficialVerifying] = useState<boolean>(false);
  const [officialVerifySuccess, setOfficialVerifySuccess] = useState<boolean>(false);
  const [officialVerifyError, setOfficialVerifyError] = useState<string>("");

  // Dynamic OTC verification timer mock
  const [countdown, setCountdown] = useState<number>(899); // 15 mins
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Reset to fresh 15 mins with new random OTC
          if (selectedVoucher) {
            setSelectedVoucher(prevV => ({
              ...prevV,
              otc: `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`
            }));
          }
          return 899;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedVoucher]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const ranks = [
    { title: "Street Sentinel", range: "0 - 100 PTS", desc: "Novice ward watch keeping street levels monitored.", color: "text-slate-400 bg-slate-500/10 border-slate-500/25" },
    { title: "Ward Guardian", range: "101 - 300 PTS", desc: "Active resolver filing triages & coordinating with engineers.", color: "text-blue-400 bg-blue-500/10 border-blue-500/25" },
    { title: "City Protector", range: "301 - 600 PTS", desc: "RWA veteran leading cleanups & validating major work orders.", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
    { title: "Civic Legend", range: "601+ PTS", desc: "Top-tier neighborhood hero with direct BBMP emergency dispatch keys.", color: "text-amber-400 bg-amber-500/10 border-amber-500/25" }
  ];

  const pointRules = [
    { activity: "Report a verified public hazard", points: "+50 PTS", icon: Zap, color: "text-amber-400 bg-amber-500/10" },
    { activity: "Complete a Volunteer Mission", points: "+100 PTS", icon: Sparkles, color: "text-emerald-400 bg-emerald-500/10" },
    { activity: "Your report gets upvoted/supported", points: "+10 PTS", icon: Heart, color: "text-rose-400 bg-rose-500/10" },
    { activity: "Audit & verify resolved work orders", points: "+50 PTS", icon: ShieldCheck, color: "text-indigo-400 bg-indigo-500/10" }
  ];

  const redemptionOptions = [
    { id: "r0", title: "IMPS Direct Bank Account Transfer", cost: 500, desc: "Cash-out 500 PTS directly into any Indian bank account as a ₹250 instant cash credit via IMPS settlement.", icon: CreditCard, theme: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    { id: "r1", title: "Solar Streetlight Offset", cost: 200, desc: "Pledge points to co-fund an eco-friendly solar LED lamp post on Indiranagar dark lanes.", icon: Zap, theme: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { id: "r2_day", title: "BMTC Transit Day Pass", cost: 100, desc: "Redeem points for an unlimited 1-Day eco-friendly public transit bus pass on any BMTC route.", icon: Ticket, theme: "text-[#818CF8] bg-indigo-500/10 border-indigo-500/20" },
    { id: "r2_week", title: "BMTC Transit Weekly Pass", cost: 400, desc: "Redeem points for an unlimited 1-Week eco-friendly public transit bus pass on any BMTC route.", icon: Ticket, theme: "text-[#818CF8] bg-indigo-500/10 border-indigo-500/20" },
    { id: "r2_month", title: "BMTC Transit Monthly Pass", cost: 1200, desc: "Redeem points for an unlimited 1-Month eco-friendly public transit bus pass on any BMTC route.", icon: Ticket, theme: "text-[#818CF8] bg-indigo-500/10 border-indigo-500/20" },
    { id: "r3", title: "Plant a Native Tree Sapling", cost: 300, desc: "Redeem to have a certified indigenous tree sapling planted in your ward with a visual geo-tag.", icon: Sparkles, theme: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { id: "r4", title: "Fixer Escrow Service Fee Waiver", cost: 150, desc: "Waive service escrow charges on your next community local fixer repair gig contract.", icon: Gift, theme: "text-teal-400 bg-teal-500/10 border-teal-500/20" }
  ];

  const handleRedeem = (id: string, title: string, cost: number) => {
    if (points >= cost) {
      if (id === "r0") {
        setShowBankForm(true);
        return;
      }

      const nextPoints = points - cost;
      setPoints(nextPoints);
      if (onUpdatePoints) {
        onUpdatePoints(-cost);
      }
      setRedeemedItem(title);

      const newVoucher = {
        id: `v-${Date.now()}`,
        title: title,
        code: `CIVIQ-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
        otc: `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`,
        redeemedDate: "Just now",
        status: "Active & Validated",
        type: id.startsWith("r2") ? "transit" : "eco",
        cost: cost
      };
      setActiveVouchers(prev => [newVoucher, ...prev]);

      setTimeout(() => setRedeemedItem(null), 3500);
    }
  };

  const handleBankCashoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccNo || !bankIFSC || !bankHolder) return;

    setIsBankProcessing(true);

    setTimeout(() => {
      const nextPoints = points - 500;
      setPoints(nextPoints);
      if (onUpdatePoints) {
        onUpdatePoints(-500);
      }

      setBankReceipt({
        txnId: `IMPS-${Math.floor(100000 + Math.random() * 900000)}Y`,
        refNo: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        account: bankAccNo.slice(-4).padStart(bankAccNo.length, "•"),
        ifsc: bankIFSC.toUpperCase(),
        holder: bankHolder,
        amount: "₹250.00",
        bankName: bankName,
        date: new Date().toLocaleTimeString() + " today"
      });

      setIsBankProcessing(false);
    }, 1500);
  };

  const handleOfficialVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialCode.trim()) {
      setOfficialVerifyError("Please enter your Department ID");
      return;
    }

    setIsOfficialVerifying(true);
    setOfficialVerifyError("");

    setTimeout(() => {
      setIsOfficialVerifying(false);
      setOfficialVerifySuccess(true);

      setActiveVouchers(prev => 
        prev.map(v => v.id === selectedVoucher.id ? { ...v, status: "Verified & Activated" } : v)
      );

      setSelectedVoucher(prev => prev ? { ...prev, status: "Verified & Activated" } : null);
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#070B14] flex flex-col text-slate-100 select-none overflow-hidden relative">
      
      {/* HEADER BAR */}
      <div className="bg-[#070B14] border-b border-indigo-950 p-4 shrink-0 flex items-center gap-3 relative z-30">
        {onBackToHome && (
          <button 
            onClick={onBackToHome}
            className="p-1.5 rounded-lg bg-[#0E1524] border border-indigo-950/80 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">CIVIQ Guide & Ranks</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Rules, features handbook, and community rewards</p>
        </div>
      </div>

      {/* THREE MODULE TAB SWITCHER */}
      <div className="bg-[#0E1524]/60 border-b border-indigo-950/60 p-2 shrink-0 flex gap-1.5 relative z-10">
        {[
          { id: "GUIDE", label: "Guide Manual" },
          { id: "REWARDS", label: "Wallet & Reward" },
          { id: "RANKS", label: "Ranks" }
        ].map((tab) => {
          const isSelected = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveMainTab(tab.id as any);
                setShowBankForm(false);
                setBankReceipt(null);
                setSelectedVoucher(null);
              }}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center border transition-all ${
                isSelected
                  ? "bg-[#4F46E5] text-white shadow-md border-transparent"
                  : "bg-[#070B14] border-indigo-950 text-slate-400 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* BODY CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">

        {/* 📖 TAB 1: DETAILED CIVIL RULES & GUIDE HANDBOOK */}
        {activeMainTab === "GUIDE" && (
          <div className="space-y-4 animate-fade-in">
            {/* Guide Headline */}
            <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900/60 border border-indigo-900/30 rounded-2xl">
              <span className="text-[8px] font-black text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 uppercase tracking-widest">CIVIQ Bengaluru Citizen Codex</span>
              <h3 className="text-xs font-black text-white mt-1.5 uppercase tracking-wide">CiviQ Collaborative Ecosystem Rules</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">
                Welcome to the unified municipal coordination portal. CiviQ connects residents, public officials, local mechanics, and volunteers together to monitor, clear, and co-fund ward infrastructure improvements.
              </p>
            </div>

            {/* Rule Sections */}
            <div className="space-y-3">
              
              {/* Section 1 */}
              <div className="p-4 bg-[#0E1524]/60 border border-indigo-950 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-[#818CF8] flex items-center gap-1.5 uppercase tracking-wide pb-1.5 border-b border-indigo-950/45">
                  <span className="text-xs">1️⃣</span> Citizen Reporting & Upvoting Lifecycle
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Any resident can file reports (like pothole anomalies, garbage hazards) in their current ward. 
                </p>
                <ul className="text-[9.5px] text-slate-300 space-y-1 pl-4 list-disc font-medium">
                  <li>Attach multiple horizontal photos or evidence video streams.</li>
                  <li>Other local ward stakeholders upvote to increase the <b>Anger Index</b>.</li>
                  <li><b>Undo & Delete capability</b> is supported instantly for filed reports or upvote clicks in case of typos.</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="p-4 bg-[#0E1524]/60 border border-indigo-950 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wide pb-1.5 border-b border-indigo-950/45">
                  <span className="text-xs">2️⃣</span> Respective Officials Dispatch Protocol
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Citizen reports are triaged by the BBMP Ward Office. Respective officials then decide how work is allocated:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-1">
                  <div className="p-2.5 bg-[#070B14]/60 border border-indigo-950 rounded-xl">
                    <span className="text-[8px] font-black text-[#818CF8] uppercase block tracking-wider">👥 Community Missions</span>
                    <p className="text-[8.5px] text-slate-400 mt-1 font-semibold">Low-severity clearings are dispatched to active citizen volunteers for points.</p>
                  </div>
                  <div className="p-2.5 bg-[#070B14]/60 border border-indigo-950 rounded-xl">
                    <span className="text-[8px] font-black text-teal-400 uppercase block tracking-wider">🔧 Professional Gigs</span>
                    <p className="text-[8.5px] text-slate-400 mt-1 font-semibold">Medium/high severity structural fixes are assigned to local fixers for cash payout.</p>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="p-4 bg-[#0E1524]/60 border border-indigo-950 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-teal-400 flex items-center gap-1.5 uppercase tracking-wide pb-1.5 border-b border-indigo-950/45">
                  <span className="text-xs">3️⃣</span> Step Logs, SLA Deadlines & Photo Auditing
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Once a mission or professional fixer gig is claimed, strict ward service policies apply:
                </p>
                <ul className="text-[9.5px] text-slate-300 space-y-1.5 pl-4 list-disc font-medium">
                  <li><b>Choose Responsibilities:</b> Claiming opens a panel to select specific duties before starting the job clock.</li>
                  <li><b>SLA Deadlines:</b> Gigs and missions have strict timers (12h for volunteers, 24h for contractors) displayed dynamically.</li>
                  <li><b>No-Proof Step Logging:</b> Performers can check off progress steps or type custom status logs on-site <i>without photo proof</i>.</li>
                  <li><b>Verification:</b> Local Gigs trigger server-side <b>Gemini AI Photogrammetry checks</b> comparing before/after photos to automatically release locked Escrow funds.</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="p-4 bg-[#0E1524]/60 border border-indigo-950 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-rose-400 flex items-center gap-1.5 uppercase tracking-wide pb-1.5 border-b border-indigo-950/45">
                  <span className="text-xs">4️⃣</span> Redemption & Safe Verification System
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Points credited from successful clearings are fully redeemable:
                </p>
                <ul className="text-[9.5px] text-slate-300 space-y-1 pl-4 list-disc font-medium">
                  <li><b>IMPS Bank Cashout:</b> Direct settlements of ₹250 cash for every 500 PTS.</li>
                  <li><b>BMTC Transit Tickets:</b> Redeem all-route general bus passes. You can redeem points separately for **Day Pass**, **Weekly Pass**, or **Monthly Pass**. To ensure absolute security, scanning the QR code only transmits pass info to the conductor's device. Officials never enter credentials on the user's screen; all verification occurs on their side, with cryptographic ledger records preventing duplication.</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div className="p-4 bg-[#0E1524]/60 border border-indigo-950 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide pb-1.5 border-b border-indigo-950/45">
                  <span className="text-xs">5️⃣</span> Relocation & 2-Step Security Keys
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Citizen accounts are tied to specific ward databases:
                </p>
                <ul className="text-[9.5px] text-slate-300 space-y-1 pl-4 list-disc font-medium">
                  <li>Relocating allows searching and typing suburb/ward options instantly.</li>
                  <li>To prevent identity spoofing, modifying any profile details requires a **2FA Safe Key Confirmation** (using registered SMS/Email codes).</li>
                </ul>
              </div>

              {/* Section 6 */}
              <div className="p-4 bg-[#0E1524]/60 border border-indigo-950 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide pb-1.5 border-b border-indigo-950/45">
                  <span className="text-xs">6️⃣</span> Funding Public Causes with Civic Points
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Pledging points to community projects actively accelerates neighborhood developments:
                </p>
                <ul className="text-[9.5px] text-slate-300 space-y-1.5 pl-4 list-disc font-medium">
                  <li><b>Streetlight & Public Causes:</b> You can choose to pledge points directly to micro-infrastructure causes like solar streetlights, tree plantations, or waste bins.</li>
                  <li><b>Real Money Conversions:</b> For every point contributed, BBMP partners, Resident Welfare Associations (RWAs), and corporate sponsors co-fund **₹0.50 of real money matching grants** into a dedicated ward project escrow fund. Once a cause hits its community target, the funds are instantly disbursed to verified contractors to deploy the physical hardware.</li>
                  <li><b>Live Progress Tracking:</b> You can monitor and audit the status (matching deposit levels, construction phase, photo proof of deployment) of all causes you have supported from your <b>Profile page</b> under the dedicated **Pledged Causes Track** panel.</li>
                </ul>
              </div>

              {/* Section 7 */}
              <div className="p-4 bg-[#0E1524]/60 border border-indigo-950 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-pink-400 flex items-center gap-1.5 uppercase tracking-wide pb-1.5 border-b border-indigo-950/45">
                  <span className="text-xs">7️⃣</span> Discussion Forums, Nested Replies & Moderator Flags
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Every civic report includes a fully interactive Discussion board to exchange ideas or report findings:
                </p>
                <ul className="text-[9.5px] text-slate-300 space-y-1.5 pl-4 list-disc font-medium">
                  <li><b>Infinitely Nested Replies:</b> Tap "Reply" on any comment or sub-comment to engage in nested threaded conversations.</li>
                  <li><b>Comment Management:</b> Authors can edit or delete their own comments instantly by tapping the 3-dots menu icon.</li>
                  <li><b>Cognizant Citizen Flags:</b> Spot inappropriate or offensive commentary? Tap the 3-dots menu to "Report Comment". Reported comments are submitted for official BBMP review.</li>
                  <li><b>Flag Tracker System:</b> Track all comments you have reported and any alerts on comments of your own in the **Moderator Flag System** on your Profile page.</li>
                </ul>
              </div>

              {/* Section 8 */}
              <div className="p-4 bg-[#0E1524]/60 border border-indigo-950 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-rose-400 flex items-center gap-1.5 uppercase tracking-wide pb-1.5 border-b border-indigo-950/45">
                  <span className="text-xs">8️⃣</span> Duty Claim Withdrawals & Profile Undo Protocols
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Plans change, and CiviQ guarantees absolute operational flexibility without arbitrary penalties:
                </p>
                <ul className="text-[9.5px] text-slate-300 space-y-1.5 pl-4 list-disc font-medium">
                  <li><b>Undo & Withdraw Claims:</b> If you claim a volunteer mission or local fixer gig, you can easily withdraw using the prominent **Undo & Withdraw** or **Undo Claim** buttons.</li>
                  <li><b>Central Control Panel:</b> You can abandon or undo claims either directly from the primary job board OR straight from the **Active Duties** panel in your Profile View. This releases the job back to the public grid instantly.</li>
                </ul>
              </div>

              {/* Section 9 */}
              <div className="p-4 bg-[#0E1524]/60 border border-indigo-950 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-black text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide pb-1.5 border-b border-indigo-950/45">
                  <span className="text-xs">9️⃣</span> Consolidated Civic Point Accrual Guide
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Maximize your community impact! Here is the precise formula for civic point accumulation:
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[9px] bg-[#070B14] p-1.5 px-2.5 rounded-lg border border-indigo-950">
                    <span className="text-slate-300 font-semibold">1. File a new verified public hazard report</span>
                    <span className="text-emerald-400 font-extrabold font-mono">+50 PTS</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] bg-[#070B14] p-1.5 px-2.5 rounded-lg border border-indigo-950">
                    <span className="text-slate-300 font-semibold">2. Complete an active Volunteer Mission</span>
                    <span className="text-emerald-400 font-extrabold font-mono">+100 PTS</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] bg-[#070B14] p-1.5 px-2.5 rounded-lg border border-indigo-950">
                    <span className="text-slate-300 font-semibold">3. Your report gets upvoted by other citizens</span>
                    <span className="text-emerald-400 font-extrabold font-mono">+10 PTS</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] bg-[#070B14] p-1.5 px-2.5 rounded-lg border border-indigo-950">
                    <span className="text-slate-300 font-semibold">4. Audit/Verify a resolved contractor work order</span>
                    <span className="text-emerald-400 font-extrabold font-mono">+50 PTS</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 🎟️ TAB 2: REWARDS, CASH-OUT, WALLET, AND REDEMPTION */}
        {activeMainTab === "REWARDS" && (
          <div className="space-y-4 animate-fade-in">
            
            {/* POINTS TOTAL CARD */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900/60 border border-indigo-900/40 rounded-2xl p-4 shadow-lg flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300">Your Current Balance</span>
                <span className="block text-2xl font-black text-teal-400 mt-1">{points} PTS</span>
                <p className="text-[9px] text-indigo-200 mt-1 font-semibold">
                  Level up your rank by reporting issues or taking up active citizen duties.
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                <Award className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            {/* DYNAMIC BANK CASHOUT FORM / RECEIPT MODAL */}
            {showBankForm && (
              <div className="bg-[#0E1524] border border-rose-500/30 rounded-2xl p-4 space-y-3 shadow-md animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-950/40">
                  <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    IMPS Direct Bank Account Cashout
                  </span>
                  <button 
                    onClick={() => {
                      setShowBankForm(false);
                      setBankReceipt(null);
                    }}
                    className="text-slate-400 hover:text-white font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>

                {bankReceipt ? (
                  /* BANK RECEIPT COMPONENT */
                  <div className="bg-[#070B14] p-3 rounded-xl border border-indigo-950/80 space-y-2.5">
                    <div className="text-center pb-1 border-b border-indigo-950/30">
                      <span className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-1 text-xs">✓</span>
                      <span className="text-[10px] font-black text-teal-400 block uppercase tracking-wider">IMPS Funds Disbursed</span>
                      <span className="text-[8px] text-slate-500 block">Ref ID: {bankReceipt.refNo}</span>
                    </div>
                    <div className="space-y-1 text-[9px] text-slate-300 font-semibold">
                      <div className="flex justify-between"><span>Bank Name:</span><span className="text-white font-bold">{bankReceipt.bankName}</span></div>
                      <div className="flex justify-between"><span>Account Holder:</span><span className="text-white font-bold">{bankReceipt.holder}</span></div>
                      <div className="flex justify-between"><span>Settled Account:</span><span className="text-white font-bold">{bankReceipt.account}</span></div>
                      <div className="flex justify-between"><span>Cleared Amount:</span><span className="text-teal-400 font-black">{bankReceipt.amount}</span></div>
                      <div className="flex justify-between"><span>Settle Gateway:</span><span className="text-white font-bold font-mono text-[8px]">{bankReceipt.txnId}</span></div>
                    </div>
                    <button
                      onClick={() => {
                        setShowBankForm(false);
                        setBankReceipt(null);
                      }}
                      className="w-full h-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-wider rounded-lg"
                    >
                      Close Receipt
                    </button>
                  </div>
                ) : (
                  /* BANK DETAILS INPUT FORM */
                  <form onSubmit={handleBankCashoutSubmit} className="space-y-2.5">
                    <p className="text-[9px] text-slate-400 leading-normal font-semibold">
                      Cashing out 500 PTS deducts points from your balance and deposits ₹250 directly into your bank via IMPS instantly.
                    </p>
                    <div>
                      <label className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">Account Holder Name</label>
                      <input 
                        type="text" 
                        value={bankHolder}
                        onChange={(e) => setBankHolder(e.target.value)}
                        className="w-full h-8 px-2 bg-[#070B14] border border-indigo-950 rounded-lg text-xs font-semibold text-white focus:outline-none" 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">Bank Name</label>
                        <input 
                          type="text" 
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full h-8 px-2 bg-[#070B14] border border-indigo-950 rounded-lg text-xs font-semibold text-white focus:outline-none" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">IFSC Code</label>
                        <input 
                          type="text" 
                          placeholder="e.g. SBIN0004921"
                          value={bankIFSC}
                          onChange={(e) => setBankIFSC(e.target.value)}
                          className="w-full h-8 px-2 bg-[#070B14] border border-indigo-950 rounded-lg text-xs font-semibold text-white focus:outline-none placeholder-slate-600 uppercase" 
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">Account Number</label>
                      <input 
                        type="password" 
                        placeholder="Enter full bank account number"
                        value={bankAccNo}
                        onChange={(e) => setBankAccNo(e.target.value)}
                        className="w-full h-8 px-2 bg-[#070B14] border border-indigo-950 rounded-lg text-xs font-semibold text-white focus:outline-none placeholder-slate-600" 
                        required 
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={points < 500 || isBankProcessing}
                      className={`w-full h-9 font-black text-[10px] uppercase tracking-wider rounded-xl ${
                        points >= 500 && !isBankProcessing
                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                          : "bg-indigo-950 text-slate-500 border border-indigo-900 cursor-not-allowed"
                      }`}
                    >
                      {isBankProcessing ? "Authorizing Gateway..." : points < 500 ? "Need 500 PTS to cash-out" : "Authorize ₹250 Direct IMPS Transfer"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ACTIVE REWARD PASSES WALLET */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                My Reward Passes (Active Wallet)
              </span>
              
              {activeVouchers.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-indigo-950 text-center text-slate-500 text-[10px] font-semibold">
                  No active vouchers. Redeem points below to collect bus passes and cash rewards!
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {activeVouchers.map((v) => (
                    <div 
                      key={v.id}
                      onClick={() => {
                        setSelectedVoucher(v);
                        setOfficialVerifySuccess(false);
                        setOfficialCode("");
                      }}
                      className={`p-3 rounded-xl border bg-gradient-to-r from-[#0E1524] to-[#141E33] hover:from-[#141E33] hover:to-[#1C2C4D] transition-all cursor-pointer flex justify-between items-center ${
                        v.status === "Claimable" ? "border-indigo-900/60" : "border-slate-800 opacity-65"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8.5 h-8.5 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                          <Ticket className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11.5px] font-black text-white truncate">{v.title}</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <span className="font-mono">Code: {v.code}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          v.status === "Claimable" 
                            ? "bg-teal-500/15 text-teal-400 border border-teal-500/20" 
                            : "bg-slate-800 text-slate-400 border border-slate-700/30"
                        }`}>
                          {v.status}
                        </span>
                        <span className="block text-[7.5px] text-slate-500 mt-1 font-semibold">Tap to Claim Ticket</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* REDEEMING POINTS OPTIONS */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Redeem Points for Brand-Aligned Benefits
              </span>
              
              <AnimatePresence>
                {redeemedItem && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 shrink-0 animate-bounce" />
                    <div>
                      <span className="block font-black uppercase text-[9px] tracking-wider text-emerald-300">Redemption Successful 🎟️</span>
                      <span>"{redeemedItem}" is active! Pass has been transferred to your Active Wallet above.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 gap-2.5">
                {redemptionOptions.map((opt) => {
                  const OptIcon = opt.icon;
                  const canAfford = points >= opt.cost;
                  return (
                    <div 
                      key={opt.id} 
                      className={`p-3 rounded-xl border bg-[#0E1524]/40 flex flex-col justify-between gap-3 ${opt.theme}`}
                    >
                      <div className="flex gap-2.5 items-start">
                        <div className="w-8 h-8 rounded-lg bg-[#070B14] border border-indigo-950/60 flex items-center justify-center shrink-0 text-slate-300">
                          <OptIcon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h4 className="text-[11px] font-black text-white truncate max-w-[170px]">{opt.title}</h4>
                            <span className="text-[9.5px] font-mono font-black text-indigo-300 shrink-0">{opt.cost} PTS</span>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-1 leading-normal font-semibold">{opt.desc}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedCauseId(opt.id)}
                          className="px-2.5 py-1 text-[8.5px] font-black text-slate-400 hover:text-white uppercase tracking-wider"
                        >
                          Ledger Info 📊
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRedeem(opt.id, opt.title, opt.cost)}
                          disabled={!canAfford}
                          className={`h-7 px-3.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            canAfford 
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95" 
                              : "bg-[#070B14] border border-indigo-950 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {canAfford ? "Redeem Benefit" : "Insufficient PTS"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 🏆 TAB 3: RANKS AND ACTIVITY MILESTONES */}
        {activeMainTab === "RANKS" && (
          <div className="space-y-4 animate-fade-in">
            {/* 1. ACTIVE RANKS EXPLAINED */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Different Types of Active Rank</span>
              <div className="grid grid-cols-1 gap-2">
                {ranks.map((rk, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border bg-[#0E1524]/60 flex gap-3 items-start transition-all hover:bg-[#0E1524]/90 ${rk.color.split(" ")[2]} ${rk.color.split(" ")[1]}`}
                  >
                    <div className={`mt-0.5 px-2 py-0.5 rounded text-[8px] font-black ${rk.color.split(" ")[0]} bg-[#070B14]`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className={`text-xs font-black ${rk.color.split(" ")[0]}`}>{rk.title}</h4>
                        <span className="text-[8.5px] font-mono font-black opacity-80">{rk.range}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold">{rk.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. HOW ARE POINTS AWARDED */}
            <div className="space-y-2.5 bg-[#0E1524] border border-indigo-950/80 rounded-2xl p-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block pb-1 border-b border-indigo-950/45">
                How Points are Awarded & How We Rank
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                CIVIQ implements a gamified, peer-voted ward ranking matrix. Every citizen's report goes through AI triaging and neighborhood support upvoting. Active leaders are ranked weekly by ward engagement index.
              </p>
              <div className="space-y-2 pt-2">
                {pointRules.map((rule, idx) => {
                  const IconComp = rule.icon;
                  return (
                    <div key={idx} className="flex justify-between items-center bg-[#070B14] p-2 rounded-xl border border-indigo-950/40">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 ${rule.color}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-300 truncate max-w-[180px]">
                          {rule.activity}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-mono font-black text-teal-400 shrink-0">
                        {rule.points}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 💳 DYNAMIC OTC TICKET VERIFICATION MODAL / DRAWER */}
      <AnimatePresence>
        {selectedVoucher && (
          <div className="absolute inset-0 bg-black/75 z-50 flex flex-col justify-end animate-fade-in">
            <div className="flex-1" onClick={() => setSelectedVoucher(null)} />
            
            <div className="bg-[#0E1524] rounded-t-3xl border-t border-indigo-950 p-5 space-y-4 animate-slide-up max-h-[90%] overflow-y-auto">
              
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                    Secure Ticket Wallet 🚇
                  </span>
                  <h3 className="text-xs font-black text-white mt-1">{selectedVoucher.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedVoucher(null)}
                  className="text-slate-400 hover:text-white font-bold text-xs p-1"
                >
                  ✕
                </button>
              </div>

              {/* HIGH-SECURITY CRYPTO TICKET INTERFACE */}
              <div className="bg-[#070B14] border border-indigo-950 p-5 rounded-2xl text-center space-y-4 relative overflow-hidden">
                {/* Rolling laser scan line animation effect */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500/30 shadow-[0_0_10px_#4F46E5] animate-bounce pointer-events-none" />

                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Secure BBMP Ledger QR Code</span>
                
                {/* Mock QR Code Container */}
                <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center border-4 border-indigo-500/20 shadow-xl relative group">
                  <QrCode className="w-32 h-32 text-slate-900" />
                  
                  {/* Blinking Live Link Badge */}
                  <div className="absolute -bottom-2 bg-emerald-500 text-white text-[7.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow border border-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    Live Ledger Linked
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">Pass Code</span>
                  <span className="text-xs font-mono font-black text-white">{selectedVoucher.code}</span>
                </div>

                <div className="bg-[#0E1524]/80 p-3 rounded-xl border border-indigo-950/50 space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                    <span>ROTATING SECURITY CODE:</span>
                    <span className="text-indigo-400 font-bold">{selectedVoucher.otc}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[9.5px] font-bold text-amber-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> SECURE CODE EXPIRES IN:</span>
                    <span className="font-mono">{formatTime(countdown)}</span>
                  </div>
                </div>
              </div>

              {/* SECURITY EXPLANATION FOR TRANSIT OFFICIALS */}
              <div className="p-4 bg-[#070B14]/80 border border-dashed border-indigo-950/60 rounded-2xl space-y-2">
                <span className="text-[8.5px] font-black text-[#818CF8] uppercase tracking-widest block flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  Anti-Duplication Protocol
                </span>
                <p className="text-[9px] text-slate-400 leading-normal font-semibold">
                  This pass is cryptographically bound to your CiviQ profile. Scanning the QR code above allows BMTC conductors and terminal inspectors to instantly register, verify, and validate travel rights directly on their official handheld ETM terminals. <b>No credential inputs or manual logins are required on your screen — all transit audits occur on their secure devices.</b>
                </p>
                <div className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-wider flex items-center gap-1 justify-center pt-1">
                  <CheckCircle2 className="w-3 h-3 text-teal-400" /> Cryptographic Signatures Authenticated by Bengaluru Smart Transit Hub
                </div>
              </div>

              {/* Footer action */}
              <button
                onClick={() => setSelectedVoucher(null)}
                className="w-full h-10 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors active:scale-98"
              >
                Done
              </button>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CAMPAIGN IMPACT ledger MODAL */}
      <AnimatePresence>
        {selectedCauseId && causesImpactData[selectedCauseId] && (() => {
          const cause = causesImpactData[selectedCauseId];
          return (
            <div className="absolute inset-0 bg-black/75 z-50 flex flex-col justify-end animate-fade-in">
              <div className="flex-1" onClick={() => setSelectedCauseId(null)} />
              
              <div className="bg-[#0E1524] rounded-t-3xl border-t border-indigo-950 p-5 space-y-4 animate-slide-up max-h-[90%] overflow-y-auto text-slate-100">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-black bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      Campaign Impact Ledger 📊
                    </span>
                    <h3 className="text-sm font-black text-white mt-1.5">{cause.title}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedCauseId(null)}
                    className="text-slate-400 hover:text-white font-bold text-xs p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Banner Image */}
                <div className="relative h-28 rounded-2xl overflow-hidden border border-indigo-950/40">
                  <img src={cause.imageUrl} alt={cause.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/40 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-xs font-black text-white bg-[#4F46E5]/90 px-2.5 py-0.5 rounded-lg shadow-md border border-indigo-500/20">
                    🟢 {cause.impactQuantity}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[10.5px] text-slate-300 font-semibold leading-relaxed">
                  {cause.description}
                </p>

                {/* Dynamic Milestones */}
                <div className="bg-[#070B14] border border-indigo-950/80 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex justify-between items-center text-[9.5px]">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider block">Campaign Milestone Progress</span>
                    <span className="font-bold text-teal-400">{cause.progress}% Funded</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-indigo-950">
                    <div className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-500 rounded-full" style={{ width: `${cause.progress}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[8.5px] text-slate-500">
                    <span>{cause.totalContributed} PTS raised</span>
                    <span>Next milestone: {Math.ceil(cause.totalContributed / (cause.progress/100))} PTS</span>
                  </div>
                </div>

                {/* Contribution details and locations */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-3 bg-indigo-950/10 border border-indigo-950/40 rounded-xl">
                    <span className="text-slate-400 block text-[8px] font-black uppercase tracking-wider">Community Ledger</span>
                    <span className="font-black text-white text-xs block mt-1">{cause.totalContributed} PTS</span>
                    <span className="text-[8px] text-slate-500 font-bold block mt-0.5">Total redeemed</span>
                  </div>
                  <div className="p-3 bg-indigo-950/10 border border-indigo-950/40 rounded-xl">
                    <span className="text-slate-400 block text-[8px] font-black uppercase tracking-wider">Total Backers</span>
                    <span className="font-black text-white text-xs block mt-1">{cause.contributorsCount} Citizens</span>
                    <span className="text-[8px] text-slate-500 font-bold block mt-0.5">Active co-funders</span>
                  </div>
                </div>

                {/* Deployment Sites / Locations list */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Active Deployment Locations</span>
                  <div className="space-y-1">
                    {cause.locations.map((loc, idx) => (
                      <div key={idx} className="flex gap-1.5 items-center bg-[#070B14] p-1.5 rounded-lg border border-indigo-950/30 text-[9.5px] font-semibold text-slate-300">
                        <span className="text-emerald-500">📍</span>
                        <span>{loc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Pledges Ledger Feed */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Recent Pledges Feed</span>
                  <div className="space-y-1 border border-dashed border-indigo-950/55 rounded-xl p-2 bg-[#070B14]/40">
                    {cause.recentActivity.map((act, idx) => (
                      <p key={idx} className="text-[9px] text-slate-400 font-medium">
                        • {act}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedCauseId(null)}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
                  >
                    Close Campaign View
                  </button>
                </div>

              </div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};
