import { useState } from "react";
import { X, Link, Upload, Server, Loader2, Tv, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Channel } from "@/lib/channels";
import { toast } from "sonner";
import { detectXtreamUrl, loadXtreamPlaylist, XtreamPlaylistData } from "@/lib/xtream";

interface PlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onPlaylistLoaded: (name: string, channels: Channel[], xtreamData?: XtreamPlaylistData) => void;
  onLoadDemo: () => void;
}

function parseM3U(content: string): Channel[] {
  const lines = content.split("\n");
  const channels: Channel[] = [];
  let currentName = "";
  let currentCategory = "";
  let currentLogo = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXTINF")) {
      const nameMatch = line.match(/,(.+)$/);
      currentName = nameMatch ? nameMatch[1].trim() : "Sans nom";
      const groupMatch = line.match(/group-title="([^"]+)"/);
      currentCategory = groupMatch ? groupMatch[1] : "Autres";
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      currentLogo = logoMatch ? logoMatch[1] : "";
    } else if (line && !line.startsWith("#")) {
      channels.push({
        id: `pl_${Date.now()}_${channels.length}`,
        name: currentName || `Chaîne ${channels.length + 1}`,
        category: currentCategory,
        url: line,
        logo: currentLogo || undefined,
        type: "live",
      });
      currentName = "";
      currentCategory = "";
      currentLogo = "";
    }
  }
  return channels;
}

const CORS_PROXIES = [
  (url: string) => url,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

export function PlaylistModal({ open, onClose, onPlaylistLoaded, onLoadDemo }: PlaylistModalProps) {
  const [tab, setTab] = useState<"url" | "file" | "xtream">("url");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [xtream, setXtream] = useState({ server: "", user: "", pass: "" });

  const loadFromUrl = async () => {
    if (!url) return;
    setLoading(true);
    setProgress("");

    const creds = detectXtreamUrl(url);
    if (creds) {
      setProgress("Xtream détecté...");
      try {
        const playlistId = `xt_${Date.now()}`;
        const data = await loadXtreamPlaylist(creds, playlistId, setProgress);
        const total = data.liveChannels.length + data.vodStreams.length + data.series.length;
        if (total === 0) {
          toast.error("Aucune chaîne trouvée sur ce serveur");
          setLoading(false); setProgress("");
          return;
        }
        toast.success(`${total} éléments chargés`);
        onPlaylistLoaded(creds.server.replace(/https?:\/\//, ""), data.liveChannels, data);
        onClose();
        return;
      } catch (err) {
        console.error("Xtream error:", err);
        toast.error("Erreur de connexion Xtream");
      } finally { setLoading(false); setProgress(""); }
      return;
    }

    for (const proxy of CORS_PROXIES) {
      try {
        const res = await fetch(proxy(url));
        if (!res.ok) continue;
        const text = await res.text();
        const channels = parseM3U(text);
        if (channels.length > 0) {
          onPlaylistLoaded(new URL(url).hostname, channels);
          toast.success(`${channels.length} chaînes chargées`);
          onClose();
          return;
        }
      } catch {}
    }
    toast.error("Impossible de charger la playlist");
    setLoading(false);
  };

  const loadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const channels = parseM3U(reader.result as string);
      if (channels.length > 0) {
        onPlaylistLoaded(file.name, channels);
        toast.success(`${channels.length} chaînes chargées`);
        onClose();
      } else toast.error("Aucune chaîne trouvée");
    };
    reader.readAsText(file);
  };

  const loadXtream = async () => {
    if (!xtream.server || !xtream.user || !xtream.pass) return;
    setLoading(true);
    const creds = { server: xtream.server.replace(/\/$/, ""), username: xtream.user, password: xtream.pass };
    try {
      const playlistId = `xt_${Date.now()}`;
      const data = await loadXtreamPlaylist(creds, playlistId, setProgress);
      const total = data.liveChannels.length + data.vodStreams.length + data.series.length;
      toast.success(`${total} éléments chargés`);
      onPlaylistLoaded(creds.server.replace(/https?:\/\//, ""), data.liveChannels, data);
      onClose();
    } catch { toast.error("Connexion échouée"); }
    finally { setLoading(false); setProgress(""); }
  };

  const TABS = [
    { id: "url" as const, label: "🔗 URL", icon: Link },
    { id: "file" as const, label: "📂 Fichier", icon: Upload },
    { id: "xtream" as const, label: "📡 Xtream", icon: Server },
  ];

  const inputStyle = { background: "#1C1C24", border: "1px solid #242430", color: "#F5F5F7" };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.7)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-[20px] p-6"
            style={{ background: "#131318", border: "1px solid #1C1C24" }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>Ajouter une playlist</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-[#1C1C24]" style={{ color: "#86868B" }}>
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-5 flex rounded-xl p-1" style={{ background: "#1C1C24" }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors"
                  style={tab === t.id ? { background: "#242430", color: "#F5F5F7" } : { color: "#86868B" }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "url" && (
              <div className="space-y-3">
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="URL M3U ou Xtream (auto-détection)"
                  className="w-full rounded-xl px-4 py-3 text-[13px] outline-none"
                  style={inputStyle}
                />
                {url && detectXtreamUrl(url) && (
                  <p className="text-[11px] flex items-center gap-1" style={{ color: "#FF6D00" }}>
                    <Server size={11} /> Xtream Codes détecté
                  </p>
                )}
                <button
                  onClick={loadFromUrl}
                  disabled={loading || !url}
                  className="w-full rounded-xl py-3 text-[13px] font-semibold text-white bg-gradient-orange transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? (progress || "Chargement...") : "Charger"}
                </button>
              </div>
            )}

            {tab === "file" && (
              <label className="flex flex-col items-center gap-3 rounded-2xl p-8 cursor-pointer transition-colors hover:bg-[#1C1C24]" style={{ border: "2px dashed #242430" }}>
                <Upload size={28} style={{ color: "#48484A" }} />
                <span className="text-[13px]" style={{ color: "#86868B" }}>Cliquez pour sélectionner un fichier .m3u</span>
                <input type="file" accept=".m3u,.m3u8" onChange={loadFromFile} className="hidden" />
              </label>
            )}

            {tab === "xtream" && (
              <div className="space-y-3">
                <input value={xtream.server} onChange={e => setXtream({ ...xtream, server: e.target.value })} placeholder="http://serveur.com:port" className="w-full rounded-xl px-4 py-3 text-[13px] outline-none" style={inputStyle} />
                <input value={xtream.user} onChange={e => setXtream({ ...xtream, user: e.target.value })} placeholder="Nom d'utilisateur" className="w-full rounded-xl px-4 py-3 text-[13px] outline-none" style={inputStyle} />
                <input value={xtream.pass} onChange={e => setXtream({ ...xtream, pass: e.target.value })} placeholder="Mot de passe" type="password" className="w-full rounded-xl px-4 py-3 text-[13px] outline-none" style={inputStyle} />
                <button onClick={loadXtream} disabled={loading || !xtream.server || !xtream.user || !xtream.pass} className="w-full rounded-xl py-3 text-[13px] font-semibold text-white bg-gradient-orange transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? (progress || "Connexion...") : "Connexion"}
                </button>
              </div>
            )}

            {/* Separator + quick buttons */}
            <div className="my-4 h-px" style={{ background: "#1C1C24" }} />
            <div className="flex gap-2">
              <button onClick={() => { onLoadDemo(); onClose(); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-medium transition-colors hover:bg-[#242430]" style={{ background: "#1C1C24", color: "#F5F5F7" }}>
                <Tv size={14} /> Chaînes démo (24)
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-medium transition-colors hover:bg-[#242430]" style={{ background: "#1C1C24", color: "#F5F5F7" }}>
                <Globe size={14} /> Free-TV (500+)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
