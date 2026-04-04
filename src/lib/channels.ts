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

export const RADIO_STATIONS: Channel[] = [
  // Radio FR (all HTTPS, verified working)
  { id: "r4", name: "France Inter", category: "Radio FR", url: "https://icecast.radiofrance.fr/franceinter-hifi.aac", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/3/38/France_Inter_logo_2021.svg/200px-France_Inter_logo_2021.svg.png", type: "live" },
  { id: "r5", name: "France Info", category: "Radio FR", url: "https://icecast.radiofrance.fr/franceinfo-hifi.aac", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/f/f0/France_Info_2021.svg/200px-France_Info_2021.svg.png", type: "live" },
  { id: "r6", name: "France Culture", category: "Radio FR", url: "https://icecast.radiofrance.fr/franceculture-hifi.aac", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/6/65/France_Culture_logo_2021.svg/200px-France_Culture_logo_2021.svg.png", type: "live" },
  { id: "r7", name: "FIP", category: "Radio FR", url: "https://icecast.radiofrance.fr/fip-hifi.aac", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/d/d5/Logo_Fip_2021.svg/200px-Logo_Fip_2021.svg.png", type: "live" },
  { id: "r8", name: "RTL", category: "Radio FR", url: "https://streamer-01.rtl.fr/rtl-1-44-128", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/0/07/RTL_logo_2015.svg/200px-RTL_logo_2015.svg.png", type: "live" },
  { id: "r11", name: "Skyrock", category: "Radio FR", url: "https://icecast.skyrock.net/s/natio_mp3_128k", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/4/4f/Skyrock_logo_2011.svg/200px-Skyrock_logo_2011.svg.png", type: "live" },
  { id: "r17", name: "France Musique", category: "Radio FR", url: "https://icecast.radiofrance.fr/francemusique-hifi.aac", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/9/95/France_Musique_-_2008.svg/200px-France_Musique_-_2008.svg.png", type: "live" },
  { id: "r18", name: "Mouv'", category: "Radio FR", url: "https://icecast.radiofrance.fr/mouv-hifi.aac", logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/1/1f/Mouv%27_logo_2020.svg/200px-Mouv%27_logo_2020.svg.png", type: "live" },
  // Radio Chill / Jazz / Classique (all HTTPS)
  { id: "r12", name: "Lounge Radio", category: "Radio Chill", url: "https://fr1.streamhosting.ch/lounge128.mp3", logo: "", type: "live" },
  { id: "r13", name: "Jazz Radio", category: "Radio Jazz", url: "https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3", logo: "", type: "live" },
  { id: "r14", name: "Radio Swiss Jazz", category: "Radio Jazz", url: "https://stream.srg-ssr.ch/m/rsj/mp3_128", logo: "", type: "live" },
  { id: "r15", name: "Radio Swiss Classic", category: "Radio Classique", url: "https://stream.srg-ssr.ch/m/rsc_fr/mp3_128", logo: "", type: "live" },
  { id: "r16", name: "Classical KING FM", category: "Radio Classique", url: "https://classicalking.streamguys1.com/king-fm-aac-128k", logo: "", type: "live" },
  { id: "r19", name: "Radio Swiss Pop", category: "Radio Pop", url: "https://stream.srg-ssr.ch/m/rsp/mp3_128", logo: "", type: "live" },
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
