import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { ArrowLeft, Play, RotateCcw, Radio, Clipboard, Trash2, Monitor, Bug, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  detectBrowser, detectStreamType, choosePlayMode, timestamp,
  cleanupPlayer, playWithNative, playWithHlsJs, startPlayback,
  NETWORK_STATES, READY_STATES, ERROR_CODES, TRACKED_EVENTS,
  attachVideoDebugEvents,
  type PlayerLogEntry, type BrowserInfo, type StreamType, type PlayMode,
} from "@/lib/playerEngine";
import { DEMO_CHANNELS, type Channel } from "@/lib/channels";
import { getPlaylists } from "@/lib/storage";

export default function DebugPlayer() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playResultRef = useRef<{ cleanup: () => void } | null>(null);
  const [url, setUrl] = useState("");
  const [logs, setLogs] = useState<PlayerLogEntry[]>([]);
  const [videoState, setVideoState] = useState<Record<string, string>>({});
  const [activeMode, setActiveMode] = useState<PlayMode>("none");
  const [selectedChannel, setSelectedChannel] = useState("");
  const logsEndRef = useRef<HTMLDivElement>(null);

  const browser = useMemo(() => detectBrowser(), []);

  // Load playlist channels
  const playlistChannels = useMemo(() => {
    const pls = getPlaylists();
    return pls.flatMap(p => p.channels || []).filter(c => c.url);
  }, []);

  const allTestChannels = useMemo(() => {
    return [...DEMO_CHANNELS, ...playlistChannels];
  }, [playlistChannels]);

  const log = useCallback((level: PlayerLogEntry["level"], msg: string) => {
    setLogs(prev => [...prev, { time: timestamp(), level, msg }]);
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
      muted: String(v.muted),
      currentTime: v.currentTime.toFixed(2),
    });
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    const interval = setInterval(updateVideoState, 500);
    return () => clearInterval(interval);
  }, [updateVideoState]);

  const reset = useCallback(() => {
    if (playResultRef.current) {
      playResultRef.current.cleanup();
      playResultRef.current = null;
    }
    cleanupPlayer(videoRef.current, null);
    setActiveMode("none");
    log("info", "🔄 Player reset");
    updateVideoState();
  }, [log, updateVideoState]);

  const getUrl = () => url.trim() || "";

  const handleTestNative = useCallback(() => {
    const u = getUrl();
    if (!u) { log("warn", "⚠️ Entrez une URL"); return; }
    reset();
    const v = videoRef.current!;
    const streamType = detectStreamType(u);
    log("info", `🎯 Stream type: ${streamType}`);
    if (streamType === "ts") log("warn", "⚠️ Flux TS direct — lecture non garantie sur navigateur");
    const result = playWithNative(v, u, log, () => {
      log("info", "🎉 PLAYING — lecture en cours!");
      setActiveMode("native");
    }, (msg) => log("error", `💥 ${msg}`));
    playResultRef.current = result;
    setActiveMode("native");
  }, [url, reset, log]);

  const handleTestHls = useCallback(() => {
    const u = getUrl();
    if (!u) { log("warn", "⚠️ Entrez une URL"); return; }
    reset();
    const v = videoRef.current!;
    const result = playWithHlsJs(v, u, log, () => {
      log("info", "🎉 PLAYING via HLS.js — lecture en cours!");
      setActiveMode("hlsjs");
    }, (msg) => log("error", `💥 ${msg}`));
    playResultRef.current = result;
    setActiveMode("hlsjs");
  }, [url, reset, log]);

  const handleAutoPlay = useCallback(() => {
    const u = getUrl();
    if (!u) { log("warn", "⚠️ Entrez une URL"); return; }
    reset();
    const v = videoRef.current!;
    const result = startPlayback(v, u, log, () => {
      log("info", "🎉 PLAYING — lecture en cours!");
    }, (msg) => log("error", `💥 ${msg}`));
    playResultRef.current = result;
    setActiveMode(result.mode);
  }, [url, reset, log]);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    const ch = allTestChannels.find(c => c.id === channelId);
    if (ch) {
      setUrl(ch.url);
      log("info", `📺 Chaîne sélectionnée: ${ch.name} (${ch.category})`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playResultRef.current) playResultRef.current.cleanup();
      cleanupPlayer(videoRef.current, null);
    };
  }, []);

  const streamType = detectStreamType(url);
  const mode = choosePlayMode(streamType, browser);

  const logColors: Record<string, string> = {
    info: "#E5E5EA", warn: "#FFD60A", error: "#FF3B30", event: "#30D158",
  };

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F", color: "#E5E5EA" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "#1C1C24" }}>
        <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} /></button>
        <Bug size={20} style={{ color: "#FF6D00" }} />
        <h1 className="text-lg font-bold">Debug Player</h1>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: "#FF6D0020", color: "#FF6D00" }}>v2.0</span>
        <div className="flex-1" />
        <span className="text-[11px] font-mono" style={{ color: "#86868B" }}>{browser.name} | {browser.protocol}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0 h-[calc(100vh-52px)]">
        {/* Left — Video + Controls */}
        <div className="flex flex-col overflow-y-auto p-4 gap-4">
          {/* Video */}
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#1C1C24", background: "#000" }}>
            <video ref={videoRef} className="w-full aspect-video" controls playsInline />
          </div>

          {/* Channel Selector */}
          <div className="rounded-xl p-3" style={{ background: "#12121A", border: "1px solid #1C1C24" }}>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: "#86868B" }}>
              Sélectionner une chaîne de test ({allTestChannels.length})
            </label>
            <select
              value={selectedChannel}
              onChange={e => handleChannelSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm appearance-none"
              style={{ background: "#1C1C24", color: "#E5E5EA", border: "1px solid #2C2C34" }}
            >
              <option value="">— Choisir une chaîne —</option>
              {Object.entries(
                allTestChannels.reduce<Record<string, Channel[]>>((acc, ch) => {
                  (acc[ch.category] = acc[ch.category] || []).push(ch);
                  return acc;
                }, {})
              ).map(([cat, channels]) => (
                <optgroup key={cat} label={cat}>
                  {channels.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* URL Input */}
          <div className="rounded-xl p-3 space-y-3" style={{ background: "#12121A", border: "1px solid #1C1C24" }}>
            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#86868B" }}>URL personnalisée</label>
            <div className="flex gap-2">
              <input type="text" value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/stream.m3u8"
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none font-mono"
                style={{ background: "#1C1C24", color: "#E5E5EA", border: "1px solid #2C2C34" }} />
              <button onClick={() => navigator.clipboard.readText().then(t => setUrl(t))}
                className="p-2 rounded-lg hover:bg-white/5" title="Coller"><Clipboard size={16} /></button>
            </div>

            {url && (
              <div className="flex gap-2 text-[10px] font-mono" style={{ color: "#86868B" }}>
                <span>Type: <strong style={{ color: streamType === "unknown" ? "#FF3B30" : "#30D158" }}>{streamType}</strong></span>
                <span>•</span>
                <span>Mode recommandé: <strong style={{ color: mode === "none" ? "#FF3B30" : "#007AFF" }}>{mode}</strong></span>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <button onClick={handleAutoPlay}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ background: "#FF6D00", color: "#fff" }}>
                <Play size={12} /> Auto
              </button>
              <button onClick={handleTestNative}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ background: "#34C759", color: "#fff" }}>
                <Monitor size={12} /> Native
              </button>
              <button onClick={handleTestHls}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ background: "#007AFF", color: "#fff" }}>
                <Radio size={12} /> HLS.js
              </button>
              <button onClick={reset}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ background: "#FF3B30", color: "#fff" }}>
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          {/* Capabilities + Video State side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-3" style={{ background: "#12121A", border: "1px solid #1C1C24" }}>
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#86868B" }}>Capabilities</h3>
              <div className="space-y-1 text-[11px]">
                <Row label="Browser" value={browser.name} />
                <Row label="Protocol" value={browser.protocol} />
                <Row label="Hostname" value={browser.hostname} />
                <Row label="Native HLS" value={browser.nativeHls ? "✅" : "❌"} ok={browser.nativeHls} />
                <Row label="MSE" value={browser.hasMSE ? "✅" : "❌"} ok={browser.hasMSE} />
                <Row label="HLS.js" value={browser.hasHlsJs ? "✅" : "❌"} ok={browser.hasHlsJs} />
                <Row label="Is Safari" value={browser.isSafari ? "Yes" : "No"} />
                <Row label="Is Chrome" value={browser.isChrome ? "Yes" : "No"} />
                <Row label="Active Mode" value={activeMode} ok={activeMode !== "none"} />
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: "#12121A", border: "1px solid #1C1C24" }}>
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#86868B" }}>Video State</h3>
              <div className="space-y-1 text-[11px] font-mono">
                {Object.keys(videoState).length === 0 && (
                  <p style={{ color: "#48484A" }}>Aucune vidéo chargée</p>
                )}
                {Object.entries(videoState).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span style={{ color: "#86868B" }}>{k}</span>
                    <span className="text-right truncate" style={{ color: k.includes("error") && v !== "none" ? "#FF3B30" : "#E5E5EA", maxWidth: 140 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Agent */}
          <div className="rounded-xl p-3" style={{ background: "#12121A", border: "1px solid #1C1C24" }}>
            <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#86868B" }}>User Agent</h3>
            <p className="text-[10px] font-mono break-all" style={{ color: "#48484A" }}>{browser.userAgent}</p>
          </div>
        </div>

        {/* Right — Console */}
        <div className="flex flex-col border-l" style={{ borderColor: "#1C1C24", background: "#0D0D14" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "#1C1C24" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#86868B" }}>
              Console <span className="text-[10px] font-normal ml-1" style={{ color: "#48484A" }}>({logs.length})</span>
            </h3>
            <button onClick={() => setLogs([])} className="p-1 rounded hover:bg-white/5"><Trash2 size={14} style={{ color: "#86868B" }} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] space-y-px">
            {logs.length === 0 && (
              <p className="text-center py-12" style={{ color: "#48484A" }}>Aucun log — sélectionnez une chaîne et lancez un test</p>
            )}
            {logs.map((l, i) => (
              <div key={i} className="flex gap-2 px-2 py-0.5 rounded" style={{
                background: l.level === "error" ? "#FF3B3010" : l.level === "warn" ? "#FFD60A08" : "transparent",
              }}>
                <span className="shrink-0" style={{ color: "#3A3A3C" }}>{l.time}</span>
                <span style={{ color: logColors[l.level] }}>{l.msg}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex justify-between items-center px-2 py-1 rounded" style={{ background: "#1C1C2480" }}>
      <span style={{ color: "#86868B" }}>{label}</span>
      <span className="font-mono" style={{ color: ok === false ? "#FF3B30" : ok === true ? "#30D158" : "#E5E5EA" }}>{value}</span>
    </div>
  );
}
