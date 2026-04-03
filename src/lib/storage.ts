import { Channel } from "./channels";
import { XtreamCredentials, XtreamAccountInfo } from "./xtream";

const FAVORITES_KEY = "chouf_favorites_v3";
const PLAYLISTS_KEY = "chouf_playlists_v3";
const RECENT_KEY = "chouf_recent";
const REMINDERS_KEY = "chouf_match_reminders";
const IDB_NAME = "chouf_db";
const IDB_STORE = "playlists";
const IDB_VERSION = 1;

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

// ======== Playlists (IndexedDB with localStorage fallback) ========
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

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Async save to IndexedDB
export async function savePlaylistsAsync(playlists: Playlist[]): Promise<void> {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    store.clear();
    for (const p of playlists) {
      store.put(p);
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    // Keep a lightweight index in localStorage for fast sync reads
    const index = playlists.map(p => ({ id: p.id, name: p.name, addedAt: p.addedAt, isXtream: p.isXtream, channelCount: p.channels.length, vodCount: p.vodStreams?.length || 0, seriesCount: p.series?.length || 0 }));
    try { localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(index)); } catch {}
  } catch {
    // Fallback to localStorage
    savePlaylistsLocalStorage(playlists);
  }
}

function savePlaylistsLocalStorage(playlists: Playlist[]) {
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch {
    console.warn("localStorage quota exceeded, stripping logos...");
    try {
      const stripped = playlists.map(p => ({
        ...p,
        channels: p.channels.map(c => ({ ...c, logo: undefined })),
        vodStreams: p.vodStreams?.map(c => ({ ...c, logo: undefined })),
        series: p.series?.map(c => ({ ...c, logo: undefined })),
      }));
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(stripped));
    } catch {
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

// Sync wrapper for backward compat
export function savePlaylists(playlists: Playlist[]) {
  savePlaylistsAsync(playlists).catch(console.error);
}

// Async load from IndexedDB
export async function loadPlaylistsAsync(): Promise<Playlist[]> {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    const req = store.getAll();
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        const result = req.result as Playlist[];
        resolve(result.length > 0 ? result : getPlaylistsFromLocalStorage());
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return getPlaylistsFromLocalStorage();
  }
}

function getPlaylistsFromLocalStorage(): Playlist[] {
  try { return JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || "[]"); } catch { return []; }
}

// Sync fallback (reads localStorage only — for initial render)
export function getPlaylists(): Playlist[] {
  return getPlaylistsFromLocalStorage();
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
