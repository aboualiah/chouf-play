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
  // 🎥 Démo Premium
  { id: "d1", name: "Big Buck Bunny (HD)", category: "Démo Premium", url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8", logo: "https://i.imgur.com/7bMqysJ.png", type: "live" },
  { id: "d2", name: "Tears of Steel (HD)", category: "Démo Premium", url: "https://test-streams.mux.dev/tears-of-steel/playlist.m3u8", logo: "https://i.imgur.com/3yZ9G6L.png", type: "live" },
  { id: "d3", name: "Test HLS Stream", category: "Démo Premium", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", logo: "https://i.imgur.com/Z6X6YyL.png", type: "live" },
  // 📰 News
  { id: "d4", name: "France 24 (FR)", category: "News", url: "https://static.france24.com/live/F24_FR_HI_HLS/live_web.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/6/65/France_24_logo.svg", type: "live" },
  { id: "d5", name: "France 24 (EN)", category: "News", url: "https://static.france24.com/live/F24_EN_HI_HLS/live_web.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/6/65/France_24_logo.svg", type: "live" },
  { id: "d6", name: "Euronews", category: "News", url: "https://rakuten-euronews-1-gb.samsung.wurl.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Euronews_2016.svg", type: "live" },
  { id: "d7", name: "DW English", category: "News", url: "https://dwamdstream103.akamaized.net/hls/live/2015526/dwstream103/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/DW_logo.svg", type: "live" },
  { id: "d8", name: "Al Jazeera English", category: "News", url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8", logo: "https://upload.wikimedia.org/wikipedia/en/f/f2/Aljazeera_eng.svg", type: "live" },
  // 🎬 TV Gratuite
  { id: "d9", name: "Pluto TV Movies", category: "TV Gratuite", url: "https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5ca6735e0c0cbe0009c3b1f0/master.m3u8", type: "live" },
  { id: "d10", name: "Pluto TV Action", category: "TV Gratuite", url: "https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5ca671f8f23f1d0007419ad8/master.m3u8", type: "live" },
  { id: "d11", name: "Pluto TV Comedy", category: "TV Gratuite", url: "https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5ca672f515a62000098a4a5b/master.m3u8", type: "live" },
  // 🎵 Music
  { id: "d12", name: "Trace Urban", category: "Music", url: "https://lightning-traceurban-samsungau.amagi.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Trace_Urban_logo.png", type: "live" },
  { id: "d13", name: "NRJ Hits", category: "Music", url: "https://nrjhits.akamaized.net/hls/live/2038375/nrjhits/master.m3u8", logo: "https://upload.wikimedia.org/wikipedia/fr/9/9d/NRJ_Hits_logo.png", type: "live" },
  // 📚 Culture
  { id: "d14", name: "NASA TV", category: "Culture", url: "https://ntv1.akamaized.net/hls/live/2008964/ntv1/master.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg", type: "live" },
  { id: "d15", name: "Bloomberg TV", category: "Culture", url: "https://bloomberg-bloomberg-1-eu.rakuten.wurl.tv/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Bloomberg_Television_logo.svg", type: "live" },
  // 🧪 Test Technique
  { id: "d16", name: "Apple Test Stream", category: "Test Technique", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8", type: "live" },
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
  { id: "r20", name: "Radio Classique", category: "Radio FR", url: "https://radioclassique.ice.infomaniak.ch/radioclassique-high.mp3", logo: "", type: "live" },
  // Radio International
  { id: "r21", name: "BBC World Service", category: "Radio EN", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/BBC_World_Service_red.svg/200px-BBC_World_Service_red.svg.png", type: "live" },
  { id: "r22", name: "Europa Plus", category: "Radio Pop", url: "https://ep128.hostingradio.ru:8030/ep128", logo: "", type: "live" },
  // Radio Jazz / Classique / Chill
  { id: "r13", name: "Jazz Radio", category: "Radio Jazz", url: "https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3", logo: "", type: "live" },
  { id: "r14", name: "Radio Swiss Jazz", category: "Radio Jazz", url: "https://stream.srg-ssr.ch/m/rsj/mp3_128", logo: "", type: "live" },
  { id: "r23", name: "TSF Jazz", category: "Radio Jazz", url: "https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3", logo: "", type: "live" },
  { id: "r15", name: "Radio Swiss Classic", category: "Radio Classique", url: "https://stream.srg-ssr.ch/m/rsc_fr/mp3_128", logo: "", type: "live" },
  { id: "r16", name: "Classical KING FM", category: "Radio Classique", url: "https://classicalking.streamguys1.com/king-fm-aac-128k", logo: "", type: "live" },
  { id: "r12", name: "Lounge Radio", category: "Radio Chill", url: "https://fr1.streamhosting.ch/lounge128.mp3", logo: "", type: "live" },
  { id: "r19", name: "Radio Swiss Pop", category: "Radio Pop", url: "https://stream.srg-ssr.ch/m/rsp/mp3_128", logo: "", type: "live" },
];

export function getCategories(channels: Channel[]): string[] {
  return [...new Set(channels.map(c => c.category))];
}

// Category color gradients for cards
export const CATEGORY_GRADIENTS: Record<string, string> = {
  "Démo Premium": "from-amber-600/40 to-amber-900/20",
  "News": "from-blue-600/40 to-blue-900/20",
  "TV Gratuite": "from-indigo-600/40 to-indigo-900/20",
  "Music": "from-pink-600/40 to-pink-900/20",
  "Culture": "from-purple-600/40 to-purple-900/20",
  "Test Technique": "from-emerald-600/40 to-emerald-900/20",
};
