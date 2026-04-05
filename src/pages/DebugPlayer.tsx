import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Play, RotateCcw, Monitor, Radio, Clipboard, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LogEntry {
  time: string;
  type: "info" | "warn" | "error" | "event";
  msg: string;
}

function ts() {
  return new Date().toLocaleTimeString("fr-FR", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 } as any);
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/CriOS/.test(ua)) return "Chrome iOS";
  if (/FxiOS/.test(ua)) return "Firefox iOS";
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Firefox/.test(ua)) return "Firefox";
  if (/Chrome/.test(ua)) return "Chrome";
  return ua.slice(0, 60);
}

const VIDEO_EVENTS = [
  "loadstart", "loadedmetadata", "loadeddata", "canplay", "canplaythrough",
  "playing", "stalled", "waiting", "suspend", "abort", "emptied", "error",
  "pause", "ended", "seeking", "seeked", "timeupdate"
] as const;

const NETWORK_STATES: Record<number, string> = {
  0: "NETWORK_EMPTY",
  1: "NETWORK_IDLE",
  2: "NETWORK_LOADING",
  3: "NETWORK_NO_SOURCE",
};

const READY_STATES: Record<number, string> = {
  0: "HAVE_NOTHING",
  1: "HAVE_METADATA",
  2: "HAVE_CURRENT_DATA",
  3: "HAVE_FUTURE_DATA",
  4: "HAVE_ENOUGH_DATA",
};

const ERROR_CODES: Record<number, string> = {
  1: "MEDIA_ERR_ABORTED",
  2: "MEDIA_ERR_NETWORK",
  3: "MEDIA_ERR_DECODE",
  4: "MEDIA_ERR_SRC_NOT_SUPPORTED",
};

export default function DebugPlayer() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [url, setUrl] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [videoState, setVideoState] = useState<Record<string, string>>({});
  const logsEndRef = useRef<HTMLDivElement>(null);

  const log = useCallback((type: LogEntry["type"], msg: string) => {
    setLogs(prev => [...prev, { time: ts(), type, msg }]);
  }, []);

  const updateVideoState = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setVideoState({
      networkState: `${v.networkState} (${NETWORK_STATES[v.networkState] || "?"})`,
      readyState: `${v.readyState} (${READY_STATES[v.readyState] || "?"})`,
      errorCode: v.error ? `${v.error.code} (${ERROR_CODES[v.error.code] || "?"})` : "none",
      errorMessage: v.error?.message || "none",
      currentSrc: v.currentSrc || "none",
      videoWidth: String(v.videoWidth),
      videoHeight: String(v.videoHeight),
      paused: String(v.paused),
      currentTime: v.currentTime.toFixed(2),
      duration: String(v.duration),
    });
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Poll video state
  useEffect(() => {
    const interval = setInterval(updateVideoState, 500);
    return () => clearInterval(interval);
  }, [updateVideoState]);

  const attachEvents = useCallback((v: HTMLVideoElement) => {
    const handlers: (() => void)[] = [];
    VIDEO_EVENTS.forEach(evt => {
      const handler = () => {
        const t = evt === "timeupdate" ? undefined : undefined; // skip timeupdate spam
        if (evt === "timeupdate") return;
        log("event", `📡 ${evt}`);
        updateVideoState();
        if (evt === "error" && v.error) {
          log("error", `❌ MediaError code=${v.error.code} (${ERROR_CODES[v.error.code] || "?"}) msg=${v.error.message || "none"}`);
        }
      };
      v.addEventListener(evt, handler);
      handlers.push(() => v.removeEventListener(evt, handler));
    });
    return () => handlers.forEach(h => h());
  }, [log, updateVideoState]);

  const resetPlayer = useCallback(() => {
    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch {}
      hlsRef.current = null;
    }
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    log("info", "🔄 Player reset");
    updateVideoState();
  }, [log, updateVideoState]);

  const testNative = useCallback(() => {
    if (!url.trim()) { log("warn", "⚠️ Entrez une URL"); return; }
    resetPlayer();
    const v = videoRef.current!;
    const cleanup = attachEvents(v);

    log("info", `▶️ Test NATIVE: ${url}`);

    if (url.includes(".ts")) {
      log("warn", "⚠️ TS direct in browser may fail — les navigateurs ne supportent généralement pas MPEG-TS nativement");
    }

    v.src = url;
    v.play().then(() => {
      log("info", "✅ play() resolved");
    }).catch(err => {
      log("error", `❌ play() rejected: ${err.message}`);
    });

    return cleanup;
  }, [url, resetPlayer, attachEvents, log]);

  const testHls = useCallback(() => {
    if (!url.trim()) { log("warn", "⚠️ Entrez une URL"); return; }
    resetPlayer();
    const v = videoRef.current!;
    const cleanupEvents = attachEvents(v);

    log("info", `▶️ Test HLS.js: ${url}`);

    if (!(window as any).Hls) {
      log("error", "❌ hls.js non chargé (window.Hls undefined)");
      return;
    }
    if (!(window as any).Hls.isSupported()) {
      log("error", "❌ Hls.isSupported() = false (MSE non disponible)");
      return;
    }

    const hls = new (window as any).Hls({
      debug: false,
      enableWorker: true,
      lowLatencyMode: false,
    });
    hlsRef.current = hls;

    hls.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
      log("info", "✅ HLS manifest parsed");
      v.play().then(() => log("info", "✅ play() resolved"))
        .catch((e: Error) => log("error", `❌ play() rejected: ${e.message}`));
    });

    hls.on((window as any).Hls.Events.ERROR, (_: any, data: any) => {
      log("error", `❌ HLS error: type=${data.type} detail=${data.details} fatal=${data.fatal}`);
      if (data.fatal) {
        log("error", "💀 Fatal HLS error — playback impossible");
      }
    });

    hls.loadSource(url);
    hls.attachMedia(v);
  }, [url, resetPlayer, attachEvents, log]);

  // Capabilities
  const browser = detectBrowser();
  const protocol = typeof window !== "undefined" ? window.location.protocol : "?";
  const nativeHls = !!document.createElement("video").canPlayType("application/vnd.apple.mpegurl");
  const hasMSE = !!(window as any).MediaSource;
  const hasHlsJs = !!(window as any).Hls && (window as any).Hls.isSupported();

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F", color: "#E5E5EA" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "#1C1C24" }}>
        <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-white/5">
          <ArrowLeft size={18} />
        </button>
        <Monitor size={20} style={{ color: "#FF6D00" }} />
        <h1 className="text-lg font-bold">Debug Player</h1>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FF6D0020", color: "#FF6D00" }}>DEV</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Left — Video + Controls */}
        <div className="space-y-4">
          {/* Video */}
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#1C1C24", background: "#000" }}>
            <video ref={videoRef} className="w-full aspect-video" controls playsInline />
          </div>

          {/* URL Input */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: "#12121A", border: "1px solid #1C1C24" }}>
            <label className="text-xs font-medium" style={{ color: "#86868B" }}>Custom URL Test</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/stream.m3u8"
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#1C1C24", color: "#E5E5EA", border: "1px solid #2C2C34" }}
              />
              <button onClick={() => navigator.clipboard.readText().then(t => setUrl(t))}
                className="p-2 rounded-lg hover:bg-white/5" title="Coller">
                <Clipboard size={16} />
              </button>
            </div>

            {/* Test Buttons */}
            <div className="flex gap-2">
              <button onClick={testNative}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "#34C759", color: "#fff" }}>
                <Play size={14} /> Test Native
              </button>
              <button onClick={testHls}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "#007AFF", color: "#fff" }}>
                <Radio size={14} /> Test HLS.js
              </button>
              <button onClick={resetPlayer}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "#FF3B30", color: "#fff" }}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>

          {/* Capabilities */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: "#12121A", border: "1px solid #1C1C24" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#86868B" }}>Capabilities</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Cap label="Browser" value={browser} />
              <Cap label="Protocol" value={protocol} />
              <Cap label="Native HLS" value={nativeHls ? "✅ Yes" : "❌ No"} ok={nativeHls} />
              <Cap label="MSE" value={hasMSE ? "✅ Yes" : "❌ No"} ok={hasMSE} />
              <Cap label="HLS.js" value={hasHlsJs ? "✅ Yes" : "❌ No"} ok={hasHlsJs} />
              <Cap label="mpegts.js" value={(window as any).mpegts ? "✅ Loaded" : "⚠️ Not loaded"} ok={!!(window as any).mpegts} />
            </div>
          </div>

          {/* Video State */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: "#12121A", border: "1px solid #1C1C24" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#86868B" }}>Video State (live)</h3>
            <div className="grid grid-cols-2 gap-1 text-xs font-mono">
              {Object.entries(videoState).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span style={{ color: "#86868B" }}>{k}:</span>
                  <span style={{ color: k.includes("error") && v !== "none" ? "#FF3B30" : "#E5E5EA" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Console Logs */}
        <div className="rounded-xl overflow-hidden flex flex-col" style={{ background: "#12121A", border: "1px solid #1C1C24", maxHeight: "calc(100vh - 100px)" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "#1C1C24" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#86868B" }}>Console ({logs.length})</h3>
            <button onClick={() => setLogs([])} className="p-1 rounded hover:bg-white/5">
              <Trash2 size={14} style={{ color: "#86868B" }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono text-xs" style={{ minHeight: 300 }}>
            {logs.length === 0 && (
              <p className="text-center py-8" style={{ color: "#48484A" }}>Aucun log — lancez un test</p>
            )}
            {logs.map((l, i) => (
              <div key={i} className="flex gap-2 py-0.5 px-1 rounded" style={{
                background: l.type === "error" ? "#FF3B3010" : l.type === "warn" ? "#FFD60A10" : "transparent"
              }}>
                <span style={{ color: "#48484A" }}>{l.time}</span>
                <span style={{
                  color: l.type === "error" ? "#FF3B30" : l.type === "warn" ? "#FFD60A" : l.type === "event" ? "#30D158" : "#E5E5EA"
                }}>{l.msg}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Cap({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg" style={{ background: "#1C1C24" }}>
      <span style={{ color: "#86868B" }}>{label}</span>
      <span className="font-mono" style={{ color: ok === false ? "#FF3B30" : ok === true ? "#34C759" : "#E5E5EA" }}>{value}</span>
    </div>
  );
}
