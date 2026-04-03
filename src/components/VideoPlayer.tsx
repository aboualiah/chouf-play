import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Heart, BookOpen, ListMusic, MoreHorizontal } from "lucide-react";
import Hls from "hls.js";
import { Channel } from "@/lib/channels";

interface VideoPlayerProps {
  channel: Channel;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}

function detectStreamType(url: string): "hls" | "mpegts" | "direct" {
  if (url.includes(".m3u8")) return "hls";
  if (url.endsWith(".ts") || /\/\d+$/.test(url)) return "mpegts";
  return "direct";
}

export function VideoPlayer({ channel, isFavorite, onBack, onToggleFavorite }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hideControlsAfterDelay = useCallback(() => {
    clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    const type = detectStreamType(channel.url);

    const cleanup = () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      video.src = "";
    };

    if (type === "hls" && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("Erreur de lecture HLS");
          // Fallback to direct
          cleanup();
          video.src = channel.url;
          video.play().catch(() => {});
        }
      });
    } else if (type === "hls" && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = channel.url;
      video.play().catch(() => {});
    } else {
      video.src = channel.url;
      video.play().catch(() => setError("Impossible de lire ce flux"));
    }

    hideControlsAfterDelay();
    return cleanup;
  }, [channel.url, hideControlsAfterDelay]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) { document.exitFullscreen(); setFullscreen(false); }
    else { containerRef.current.requestFullscreen(); setFullscreen(true); }
  };

  const REMOTE_BUTTONS = [
    { color: "bg-destructive", icon: Heart, label: "Favoris", action: onToggleFavorite, active: isFavorite },
    { color: "bg-success", icon: BookOpen, label: "EPG", action: () => {} },
    { color: "bg-warning", icon: ListMusic, label: "Listes", action: () => {} },
    { color: "bg-info", icon: MoreHorizontal, label: "Options", action: () => {} },
  ];

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col bg-background"
      onMouseMove={hideControlsAfterDelay}
      onClick={hideControlsAfterDelay}
    >
      {/* Back button - always visible */}
      <button
        onClick={onBack}
        className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full bg-background/60 px-3 py-1.5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-background/80"
      >
        <ArrowLeft size={16} />
        Retour
      </button>

      {/* Channel info */}
      <div className={`absolute left-4 top-14 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <h2 className="text-lg font-bold text-foreground">{channel.name}</h2>
        <p className="text-xs text-muted-foreground">{channel.category}</p>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        className="h-full w-full object-contain bg-background"
        autoPlay
        playsInline
        onClick={togglePlay}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="rounded-lg bg-destructive/20 px-4 py-2 text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-background/90 to-transparent px-6 pb-4 pt-16 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Remote buttons */}
        <div className="mb-4 flex justify-center gap-6">
          {REMOTE_BUTTONS.map(btn => (
            <button key={btn.label} onClick={btn.action} className="flex flex-col items-center gap-1">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${btn.color} transition-transform hover:scale-110`}>
                <btn.icon size={18} className="text-primary-foreground" fill={btn.active ? "currentColor" : "none"} />
              </div>
              <span className="text-[10px] text-muted-foreground">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Transport controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={togglePlay} className="rounded-full bg-foreground/10 p-2 backdrop-blur-sm transition-colors hover:bg-foreground/20">
            {playing ? <Pause size={20} className="text-foreground" /> : <Play size={20} className="text-foreground" fill="currentColor" />}
          </button>
          <button onClick={toggleMute} className="rounded-full bg-foreground/10 p-2 backdrop-blur-sm transition-colors hover:bg-foreground/20">
            {muted ? <VolumeX size={18} className="text-foreground" /> : <Volume2 size={18} className="text-foreground" />}
          </button>
          <button onClick={toggleFullscreen} className="rounded-full bg-foreground/10 p-2 backdrop-blur-sm transition-colors hover:bg-foreground/20">
            {fullscreen ? <Minimize size={18} className="text-foreground" /> : <Maximize size={18} className="text-foreground" />}
          </button>
        </div>
      </div>
    </div>
  );
}
