import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Heart, BookOpen, MoreHorizontal, PictureInPicture2, Loader2, Circle, Rewind, Bug, X } from "lucide-react";
import { Channel } from "@/lib/channels";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  detectBrowser, detectStreamType, choosePlayMode, timestamp,
  cleanupPlayer, startPlayback,
  NETWORK_STATES, READY_STATES, ERROR_CODES,
  type PlayerLogEntry, type PlayMode,
} from "@/lib/playerEngine";

interface VideoPlayerProps {
  channel: Channel;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onShowCatchup?: () => void;
  onShowEpg?: () => void;
}

export function VideoPlayer({ channel, isFavorite, onBack, onToggleFavorite, onPrev, onNext, onShowCatchup, onShowEpg }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playResultRef = useRef<{ cleanup: () => void } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(1);

  // Debug panel
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<PlayerLogEntry[]>([]);
  const [activeMode, setActiveMode] = useState<PlayMode>("none");

  // Zapping overlay
  const [zapInfo, setZapInfo] = useState<{ name: string; category: string; logo?: string } | null>(null);
  const zapTimer = useRef<ReturnType<typeof setTimeout>>();

  // Info banner
  const [showBanner, setShowBanner] = useState(false);
  const bannerTimer = useRef<ReturnType<typeof setTimeout>>();

  const debugLog = useCallback((level: PlayerLogEntry["level"], msg: string) => {
    setDebugLogs(prev => [...prev.slice(-100), { time: timestamp(), level, msg }]);
  }, []);

  // Banner on channel change
  useEffect(() => {
    setShowBanner(true);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setShowBanner(false), 5000);
    return () => clearTimeout(bannerTimer.current);
  }, [channel.id]);

  // Zapping keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); onNext?.(); }
      else if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); onPrev?.(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext]);

  // Zapping overlay
  useEffect(() => {
    setZapInfo({ name: channel.name, category: channel.category, logo: channel.logo });
    clearTimeout(zapTimer.current);
    zapTimer.current = setTimeout(() => setZapInfo(null), 2500);
    return () => clearTimeout(zapTimer.current);
  }, [channel.id]);

  const hideControlsAfterDelay = useCallback(() => {
    clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // ── Main playback logic ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel?.url) return;

    // Cleanup previous
    if (playResultRef.current) {
      playResultRef.current.cleanup();
      playResultRef.current = null;
    }
    cleanupPlayer(video, null);

    setError(null);
    setLoading(true);
    setActiveMode("none");
    setDebugLogs([]);

    const result = startPlayback(
      video,
      channel.url,
      debugLog,
      () => {
        setLoading(false);
        setPlaying(true);
        setActiveMode(result.mode);
      },
      (msg) => {
        setLoading(false);
        setError(msg);
        debugLog("error", `PLAYER ERROR: ${msg}`);
      }
    );

    playResultRef.current = result;
    setActiveMode(result.mode);
    hideControlsAfterDelay();

    return () => {
      if (playResultRef.current) {
        playResultRef.current.cleanup();
        playResultRef.current = null;
      }
      cleanupPlayer(video, null);
    };
  }, [channel.url, channel.id, hideControlsAfterDelay, debugLog]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val; setVolume(val);
    if (val === 0) setMuted(true); else setMuted(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) { document.exitFullscreen(); setFullscreen(false); }
    else { containerRef.current.requestFullscreen(); setFullscreen(true); }
  };

  const togglePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await v.requestPictureInPicture();
  };

  const handleRecord = () => {
    toast.info("📱 L'enregistrement sera disponible dans la version Android");
  };

  const REMOTE_BUTTONS = [
    { color: "#FF3B30", icon: Heart, label: "Favoris", action: onToggleFavorite, active: isFavorite },
    { color: "#34C759", icon: BookOpen, label: "EPG", action: onShowEpg || (() => {}) },
    { color: "#FFD60A", icon: Rewind, label: "Catch-up", action: onShowCatchup || (() => {}) },
    { color: "#007AFF", icon: MoreHorizontal, label: "Options", action: () => {} },
  ];

  const browser = detectBrowser();

  return (
    <div ref={containerRef} data-player-container className="relative flex h-full w-full flex-col" style={{ background: "#0A0A0F" }} onMouseMove={hideControlsAfterDelay}>
      {/* Back button */}
      <button onClick={onBack} className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all"
        style={{ background: "rgba(10,10,15,0.6)", backdropFilter: "blur(8px)", color: "#F5F5F7" }}>
        <ArrowLeft size={16} /> Retour
      </button>

      {/* Debug toggle */}
      <button onClick={() => setShowDebug(!showDebug)}
        className="absolute right-4 top-4 z-30 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-all"
        style={{ background: showDebug ? "#FF6D0040" : "rgba(10,10,15,0.6)", backdropFilter: "blur(8px)", color: showDebug ? "#FF6D00" : "#86868B" }}>
        <Bug size={13} /> Debug
      </button>

      {/* Channel info */}
      <div className={`absolute left-4 top-14 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <h2 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>{channel.name}</h2>
        <p className="text-[11px]" style={{ color: "#86868B" }}>{channel.category}
          {activeMode !== "none" && <span className="ml-2 px-1.5 py-0.5 rounded text-[9px]" style={{ background: "#1C1C24", color: "#FF6D00" }}>{activeMode}</span>}
        </p>
      </div>

      {/* Zapping overlay */}
      <AnimatePresence>
        {zapInfo && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 rounded-2xl px-8 py-6"
              style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)" }}>
              {zapInfo.logo && (
                <img src={zapInfo.logo} className="h-12 w-12 rounded-xl object-contain" alt=""
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <p className="text-xl font-bold" style={{ color: "#F5F5F7" }}>{zapInfo.name}</p>
              <p className="text-[12px]" style={{ color: "#86868B" }}>{zapInfo.category}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video */}
      <video ref={videoRef} className="h-full w-full object-contain" style={{ background: "#0A0A0F" }} autoPlay playsInline onClick={togglePlay} />

      {/* Loading */}
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin" style={{ color: "#FF6D00" }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <p className="rounded-xl px-4 py-2 text-sm max-w-md text-center" style={{ background: "rgba(255,59,48,0.15)", color: "#FF3B30" }}>{error}</p>
          <p className="text-[10px]" style={{ color: "#48484A" }}>
            {browser.name} | {detectStreamType(channel.url)} | {activeMode}
          </p>
        </div>
      )}

      {/* Info banner */}
      <AnimatePresence>
        {showBanner && !loading && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-20 left-4 right-4 z-20 flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)", border: "1px solid #1C1C24" }}>
            {channel.logo && (
              <img src={channel.logo} className="h-10 w-10 rounded-xl object-contain" alt=""
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold" style={{ color: "#F5F5F7" }}>{channel.name}</p>
              <p className="text-[11px]" style={{ color: "#86868B" }}>{channel.category}</p>
            </div>
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#34C759" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug panel */}
      <AnimatePresence>
        {showDebug && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            className="absolute right-0 top-0 bottom-0 z-30 w-80 flex flex-col overflow-hidden"
            style={{ background: "rgba(10,10,15,0.95)", backdropFilter: "blur(16px)", borderLeft: "1px solid #1C1C24" }}>
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "#1C1C24" }}>
              <span className="text-xs font-bold" style={{ color: "#FF6D00" }}>Debug Logs</span>
              <button onClick={() => setShowDebug(false)} className="p-1 rounded hover:bg-white/5"><X size={14} /></button>
            </div>
            <div className="px-3 py-2 border-b space-y-1 text-[10px] font-mono" style={{ borderColor: "#1C1C24" }}>
              <div className="flex justify-between"><span style={{ color: "#86868B" }}>URL</span><span className="truncate ml-2 max-w-[180px]" style={{ color: "#E5E5EA" }}>{channel.url}</span></div>
              <div className="flex justify-between"><span style={{ color: "#86868B" }}>Browser</span><span style={{ color: "#E5E5EA" }}>{browser.name}</span></div>
              <div className="flex justify-between"><span style={{ color: "#86868B" }}>Stream</span><span style={{ color: "#30D158" }}>{detectStreamType(channel.url)}</span></div>
              <div className="flex justify-between"><span style={{ color: "#86868B" }}>Mode</span><span style={{ color: "#007AFF" }}>{activeMode}</span></div>
              {videoRef.current && (
                <>
                  <div className="flex justify-between"><span style={{ color: "#86868B" }}>readyState</span><span style={{ color: "#E5E5EA" }}>{videoRef.current.readyState} ({READY_STATES[videoRef.current.readyState]})</span></div>
                  <div className="flex justify-between"><span style={{ color: "#86868B" }}>networkState</span><span style={{ color: "#E5E5EA" }}>{videoRef.current.networkState} ({NETWORK_STATES[videoRef.current.networkState]})</span></div>
                  <div className="flex justify-between"><span style={{ color: "#86868B" }}>dimensions</span><span style={{ color: "#E5E5EA" }}>{videoRef.current.videoWidth}×{videoRef.current.videoHeight}</span></div>
                </>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px] space-y-px">
              {debugLogs.map((l, i) => (
                <div key={i} className="px-1 py-0.5 rounded" style={{
                  background: l.level === "error" ? "#FF3B3010" : "transparent",
                  color: l.level === "error" ? "#FF3B30" : l.level === "warn" ? "#FFD60A" : l.level === "event" ? "#30D158" : "#E5E5EA",
                }}>{l.time} {l.msg}</div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <div className={`absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "linear-gradient(to top, rgba(10,10,15,0.95), transparent)" }}>
        <div className="px-6 pb-5 pt-20">
          {/* Remote buttons */}
          <div className="mb-5 flex justify-center gap-6">
            {REMOTE_BUTTONS.map(btn => (
              <button key={btn.label} onClick={btn.action} className="flex flex-col items-center gap-1.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                  style={{ background: btn.color, boxShadow: `0 0 12px ${btn.color}40` }}>
                  <btn.icon size={17} className="text-white" fill={btn.active ? "currentColor" : "none"} />
                </div>
                <span className="text-[9px] font-medium" style={{ color: "#86868B" }}>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Transport */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={onPrev} className="rounded-full p-2 transition-colors hover:bg-white/10">
              <SkipBack size={18} style={{ color: "#F5F5F7" }} />
            </button>
            <button onClick={togglePlay} className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-orange">
              {playing ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" fill="currentColor" />}
            </button>
            <button onClick={onNext} className="rounded-full p-2 transition-colors hover:bg-white/10">
              <SkipForward size={18} style={{ color: "#F5F5F7" }} />
            </button>
            <div className="mx-2 h-6 w-px" style={{ background: "#48484A" }} />
            <button onClick={handleRecord} className="rounded-full p-2 transition-colors hover:bg-white/10" title="Enregistrer">
              <Circle size={16} className="fill-[#FF3B30]" style={{ color: "#FF3B30" }} />
            </button>
            <div className="mx-1 h-6 w-px" style={{ background: "#48484A" }} />
            <button onClick={toggleMute} className="rounded-full p-2 transition-colors hover:bg-white/10">
              {muted ? <VolumeX size={16} style={{ color: "#F5F5F7" }} /> : <Volume2 size={16} style={{ color: "#F5F5F7" }} />}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
              onChange={e => handleVolume(parseFloat(e.target.value))} className="w-20 accent-[#FF6D00]" />
            <button onClick={togglePiP} className="rounded-full p-2 transition-colors hover:bg-white/10">
              <PictureInPicture2 size={16} style={{ color: "#F5F5F7" }} />
            </button>
            <button onClick={toggleFullscreen} className="rounded-full p-2 transition-colors hover:bg-white/10">
              {fullscreen ? <Minimize size={16} style={{ color: "#F5F5F7" }} /> : <Maximize size={16} style={{ color: "#F5F5F7" }} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
