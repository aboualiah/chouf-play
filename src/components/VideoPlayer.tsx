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

  // Zapping overlay
  const [zapInfo, setZapInfo] = useState<{ name: string; category: string; logo?: string } | null>(null);
  const zapTimer = useRef<ReturnType<typeof setTimeout>>();

  // Info banner
  const [showBanner, setShowBanner] = useState(false);
  const bannerTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setShowBanner(true);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setShowBanner(false), 5000);
    return () => clearTimeout(bannerTimer.current);
  }, [channel.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); onNext?.(); }
      else if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); onPrev?.(); }
      else if (e.key === "Enter" || e.key === "i" || e.key === "I" || e.keyCode === 165 /* INFO */) {
        // INFO / OK key: re-show info banner
        e.preventDefault();
        setShowBanner(true);
        clearTimeout(bannerTimer.current);
        bannerTimer.current = setTimeout(() => setShowBanner(false), 5000);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext]);

  // EPG data for current channel
  const epgInfo = useMemo(() => getCurrentProgram(channel.name), [channel.name]);

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

  // Main playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel?.url) return;

    if (playResultRef.current) { playResultRef.current.cleanup(); playResultRef.current = null; }
    cleanupPlayer(video, null);

    setError(null);
    setLoading(true);

    const result = startPlayback(
      video,
      channel.url,
      () => { setLoading(false); setPlaying(true); },
      (msg) => { setLoading(false); setError(msg); }
    );

    playResultRef.current = result;
    hideControlsAfterDelay();

    return () => {
      if (playResultRef.current) { playResultRef.current.cleanup(); playResultRef.current = null; }
      cleanupPlayer(video, null);
    };
  }, [channel.url, channel.id, hideControlsAfterDelay]);

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

  const REMOTE_BUTTONS: { color: string; colorKey: string; icon: any; label: string; shortcut: string; action: () => void; active?: boolean }[] = [
    { color: "#FF3B30", colorKey: "red", icon: Heart, label: "Favoris", shortcut: "R", action: onToggleFavorite, active: isFavorite },
    { color: "#34C759", colorKey: "green", icon: BookOpen, label: "EPG", shortcut: "G", action: onShowEpg || (() => {}) },
    { color: "#FFD60A", colorKey: "yellow", icon: Rewind, label: "Catch-up", shortcut: "Y", action: onShowCatchup || (() => {}) },
    { color: "#007AFF", colorKey: "blue", icon: MoreHorizontal, label: "Options", shortcut: "B", action: () => {} },
  ];

  return (
    <div ref={containerRef} data-player-container className="relative flex h-full w-full flex-col" style={{ background: "#0A0A0F" }} onMouseMove={hideControlsAfterDelay}>
      {/* Back button */}
      <button onClick={onBack} className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all"
        style={{ background: "rgba(10,10,15,0.6)", backdropFilter: "blur(8px)", color: "#F5F5F7" }}>
        <ArrowLeft size={16} /> Retour
      </button>

      {/* Channel info */}
      <div className={`absolute left-4 top-14 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <h2 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>{channel.name}</h2>
        <p className="text-[11px]" style={{ color: "#86868B" }}>{channel.category}</p>
      </div>

      {/* Zapping overlay */}
      <AnimatePresence>
        {zapInfo && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 rounded-2xl px-10 py-6"
              style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)" }}>
              {channelIndex !== undefined && (
                <p className="text-[36px] font-black tabular-nums" style={{ color: "#FF6D00" }}>{channelIndex + 1}</p>
              )}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <p className="rounded-xl px-5 py-3 text-sm max-w-md text-center font-medium" style={{ background: "rgba(255,59,48,0.12)", color: "#FF6D6D" }}>{error}</p>
          <button onClick={() => {
            setError(null);
            setLoading(true);
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

      {/* Info banner */}
      <AnimatePresence>
        {showBanner && !loading && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-20 left-4 right-4 z-20 flex items-center gap-4 rounded-2xl px-5 py-3"
            style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)", border: "1px solid #1C1C24" }}>
            {channelIndex !== undefined && (
              <span className="text-[24px] font-black tabular-nums shrink-0" style={{ color: "#FF6D00" }}>{channelIndex + 1}</span>
            )}
            {channel.logo && (
              <img src={channel.logo} className="h-10 w-10 rounded-xl object-contain shrink-0" alt=""
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold" style={{ color: "#F5F5F7" }}>{channel.name}</p>
              <p className="text-[12px]" style={{ color: "#86868B" }}>{channel.category}</p>
              {epgInfo && (
                <div className="mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium" style={{ color: "#FF6D00" }}>{epgInfo.title}</span>
                    {epgInfo.nextTitle && (
                      <span className="text-[10px]" style={{ color: "#48484A" }}>→ {epgInfo.nextStart} {epgInfo.nextTitle}</span>
                    )}
                  </div>
                  <div className="mt-1 h-[2px] rounded-full overflow-hidden" style={{ background: "#242430" }}>
                    <div className="h-full rounded-full" style={{ width: `${epgInfo.progress}%`, background: "#FF6D00" }} />
                  </div>
                </div>
              )}
            </div>
            <div className="h-2 w-2 rounded-full animate-pulse shrink-0" style={{ background: "#34C759" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <div className={`absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "linear-gradient(to top, rgba(10,10,15,0.95), transparent)" }}>
        <div className="px-6 pb-5 pt-20">
          {/* Remote buttons */}
          <div className="mb-5 flex justify-center gap-6">
            {REMOTE_BUTTONS.map(btn => {
              const isFlashing = colorFlash === btn.colorKey;
              return (
                <button key={btn.label} onClick={btn.action} className="flex flex-col items-center gap-1.5 group">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${isFlashing ? "animate-pulse scale-125" : ""}`}
                    style={{ background: btn.color, boxShadow: `0 0 ${isFlashing ? "24px" : "12px"} ${btn.color}${isFlashing ? "80" : "40"}` }}>
                    <btn.icon size={17} className="text-white" fill={btn.active ? "currentColor" : "none"} />
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: "#86868B" }}>{btn.label} ({btn.shortcut})</span>
                </button>
              );
            })}
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
