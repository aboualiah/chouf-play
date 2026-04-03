import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Heart, BookOpen, ListMusic, MoreHorizontal, PictureInPicture2 } from "lucide-react";
import Hls from "hls.js";
import { Channel } from "@/lib/channels";

interface VideoPlayerProps {
  channel: Channel;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

function detectStreamType(url: string): "hls" | "mpegts" | "direct" {
  if (url.includes(".m3u8")) return "hls";
  if (url.endsWith(".ts") || /\/\d+$/.test(url) || /\/\d+\.ts/.test(url)) return "mpegts";
  return "direct";
}

export function VideoPlayer({ channel, isFavorite, onBack, onToggleFavorite, onPrev, onNext }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const mpegtsRef = useRef<any>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);

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
      if (mpegtsRef.current) { mpegtsRef.current.destroy(); mpegtsRef.current = null; }
      video.src = "";
    };

    const tryMpegts = () => {
      const w = window as any;
      const initMpegts = () => {
        if (w.mpegts && w.mpegts.isSupported()) {
          const player = w.mpegts.createPlayer({
            type: "mpegts",
            url: channel.url,
            isLive: true,
          });
          mpegtsRef.current = player;
          player.attachMediaElement(video);
          player.load();
          video.play().catch(() => {});
        } else {
          // Try HLS.js as fallback for .ts URLs
          const hlsUrl = channel.url.replace(/\.ts$/, ".m3u8");
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsRef.current = hls;
            hls.loadSource(channel.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
            hls.on(Hls.Events.ERROR, () => {
              video.src = channel.url;
              video.play().catch(() => setError("Impossible de lire ce flux"));
            });
          } else {
            video.src = channel.url;
            video.play().catch(() => setError("Impossible de lire ce flux"));
          }
        }
      };

      if (w.mpegts) {
        initMpegts();
      } else {
        // Wait for mpegts.js to load (max 5s)
        let attempts = 0;
        const waitForMpegts = setInterval(() => {
          attempts++;
          if (w.mpegts || attempts > 25) {
            clearInterval(waitForMpegts);
            initMpegts();
          }
        }, 200);
      }
    };

    const tryDirect = () => {
      video.src = channel.url;
      video.play().catch(() => setError("Impossible de lire ce flux"));
    };

    if (type === "hls" && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          cleanup();
          tryMpegts();
        }
      });
    } else if (type === "hls" && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = channel.url;
      video.play().catch(() => {});
    } else if (type === "mpegts") {
      tryMpegts();
    } else {
      tryDirect();
    }

    hideControlsAfterDelay();
    return cleanup;
  }, [channel.url, hideControlsAfterDelay]);

  // Load mpegts.js from CDN and ensure it's ready before playback
  useEffect(() => {
    const w = window as any;
    if (!w.mpegts && !document.querySelector('script[src*="mpegts.js"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mpegts.js@1.7.3/dist/mpegts.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

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

  const handleVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    setVolume(val);
    if (val === 0) setMuted(true);
    else setMuted(false);
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

  const REMOTE_BUTTONS = [
    { color: "#FF3B30", icon: Heart, label: "Favoris", action: onToggleFavorite, active: isFavorite },
    { color: "#34C759", icon: BookOpen, label: "EPG", action: () => {} },
    { color: "#FFD60A", icon: ListMusic, label: "Listes", action: () => {} },
    { color: "#007AFF", icon: MoreHorizontal, label: "Options", action: () => {} },
  ];

  return (
    <div
      ref={containerRef}
      data-player-container
      className="relative flex h-full w-full flex-col"
      style={{ background: "#0A0A0F" }}
      onMouseMove={hideControlsAfterDelay}
    >
      {/* Back button — always visible */}
      <button
        onClick={onBack}
        className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all"
        style={{ background: "rgba(10, 10, 15, 0.6)", backdropFilter: "blur(8px)", color: "#F5F5F7" }}
      >
        <ArrowLeft size={16} />
        Retour
      </button>

      {/* Channel info */}
      <div className={`absolute left-4 top-14 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <h2 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>{channel.name}</h2>
        <p className="text-[11px]" style={{ color: "#86868B" }}>{channel.category}</p>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        style={{ background: "#0A0A0F" }}
        autoPlay
        playsInline
        onClick={togglePlay}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="rounded-xl px-4 py-2 text-sm" style={{ background: "rgba(255, 59, 48, 0.15)", color: "#FF3B30" }}>{error}</p>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "linear-gradient(to top, rgba(10, 10, 15, 0.95), transparent)" }}
      >
        <div className="px-6 pb-5 pt-20">
          {/* Remote buttons */}
          <div className="mb-5 flex justify-center gap-6">
            {REMOTE_BUTTONS.map(btn => (
              <button key={btn.label} onClick={btn.action} className="flex flex-col items-center gap-1.5 group">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                  style={{ background: btn.color, boxShadow: `0 0 12px ${btn.color}40` }}
                >
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
            <button onClick={toggleMute} className="rounded-full p-2 transition-colors hover:bg-white/10">
              {muted ? <VolumeX size={16} style={{ color: "#F5F5F7" }} /> : <Volume2 size={16} style={{ color: "#F5F5F7" }} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={e => handleVolume(parseFloat(e.target.value))}
              className="w-20 accent-[#FF6D00]"
            />
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
