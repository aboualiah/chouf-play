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
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
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
