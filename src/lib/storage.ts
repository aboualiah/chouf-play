import { Channel } from "./channels";
import { XtreamCredentials, XtreamAccountInfo } from "./xtream";

const FAVORITES_KEY = "chouf_favorites_v3";
const PLAYLISTS_KEY = "chouf_playlists_v3";
const RECENT_KEY = "chouf_recent";
const REMINDERS_KEY = "chouf_match_reminders";

// ======== Favorites ========
export function getFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
}

export function toggleFavorite(channelId: string): string[] {
  const favs = getFavorites();
  const idx = favs.indexOf(channelId);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(channelId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return favs;
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
  try { return JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || "[]"); } catch { return []; }
}

export function savePlaylists(playlists: Playlist[]) {
  try {
    // Try saving as-is first
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (e) {
    // localStorage quota exceeded — strip logos to reduce size
    console.warn("localStorage quota exceeded, stripping logos...");
    try {
      const stripped = playlists.map(p => ({
        ...p,
        channels: p.channels.map(c => ({ ...c, logo: undefined })),
        vodStreams: p.vodStreams?.map(c => ({ ...c, logo: undefined })),
        series: p.series?.map(c => ({ ...c, logo: undefined })),
      }));
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(stripped));
    } catch (e2) {
      // Still too large — keep only channel names/urls (no logos, minimal data)
      console.warn("Still too large, keeping minimal data...");
      const minimal = playlists.map(p => ({
        ...p,
        channels: p.channels.map(c => ({ id: c.id, name: c.name, category: c.category, url: c.url, type: c.type, streamId: c.streamId, playlistId: c.playlistId })),
        vodStreams: p.vodStreams?.map(c => ({ id: c.id, name: c.name, category: c.category, url: c.url, type: c.type, streamId: c.streamId, playlistId: c.playlistId })),
        series: p.series?.map(c => ({ id: c.id, name: c.name, category: c.category, url: c.url, type: c.type, streamId: c.streamId, playlistId: c.playlistId, seriesInfo: c.seriesInfo })),
      }));
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(minimal));
    }
  }
}

// ======== Recents ========
export function addRecent(channelId: string) {
  const recent = getRecent();
  const filtered = recent.filter(id => id !== channelId);
  filtered.unshift(channelId);
  localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 30)));
}

export function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

// ======== Match reminders ========
export function getReminders(): string[] {
  try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]"); } catch { return []; }
}

export function toggleReminder(matchId: string): string[] {
  const r = getReminders();
  const idx = r.indexOf(matchId);
  if (idx >= 0) r.splice(idx, 1);
  else r.push(matchId);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(r));
  return r;
}
