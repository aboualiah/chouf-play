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

const CORS_PROXY = "https://corsproxy.io/?";

function withCorsProxy(url: string) {
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
}

function getStreamUrl(originalUrl: string): string {
  if (originalUrl.startsWith('http://') && window.location.protocol === 'https:') {
    return withCorsProxy(originalUrl);
  }
  return originalUrl;
}

function needsMixedContentProxy(url: string): boolean {
  return url.startsWith('http://') && window.location.protocol === 'https:';
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
    if (!video || !channel?.url) return;
    let cancelled = false;

    cleanup();
    setError(null);
    setLoading(true);

    const rawUrl = channel.url;
    const streamType = detectStreamType(rawUrl);
    const isHLS = streamType === 'hls';
    const isMpegTS = streamType === 'mpegts';
    const isMixed = rawUrl.startsWith('http://') && window.location.protocol === 'https:';

    console.log("CHOUF: URL=" + rawUrl + " type=" + streamType + " mixed=" + isMixed);

    const startPlay = () => {
      if (cancelled) return;
      setLoading(false);
      setPlaying(true);
    };
    const onStreamError = () => {
      if (cancelled) return;
      setLoading(false);
      setError('Impossible de lire ce flux');
    };

    const safetyTimeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 12000);

    const initTimer = setTimeout(() => {
      // STRATEGY: For HTTP streams on HTTPS page, try native video.src first
      // Native <video> is more permissive than XHR (HLS.js) for mixed content
      
      const tryNativeFirst = (nativeUrl: string, fallback: () => void) => {
        console.log("CHOUF: Trying native playback:", nativeUrl);
        video.crossOrigin = 'anonymous';
        video.src = nativeUrl;
        video.onplaying = startPlay;
        
        const nativeTimeout = setTimeout(() => {
          if (cancelled) return;
          console.log("CHOUF: Native timeout, trying without crossOrigin");
          video.removeAttribute('crossOrigin');
          video.src = nativeUrl;
          video.onplaying = startPlay;
          video.onerror = () => {
            if (cancelled) return;
            console.log("CHOUF: Native failed, falling back");
            fallback();
          };
          video.play().catch(() => {
            if (!cancelled) fallback();
          });
        }, 5000);

        video.onerror = () => {
          clearTimeout(nativeTimeout);
          if (cancelled) return;
          console.log("CHOUF: Native with crossOrigin failed, trying without");
          video.removeAttribute('crossOrigin');
          video.src = nativeUrl;
          video.onplaying = () => { clearTimeout(nativeTimeout); startPlay(); };
          video.onerror = () => {
            clearTimeout(nativeTimeout);
            if (!cancelled) fallback();
          };
          video.play().catch(() => {
            clearTimeout(nativeTimeout);
            if (!cancelled) fallback();
          });
        };
        
        video.play().catch(() => {});
      };

      const initHlsPlayer = (videoUrl: string, retryWithProxy = false) => {
        if (!Hls.isSupported()) {
          // Safari native HLS
          video.src = videoUrl;
          video.addEventListener("playing", startPlay, { once: true });
          video.play().catch(onStreamError);
          return;
        }
        
        const useProxy = retryWithProxy;
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30,
          xhrSetup: (xhr, xhrUrl) => {
            if (useProxy && !xhrUrl.startsWith(CORS_PROXY)) {
              const proxied = withCorsProxy(xhrUrl);
              xhr.open('GET', proxied, true);
            }
          },
        });

        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          startPlay();
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal) return;
          hls.destroy();
          if (hlsRef.current === hls) hlsRef.current = null;
          if (cancelled) return;

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !retryWithProxy) {
            console.log('CHOUF: HLS retry with CORS proxy');
            initHlsPlayer(withCorsProxy(rawUrl), true);
            return;
          }

          setError(data.type === Hls.ErrorTypes.NETWORK_ERROR ? 'Flux indisponible' : 'Erreur de lecture');
          setLoading(false);
        });
      };

      if (isHLS) {
        if (isMixed) {
          // Mixed content: try native first, then HLS.js with proxy
          tryNativeFirst(rawUrl, () => {
            if (cancelled) return;
            console.log("CHOUF: Native failed for HLS, trying HLS.js with proxy");
            initHlsPlayer(withCorsProxy(rawUrl), true);
          });
        } else {
          // Same protocol: use HLS.js directly
          initHlsPlayer(rawUrl);
        }
      } else if (isMpegTS) {
        // For MPEG-TS, always try native first
        tryNativeFirst(rawUrl, () => {
          if (cancelled) return;
          // Fallback: try mpegts.js
          if (window.mpegts && window.mpegts.isSupported()) {
            console.log("CHOUF: Trying mpegts.js");
            try {
              const player = window.mpegts.createPlayer({
                type: 'mpegts', url: isMixed ? withCorsProxy(rawUrl) : rawUrl,
                isLive: true, cors: true, hasAudio: true, hasVideo: true,
              }, {
                enableWorker: true, enableStashBuffer: false,
                stashInitialSize: 128, liveBufferLatencyChasing: true,
              });
              mpegtsRef.current = player;
              player.on(window.mpegts.Events.ERROR, (type: any, detail: any) => {
                if (!cancelled) { setError('Erreur: ' + detail); setLoading(false); }
              });
              player.attachMediaElement(video);
              player.load();
              player.play();
              video.addEventListener('playing', startPlay, { once: true });
            } catch (e) {
              console.warn("CHOUF: mpegts.js failed:", e);
              onStreamError();
            }
          } else {
            onStreamError();
          }
        });
      } else {
        // Direct playback
        video.src = rawUrl;
        video.onplaying = startPlay;
        video.onerror = onStreamError;
        video.play().catch(onStreamError);
      }
    }, 300);

    hideControlsAfterDelay();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimeout);
      clearTimeout(initTimer);
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
