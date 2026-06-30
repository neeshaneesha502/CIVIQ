import React, { useState, useEffect, useRef } from "react";
import { Issue } from "../../types";
import { Camera, Image as ImageIcon, Mic, MicOff, MapPin, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, AlertTriangle, Search } from "lucide-react";
import { sanitizeInput } from "../../lib/sanitize";
import { bengaluruAreasAndWards } from "../../data/bengaluruData";

const areaCoordinates: { [key: string]: { lat: number; lng: number } } = {
  "Indiranagar": { lat: 12.9784, lng: 77.6408 },
  "Koramangala": { lat: 12.9352, lng: 77.6245 },
  "Marathahalli": { lat: 12.9562, lng: 77.7011 },
  "JP Nagar": { lat: 12.9063, lng: 77.5857 },
  "Whitefield": { lat: 12.9698, lng: 77.7500 },
  "Jayanagar": { lat: 12.9250, lng: 77.5938 },
  "Malleshwaram": { lat: 12.9980, lng: 77.5714 },
  "HSR Layout": { lat: 12.9116, lng: 77.6389 },
  "Sadashivanagar": { lat: 13.0068, lng: 77.5813 },
  "Hebbal": { lat: 13.0354, lng: 77.5988 },
  "Banashankari": { lat: 12.9254, lng: 77.5468 },
  "Rajajinagar": { lat: 12.9880, lng: 77.5540 },
  "BTM Layout": { lat: 12.9166, lng: 77.6101 },
  "Bellandur": { lat: 12.9304, lng: 77.6784 },
  "Yelahanka": { lat: 13.1007, lng: 77.5963 },
  "RT Nagar": { lat: 13.0180, lng: 77.5948 },
  "Electronic City": { lat: 12.8491, lng: 77.6639 },
  "Basavanagudi": { lat: 12.9406, lng: 77.5738 },
  "Frazer Town": { lat: 12.9968, lng: 77.6131 },
  "Richmond Town": { lat: 12.9600, lng: 77.6100 }
};

interface ReportViewProps {
  onAddIssue: (issue: Issue) => void;
  onNavigateToTab: (tab: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ onAddIssue, onNavigateToTab }) => {
  const [step, setStep] = useState<number>(1);
  
  // Form State
  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("Roads 🛣️");
  const [description, setDescription] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [address, setAddress] = useState<string>("Koramangala 80 Feet Rd, Bengaluru, KA 560095");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9352, lng: 77.6245 });
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  // AI Triage State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // Success Ref
  const successRef = useRef<any>(null);

  // Category list
  const categories = [
    "Roads 🛣️", "Water 💧", "Lighting 💡", "Sanitation ♻️",
    "Utilities ⚡", "Parks 🌳", "Public Safety 🚨", "Other 📋"
  ];

  // Simulated Voice transcripts for Bengaluru citizens
  const mockTranscripts = [
    "There is a deep pothole cluster forming right after the flyover at Marathahalli Bridge. Vehicles are swerving like crazy to avoid it and it's super dangerous.",
    "The streetlights on Indiranagar 100 Feet Road have been completely dead for 3 nights. The whole stretch is pitch dark and feels unsafe to walk.",
    "Raw sewage is bubbling out of a broken sanitary manhole near Koramangala 5th block. It's overflowing onto the main pavement and smells awful.",
    "A major water supply pipeline has burst here in JP Nagar 6th phase, clean drinking water is spraying everywhere and wasting thousands of liters."
  ];

  // Speech simulator
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      setRecordProgress(0);
      timer = setInterval(() => {
        setRecordProgress((prev) => {
          if (prev >= 100) {
            setIsRecording(false);
            // Pre-fill transcript randomly
            const randomText = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
            setDescription(randomText);
            // Set auto suggested title
            const shortTitle = randomText.split(" ").slice(0, 5).join(" ") + "...";
            setTitle(shortTitle);
            return 100;
          }
          return prev + 15;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Auto title suggestion after description typing pauses
  useEffect(() => {
    if (description.length > 20 && !title) {
      const timer = setTimeout(() => {
        const generatedTitle = description.slice(0, 30) + (description.length > 30 ? "..." : "");
        setTitle(generatedTitle);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [description]);

  // Handle Photo selection
  const handleCapturePhoto = () => {
    setPhoto("https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600");
    setStep(2); // Auto advance
  };

  const handleChooseGallery = () => {
    setPhoto("https://images.unsplash.com/photo-1599740831111-e63777d853e8?auto=format&fit=crop&q=80&w=600");
    setStep(2);
  };

  // Run server-side Gemini Triage
  const runAiTriage = async () => {
    setIsAnalyzing(true);
    setStep(4);
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category })
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Final submission to DB list
  const handleSubmitReport = () => {
    const cleanTitle = sanitizeInput(title || "New Civic Report", 100);
    const cleanDescription = sanitizeInput(description || "", 1000);

    const newIssue: Issue = {
      id: `CIVIQ-${Math.floor(100 + Math.random() * 900)}`,
      title: cleanTitle,
      description: cleanDescription,
      category,
      severity: aiAnalysis?.severity || "Low",
      status: "Pending",
      latitude: coords.lat,
      longitude: coords.lng,
      assignedTo: aiAnalysis?.assignedTo || "RWA Volunteers",
      type: aiAnalysis?.type || "volunteer",
      payment: aiAnalysis?.payment || "Civic Points: +100 pts",
      sla: aiAnalysis?.sla || 336,
      hoursPassed: 1,
      upvotes: 1,
      safetyRisk: aiAnalysis?.safetyRisk || false,
      address,
      date: new Date().toISOString(),
      angerIndex: aiAnalysis?.angerIndex || 20,
      department: aiAnalysis?.department || "General Public Works",
      estimatedTime: aiAnalysis?.estimatedTime || "14 days",
      urgencyReason: aiAnalysis?.urgencyReason || "Triage assigned based on community impact.",
      actionItems: aiAnalysis?.actionItems || ["Verify coordinates", "Coordinate responder dispatch", "Initiate repair review"],
      isUserReported: true,
      beforePhotoUrl: photo || "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&q=80"
    };

    onAddIssue(newIssue);
    setStep(5);

    // Auto navigate after 3 seconds
    setTimeout(() => {
      onNavigateToTab("Feed");
    }, 3500);
  };

  // Reset reporting wizard
  const resetForm = () => {
    setStep(1);
    setPhoto(null);
    setCategory("Roads 🛣️");
    setDescription("");
    setTitle("");
    setAiAnalysis(null);
  };

  return (
    <div className="w-full h-full bg-[#F0F4FF] dark:bg-[#070B14] flex flex-col justify-between select-none text-slate-800 dark:text-slate-100">
      {/* HEADER SECTION */}
      <div className="px-4 pt-5 pb-3 bg-[#F0F4FF] dark:bg-[#070B14] border-b border-slate-200 dark:border-indigo-950 flex justify-between items-center">
        <button
          onClick={() => step > 1 && step < 5 ? setStep(step - 1) : onNavigateToTab("Home")}
          className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#1B253D] text-slate-600 dark:text-slate-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          Report Issue {step < 5 ? `(Step ${step}/4)` : ""}
        </span>
        <div className="w-8" />
      </div>

      {/* STEP PROGRESS LINE */}
      {step < 5 && (
        <div className="w-full bg-slate-100 dark:bg-[#1B253D] h-1.5 flex">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-full transition-all duration-300 ${
                s <= step ? "bg-[#4F46E5] dark:bg-[#818CF8]" : "bg-slate-200 dark:bg-[#1B253D]"
              }`}
            />
          ))}
        </div>
      )}

      {/* WIZARD SCREENS CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        
        {/* STEP 1: CAPTURE PHOTO */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-between animate-fade-in">
            <div className="flex flex-col items-center text-center mt-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Capture the Issue</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                Providing a photo helps Gemini AI identify the category, severity, and exact agency.
              </p>

              {/* Viewfinder block */}
              <div className="w-full aspect-[4/3] bg-slate-200 dark:bg-[#070B14] rounded-2xl mt-6 border-2 border-dashed border-slate-300 dark:border-indigo-950 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                {photo ? (
                  <img src={photo} alt="Issue preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 gap-2">
                    <Camera className="w-12 h-12 stroke-[1.5] text-[#4F46E5] animate-pulse" />
                    <span className="text-[11px] font-bold">LENS PREVIEW STANDBY</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={handleCapturePhoto}
                className="w-full h-13 bg-[#4F46E5] dark:bg-[#818CF8] text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-xs shadow-md shadow-indigo-500/10 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
              <button
                onClick={handleChooseGallery}
                className="w-full h-13 bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 text-slate-800 dark:text-slate-200 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-all"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" />
                Choose from Gallery
              </button>
              <button
                onClick={() => setStep(2)}
                className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:underline mt-2"
              >
                Skip — Report without photo
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORY + DESCRIPTION */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between animate-fade-in">
            <div className="flex flex-col">
              <h3 className="text-md font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">
                Select Category
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-bold transition-all snap-start ${
                      category === cat
                        ? "bg-[#4F46E5] dark:bg-[#818CF8] text-white shadow-md shadow-indigo-500/10"
                        : "bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Speech Transcription Section */}
              <div className="mt-5 flex flex-col items-center">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
                  Voice Triage Entry
                </h4>
                <p className="text-[10px] text-slate-400 text-center mt-0.5">
                  Tap to dictate. Gemini transcribes and summaries in real-time.
                </p>

                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`w-18 h-18 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 mt-3 relative ${
                    isRecording
                      ? "bg-rose-500 text-white scale-110 animate-pulse"
                      : "bg-indigo-50 dark:bg-[#1B253D] border border-indigo-100 dark:border-indigo-900/30 text-[#4F46E5] dark:text-[#818CF8]"
                  }`}
                >
                  {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  {isRecording && (
                    <div className="absolute inset-[-4px] rounded-full border border-rose-400 animate-ping opacity-75" />
                  )}
                </button>

                {isRecording && (
                  <span className="text-[10px] font-bold font-mono text-rose-500 mt-2 tracking-widest uppercase">
                    SpeechRecognizer Active...
                  </span>
                )}
              </div>

              {/* Description Input */}
              <div className="mt-5">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Describe Issue Clearly
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue clearly (min 20 characters)..."
                  className="w-full h-24 p-3 bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 rounded-xl text-xs shadow-sm focus:outline-none focus:border-[#4F46E5]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Character count: {description.length}</span>
                  <span>Minimum required: 20</span>
                </div>
              </div>

              {/* Auto Title Input */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  Title
                  <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 rounded border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> AI Suggestion
                  </span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Provide a short title..."
                  className="w-full p-3 bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 rounded-xl text-xs shadow-sm focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={description.length < 20}
              className={`w-full h-13 mt-6 rounded-2xl flex items-center justify-center gap-1.5 font-bold text-xs shadow-md active:scale-95 transition-all ${
                description.length >= 20
                  ? "bg-[#4F46E5] dark:bg-[#818CF8] text-white shadow-indigo-500/10"
                  : "bg-slate-100 dark:bg-[#1B253D] text-slate-400 dark:text-slate-600 cursor-not-allowed"
              }`}
            >
              Continue Location
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: LOCATION */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-between animate-fade-in">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Pinpoint Location</h3>
              <p className="text-xs text-slate-400 mt-1">
                Establish correct GPS coordinates or select a Bengaluru ward manually to ensure accurate dispatch.
              </p>

              {/* Map Simulator */}
              <div className="w-full h-[180px] bg-sky-100 dark:bg-[#070B14] rounded-2xl border border-slate-200 dark:border-indigo-950 mt-4 relative overflow-hidden flex items-center justify-center shadow-inner">
                {/* Visual grid layout simulating a map */}
                <div className="absolute inset-0 bg-grid opacity-10" />
                {/* Mock Roads */}
                <div className="absolute top-1/2 left-0 right-0 h-10 bg-slate-200/50 dark:bg-[#0E1524]/50 border-y border-slate-300 dark:border-indigo-950 transform -translate-y-1/2 flex items-center pl-6">
                  <span className="text-[8px] font-mono tracking-widest text-[#4F46E5] dark:text-[#818CF8] font-bold uppercase">
                    {address.split(",")[0]?.toUpperCase() || "MAIN CROSS ROAD"}
                  </span>
                </div>
                <div className="absolute left-1/3 top-0 bottom-0 w-8 bg-slate-200/50 dark:bg-[#0E1524]/50 border-x border-slate-300 dark:border-indigo-950 flex flex-col justify-center items-center">
                  <span className="text-[8px] font-mono tracking-widest text-[#4F46E5] dark:text-[#818CF8] font-bold uppercase rotate-90 my-2">WARD MAP</span>
                </div>

                {/* Draggable red pin in center */}
                <div className="absolute flex flex-col items-center animate-bounce z-10">
                  <MapPin className="w-8 h-8 text-rose-500 fill-rose-500" />
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-[8px] font-black uppercase text-white tracking-wider mt-0.5 shadow-md">
                    INCIDENT POINT
                  </span>
                </div>

                {/* Bengaluru map tags */}
                <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md border border-slate-200 dark:border-indigo-950 rounded px-2 py-0.5 text-[8px] font-mono text-slate-400">
                  LAT: {coords.lat.toFixed(4)} | LNG: {coords.lng.toFixed(4)}
                </div>
              </div>

              {/* Use current location */}
              <button
                type="button"
                onClick={() => {
                  setLocationLoading(true);
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        setCoords({ lat, lng });
                        
                        // Map to nearest pre-defined ward
                        let closestArea = bengaluruAreasAndWards[0];
                        let minDistance = Infinity;
                        bengaluruAreasAndWards.forEach((item) => {
                          const areaCoords = areaCoordinates[item.area] || { lat: 12.9716, lng: 77.5946 };
                          const dist = Math.pow(lat - areaCoords.lat, 2) + Math.pow(lng - areaCoords.lng, 2);
                          if (dist < minDistance) {
                            minDistance = dist;
                            closestArea = item;
                          }
                        });
                        setAddress(`${closestArea.area} Main Rd, ${closestArea.ward}, Bengaluru, KA`);
                        setLocationLoading(false);
                      },
                      (error) => {
                        console.warn("Geolocation error, using random fallback:", error);
                        const randomArea = bengaluruAreasAndWards[Math.floor(Math.random() * bengaluruAreasAndWards.length)];
                        const areaCoords = areaCoordinates[randomArea.area];
                        setCoords(areaCoords);
                        setAddress(`${randomArea.area} Main Rd, ${randomArea.ward}, Bengaluru, KA`);
                        setLocationLoading(false);
                      },
                      { timeout: 8000 }
                    );
                  } else {
                    const randomArea = bengaluruAreasAndWards[Math.floor(Math.random() * bengaluruAreasAndWards.length)];
                    const areaCoords = areaCoordinates[randomArea.area];
                    setCoords(areaCoords);
                    setAddress(`${randomArea.area} Main Rd, ${randomArea.ward}, Bengaluru, KA`);
                    setLocationLoading(false);
                  }
                }}
                disabled={locationLoading}
                className="mt-3 px-4 h-11 bg-white dark:bg-[#111827] border border-slate-200 dark:border-indigo-950 text-[#4F46E5] dark:text-[#818CF8] disabled:text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <MapPin className={`w-4 h-4 ${locationLoading ? "animate-spin text-indigo-500" : "animate-bounce"}`} />
                {locationLoading ? "Detecting GPS Position..." : "📍 Detect My GPS Location"}
              </button>

              {/* MANUAL WARD SELECTOR (SEARCHABLE) */}
              <div className="mt-4">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Or Select Bengaluru Ward Manually ({bengaluruAreasAndWards.length} Available)
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder="Search Ward (e.g. Indiranagar, Whitefield, JP Nagar...)"
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-indigo-950 rounded-xl text-xs shadow-sm focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                {/* Filtered Area grid */}
                <div className="mt-2 grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto scrollbar-none border border-slate-200 dark:border-indigo-950/60 p-1.5 rounded-xl bg-slate-50 dark:bg-[#070B14]">
                  {bengaluruAreasAndWards
                    .filter((item) =>
                      item.area.toLowerCase().includes(locationSearch.toLowerCase()) ||
                      item.ward.toLowerCase().includes(locationSearch.toLowerCase())
                    )
                    .map((item) => {
                      const isSelected = address.includes(item.area);
                      return (
                        <button
                          key={item.area}
                          type="button"
                          onClick={() => {
                            const areaCoords = areaCoordinates[item.area] || { lat: 12.9716, lng: 77.5946 };
                            setCoords(areaCoords);
                            setAddress(`${item.area} Main Rd, ${item.ward}, Bengaluru, KA`);
                          }}
                          className={`p-2 rounded-lg text-left text-[11px] font-bold border transition-colors ${
                            isSelected
                              ? "bg-indigo-500/10 border-[#4F46E5] text-[#4F46E5] dark:text-[#818CF8]"
                              : "bg-white dark:bg-[#111827] border-slate-100 dark:border-indigo-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-indigo-800"
                          }`}
                        >
                          <span className="block text-xs font-black">{item.area}</span>
                          <span className="block text-[9px] text-slate-400 font-semibold">{item.ward}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Editable Geocoded Address */}
              <div className="mt-4">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Custom Geocoded Address / Landmark
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Type address or select a ward above..."
                  className="w-full p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-indigo-950 rounded-xl text-xs shadow-sm focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <button
              onClick={runAiTriage}
              className="w-full h-12 mt-4 bg-[#4F46E5] dark:bg-[#818CF8] text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-xs shadow-md shadow-indigo-500/10 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              Analyze with Gemini AI
            </button>
          </div>
        )}

        {/* STEP 4: AI ANALYSIS */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-between animate-fade-in">
            {isAnalyzing ? (
              /* Analyzing Loader State */
              <div className="flex-1 flex flex-col items-center justify-center text-center mt-12">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50/50 dark:bg-[#070B14] border border-indigo-100 dark:border-indigo-950 flex items-center justify-center relative animate-pulse shadow-md mb-4">
                  <Sparkles className="w-8 h-8 text-[#4F46E5] dark:text-[#818CF8] animate-spin" />
                </div>
                <h3 className="text-md font-extrabold text-slate-800 dark:text-white">Analyzing report with Gemini AI...</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                  Triage categorizing, routing responders, and assessing public risk factor indices...
                </p>

                {/* Shimmer layout boxes */}
                <div className="w-full mt-6 space-y-3">
                  <div className="h-10 bg-indigo-100/30 dark:bg-[#070B14] rounded-xl animate-pulse" />
                  <div className="h-14 bg-indigo-100/30 dark:bg-[#070B14] rounded-xl animate-pulse" />
                  <div className="h-18 bg-indigo-100/30 dark:bg-[#070B14] rounded-xl animate-pulse" />
                </div>
              </div>
            ) : (
              /* Reveal AI results */
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex flex-col">
                  <h3 className="text-md font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">
                    AI Triage Verdict
                  </h3>

                  {/* Verdict severity */}
                  <div className="bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 p-4 rounded-2xl shadow-sm mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Severity</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Gemini Confidence: {aiAnalysis?.confidence}%</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                          aiAnalysis?.severity === "Critical"
                            ? "bg-rose-500"
                            : aiAnalysis?.severity === "High"
                            ? "bg-orange-500"
                            : aiAnalysis?.severity === "Medium"
                            ? "bg-yellow-500"
                            : "bg-emerald-500"
                        }`}
                      >
                        {aiAnalysis?.severity}
                      </span>
                      <button
                        onClick={() => {
                          const override = aiAnalysis?.severity === "Critical" ? "Low" : "Critical";
                          setAiAnalysis({ ...aiAnalysis, severity: override });
                        }}
                        className="text-[10px] font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline"
                      >
                        Tap to override
                      </button>
                    </div>
                  </div>

                  {/* Verdict Responder routing */}
                  <div
                    className={`p-4 rounded-2xl border shadow-sm mb-3 text-slate-800 dark:text-white ${
                      aiAnalysis?.severity === "Critical"
                        ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30"
                        : aiAnalysis?.severity === "High"
                        ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30"
                        : aiAnalysis?.severity === "Medium"
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30"
                        : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Who Handles This (Routing Triage)
                    </span>
                    <h4 className="text-md font-black flex items-center gap-1.5">
                      {aiAnalysis?.severity === "Critical" ? "🚨" : aiAnalysis?.severity === "High" ? "🏛️" : aiAnalysis?.severity === "Medium" ? "🔧" : "👥"}
                      {aiAnalysis?.assignedTo}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      Estimate: {aiAnalysis?.estimatedTime} | {aiAnalysis?.payment}
                    </p>
                    {aiAnalysis?.severity === "Critical" && (
                      <p className="text-[10px] text-rose-500 font-extrabold mt-1">
                        Auto-escalates to State Government if unresolved.
                      </p>
                    )}
                  </div>

                  {/* AI Insights & Department actions */}
                  <div className="bg-[#F0F4FF] dark:bg-[#070B14] border border-slate-200 dark:border-indigo-950 p-4 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                      Department Insights
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                      <div>
                        <span className="text-slate-400 block">Department:</span>
                        <span className="font-bold">{aiAnalysis?.department}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Estimated Fix:</span>
                        <span className="font-bold">{aiAnalysis?.estimatedTime}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Target Actions:</span>
                    <ul className="space-y-1">
                      {aiAnalysis?.actionItems?.map((item: string, idx: number) => (
                        <li key={idx} className="text-[10px] text-slate-600 dark:text-slate-400 font-medium list-disc pl-1 ml-3">
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Safety risk check */}
                    {aiAnalysis?.safetyRisk && (
                      <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-lg flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          Critical Public Safety Vulnerability Flagged
                        </span>
                      </div>
                    )}

                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-[10px] font-semibold italic text-amber-800 dark:text-amber-400">
                      Reason: {aiAnalysis?.urgencyReason}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitReport}
                  className="w-full h-13 mt-6 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-1.5 font-bold text-xs shadow-md shadow-emerald-500/10 active:scale-95 transition-all animate-bounce"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Report to Grid
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: SUCCESS STATE */}
        {step === 5 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            {/* Draw checkmark */}
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg relative">
              <CheckCircle2 className="w-12 h-12 stroke-[2]" />
              <div className="absolute inset-[-6px] rounded-full border-2 border-emerald-400 animate-ping opacity-25" />
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-6">Report Submitted! 🎉</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-[240px]">
              Congratulations! Your triage report has been catalogued and routed to the corresponding ward teams.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 dark:bg-[#0E1524] border border-indigo-100 dark:border-indigo-950 w-full">
              <span className="text-[9px] font-black tracking-widest text-[#4F46E5] block uppercase mb-1">
                DEMO REWARD AWARDED
              </span>
              <span className="text-lg font-black text-[#4F46E5] dark:text-[#818CF8] block">
                +50 Civic Points
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-mono block">
                REF: CIVIQ-{Math.floor(100000 + Math.random() * 900000)}
              </span>
            </div>

            <button
              onClick={() => onNavigateToTab("Feed")}
              className="mt-8 px-6 py-3 bg-[#4F46E5] dark:bg-[#818CF8] text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
            >
              View in Feed Grid
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
