import { Channel } from "./channels";

const FAVORITES_KEY = "chouf_favorites";
const PLAYLISTS_KEY = "chouf_playlists";
const RECENT_KEY = "chouf_recent";

export function getFavorites(): string[] {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

export function toggleFavorite(channelId: string): string[] {
  const favs = getFavorites();
  const idx = favs.indexOf(channelId);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(channelId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return favs;
}

export interface Playlist {
  id: string;
  name: string;
  channels: Channel[];
  addedAt: number;
}

export function getPlaylists(): Playlist[] {
  return JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || "[]");
}

export function savePlaylists(playlists: Playlist[]) {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

export function addRecent(channelId: string) {
  const recent = getRecent();
  const filtered = recent.filter(id => id !== channelId);
  filtered.unshift(channelId);
  localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 20)));
}

export function getRecent(): string[] {
  return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
}
