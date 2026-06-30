import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, MapPin, Film } from "lucide-react";

interface VideoPlayerProps {
  videoUrl?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  address = "Bengaluru Ward Sector",
  latitude = 12.9716,
  longitude = 77.5946
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(8); // default mock duration
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set real video or beautiful default pothole/water/street loop
  const realUrl = videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-street-traffic-and-pavement-in-a-busy-city-at-night-42284-large.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 8);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(err => console.log("Auto-play error: ", err));
      setIsPlaying(true);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
        <Film className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        Citizen Video Evidence & Location
      </div>

      <div className="w-full aspect-[16/9] bg-black rounded-2xl overflow-hidden relative border border-slate-200 dark:border-indigo-950/60 shadow-md group">
        
        {/* Real HTML5 Video element */}
        <video
          ref={videoRef}
          src={realUrl}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          onClick={handlePlayPause}
        />

        {/* Video Overlays */}
        {!isPlaying && (
          <div 
            onClick={handlePlayPause}
            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-colors duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 active:scale-95">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Geotag Watermark */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/30 text-[9px] font-semibold text-white flex items-center gap-1.5 shadow">
          <MapPin className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span className="truncate max-w-[150px]">{address.split(",")[0]}</span>
        </div>

        {/* Coordinates HUD */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-slate-300 border border-slate-700/20">
          {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
        </div>

        {/* Custom Video Controls overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          
          {/* Progress Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white font-mono">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 rounded-lg appearance-none bg-slate-600 accent-indigo-500 cursor-pointer"
            />
            <span className="text-[9px] text-white font-mono">{formatTime(duration)}</span>
          </div>

          {/* Buttons Row */}
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <button onClick={handlePlayPause} className="hover:text-indigo-400 transition-colors">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button onClick={handleMuteToggle} className="hover:text-indigo-400 transition-colors">
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            
            <button className="hover:text-indigo-400 transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
