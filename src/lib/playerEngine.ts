/**
 * CHOUF Play — Player Engine (Production)
 * Logique de lecture : MP4 natif, HLS Safari natif / autres hls.js, TS natif avec warning
 */

import Hls from "hls.js";

export type StreamType = "hls" | "mp4" | "ts" | "unknown";
export type PlayMode = "native" | "hlsjs" | "native-ts" | "unsupported" | "none";

export interface BrowserInfo {
  name: string;
  isSafari: boolean;
  nativeHls: boolean;
  hasHlsJs: boolean;
}

// ── Detection ──

export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
  const isIOS = /CriOS|FxiOS/.test(ua);

  let name = "Unknown";
  if (isIOS) name = "iOS Browser";
  else if (isSafari) name = "Safari";
  else if (/Edg\//.test(ua)) name = "Edge";
  else if (/Firefox/.test(ua)) name = "Firefox";
  else if (/Chrome/.test(ua)) name = "Chrome";

  const testVideo = document.createElement("video");
  const nativeHls = !!(testVideo.canPlayType("application/vnd.apple.mpegurl") || testVideo.canPlayType("application/x-mpegURL"));

  return {
    name,
    isSafari: isSafari || isIOS,
    nativeHls,
    hasHlsJs: typeof Hls !== "undefined" && Hls.isSupported(),
  };
}

export function detectStreamType(url: string): StreamType {
  if (!url) return "unknown";
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  if (clean.endsWith(".m3u8")) return "hls";
  if (clean.endsWith(".mp4")) return "mp4";
  if (clean.endsWith(".ts")) return "ts";
  if (/\/live\/[^/]+\/[^/]+\/\d+$/.test(url)) return "ts";
  return "unknown";
}

export function choosePlayMode(streamType: StreamType, browser: BrowserInfo): PlayMode {
  if (streamType === "mp4") return "native";
  if (streamType === "hls") {
    if (browser.nativeHls) return "native";
    return browser.hasHlsJs ? "hlsjs" : "unsupported";
  }
  if (streamType === "ts") return "native-ts";
  return "unsupported";
}

// ── User-facing error messages ──

function userErrorMessage(errorCode: number | undefined): string {
  if (errorCode === 2) return "Erreur réseau — vérifiez votre connexion";
  if (errorCode === 3) return "Format non pris en charge";
  if (errorCode === 4) return "Lecture impossible pour cette chaîne";
  return "Cette chaîne n'est pas disponible pour le moment";
}

// ── Cleanup ──

export function cleanupPlayer(video: HTMLVideoElement | null, hlsInstance: any | null): void {
  if (hlsInstance) {
    try { hlsInstance.stopLoad(); hlsInstance.detachMedia(); hlsInstance.destroy(); } catch {}
  }
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
}

// ── Playback ──

export interface PlayResult {
  mode: PlayMode;
  cleanup: () => void;
}

export function startPlayback(
  video: HTMLVideoElement,
  url: string,
  onPlaying: () => void,
  onError: (msg: string) => void
): PlayResult {
  const browser = detectBrowser();
  const streamType = detectStreamType(url);
  const mode = choosePlayMode(streamType, browser);

  console.log("CHOUF: trying to play", url, "| stream:", streamType, "| mode:", mode, "| browser:", browser.name, "| nativeHls:", browser.nativeHls, "| hlsJs:", browser.hasHlsJs);

  if (mode === "unsupported") {
    // Last resort: try native playback anyway (some browsers handle HLS natively)
    console.log("CHOUF: mode unsupported, trying native fallback");
    return playWithNative(video, url, onPlaying, onError);
  }

  if (mode === "hlsjs") return playWithHlsJs(video, url, onPlaying, onError);
  return playWithNative(video, url, onPlaying, onError);
}

function playWithNative(
  video: HTMLVideoElement, url: string,
  onPlaying: () => void, onError: (msg: string) => void,
): PlayResult {
  let started = false;

  const onPlayingHandler = () => { started = true; onPlaying(); };
  const errorHandler = () => {
    if (started) return;
    // Don't show error immediately — wait for timeout
  };

  video.addEventListener("playing", onPlayingHandler);
  video.addEventListener("error", errorHandler);
  video.src = url;
  video.play().catch(() => {
    // Don't show error immediately on play() rejection
  });

  const timeout = setTimeout(() => {
    if (!started) onError("Lecture impossible pour cette chaîne");
  }, 10000);

  return {
    mode: "native",
    cleanup: () => {
      clearTimeout(timeout);
      video.removeEventListener("playing", onPlayingHandler);
      video.removeEventListener("error", errorHandler);
    },
  };
}

function playWithHlsJs(
  video: HTMLVideoElement, url: string,
  onPlaying: () => void, onError: (msg: string) => void,
): PlayResult {
  if (!Hls || !Hls.isSupported()) {
    console.log("CHOUF: Hls.js not supported, falling back to native");
    return playWithNative(video, url, onPlaying, onError);
  }

  let started = false;
  let destroyed = false;

  const hls = new Hls({ debug: false, enableWorker: true, lowLatencyMode: false, maxBufferLength: 30, maxMaxBufferLength: 60 });

  hls.on(Hls.Events.ERROR, (_: any, data: any) => {
    if (data.fatal && !started && !destroyed) {
      onError("Lecture impossible pour cette chaîne");
      destroyed = true;
      try { hls.destroy(); } catch {}
    }
  });

  const onPlayingHandler = () => { started = true; onPlaying(); };
  video.addEventListener("playing", onPlayingHandler);

  hls.loadSource(url);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    video.play().catch(() => {});
  });

  const timeout = setTimeout(() => {
    if (!started && !destroyed) onError("Lecture impossible pour cette chaîne");
  }, 10000);

  return {
    mode: "hlsjs",
    cleanup: () => {
      clearTimeout(timeout);
      video.removeEventListener("playing", onPlayingHandler);
      if (!destroyed) {
        destroyed = true;
        try { hls.stopLoad(); hls.detachMedia(); hls.destroy(); } catch {}
      }
    },
  };
}
