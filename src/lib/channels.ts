export interface Channel {
  id: string;
  name: string;
  category: string;
  url: string;
  logo?: string;
  type?: "live" | "vod" | "series";
  streamId?: string | number;
  containerExtension?: string;
  playlistId?: string;
  seriesInfo?: { series_id: number | string };
}

export const DEMO_CHANNELS: Channel[] = [
  { id: "d1", name: "Quran Karim TV", category: "Religion", url: "https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8", type: "live" },
  { id: "d2", name: "Makkah Live", category: "Religion", url: "https://cdn-globecast.akamaized.net/live/eds/saudi_quran_makkah/hls_snr/index.m3u8", type: "live" },
  { id: "d3", name: "Sunnah TV", category: "Religion", url: "https://cdn-globecast.akamaized.net/live/eds/saudi_sunna/hls_snr/index.m3u8", type: "live" },
  { id: "d4", name: "France 24 FR", category: "Info FR", url: "https://stream.france24.com/live/france24_fr/france24_fr.m3u8", type: "live" },
  { id: "d5", name: "TV5Monde Info", category: "Info FR", url: "https://ott.tv5monde.com/Content/HLS/Live/channel(info)/index.m3u8", type: "live" },
  { id: "d6", name: "CGTN FR", category: "Info FR", url: "https://news.cgtn.com/resource/live/french/cgtn-f.m3u8", type: "live" },
  { id: "d7", name: "Arte", category: "Info FR", url: "https://artesimulcast.akamaized.net/hls/live/2031003/artelive_fr/index.m3u8", type: "live" },
  { id: "d8", name: "France 24 EN", category: "Info EN", url: "https://stream.france24.com/live/france24_en/france24_en.m3u8", type: "live" },
  { id: "d9", name: "Al Jazeera EN", category: "Info EN", url: "https://live-hls-web-aje.getaj.net/AJE/01.m3u8", type: "live" },
  { id: "d10", name: "DW English", category: "Info EN", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8", type: "live" },
  { id: "d11", name: "CGTN EN", category: "Info EN", url: "https://news.cgtn.com/resource/live/english/cgtn-news.m3u8", type: "live" },
  { id: "d12", name: "TRT World", category: "Info EN", url: "https://tv-trtworld.medya.trt.com.tr/master.m3u8", type: "live" },
  { id: "d13", name: "Sky News", category: "Info EN", url: "https://linear417-gb-hls1-prd-ak.cdn.skycdp.com/100e/Content/HLS_001_1080_30/Live/channel(skynews)/index_1080-30.m3u8", type: "live" },
  { id: "d14", name: "France 24 AR", category: "Info AR", url: "https://stream.france24.com/live/france24_ar/france24_ar.m3u8", type: "live" },
  { id: "d15", name: "DW عربي", category: "Info AR", url: "https://dwamdstream106.akamaized.net/hls/live/2015530/dwstream106/index.m3u8", type: "live" },
  { id: "d16", name: "DW Deutsch", category: "Info DE", url: "https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8", type: "live" },
  { id: "d17", name: "Red Bull TV", category: "Sport", url: "https://rbmn-live.akamaized.net/hls/live/590964/BossRu498worwor/master_264.m3u8", type: "live" },
  { id: "d18", name: "Arirang TV", category: "Culture", url: "https://amdlive-ch01-ctnd-com.akamaized.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8", type: "live" },
  { id: "d19", name: "NHK World", category: "Culture", url: "https://nhkworld.webcdn.stream.ne.jp/www11/nhkworld-tv/domestic/263942/live_wa_s.m3u8", type: "live" },
  { id: "d20", name: "Euronews FR", category: "Info FR", url: "https://rakuten-euronews-fr-1-be.samsung.wurl.tv/manifest/playlist.m3u8", type: "live" },
  { id: "d21", name: "RT France", category: "Info FR", url: "https://rt-fra.rbc.ru/rbc/live/fra/index.m3u8", type: "live" },
  { id: "d22", name: "CNBC", category: "Info EN", url: "https://ott-lnr-live-str.akamaized.net/hls/live/2042585/CNBC-US/master.m3u8", type: "live" },
  { id: "d23", name: "Bloomberg", category: "Info EN", url: "https://www.bloomberg.com/media-manifest/streams/us.m3u8", type: "live" },
  { id: "d24", name: "ABC News", category: "Info EN", url: "https://content-ause2.uplynk.com/channel/3324f2467c414329b3b0cc5cd987b6be/f.m3u8", type: "live" },
];

export function getCategories(channels: Channel[]): string[] {
  return [...new Set(channels.map(c => c.category))];
}

// Category color gradients for cards
export const CATEGORY_GRADIENTS: Record<string, string> = {
  "Religion": "from-amber-700/50 to-amber-900/30",
  "Info FR": "from-blue-600/40 to-blue-900/20",
  "Info EN": "from-indigo-600/40 to-indigo-900/20",
  "Info AR": "from-emerald-600/40 to-emerald-900/20",
  "Info DE": "from-red-600/40 to-red-900/20",
  "Sport": "from-orange-600/40 to-orange-900/20",
  "Culture": "from-purple-600/40 to-purple-900/20",
};
