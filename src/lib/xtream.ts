import { Channel } from "./channels";

export interface XtreamCredentials {
  server: string;
  username: string;
  password: string;
}

export interface XtreamAccountInfo {
  username: string;
  status: string;
  exp_date: string;
  max_connections: string;
  active_cons: string;
  created_at: string;
}

export interface XtreamPlaylistData {
  credentials: XtreamCredentials;
  accountInfo: XtreamAccountInfo | null;
  liveChannels: Channel[];
  liveCategories: { category_id: string; category_name: string }[];
  vodStreams: Channel[];
  vodCategories: { category_id: string; category_name: string }[];
  series: Channel[];
  seriesCategories: { category_id: string; category_name: string }[];
  mac: string;
}

interface CorsProxy {
  name: string;
  buildUrl: (url: string) => string;
}

const CORS_PROXIES: CorsProxy[] = [
  { name: "direct", buildUrl: (url: string) => url },
  { name: "codetabs", buildUrl: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}` },
  { name: "allorigins", buildUrl: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
  { name: "corsproxy", buildUrl: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}` },
];

// Track which proxy last succeeded to prioritize it
let lastWorkingProxy: string | null = null;

function getProxyOrder(url: string): CorsProxy[] {
  const isHttp = url.startsWith("http://");
  // For HTTP urls, skip direct (mixed content blocked)
  let proxies = isHttp ? CORS_PROXIES.filter(p => p.name !== "direct") : [...CORS_PROXIES];
  
  // Prioritize last working proxy
  if (lastWorkingProxy) {
    const idx = proxies.findIndex(p => p.name === lastWorkingProxy);
    if (idx > 0) {
      const [winner] = proxies.splice(idx, 1);
      proxies.unshift(winner);
    }
  }
  return proxies;
}

function extractFirstJsonValue(text: string): string | null {
  const startCandidates = [text.indexOf("{"), text.indexOf("[")].filter(i => i >= 0);
  if (startCandidates.length === 0) return null;

  const start = Math.min(...startCandidates);
  const openChar = text[start];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (char === "\\") { escaped = true; continue; }
      if (char === '"') inString = false;
      continue;
    }
    if (char === '"') { inString = true; continue; }
    if (char === openChar) depth++;
    if (char === closeChar) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function parseJsonPayload(text: string): any | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) return null;

  const segments = [trimmed];
  const mdIdx = trimmed.indexOf("Markdown Content:");
  if (mdIdx >= 0) segments.unshift(trimmed.slice(mdIdx + "Markdown Content:".length).trim());

  for (const segment of segments) {
    const jsonCandidate = extractFirstJsonValue(segment);
    if (!jsonCandidate) continue;
    try { return JSON.parse(jsonCandidate); } catch { continue; }
  }
  return null;
}

export function detectXtreamUrl(url: string): XtreamCredentials | null {
  try {
    const u = new URL(url);
    const username = u.searchParams.get("username");
    const password = u.searchParams.get("password");
    if (username && password) {
      return { server: `${u.protocol}//${u.host}`, username, password };
    }
  } catch {}

  const match = url.match(/(?:https?:\/\/[^/]+).*?username=([^&]+).*?password=([^&]+)/);
  if (match) {
    const serverMatch = url.match(/(https?:\/\/[^/]+)/);
    if (serverMatch) return { server: serverMatch[1], username: match[1], password: match[2] };
  }
  return null;
}

/** Fetch JSON from a URL, trying proxies sequentially */
async function fetchJson(url: string): Promise<any> {
  let lastError: Error | null = null;
  for (const proxy of getProxyOrder(url)) {
    try {
      const res = await fetch(proxy.buildUrl(url), {
        headers: { Accept: "application/json, text/plain, */*" },
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text || text.trim() === "") continue;

      // Check for proxy rate limit responses
      const parsed = parseJsonPayload(text);
      if (parsed !== null) {
        // Skip proxy error responses
        if (parsed.code === 429 || parsed.ok === false) continue;
        lastWorkingProxy = proxy.name;
        return parsed;
      }
    } catch (e) {
      lastError = e as Error;
    }
  }
  throw lastError || new Error("All proxies failed");
}

/** Fetch M3U content as fallback */
async function fetchM3UContent(url: string): Promise<string | null> {
  for (const proxy of getProxyOrder(url)) {
    try {
      const res = await fetch(proxy.buildUrl(url), {
        headers: { Accept: "text/plain, */*" },
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (text && (text.includes("#EXTM3U") || text.includes("#EXTINF"))) {
        lastWorkingProxy = proxy.name;
        return text;
      }
    } catch { continue; }
  }
  return null;
}

/** Parse M3U content into channels */
function parseM3UToChannels(content: string, playlistId: string): Channel[] {
  const lines = content.split("\n");
  const channels: Channel[] = [];
  let name = "", category = "", logo = "";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("#EXTINF")) {
      const nameMatch = line.match(/,(.+)$/);
      name = nameMatch ? nameMatch[1].trim() : "Sans nom";
      const groupMatch = line.match(/group-title="([^"]+)"/);
      category = groupMatch ? groupMatch[1] : "Autres";
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      logo = logoMatch ? logoMatch[1] : "";
    } else if (line && !line.startsWith("#")) {
      channels.push({
        id: `xt_live_${playlistId}_${channels.length}`,
        name: name || `Chaîne ${channels.length + 1}`,
        category,
        url: line,
        logo: logo || undefined,
        type: "live",
        playlistId,
      });
      name = ""; category = ""; logo = "";
    }
  }
  return channels;
}

function generateMac(): string {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase();
  return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
}

function getOrCreateMac(playlistId: string): string {
  const key = `chouf_mac_${playlistId}`;
  let mac = localStorage.getItem(key);
  if (!mac) { mac = generateMac(); localStorage.setItem(key, mac); }
  return mac;
}

export function buildLiveUrl(creds: XtreamCredentials, streamId: string | number): string {
  return `${creds.server}/live/${creds.username}/${creds.password}/${streamId}.ts`;
}

export function buildVodUrl(creds: XtreamCredentials, streamId: string | number, ext: string): string {
  return `${creds.server}/movie/${creds.username}/${creds.password}/${streamId}.${ext || "mp4"}`;
}

export function buildSeriesUrl(creds: XtreamCredentials, streamId: string | number, ext: string): string {
  return `${creds.server}/series/${creds.username}/${creds.password}/${streamId}.${ext || "mp4"}`;
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function loadXtreamPlaylist(
  creds: XtreamCredentials,
  playlistId: string,
  onProgress?: (msg: string) => void
): Promise<XtreamPlaylistData> {
  const base = `${creds.server}/player_api.php?username=${creds.username}&password=${creds.password}`;
  const mac = getOrCreateMac(playlistId);

  onProgress?.("Connexion au serveur...");

  // Fetch account info
  let accountInfo: XtreamAccountInfo | null = null;
  try {
    const info = await fetchJson(base);
    if (info?.user_info) accountInfo = info.user_info;
  } catch {}

  onProgress?.("Chargement des chaînes TV...");

  // SEQUENTIAL fetching to avoid proxy rate limits (429)
  let liveStreams: any[] = [];
  let liveCats: any[] = [];
  let vodStreams: any[] = [];
  let vodCats: any[] = [];
  let seriesStreams: any[] = [];
  let seriesCats: any[] = [];

  try { liveStreams = await fetchJson(`${base}&action=get_live_streams`); } catch {}
  await delay(300);
  try { liveCats = await fetchJson(`${base}&action=get_live_categories`); } catch {}
  await delay(300);

  onProgress?.("Chargement des films...");
  try { vodStreams = await fetchJson(`${base}&action=get_vod_streams`); } catch {}
  await delay(300);
  try { vodCats = await fetchJson(`${base}&action=get_vod_categories`); } catch {}
  await delay(300);

  onProgress?.("Chargement des séries...");
  try { seriesStreams = await fetchJson(`${base}&action=get_series`); } catch {}
  await delay(300);
  try { seriesCats = await fetchJson(`${base}&action=get_series_categories`); } catch {}

  // Normalize arrays
  const toArray = (v: any): any[] => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        if (Array.isArray(v[k])) return v[k];
      }
    }
    return [];
  };

  liveStreams = toArray(liveStreams);
  liveCats = toArray(liveCats);
  vodStreams = toArray(vodStreams);
  vodCats = toArray(vodCats);
  seriesStreams = toArray(seriesStreams);
  seriesCats = toArray(seriesCats);

  // If API returned nothing, try M3U fallback
  if (liveStreams.length === 0 && vodStreams.length === 0 && seriesStreams.length === 0) {
    onProgress?.("Tentative via M3U...");
    const m3uUrl = `${creds.server}/get.php?username=${creds.username}&password=${creds.password}&type=m3u_plus&output=ts`;
    const m3uContent = await fetchM3UContent(m3uUrl);
    if (m3uContent) {
      const parsed = parseM3UToChannels(m3uContent, playlistId);
      if (parsed.length > 0) {
        console.log(`M3U fallback loaded: ${parsed.length} channels`);
        return {
          credentials: creds, accountInfo,
          liveChannels: parsed,
          liveCategories: [...new Set(parsed.map(c => c.category))].map(c => ({ category_id: c, category_name: c })),
          vodStreams: [], vodCategories: [],
          series: [], seriesCategories: [],
          mac,
        };
      }
    }
  }

  onProgress?.("Traitement des données...");
  console.log(`Xtream loaded: ${liveStreams.length} live, ${vodStreams.length} VOD, ${seriesStreams.length} series`);

  // Build category maps
  const liveCatMap: Record<string, string> = {};
  liveCats.forEach((c: any) => { liveCatMap[c.category_id] = c.category_name; });
  const vodCatMap: Record<string, string> = {};
  vodCats.forEach((c: any) => { vodCatMap[c.category_id] = c.category_name; });
  const seriesCatMap: Record<string, string> = {};
  seriesCats.forEach((c: any) => { seriesCatMap[c.category_id] = c.category_name; });

  const liveChannels: Channel[] = liveStreams.map((s: any) => ({
    id: `xt_live_${playlistId}_${s.stream_id}`,
    name: s.name || "Sans nom",
    category: liveCatMap[s.category_id] || "Autres",
    url: buildLiveUrl(creds, s.stream_id),
    logo: s.stream_icon || undefined,
    type: "live" as const,
    streamId: s.stream_id,
    playlistId,
  }));

  const vodChannels: Channel[] = vodStreams.map((s: any) => ({
    id: `xt_vod_${playlistId}_${s.stream_id}`,
    name: s.name || "Sans nom",
    category: vodCatMap[s.category_id] || "Autres",
    url: buildVodUrl(creds, s.stream_id, s.container_extension),
    logo: s.stream_icon || undefined,
    type: "vod" as const,
    streamId: s.stream_id,
    containerExtension: s.container_extension,
    playlistId,
  }));

  const seriesChannels: Channel[] = seriesStreams.map((s: any) => ({
    id: `xt_series_${playlistId}_${s.series_id}`,
    name: s.name || "Sans nom",
    category: seriesCatMap[s.category_id] || "Autres",
    url: "",
    logo: s.cover || undefined,
    type: "series" as const,
    streamId: s.series_id,
    playlistId,
    seriesInfo: { series_id: s.series_id },
  }));

  return {
    credentials: creds, accountInfo,
    liveChannels,
    liveCategories: liveCats,
    vodStreams: vodChannels,
    vodCategories: vodCats,
    series: seriesChannels,
    seriesCategories: seriesCats,
    mac,
  };
}

export async function loadSeriesEpisodes(
  creds: XtreamCredentials,
  seriesId: number | string,
  playlistId: string
): Promise<{ season: string; episodes: Channel[] }[]> {
  const base = `${creds.server}/player_api.php?username=${creds.username}&password=${creds.password}`;
  try {
    const data = await fetchJson(`${base}&action=get_series_info&series_id=${seriesId}`);
    if (!data?.episodes) return [];

    const seasons: { season: string; episodes: Channel[] }[] = [];
    for (const [seasonNum, eps] of Object.entries(data.episodes)) {
      const episodes: Channel[] = (eps as any[]).map((ep: any) => ({
        id: `xt_ep_${playlistId}_${ep.id}`,
        name: ep.title || `Episode ${ep.episode_num}`,
        category: `Saison ${seasonNum}`,
        url: buildSeriesUrl(creds, ep.id, ep.container_extension),
        type: "series" as const,
        streamId: ep.id,
        containerExtension: ep.container_extension,
        playlistId,
      }));
      seasons.push({ season: seasonNum, episodes });
    }
    return seasons;
  } catch { return []; }
}
