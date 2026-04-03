import { Channel } from "./channels";
import { XtreamCredentials, XtreamAccountInfo } from "./xtream";

const FAVORITES_KEY = "chouf_favorites_v2";
const PLAYLISTS_KEY = "chouf_playlists_v2";
const RECENT_KEY = "chouf_recent";

// ======== Per-playlist favorites ========
export interface PlaylistFavorites {
  channels: Record<string, string[]>;  // playlistId -> channelIds
  vod: Record<string, string[]>;
  series: Record<string, string[]>;
}

function getPlaylistFavorites(): PlaylistFavorites {
  const def: PlaylistFavorites = { channels: {}, vod: {}, series: {} };
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return def;
    return { ...def, ...JSON.parse(stored) };
  } catch { return def; }
}

function savePlaylistFavorites(pf: PlaylistFavorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(pf));
}

export function getFavorites(): string[] {
  // Return flat list of all favorite IDs across all playlists
  const pf = getPlaylistFavorites();
  const all = new Set<string>();
  for (const ids of Object.values(pf.channels)) ids.forEach(id => all.add(id));
  for (const ids of Object.values(pf.vod)) ids.forEach(id => all.add(id));
  for (const ids of Object.values(pf.series)) ids.forEach(id => all.add(id));
  // Also include legacy favorites
  try {
    const legacy: string[] = JSON.parse(localStorage.getItem("chouf_favorites") || "[]");
    legacy.forEach(id => all.add(id));
  } catch {}
  return [...all];
}

export function getFavoritesGrouped(): PlaylistFavorites {
  return getPlaylistFavorites();
}

export function toggleFavorite(channelId: string, playlistId?: string, contentType?: "live" | "vod" | "series"): string[] {
  const pf = getPlaylistFavorites();
  const plId = playlistId || "default";
  const bucket = contentType === "vod" ? "vod" : contentType === "series" ? "series" : "channels";

  if (!pf[bucket][plId]) pf[bucket][plId] = [];
  const arr = pf[bucket][plId];
  const idx = arr.indexOf(channelId);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(channelId);

  savePlaylistFavorites(pf);
  return getFavorites();
}

// ======== Playlists ========
export interface Playlist {
  id: string;
  name: string;
  channels: Channel[];
  addedAt: number;
  isXtream?: boolean;
  xtreamCredentials?: XtreamCredentials;
  xtreamAccountInfo?: XtreamAccountInfo | null;
  xtreamMac?: string;
  vodStreams?: Channel[];
  series?: Channel[];
}

export function getPlaylists(): Playlist[] {
  try {
    return JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || "[]");
  } catch { return []; }
}

export function savePlaylists(playlists: Playlist[]) {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

// ======== Recents ========
export function addRecent(channelId: string) {
  const recent = getRecent();
  const filtered = recent.filter(id => id !== channelId);
  filtered.unshift(channelId);
  localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 20)));
}

export function getRecent(): string[] {
  return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
}
