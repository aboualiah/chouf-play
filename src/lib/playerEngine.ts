/**
 * CHOUF Play — Player Engine v3
 * Architecture claire et testable pour la lecture vidéo.
 * 
 * Logique stricte :
 *   - MP4 → natif
 *   - HLS (.m3u8) → Safari natif / Chrome+Edge+Firefox via hls.js UNIQUEMENT
 *   - TS → tentative native avec warning clair
 *   - Unknown → erreur claire
 *   - Mixed content (HTTP dans HTTPS) → warning explicite
 */

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type StreamType = "hls" | "mp4" | "ts" | "unknown";
export type PlayMode = "native" | "hlsjs" | "native-ts-test" | "unsupported" | "none";

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
  canPlayTypeResult: string;
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

export const ERROR_MESSAGES: Record<number, string> = {
  1: "Lecture annulée",
  2: "Erreur réseau — vérifiez votre connexion",
  3: "Erreur de décodage — format non supporté",
  4: "Source média non supportée par le navigateur",
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
  const canPlayResult = testVideo.canPlayType("application/vnd.apple.mpegurl") || 
                        testVideo.canPlayType("application/x-mpegURL");
  const nativeHls = !!canPlayResult;

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
    canPlayTypeResult: canPlayResult || "empty",
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

// ──────────────────────────────────────────────
// Mixed content detection
// ──────────────────────────────────────────────

export function isMixedContentBlocked(url: string): boolean {
  return window.location.protocol === "https:" && url.startsWith("http://");
}

export function getStreamProtocol(url: string): string {
  try {
    return new URL(url).protocol;
  } catch {
    return "unknown:";
  }
}

// ──────────────────────────────────────────────
// Play mode selection — STRICT LOGIC
// ──────────────────────────────────────────────

export function choosePlayMode(streamType: StreamType, browser: BrowserInfo): PlayMode {
  switch (streamType) {
    case "mp4":
      return "native";

    case "hls":
      // Safari (desktop + iOS) → native HLS
      if (browser.isSafari) return "native";
      // Chrome iOS also uses Safari engine → native
      if (browser.name === "Chrome iOS" || browser.name === "Firefox iOS") return "native";
      // All other browsers (Chrome, Edge, Firefox) → hls.js ONLY
      if (browser.hasHlsJs) return "hlsjs";
      // No hls.js available → unsupported
      return "unsupported";

    case "ts":
      return "native-ts-test";

    case "unknown":
      return "unsupported";
  }
}

// ──────────────────────────────────────────────
// Error message builder
// ──────────────────────────────────────────────

export function buildErrorMessage(
  errorCode: number | undefined,
  url: string,
  streamType: StreamType,
  browser: BrowserInfo,
  mode: PlayMode
): string {
  const isMixed = isMixedContentBlocked(url);

  // MediaError code 4 — source not supported
  if (errorCode === 4) {
    if (isMixed) {
      return "Flux HTTP non compatible avec cette app web HTTPS — le navigateur bloque le contenu mixte";
    }
    if (browser.isSafari && streamType === "hls") {
      return "Safari ne supporte pas cette source HLS dans ce contexte";
    }
    return "Source média non supportée par le navigateur";
  }

  if (errorCode === 2) {
    if (isMixed) return "Erreur réseau — flux HTTP bloqué dans un contexte HTTPS";
    return "Erreur réseau — vérifiez que le flux est accessible";
  }

  if (errorCode === 3) return "Erreur de décodage — le format n'est pas compatible";
  if (errorCode === 1) return "Lecture annulée";

  if (mode === "unsupported") {
    if (streamType === "hls") return "HLS non supporté — hls.js non disponible sur ce navigateur";
    return "Type de flux non supporté par ce navigateur";
  }

  return "Erreur de lecture inconnue";
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
  const browser = detectBrowser();
  const streamType = detectStreamType(url);
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
    const msg = buildErrorMessage(code, url, streamType, browser, "native");
    onLog("error", `❌ ${msg}`);
    onError(msg);
  };
  video.addEventListener("error", errorHandler);

  video.src = url;
  video.play().then(() => {
    onLog("info", "✅ play() resolved");
  }).catch((err) => {
    if (!started) {
      onLog("error", `❌ play() rejected: ${err.message}`);
      // Don't duplicate error if errorHandler already fired
      if (!video.error) {
        const isMixed = isMixedContentBlocked(url);
        const msg = isMixed
          ? "Flux HTTP non compatible avec cette app web HTTPS"
          : `Lecture impossible: ${err.message}`;
        onError(msg);
      }
    }
  });

  const timeout = setTimeout(() => {
    if (!started) {
      timedOut = true;
      const isMixed = isMixedContentBlocked(url);
      const msg = isMixed
        ? "Flux HTTP bloqué — contenu mixte non autorisé par le navigateur"
        : "Le flux ne démarre pas dans le délai imparti (timeout 8s)";
      onLog("warn", `⏱️ ${msg}`);
      onError(msg);
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
    onError("HLS non supporté — hls.js non disponible sur ce navigateur");
    return { mode: "unsupported", cleanup: () => {} };
  }

  onLog("info", `▶️ Lecture HLS.js: ${url}`);

  // Check mixed content
  if (isMixedContentBlocked(url)) {
    onLog("warn", "⚠️ Flux HTTP dans un contexte HTTPS — lecture potentiellement bloquée par le navigateur");
  }

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
        const isMixed = isMixedContentBlocked(url);
        const errMsg = isMixed
          ? `Erreur HLS fatale — flux HTTP dans un contexte HTTPS: ${data.details}`
          : `Erreur HLS fatale: ${data.details}`;
        onError(errMsg);
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
      const isMixed = isMixedContentBlocked(url);
      const msg = isMixed
        ? "Flux HTTP bloqué dans un contexte HTTPS — le navigateur refuse le contenu mixte"
        : "Le flux ne démarre pas dans le délai imparti (HLS.js timeout 8s)";
      onLog("warn", `⏱️ ${msg}`);
      onError(msg);
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
  const isMixed = isMixedContentBlocked(url);
  const streamProto = getStreamProtocol(url);

  onLog("info", `🔍 Browser: ${browser.name} | Stream: ${streamType} | Mode choisi: ${mode}`);
  onLog("info", `🔗 URL: ${url}`);
  onLog("info", `🔒 Page: ${browser.protocol} | Flux: ${streamProto} | Mixed: ${isMixed ? "OUI ⚠️" : "non"}`);

  if (isMixed) {
    onLog("warn", "⚠️ ATTENTION: Flux HTTP chargé depuis une app HTTPS — lecture web potentiellement bloquée par le navigateur");
  }

  if (streamType === "ts") {
    onLog("warn", "⚠️ Flux TS direct — lecture non garantie sur navigateur web");
  }

  if (streamType === "unknown") {
    const msg = "Type de flux non détecté — vérifiez l'URL";
    onLog("error", `❌ ${msg}`);
    onError(msg);
    return { mode: "unsupported", cleanup: () => {} };
  }

  if (mode === "unsupported") {
    const msg = streamType === "hls"
      ? "Chrome doit utiliser HLS.js pour ce flux HLS — hls.js non disponible"
      : "Type de flux non supporté par ce navigateur";
    onLog("error", `❌ ${msg}`);
    onError(msg);
    return { mode: "unsupported", cleanup: () => {} };
  }

  // STRICT: Chrome/Edge/Firefox + HLS → ONLY hls.js, never native
  if (mode === "hlsjs") {
    onLog("info", "🎯 Mode sélectionné: hlsjs (Chrome/Edge/Firefox → HLS.js exclusif)");
    return playWithHlsJs(video, url, onLog, onPlaying, onError);
  }

  // Safari + HLS or MP4 or TS → native
  if (streamType === "hls") {
    onLog("info", "🎯 Mode sélectionné: native (Safari → HLS natif)");
  } else if (streamType === "ts") {
    onLog("info", "🎯 Mode sélectionné: native-ts-test (tentative lecture TS)");
  } else {
    onLog("info", "🎯 Mode sélectionné: native (MP4)");
  }

  return playWithNative(video, url, onLog, onPlaying, onError);
}
