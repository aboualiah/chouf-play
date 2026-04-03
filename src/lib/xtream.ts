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

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => url,
];

/**
 * Detect if a URL contains Xtream credentials
 */
export function detectXtreamUrl(url: string): XtreamCredentials | null {
  try {
    const u = new URL(url);
    const username = u.searchParams.get("username");
    const password = u.searchParams.get("password");
    if (username && password) {
      const server = `${u.protocol}//${u.host}`;
      return { server, username, password };
    }
  } catch {}

  // Try regex for various formats
  const match = url.match(/(?:https?:\/\/[^/]+).*?username=([^&]+).*?password=([^&]+)/);
  if (match) {
    const serverMatch = url.match(/(https?:\/\/[^/]+)/);
    if (serverMatch) {
      return { server: serverMatch[1], username: match[1], password: match[2] };
    }
  }

  return null;
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(CORS_PROXY(url));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
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
  onProgress?: (msg: string) => void
): Promise<XtreamPlaylistData> {
  const base = `${creds.server}/player_api.php?username=${creds.username}&password=${creds.password}`;
  const mac = getOrCreateMac(playlistId);

  onProgress?.("Connexion au serveur...");

  // Fetch account info
  let accountInfo: XtreamAccountInfo | null = null;
  try {
    const info = await fetchJson(base);
    if (info?.user_info) {
      accountInfo = info.user_info;
    }
  } catch {}

  onProgress?.("Chargement des chaînes TV...");

  // Fetch live streams + categories in parallel
  const [liveStreamsRaw, liveCatsRaw, vodStreamsRaw, vodCatsRaw, seriesRaw, seriesCatsRaw] = await Promise.allSettled([
    fetchJson(`${base}&action=get_live_streams`),
    fetchJson(`${base}&action=get_live_categories`),
    fetchJson(`${base}&action=get_vod_streams`),
    fetchJson(`${base}&action=get_vod_categories`),
    fetchJson(`${base}&action=get_series`),
    fetchJson(`${base}&action=get_series_categories`),
  ]);

  const liveStreams = liveStreamsRaw.status === "fulfilled" ? liveStreamsRaw.value : [];
  const liveCats = liveCatsRaw.status === "fulfilled" ? liveCatsRaw.value : [];
  const vodStreams = vodStreamsRaw.status === "fulfilled" ? vodStreamsRaw.value : [];
  const vodCats = vodCatsRaw.status === "fulfilled" ? vodCatsRaw.value : [];
  const seriesStreams = seriesRaw.status === "fulfilled" ? seriesRaw.value : [];
  const seriesCats = seriesCatsRaw.status === "fulfilled" ? seriesCatsRaw.value : [];

  // Build category maps
  const liveCatMap: Record<string, string> = {};
  if (Array.isArray(liveCats)) liveCats.forEach((c: any) => { liveCatMap[c.category_id] = c.category_name; });

  const vodCatMap: Record<string, string> = {};
  if (Array.isArray(vodCats)) vodCats.forEach((c: any) => { vodCatMap[c.category_id] = c.category_name; });

  const seriesCatMap: Record<string, string> = {};
  if (Array.isArray(seriesCats)) seriesCats.forEach((c: any) => { seriesCatMap[c.category_id] = c.category_name; });

  // Map live streams to Channel
  const liveChannels: Channel[] = Array.isArray(liveStreams)
    ? liveStreams.map((s: any) => ({
        id: `xt_live_${playlistId}_${s.stream_id}`,
        name: s.name || "Sans nom",
        category: liveCatMap[s.category_id] || "Autres",
        url: buildLiveUrl(creds, s.stream_id),
        logo: s.stream_icon || undefined,
        type: "live" as const,
        streamId: s.stream_id,
        playlistId,
      }))
    : [];

  // Map VOD streams to Channel
  const vodChannels: Channel[] = Array.isArray(vodStreams)
    ? vodStreams.map((s: any) => ({
        id: `xt_vod_${playlistId}_${s.stream_id}`,
        name: s.name || "Sans nom",
        category: vodCatMap[s.category_id] || "Autres",
        url: buildVodUrl(creds, s.stream_id, s.container_extension),
        logo: s.stream_icon || undefined,
        type: "vod" as const,
        streamId: s.stream_id,
        containerExtension: s.container_extension,
        playlistId,
      }))
    : [];

  // Map series to Channel
  const seriesChannels: Channel[] = Array.isArray(seriesStreams)
    ? seriesStreams.map((s: any) => ({
        id: `xt_series_${playlistId}_${s.series_id}`,
        name: s.name || "Sans nom",
        category: seriesCatMap[s.category_id] || "Autres",
        url: "", // Will be resolved when selecting episodes
        logo: s.cover || undefined,
        type: "series" as const,
        streamId: s.series_id,
        playlistId,
        seriesInfo: { series_id: s.series_id },
      }))
    : [];

  return {
    credentials: creds,
    accountInfo,
    liveChannels,
    liveCategories: Array.isArray(liveCats) ? liveCats : [],
    vodStreams: vodChannels,
    vodCategories: Array.isArray(vodCats) ? vodCats : [],
    series: seriesChannels,
    seriesCategories: Array.isArray(seriesCats) ? seriesCats : [],
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
  } catch {
    return [];
  }
}
