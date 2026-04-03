import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Heart, BookOpen, ListMusic, MoreHorizontal, PictureInPicture2, Loader2 } from "lucide-react";
import Hls from "hls.js";
import { Channel } from "@/lib/channels";

declare global {
  interface Window { mpegts: any; }
}

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
  if (/\/\d+\.ts$/.test(url) || /\/\d+$/.test(url) || /\/live\/[^/]+\/[^/]+\/\d+/.test(url) || url.endsWith(".ts")) return "mpegts";
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
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(1);

  const hideControlsAfterDelay = useCallback(() => {
    clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const cleanup = useCallback(() => {
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (mpegtsRef.current) {
      try {
        mpegtsRef.current.pause();
        mpegtsRef.current.unload();
        mpegtsRef.current.detachMediaElement();
        mpegtsRef.current.destroy();
      } catch {}
      mpegtsRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.removeAttribute("src");
      video.load();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    cleanup();
    setError(null);
    setLoading(true);

    const streamType = detectStreamType(channel.url);

    const onPlaying = () => { setLoading(false); setPlaying(true); };
    video.addEventListener("playing", onPlaying, { once: true });

    // Safety timeout
    const safetyTimeout = setTimeout(() => setLoading(false), 8000);

    const tryMpegts = (url: string) => {
      if (window.mpegts && window.mpegts.isSupported()) {
        const player = window.mpegts.createPlayer({
          type: "mpegts",
          url: url,
          isLive: true,
        });
        mpegtsRef.current = player;
        player.attachMediaElement(video);
        player.load();
        player.play();
      } else {
        // mpegts not available, try direct
        video.src = url;
        video.play().catch(() => setError("Format non supporté par ce navigateur"));
      }
    };

    const tryHlsFallback = (url: string) => {
      const hlsUrl = url.replace(/\.ts$/, ".m3u8");
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true, maxBufferLength: 30 });
        hlsRef.current = hls;
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            hls.destroy();
            hlsRef.current = null;
            // Last resort: direct src
            video.src = url;
            video.play().catch(() => setError("Impossible de lire ce flux"));
          }
        });
      } else {
        video.src = url;
        video.play().catch(() => setError("Impossible de lire ce flux"));
      }
    };

    if (streamType === "mpegts") {
      // Primary: mpegts.js for .ts streams (Xtream)
      if (window.mpegts) {
        tryMpegts(channel.url);
      } else {
        // Wait for mpegts.js CDN script to load
        let attempts = 0;
        const waitInterval = setInterval(() => {
          attempts++;
          if (window.mpegts || attempts > 30) {
            clearInterval(waitInterval);
            if (window.mpegts) {
              tryMpegts(channel.url);
            } else {
              tryHlsFallback(channel.url);
            }
          }
        }, 200);
      }
    } else if (streamType === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true, maxBufferLength: 30 });
        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            hls.destroy();
            hlsRef.current = null;
            tryMpegts(channel.url);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = channel.url;
        video.play().catch(() => {});
      } else {
        video.src = channel.url;
        video.play().catch(() => setError("HLS non supporté"));
      }
    } else {
      video.src = channel.url;
      video.play().catch(() => setError("Impossible de lire ce flux"));
    }

    hideControlsAfterDelay();

    return () => {
      clearTimeout(safetyTimeout);
      video.removeEventListener("playing", onPlaying);
      cleanup();
    };
  }, [channel.url, hideControlsAfterDelay, cleanup]);

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
      {/* Back button */}
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

      {/* Loading spinner */}
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin" style={{ color: "#FF6D00" }} />
        </div>
      )}

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
