/**
 * CHOUF Play — Player Engine
 * Architecture claire et testable pour la lecture vidéo.
 * 
 * Logique :
 *   - MP4 → natif
 *   - HLS (.m3u8) → Safari natif / Chrome via hls.js
 *   - TS → tentative native avec warning
 *   - Unknown → erreur claire
 */

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type StreamType = "hls" | "mp4" | "ts" | "unknown";
export type PlayMode = "native" | "hlsjs" | "none";

export interface PlayerLogEntry {
  time: string;
  level: "info" | "warn" | "error" | "event";
  msg: string;
}

export interface BrowserInfo {
  name: string;
  isSafari: boolean;
  isChrome: boolean;
  isEdge: boolean;
  isFirefox: boolean;
  userAgent: string;
  protocol: string;
  hostname: string;
  nativeHls: boolean;
  hasMSE: boolean;
  hasHlsJs: boolean;
}

export const NETWORK_STATES: Record<number, string> = {
  0: "NETWORK_EMPTY",
  1: "NETWORK_IDLE",
  2: "NETWORK_LOADING",
  3: "NETWORK_NO_SOURCE",
};

export const READY_STATES: Record<number, string> = {
  0: "HAVE_NOTHING",
  1: "HAVE_METADATA",
  2: "HAVE_CURRENT_DATA",
  3: "HAVE_FUTURE_DATA",
  4: "HAVE_ENOUGH_DATA",
};

export const ERROR_CODES: Record<number, string> = {
  1: "MEDIA_ERR_ABORTED",
  2: "MEDIA_ERR_NETWORK",
  3: "MEDIA_ERR_DECODE",
  4: "MEDIA_ERR_SRC_NOT_SUPPORTED",
};

export const TRACKED_EVENTS = [
  "loadstart", "loadedmetadata", "loadeddata", "canplay", "canplaythrough",
  "playing", "pause", "waiting", "stalled", "suspend", "emptied", "abort",
  "error", "ended", "seeking", "seeked",
] as const;

// ──────────────────────────────────────────────
// Detection
// ──────────────────────────────────────────────

export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
  const isChrome = /Chrome/.test(ua) && !/Edg/.test(ua);
  const isEdge = /Edg\//.test(ua);
  const isFirefox = /Firefox/.test(ua);

  let name = "Unknown";
  if (/CriOS/.test(ua)) name = "Chrome iOS";
  else if (/FxiOS/.test(ua)) name = "Firefox iOS";
  else if (isSafari) name = "Safari";
  else if (isEdge) name = "Edge";
  else if (isFirefox) name = "Firefox";
  else if (isChrome) name = "Chrome";

  const testVideo = document.createElement("video");
  const nativeHls = !!(
    testVideo.canPlayType("application/vnd.apple.mpegurl") ||
    testVideo.canPlayType("application/x-mpegURL")
  );

  return {
    name,
    isSafari,
    isChrome,
    isEdge,
    isFirefox,
    userAgent: ua,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    nativeHls,
    hasMSE: typeof MediaSource !== "undefined",
    hasHlsJs: !!(window as any).Hls && (window as any).Hls.isSupported(),
  };
}

export function detectStreamType(url: string): StreamType {
  if (!url) return "unknown";
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  if (clean.endsWith(".m3u8")) return "hls";
  if (clean.endsWith(".mp4")) return "mp4";
  if (clean.endsWith(".ts")) return "ts";
  // Xtream-style URLs without extension are usually TS
  if (/\/live\/[^/]+\/[^/]+\/\d+$/.test(url)) return "ts";
  return "unknown";
}

export function choosePlayMode(streamType: StreamType, browser: BrowserInfo): PlayMode {
  switch (streamType) {
    case "mp4":
      return "native";
    case "hls":
      if (browser.nativeHls && browser.isSafari) return "native";
      if (browser.hasHlsJs) return "hlsjs";
      if (browser.nativeHls) return "native"; // fallback for other browsers with native
      return "none";
    case "ts":
      return "native"; // tentative
    case "unknown":
      return "none";
  }
}

// ──────────────────────────────────────────────
// Timestamp helper
// ──────────────────────────────────────────────

export function timestamp(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

// ──────────────────────────────────────────────
// Video event attachment
// ──────────────────────────────────────────────

export function attachVideoDebugEvents(
  video: HTMLVideoElement,
  onLog: (level: PlayerLogEntry["level"], msg: string) => void
): () => void {
  const handlers: (() => void)[] = [];

  for (const evt of TRACKED_EVENTS) {
    const handler = () => {
      onLog("event", `📡 ${evt}`);
      if (evt === "error" && video.error) {
        onLog(
          "error",
          `❌ MediaError code=${video.error.code} (${ERROR_CODES[video.error.code] || "?"}) — ${video.error.message || "no message"}`
        );
      }
    };
    video.addEventListener(evt, handler);
    handlers.push(() => video.removeEventListener(evt, handler));
  }

  return () => handlers.forEach((h) => h());
}

// ──────────────────────────────────────────────
// Cleanup
// ──────────────────────────────────────────────

export function cleanupPlayer(
  video: HTMLVideoElement | null,
  hlsInstance: any | null
): void {
  if (hlsInstance) {
    try {
      hlsInstance.stopLoad();
      hlsInstance.detachMedia();
      hlsInstance.destroy();
    } catch {}
  }
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
}

// ──────────────────────────────────────────────
// Play functions
// ──────────────────────────────────────────────

export interface PlayResult {
  mode: PlayMode;
  hlsInstance?: any;
  cleanup: () => void;
}

export function playWithNative(
  video: HTMLVideoElement,
  url: string,
  onLog: (level: PlayerLogEntry["level"], msg: string) => void,
  onPlaying: () => void,
  onError: (msg: string) => void,
  timeoutMs = 8000
): PlayResult {
  onLog("info", `▶️ Lecture native: ${url}`);

  const eventsCleanup = attachVideoDebugEvents(video, onLog);
  let started = false;
  let timedOut = false;

  const onPlayingHandler = () => {
    started = true;
    onPlaying();
  };
  video.addEventListener("playing", onPlayingHandler);

  const errorHandler = () => {
    if (started || timedOut) return;
    const code = video.error?.code;
    const detail = ERROR_CODES[code || 0] || "unknown";
    onError(`Erreur native: ${detail} (code ${code})`);
  };
  video.addEventListener("error", errorHandler);

  video.src = url;
  video.play().then(() => {
    onLog("info", "✅ play() resolved");
  }).catch((err) => {
    if (!started) {
      onLog("error", `❌ play() rejected: ${err.message}`);
      onError(`Lecture impossible: ${err.message}`);
    }
  });

  const timeout = setTimeout(() => {
    if (!started) {
      timedOut = true;
      onLog("warn", "⏱️ Timeout 8s — le flux ne démarre pas");
      onError("Le flux ne démarre pas dans ce navigateur (timeout 8s)");
    }
  }, timeoutMs);

  const cleanup = () => {
    clearTimeout(timeout);
    video.removeEventListener("playing", onPlayingHandler);
    video.removeEventListener("error", errorHandler);
    eventsCleanup();
  };

  return { mode: "native", cleanup };
}

export function playWithHlsJs(
  video: HTMLVideoElement,
  url: string,
  onLog: (level: PlayerLogEntry["level"], msg: string) => void,
  onPlaying: () => void,
  onError: (msg: string) => void,
  timeoutMs = 8000
): PlayResult {
  const Hls = (window as any).Hls;
  if (!Hls || !Hls.isSupported()) {
    onLog("error", "❌ HLS.js non disponible ou non supporté");
    onError("HLS non supporté sur ce navigateur");
    return { mode: "none", cleanup: () => {} };
  }

  onLog("info", `▶️ Lecture HLS.js: ${url}`);

  const eventsCleanup = attachVideoDebugEvents(video, onLog);
  let started = false;
  let destroyed = false;

  const hls = new Hls({
    debug: false,
    enableWorker: true,
    lowLatencyMode: false,
    maxBufferLength: 30,
    maxMaxBufferLength: 60,
  });

  // HLS.js events
  hls.on(Hls.Events.MANIFEST_LOADING, () => onLog("info", "📥 HLS manifest loading..."));
  hls.on(Hls.Events.MANIFEST_PARSED, (_: any, data: any) => {
    onLog("info", `✅ HLS manifest parsed — ${data.levels?.length || 0} levels`);
  });
  hls.on(Hls.Events.LEVEL_LOADED, (_: any, data: any) => {
    onLog("info", `📊 Level loaded — duration: ${data.details?.totalduration?.toFixed(1)}s`);
  });
  hls.on(Hls.Events.FRAG_LOADED, (_: any, data: any) => {
    onLog("info", `📦 Fragment loaded — sn:${data.frag?.sn}`);
  });

  hls.on(Hls.Events.ERROR, (_: any, data: any) => {
    const msg = `HLS error: type=${data.type} detail=${data.details} fatal=${data.fatal}`;
    if (data.fatal) {
      onLog("error", `💀 FATAL ${msg}`);
      if (!started && !destroyed) {
        onError(`Erreur HLS fatale: ${data.details}`);
        destroyed = true;
        try { hls.destroy(); } catch {}
      }
    } else {
      onLog("warn", `⚠️ ${msg}`);
    }
  });

  const onPlayingHandler = () => {
    started = true;
    onPlaying();
  };
  video.addEventListener("playing", onPlayingHandler);

  hls.loadSource(url);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    video.play().then(() => {
      onLog("info", "✅ play() resolved via HLS.js");
    }).catch((err: Error) => {
      if (!started) {
        onLog("error", `❌ play() rejected: ${err.message}`);
      }
    });
  });

  const timeout = setTimeout(() => {
    if (!started && !destroyed) {
      onLog("warn", "⏱️ Timeout 8s — le flux HLS ne démarre pas");
      onError("Le flux ne démarre pas (HLS.js timeout 8s)");
    }
  }, timeoutMs);

  const cleanup = () => {
    clearTimeout(timeout);
    video.removeEventListener("playing", onPlayingHandler);
    eventsCleanup();
    if (!destroyed) {
      destroyed = true;
      try {
        hls.stopLoad();
        hls.detachMedia();
        hls.destroy();
      } catch {}
    }
  };

  return { mode: "hlsjs", hlsInstance: hls, cleanup };
}

// ──────────────────────────────────────────────
// Main play orchestrator
// ──────────────────────────────────────────────

export function startPlayback(
  video: HTMLVideoElement,
  url: string,
  onLog: (level: PlayerLogEntry["level"], msg: string) => void,
  onPlaying: () => void,
  onError: (msg: string) => void
): PlayResult {
  const browser = detectBrowser();
  const streamType = detectStreamType(url);
  const mode = choosePlayMode(streamType, browser);

  onLog("info", `🔍 Browser: ${browser.name} | Stream: ${streamType} | Mode: ${mode}`);
  onLog("info", `🔗 URL: ${url}`);

  if (streamType === "ts") {
    onLog("warn", "⚠️ Flux TS direct — lecture non garantie sur navigateur web");
  }

  if (streamType === "unknown") {
    onLog("error", "❌ Type de flux non détecté");
    onError("Type de flux non détecté — vérifiez l'URL");
    return { mode: "none", cleanup: () => {} };
  }

  if (mode === "none") {
    onLog("error", "❌ Aucun mode de lecture disponible pour ce flux");
    onError("HLS non supporté sur ce navigateur — installez un navigateur compatible");
    return { mode: "none", cleanup: () => {} };
  }

  if (mode === "hlsjs") {
    return playWithHlsJs(video, url, onLog, onPlaying, onError);
  }

  return playWithNative(video, url, onLog, onPlaying, onError);
}
