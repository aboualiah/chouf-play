export interface Channel {
  id: string;
  name: string;
  category: string;
  url: string;
  logo?: string;
  isFavorite?: boolean;
  type?: "live" | "vod" | "series";
  streamId?: string | number;
  containerExtension?: string;
  playlistId?: string;
  seriesInfo?: { series_id: number | string };
}

export const DEMO_CHANNELS: Channel[] = [
  { id: "1", name: "Quran Karim TV", category: "Religion", url: "https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8", type: "live" },
  { id: "2", name: "Makkah Live", category: "Religion", url: "https://cdn-globecast.akamaized.net/live/eds/saudi_quran_makkah/hls_snr/index.m3u8", type: "live" },
  { id: "3", name: "Sunnah TV", category: "Religion", url: "https://cdn-globecast.akamaized.net/live/eds/saudi_sunna/hls_snr/index.m3u8", type: "live" },
  { id: "4", name: "France 24 FR", category: "Info FR", url: "https://stream.france24.com/live/france24_fr/france24_fr.m3u8", type: "live" },
  { id: "5", name: "TV5Monde Info", category: "Info FR", url: "https://ott.tv5monde.com/Content/HLS/Live/channel(info)/index.m3u8", type: "live" },
  { id: "6", name: "CGTN FR", category: "Info FR", url: "https://news.cgtn.com/resource/live/french/cgtn-f.m3u8", type: "live" },
  { id: "7", name: "Arte", category: "Info FR", url: "https://artesimulcast.akamaized.net/hls/live/2031003/artelive_fr/index.m3u8", type: "live" },
  { id: "8", name: "France 24 EN", category: "Info EN", url: "https://stream.france24.com/live/france24_en/france24_en.m3u8", type: "live" },
  { id: "9", name: "Al Jazeera EN", category: "Info EN", url: "https://live-hls-web-aje.getaj.net/AJE/01.m3u8", type: "live" },
  { id: "10", name: "DW English", category: "Info EN", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8", type: "live" },
  { id: "11", name: "CGTN EN", category: "Info EN", url: "https://news.cgtn.com/resource/live/english/cgtn-news.m3u8", type: "live" },
  { id: "12", name: "TRT World", category: "Info EN", url: "https://tv-trtworld.medya.trt.com.tr/master.m3u8", type: "live" },
  { id: "13", name: "Sky News", category: "Info EN", url: "https://linear417-gb-hls1-prd-ak.cdn.skycdp.com/100e/Content/HLS_001_1080_30/Live/channel(skynews)/index_1080-30.m3u8", type: "live" },
  { id: "14", name: "France 24 AR", category: "Info AR", url: "https://stream.france24.com/live/france24_ar/france24_ar.m3u8", type: "live" },
  { id: "15", name: "DW عربي", category: "Info AR", url: "https://dwamdstream106.akamaized.net/hls/live/2015530/dwstream106/index.m3u8", type: "live" },
  { id: "16", name: "DW Deutsch", category: "Info DE", url: "https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8", type: "live" },
  { id: "17", name: "Red Bull TV", category: "Sport", url: "https://rbmn-live.akamaized.net/hls/live/590964/BossRu498worwor/master_264.m3u8", type: "live" },
  { id: "18", name: "Arirang TV", category: "Culture", url: "https://amdlive-ch01-ctnd-com.akamaized.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8", type: "live" },
];

export function getCategories(channels: Channel[]): string[] {
  return [...new Set(channels.map(c => c.category))];
}
