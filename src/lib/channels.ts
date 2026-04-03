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
  // 🕌 Religion
  { id: "d1", name: "Quran Karim TV", category: "Religion", url: "https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Saudi_Quran_TV.png/200px-Saudi_Quran_TV.png", type: "live" },
  { id: "d2", name: "Makkah Live", category: "Religion", url: "https://cdn-globecast.akamaized.net/live/eds/saudi_quran_makkah/hls_snr/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/71/Makkah_TV_logo.png/200px-Makkah_TV_logo.png", type: "live" },
  { id: "d3", name: "Sunnah TV", category: "Religion", url: "https://cdn-globecast.akamaized.net/live/eds/saudi_sunna/hls_snr/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Saudi_Quran_TV.png/200px-Saudi_Quran_TV.png", type: "live" },
  // 📰 Info FR
  { id: "d4", name: "France 24 FR", category: "Info FR", url: "https://stream.france24.com/live/france24_fr/france24_fr.m3u8", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/2/24/France_24_logo_2018.svg/200px-France_24_logo_2018.svg.png", type: "live" },
  { id: "d5", name: "CGTN Français", category: "Info FR", url: "https://news.cgtn.com/resource/live/french/cgtn-f.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CGTN.svg/200px-CGTN.svg.png", type: "live" },
  // 📰 Info EN
  { id: "d6", name: "Al Jazeera EN", category: "Info EN", url: "https://live-hls-web-aje.getaj.net/AJE/01.m3u8", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/200px-Aljazeera_eng.svg.png", type: "live" },
  { id: "d7", name: "France 24 EN", category: "Info EN", url: "https://stream.france24.com/live/france24_en/france24_en.m3u8", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/2/24/France_24_logo_2018.svg/200px-France_24_logo_2018.svg.png", type: "live" },
  { id: "d8", name: "DW English", category: "Info EN", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/200px-Deutsche_Welle_symbol_2012.svg.png", type: "live" },
  { id: "d9", name: "TRT World", category: "Info EN", url: "https://tv-trtworld.medya.trt.com.tr/master.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/TRT_World_logo.png/200px-TRT_World_logo.png", type: "live" },
  { id: "d10", name: "CGTN English", category: "Info EN", url: "https://news.cgtn.com/resource/live/english/cgtn-news.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CGTN.svg/200px-CGTN.svg.png", type: "live" },
  // 📰 Info AR
  { id: "d11", name: "France 24 AR", category: "Info AR", url: "https://stream.france24.com/live/france24_ar/france24_ar.m3u8", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/2/24/France_24_logo_2018.svg/200px-France_24_logo_2018.svg.png", type: "live" },
  { id: "d12", name: "DW عربي", category: "Info AR", url: "https://dwamdstream106.akamaized.net/hls/live/2015530/dwstream106/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/200px-Deutsche_Welle_symbol_2012.svg.png", type: "live" },
  // 📰 Info DE
  { id: "d13", name: "DW Deutsch", category: "Info DE", url: "https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/200px-Deutsche_Welle_symbol_2012.svg.png", type: "live" },
  // 📰 Info ES
  { id: "d14", name: "DW Español", category: "Info ES", url: "https://dwamdstream103.akamaized.net/hls/live/2015528/dwstream103/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/200px-Deutsche_Welle_symbol_2012.svg.png", type: "live" },
  // 🏅 Sport & Culture
  { id: "d15", name: "Red Bull TV", category: "Sport", url: "https://rbmn-live.akamaized.net/hls/live/590964/BossRu498worwor/master_264.m3u8", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/Red_Bull_TV_logo.svg/200px-Red_Bull_TV_logo.svg.png", type: "live" },
  { id: "d16", name: "Arirang TV", category: "Culture", url: "https://amdlive-ch01-ctnd-com.akamaized.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Arirang_TV_logo.svg/200px-Arirang_TV_logo.svg.png", type: "live" },
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
  "Info ES": "from-yellow-600/40 to-yellow-900/20",
  "Sport": "from-orange-600/40 to-orange-900/20",
  "Culture": "from-purple-600/40 to-purple-900/20",
};
