import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Heart, BookOpen, MoreHorizontal, PictureInPicture2, Loader2, Circle, Rewind } from "lucide-react";
import { Channel } from "@/lib/channels";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cleanupPlayer, startPlayback, type PlayResult } from "@/lib/playerEngine";
import type { ColorFlash } from "@/hooks/useKeyboardShortcuts";
import { getCurrentProgram } from "@/components/MiniEpg";

interface VideoPlayerProps {
  channel: Channel;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onShowCatchup?: () => void;
  onShowEpg?: () => void;
  colorFlash?: ColorFlash;
  channelIndex?: number;
}

export function VideoPlayer({ channel, isFavorite, onBack, onToggleFavorite, onPrev, onNext, onShowCatchup, onShowEpg, colorFlash, channelIndex }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playResultRef = useRef<PlayResult | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(1);

  // Zapping overlay (center, brief)
  const [zapInfo, setZapInfo] = useState<{ name: string; category: string; logo?: string } | null>(null);
  const zapTimer = useRef<ReturnType<typeof setTimeout>>();

  const epgInfo = useMemo(() => getCurrentProgram(channel.name), [channel.name]);

  // Show zapping overlay on channel change
  useEffect(() => {
    setZapInfo({ name: channel.name, category: channel.category, logo: channel.logo });
    clearTimeout(zapTimer.current);
    zapTimer.current = setTimeout(() => setZapInfo(null), 2500);
    return () => clearTimeout(zapTimer.current);
  }, [channel.id]);

  // Keyboard: zapping + INFO to re-show controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); onNext?.(); }
      else if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); onPrev?.(); }
      else if (e.key === "Enter" || e.key === "i" || e.key === "I" || e.keyCode === 165) {
        e.preventDefault();
        hideControlsAfterDelay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext]);

  const hideControlsAfterDelay = useCallback(() => {
    clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // Main playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel?.url) return;
    if (playResultRef.current) { playResultRef.current.cleanup(); playResultRef.current = null; }
    cleanupPlayer(video, null);
    setError(null);
    setLoading(true);
    const result = startPlayback(video, channel.url, () => { setLoading(false); setPlaying(true); }, (msg) => { setLoading(false); setError(msg); });
    playResultRef.current = result;
    hideControlsAfterDelay();
    return () => {
      if (playResultRef.current) { playResultRef.current.cleanup(); playResultRef.current = null; }
      cleanupPlayer(video, null);
    };
  }, [channel.url, channel.id, hideControlsAfterDelay]);

  const togglePlay = () => { const v = videoRef.current; if (!v) return; if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); } };
  const toggleMute = () => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); };
  const handleVolume = (val: number) => { const v = videoRef.current; if (!v) return; v.volume = val; setVolume(val); setMuted(val === 0); };
  const toggleFullscreen = () => { if (!containerRef.current) return; if (document.fullscreenElement) { document.exitFullscreen(); setFullscreen(false); } else { containerRef.current.requestFullscreen(); setFullscreen(true); } };
  const togglePiP = async () => { const v = videoRef.current; if (!v) return; if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await v.requestPictureInPicture(); };
  const handleRecord = () => { toast.info("📱 L'enregistrement sera disponible dans la version Android"); };

  const REMOTE_BUTTONS = [
    { color: "#FF3B30", colorKey: "red", icon: Heart, label: "Favoris", shortcut: "R", action: onToggleFavorite, active: isFavorite },
    { color: "#34C759", colorKey: "green", icon: BookOpen, label: "EPG", shortcut: "G", action: onShowEpg || (() => {}) },
    { color: "#FFD60A", colorKey: "yellow", icon: Rewind, label: "Catch-up", shortcut: "Y", action: onShowCatchup || (() => {}) },
    { color: "#007AFF", colorKey: "blue", icon: MoreHorizontal, label: "Options", shortcut: "B", action: () => {} },
  ];

  return (
    <div ref={containerRef} data-player-container className="relative flex h-full w-full flex-col" style={{ background: "#0A0A0F" }}
      onMouseMove={hideControlsAfterDelay} onClick={hideControlsAfterDelay}>

      {/* Video */}
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-contain" style={{ background: "#0A0A0F" }} autoPlay playsInline onClick={togglePlay} />

      {/* Loading */}
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <Loader2 size={40} className="animate-spin" style={{ color: "#FF6D00" }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
          <p className="rounded-xl px-5 py-3 text-sm max-w-md text-center font-medium" style={{ background: "rgba(255,59,48,0.12)", color: "#FF6D6D" }}>{error}</p>
          <button onClick={() => {
            setError(null); setLoading(true);
            const video = videoRef.current;
            if (video && channel.url) {
              if (playResultRef.current) { playResultRef.current.cleanup(); playResultRef.current = null; }
              cleanupPlayer(video, null);
              const result = startPlayback(video, channel.url, () => { setLoading(false); setPlaying(true); }, (msg) => { setLoading(false); setError(msg); });
              playResultRef.current = result;
            }
          }} className="rounded-lg px-4 py-2 text-[12px] font-medium transition-all hover:scale-105" style={{ background: "#1C1C24", color: "#86868B" }}>
            Réessayer
          </button>
        </div>
      )}

      {/* Zapping overlay — center, temporary */}
      <AnimatePresence>
        {zapInfo && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 rounded-2xl px-10 py-5"
              style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)" }}>
              {channelIndex !== undefined && (
                <p className="text-[36px] font-black tabular-nums" style={{ color: "#FF6D00" }}>{channelIndex + 1}</p>
              )}
              <p className="text-xl font-bold" style={{ color: "#F5F5F7" }}>{zapInfo.name}</p>
              <p className="text-[12px]" style={{ color: "#86868B" }}>{zapInfo.category}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === TOP BAR: Back + Channel name + LIVE badge === */}
      <div className={`absolute top-0 left-0 right-0 z-20 transition-opacity duration-300 ${showControls ? "opacity-70" : "opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
            style={{ background: "rgba(10,10,15,0.6)", backdropFilter: "blur(8px)", color: "#F5F5F7" }}>
            <ArrowLeft size={14} /> Retour
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[14px] font-bold truncate" style={{ color: "#F5F5F7" }}>{channel.name}</span>
            <span className="text-[10px]" style={{ color: "#86868B" }}>{channel.category}</span>
            <div className="flex items-center gap-1 shrink-0">
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#34C759" }} />
              <span className="text-[9px] font-semibold" style={{ color: "#34C759" }}>LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* === BOTTOM OVERLAY: Info bar + Controls === */}
      <div className={`absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.6) 70%, transparent 100%)" }}>
        <div className="px-5 pb-4 pt-12">

          {/* Info bar: channel info + EPG + color buttons — single line */}
          <div className="flex items-center gap-4 mb-3">
            {/* Channel number + logo + name */}
            <div className="flex items-center gap-3 shrink-0">
              {channelIndex !== undefined && (
                <span className="text-[20px] font-black tabular-nums" style={{ color: "#FF6D00" }}>{channelIndex + 1}</span>
              )}
              {channel.logo && (
                <img src={channel.logo} className="h-8 w-8 rounded-lg object-contain" alt=""
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="min-w-0">
                <p className="text-[14px] font-bold leading-tight" style={{ color: "#F5F5F7" }}>{channel.name}</p>
                <p className="text-[11px]" style={{ color: "#86868B" }}>{channel.category}</p>
              </div>
            </div>

            {/* EPG info */}
            {epgInfo && (
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-4 w-px" style={{ background: "#48484A" }} />
                <span className="text-[11px] font-medium truncate" style={{ color: "#FF6D00" }}>{epgInfo.title}</span>
                {epgInfo.nextTitle && (
                  <span className="text-[10px] truncate" style={{ color: "#48484A" }}>→ {epgInfo.nextStart} {epgInfo.nextTitle}</span>
                )}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* 4 color buttons */}
            <div className="flex items-center gap-4 shrink-0">
              {REMOTE_BUTTONS.map(btn => {
                const isFlashing = colorFlash === btn.colorKey;
                return (
                  <button key={btn.label} onClick={btn.action} className="flex flex-col items-center gap-0.5 group">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${isFlashing ? "animate-pulse scale-125" : ""}`}
                      style={{ background: btn.color, boxShadow: `0 0 ${isFlashing ? "20px" : "8px"} ${btn.color}${isFlashing ? "80" : "30"}` }}>
                      <btn.icon size={14} className="text-white" fill={btn.active ? "currentColor" : "none"} />
                    </div>
                    <span className="text-[8px]" style={{ color: "#636366" }}>{btn.label}({btn.shortcut})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transport controls — single line, centered */}
          <div className="flex items-center justify-center gap-2">
            <button onClick={onPrev} className="rounded-full p-1.5 transition-colors hover:bg-white/10">
              <SkipBack size={16} style={{ color: "#F5F5F7" }} />
            </button>
            <button onClick={togglePlay} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-orange">
              {playing ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white" fill="currentColor" />}
            </button>
            <button onClick={onNext} className="rounded-full p-1.5 transition-colors hover:bg-white/10">
              <SkipForward size={16} style={{ color: "#F5F5F7" }} />
            </button>
            <div className="mx-1 h-5 w-px" style={{ background: "#48484A" }} />
            <button onClick={handleRecord} className="rounded-full p-1.5 transition-colors hover:bg-white/10" title="Enregistrer">
              <Circle size={14} className="fill-[#FF3B30]" style={{ color: "#FF3B30" }} />
            </button>
            <div className="mx-1 h-5 w-px" style={{ background: "#48484A" }} />
            <button onClick={toggleMute} className="rounded-full p-1.5 transition-colors hover:bg-white/10">
              {muted ? <VolumeX size={14} style={{ color: "#F5F5F7" }} /> : <Volume2 size={14} style={{ color: "#F5F5F7" }} />}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
              onChange={e => handleVolume(parseFloat(e.target.value))} className="w-16 accent-[#FF6D00]" />
            <button onClick={togglePiP} className="rounded-full p-1.5 transition-colors hover:bg-white/10">
              <PictureInPicture2 size={14} style={{ color: "#F5F5F7" }} />
            </button>
            <button onClick={toggleFullscreen} className="rounded-full p-1.5 transition-colors hover:bg-white/10">
              {fullscreen ? <Minimize size={14} style={{ color: "#F5F5F7" }} /> : <Maximize size={14} style={{ color: "#F5F5F7" }} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
