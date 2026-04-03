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
  { name: "allorigins", buildUrl: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
  { name: "corsproxy", buildUrl: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}` },
  { name: "codetabs", buildUrl: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}` },
];

let lastWorkingProxy: string | null = null;

function getProxyOrder(url: string): CorsProxy[] {
  const isHttp = url.startsWith("http://");
  const proxies = isHttp ? CORS_PROXIES.filter((proxy) => proxy.name !== "direct") : [...CORS_PROXIES];

  if (lastWorkingProxy) {
    const winnerIndex = proxies.findIndex((proxy) => proxy.name === lastWorkingProxy);
    if (winnerIndex > 0) {
      const [winner] = proxies.splice(winnerIndex, 1);
      proxies.unshift(winner);
    }
  }

  return proxies;
}

function extractFirstJsonValue(text: string): string | null {
  const startCandidates = [text.indexOf("{"), text.indexOf("[")].filter((index) => index >= 0);
  if (startCandidates.length === 0) return null;

  const start = Math.min(...startCandidates);
  const openChar = text[start];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}

function parseJsonPayload(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const extracted = extractFirstJsonValue(trimmed);
    if (!extracted) return null;
    try {
      return JSON.parse(extracted);
    } catch {
      return null;
    }
  }
}

function isHtmlPayload(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html") || trimmed.includes("<body") || trimmed.includes("cloudflare");
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeArrayPayload(value: unknown): any[] {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    for (const nested of Object.values(record)) {
      if (Array.isArray(nested)) return nested;
    }

    const objectValues = Object.values(record);
    if (objectValues.length > 0 && objectValues.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
      return objectValues as any[];
    }
  }

  return [];
}

async function fetchOnce(url: string, accept: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { Accept: accept },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error("Réponse vide");
    }

    return text;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export async function fetchTextWithProxy(url: string, accept = "text/plain, */*"): Promise<string> {
  let lastError: Error | null = null;

  for (const proxy of getProxyOrder(url)) {
    try {
      const proxiedUrl = proxy.buildUrl(url);
      const text = await fetchOnce(proxiedUrl, accept, proxy.name === "direct" ? 10000 : 15000);

      if (isHtmlPayload(text)) {
        throw new Error(`Payload HTML via ${proxy.name}`);
      }

      lastWorkingProxy = proxy.name;
      return text;
    } catch (error) {
      lastError = error as Error;
    }
  }

  throw lastError || new Error("Impossible de contacter le serveur");
}

async function fetchJson(url: string): Promise<any> {
  const text = await fetchTextWithProxy(url, "application/json, text/plain, */*");
  const parsed = parseJsonPayload(text);

  if (parsed === null) {
    throw new Error("JSON invalide");
  }

  return parsed;
}

async function fetchM3UContent(url: string): Promise<string | null> {
  try {
    const text = await fetchTextWithProxy(
      url,
      "application/x-mpegURL, application/vnd.apple.mpegurl, text/plain, */*",
    );

    if (text.includes("#EXTM3U") || text.includes("#EXTINF")) {
      return text;
    }
  } catch {
    return null;
  }

  return null;
}

function parseM3UToChannels(content: string, playlistId: string): Channel[] {
  const lines = content.split("\n");
  const channels: Channel[] = [];
  let name = "";
  let category = "Autres";
  let logo = "";

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("#EXTINF")) {
      const nameMatch = line.match(/,(.+)$/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);

      name = nameMatch ? nameMatch[1].trim() : "Sans nom";
      category = groupMatch ? groupMatch[1] : "Autres";
      logo = logoMatch ? logoMatch[1] : "";
      continue;
    }

    if (line && !line.startsWith("#")) {
      channels.push({
        id: `xt_live_${playlistId}_${channels.length}`,
        name: name || `Chaîne ${channels.length + 1}`,
        category,
        url: line,
        logo: logo || undefined,
        type: "live",
        playlistId,
      });

      name = "";
      category = "Autres";
      logo = "";
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

  if (!mac) {
    mac = generateMac();
    localStorage.setItem(key, mac);
  }

  return mac;
}

export function detectXtreamUrl(url: string): XtreamCredentials | null {
  try {
    const urlObj = new URL(url);
    const username = urlObj.searchParams.get("username");
    const password = urlObj.searchParams.get("password");
    const server = `${urlObj.protocol}//${urlObj.host}`;

    if (username && password) {
      return { server, username, password };
    }
  } catch {
    return null;
  }

  return null;
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

export async function loadXtreamPlaylist(
  creds: XtreamCredentials,
  playlistId: string,
  onProgress?: (msg: string) => void,
): Promise<XtreamPlaylistData> {
  const base = `${creds.server}/player_api.php?username=${creds.username}&password=${creds.password}`;
  const mac = getOrCreateMac(playlistId);

  onProgress?.("Connexion au serveur...");

  let accountInfo: XtreamAccountInfo | null = null;
  try {
    const infoResponse = await fetchJson(base);
    accountInfo = (infoResponse?.user_info ?? infoResponse ?? null) as XtreamAccountInfo | null;
  } catch {
    accountInfo = null;
  }

  let liveStreams: any[] = [];
  let liveCategories: any[] = [];
  let vodStreams: any[] = [];
  let vodCategories: any[] = [];
  let seriesStreams: any[] = [];
  let seriesCategories: any[] = [];

  onProgress?.("Chargement chaînes...");
  try {
    liveStreams = normalizeArrayPayload(await fetchJson(`${base}&action=get_live_streams`));
  } catch {}
  await wait(250);

  try {
    liveCategories = normalizeArrayPayload(await fetchJson(`${base}&action=get_live_categories`));
  } catch {}
  await wait(250);

  onProgress?.("Chargement films...");
  try {
    vodStreams = normalizeArrayPayload(await fetchJson(`${base}&action=get_vod_streams`));
  } catch {}
  await wait(250);

  try {
    vodCategories = normalizeArrayPayload(await fetchJson(`${base}&action=get_vod_categories`));
  } catch {}
  await wait(250);

  onProgress?.("Chargement séries...");
  try {
    seriesStreams = normalizeArrayPayload(await fetchJson(`${base}&action=get_series`));
  } catch {}
  await wait(250);

  try {
    seriesCategories = normalizeArrayPayload(await fetchJson(`${base}&action=get_series_categories`));
  } catch {}

  if (liveStreams.length === 0 && vodStreams.length === 0 && seriesStreams.length === 0) {
    onProgress?.("Tentative via playlist M3U...");
    const m3uUrl = `${creds.server}/get.php?username=${creds.username}&password=${creds.password}&type=m3u_plus&output=ts`;
    const m3uContent = await fetchM3UContent(m3uUrl);

    if (m3uContent) {
      const parsedChannels = parseM3UToChannels(m3uContent, playlistId);
      if (parsedChannels.length > 0) {
        return {
          credentials: creds,
          accountInfo,
          liveChannels: parsedChannels,
          liveCategories: [...new Set(parsedChannels.map((channel) => channel.category || "Autres"))].map((category) => ({
            category_id: category,
            category_name: category,
          })),
          vodStreams: [],
          vodCategories: [],
          series: [],
          seriesCategories: [],
          mac,
        };
      }
    }
  }

  const liveCategoryMap: Record<string, string> = {};
  liveCategories.forEach((category: any) => {
    liveCategoryMap[String(category.category_id ?? category.id ?? "")] = category.category_name || category.name || "Autres";
  });

  const vodCategoryMap: Record<string, string> = {};
  vodCategories.forEach((category: any) => {
    vodCategoryMap[String(category.category_id ?? category.id ?? "")] = category.category_name || category.name || "Autres";
  });

  const seriesCategoryMap: Record<string, string> = {};
  seriesCategories.forEach((category: any) => {
    seriesCategoryMap[String(category.category_id ?? category.id ?? "")] = category.category_name || category.name || "Autres";
  });

  const liveChannels: Channel[] = liveStreams
    .filter((stream: any) => stream?.stream_id)
    .map((stream: any) => ({
      id: `xt_live_${playlistId}_${stream.stream_id}`,
      name: stream.name || "Sans nom",
      category: liveCategoryMap[String(stream.category_id ?? "")] || stream.category_name || "Autres",
      url: buildLiveUrl(creds, stream.stream_id),
      logo: stream.stream_icon || undefined,
      type: "live",
      streamId: stream.stream_id,
      playlistId,
    }));

  const vodChannels: Channel[] = vodStreams
    .filter((stream: any) => stream?.stream_id)
    .map((stream: any) => ({
      id: `xt_vod_${playlistId}_${stream.stream_id}`,
      name: stream.name || "Sans nom",
      category: vodCategoryMap[String(stream.category_id ?? "")] || stream.category_name || "Autres",
      url: buildVodUrl(creds, stream.stream_id, stream.container_extension),
      logo: stream.stream_icon || undefined,
      type: "vod",
      streamId: stream.stream_id,
      containerExtension: stream.container_extension,
      playlistId,
    }));

  const seriesChannels: Channel[] = seriesStreams
    .filter((stream: any) => stream?.series_id)
    .map((stream: any) => ({
      id: `xt_series_${playlistId}_${stream.series_id}`,
      name: stream.name || "Sans nom",
      category: seriesCategoryMap[String(stream.category_id ?? "")] || stream.category_name || "Autres",
      url: "",
      logo: stream.cover || undefined,
      type: "series",
      streamId: stream.series_id,
      playlistId,
      seriesInfo: { series_id: stream.series_id },
    }));

  return {
    credentials: creds,
    accountInfo,
    liveChannels,
    liveCategories: liveCategories.map((category: any) => ({
      category_id: String(category.category_id ?? category.id ?? category.category_name ?? ""),
      category_name: category.category_name || category.name || "Autres",
    })),
    vodStreams: vodChannels,
    vodCategories: vodCategories.map((category: any) => ({
      category_id: String(category.category_id ?? category.id ?? category.category_name ?? ""),
      category_name: category.category_name || category.name || "Autres",
    })),
    series: seriesChannels,
    seriesCategories: seriesCategories.map((category: any) => ({
      category_id: String(category.category_id ?? category.id ?? category.category_name ?? ""),
      category_name: category.category_name || category.name || "Autres",
    })),
    mac,
  };
}

export async function loadSeriesEpisodes(
  creds: XtreamCredentials,
  seriesId: number | string,
  playlistId: string,
): Promise<{ season: string; episodes: Channel[] }[]> {
  const base = `${creds.server}/player_api.php?username=${creds.username}&password=${creds.password}`;

  try {
    const data = await fetchJson(`${base}&action=get_series_info&series_id=${seriesId}`);
    if (!data?.episodes) return [];

    const seasons: { season: string; episodes: Channel[] }[] = [];

    for (const [seasonNumber, entries] of Object.entries(data.episodes)) {
      const episodes: Channel[] = (entries as any[]).map((episode: any) => ({
        id: `xt_ep_${playlistId}_${episode.id}`,
        name: episode.title || `Episode ${episode.episode_num}`,
        category: `Saison ${seasonNumber}`,
        url: buildSeriesUrl(creds, episode.id, episode.container_extension),
        type: "series",
        streamId: episode.id,
        containerExtension: episode.container_extension,
        playlistId,
      }));

      seasons.push({ season: seasonNumber, episodes });
    }

    return seasons;
  } catch {
    return [];
  }
}
