import { useState } from "react";
import { X, Link, Upload, Server, Loader2, Tv, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Channel } from "@/lib/channels";
import { toast } from "sonner";
import { detectXtreamUrl, fetchTextWithProxy, loadXtreamPlaylist, XtreamPlaylistData } from "@/lib/xtream";

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
  let currentCategory = "Autres";
  let currentLogo = "";

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("#EXTINF")) {
      const nameMatch = line.match(/,(.+)$/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);

      currentName = nameMatch ? nameMatch[1].trim() : "Sans nom";
      currentCategory = groupMatch ? groupMatch[1] : "Autres";
      currentLogo = logoMatch ? logoMatch[1] : "";
      continue;
    }

    if (line && !line.startsWith("#")) {
      channels.push({
        id: `pl_${Date.now()}_${channels.length}`,
        name: currentName || `Chaîne ${channels.length + 1}`,
        category: currentCategory,
        url: line,
        logo: currentLogo || undefined,
        type: "live",
      });

      currentName = "";
      currentCategory = "Autres";
      currentLogo = "";
    }
  }

  return channels;
}

export function PlaylistModal({ open, onClose, onPlaylistLoaded, onLoadDemo }: PlaylistModalProps) {
  const [tab, setTab] = useState<"url" | "file" | "xtream">("url");
  const [playlistName, setPlaylistName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [xtream, setXtream] = useState({ server: "", user: "", pass: "" });

  const inputStyle = { background: "#1C1C24", border: "1px solid #242430", color: "#F5F5F7" };

  const requirePlaylistName = () => {
    if (playlistName.trim()) return true;
    toast.error("Ajoutez un nom de liste");
    return false;
  };

  const closeAndReset = () => {
    setLoading(false);
    setProgress("");
    onClose();
  };

  const loadFromUrl = async () => {
    if (!url.trim() || !requirePlaylistName()) return;

    setLoading(true);
    setProgress("");

    const detectedXtream = detectXtreamUrl(url.trim());

    try {
      if (detectedXtream) {
        setProgress("Xtream détecté...");
        const playlistId = `xt_${Date.now()}`;
        const data = await loadXtreamPlaylist(detectedXtream, playlistId, setProgress);
        const total = data.liveChannels.length + data.vodStreams.length + data.series.length;

        if (total === 0) {
          toast.error("Aucune chaîne trouvée sur ce serveur");
          return;
        }

        onPlaylistLoaded(playlistName.trim(), data.liveChannels, data);
        toast.success(`${total} éléments chargés`);
        closeAndReset();
        return;
      }

      setProgress("Téléchargement playlist...");
      const content = await fetchTextWithProxy(
        url.trim(),
        "application/x-mpegURL, application/vnd.apple.mpegurl, text/plain, */*",
      );

      if (!content.includes("#EXTINF") && !content.includes("#EXTM3U")) {
        toast.error("Le lien ne retourne pas une playlist M3U valide");
        return;
      }

      const channels = parseM3U(content);
      if (channels.length === 0) {
        toast.error("Aucune chaîne trouvée dans cette playlist");
        return;
      }

      onPlaylistLoaded(playlistName.trim(), channels);
      toast.success(`${channels.length} chaînes chargées`);
      closeAndReset();
    } catch (error) {
      console.error("Playlist URL error:", error);
      toast.error("Impossible de charger la playlist");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const loadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!requirePlaylistName()) return;

    const reader = new FileReader();
    reader.onload = () => {
      const channels = parseM3U(reader.result as string);
      if (channels.length > 0) {
        onPlaylistLoaded(playlistName.trim(), channels);
        toast.success(`${channels.length} chaînes chargées`);
        closeAndReset();
      } else {
        toast.error("Aucune chaîne trouvée");
      }
    };
    reader.readAsText(file);
  };

  const loadXtream = async () => {
    if (!xtream.server.trim() || !xtream.user.trim() || !xtream.pass.trim() || !requirePlaylistName()) return;

    setLoading(true);
    setProgress("Connexion au serveur...");

    const credentials = {
      server: xtream.server.replace(/\/$/, ""),
      username: xtream.user.trim(),
      password: xtream.pass.trim(),
    };

    try {
      const playlistId = `xt_${Date.now()}`;
      const data = await loadXtreamPlaylist(credentials, playlistId, setProgress);
      const total = data.liveChannels.length + data.vodStreams.length + data.series.length;

      if (total === 0) {
        toast.error("Aucune chaîne trouvée sur ce serveur");
        return;
      }

      onPlaylistLoaded(playlistName.trim(), data.liveChannels, data);
      toast.success(`${total} éléments chargés`);
      closeAndReset();
    } catch (error) {
      console.error("Xtream connection error:", error);
      toast.error("Connexion Xtream échouée");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const tabs = [
    { id: "url" as const, label: "🔗 URL", icon: Link },
    { id: "file" as const, label: "📂 Fichier", icon: Upload },
    { id: "xtream" as const, label: "📡 Xtream", icon: Server },
  ];

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
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] rounded-[20px] p-6"
            style={{ background: "#131318", border: "1px solid #1C1C24" }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>Ajouter une playlist</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-[#1C1C24]" style={{ color: "#86868B" }}>
                <X size={18} />
              </button>
            </div>

            <div className="mb-5 flex rounded-xl p-1" style={{ background: "#1C1C24" }}>
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors"
                  style={tab === item.id ? { background: "#242430", color: "#F5F5F7" } : { color: "#86868B" }}
                >
                  <item.icon size={13} />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mb-4 space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "#86868B" }}>
                <Type size={12} /> Nom de la liste
              </label>
              <input
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Ex: Bouquet Salon, Abonnement Papa..."
                className="w-full rounded-xl px-4 py-3 text-[13px] outline-none"
                style={inputStyle}
              />
            </div>

            {tab === "url" && (
              <div className="space-y-3">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="URL M3U ou Xtream (auto-détection)"
                  className="w-full rounded-xl px-4 py-3 text-[13px] outline-none"
                  style={inputStyle}
                />
                {url && detectXtreamUrl(url) && (
                  <p className="flex items-center gap-1 text-[11px]" style={{ color: "#FF6D00" }}>
                    <Server size={11} /> Xtream détecté automatiquement
                  </p>
                )}
                <button
                  onClick={loadFromUrl}
                  disabled={loading || !url.trim() || !playlistName.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-semibold text-white bg-gradient-orange transition-opacity disabled:opacity-50"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? (progress || "Chargement...") : "Charger"}
                </button>
              </div>
            )}

            {tab === "file" && (
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl p-8 transition-colors hover:bg-[#1C1C24]" style={{ border: "2px dashed #242430" }}>
                <Upload size={28} style={{ color: "#48484A" }} />
                <span className="text-[13px]" style={{ color: "#86868B" }}>Cliquez pour sélectionner un fichier .m3u</span>
                <input type="file" accept=".m3u,.m3u8" onChange={loadFromFile} className="hidden" />
              </label>
            )}

            {tab === "xtream" && (
              <div className="space-y-3">
                <input
                  value={xtream.server}
                  onChange={(e) => setXtream({ ...xtream, server: e.target.value })}
                  placeholder="http://serveur.com:port"
                  className="w-full rounded-xl px-4 py-3 text-[13px] outline-none"
                  style={inputStyle}
                />
                <input
                  value={xtream.user}
                  onChange={(e) => setXtream({ ...xtream, user: e.target.value })}
                  placeholder="Nom d'utilisateur"
                  className="w-full rounded-xl px-4 py-3 text-[13px] outline-none"
                  style={inputStyle}
                />
                <input
                  value={xtream.pass}
                  onChange={(e) => setXtream({ ...xtream, pass: e.target.value })}
                  placeholder="Mot de passe"
                  type="password"
                  className="w-full rounded-xl px-4 py-3 text-[13px] outline-none"
                  style={inputStyle}
                />
                <button
                  onClick={loadXtream}
                  disabled={loading || !xtream.server.trim() || !xtream.user.trim() || !xtream.pass.trim() || !playlistName.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-semibold text-white bg-gradient-orange transition-opacity disabled:opacity-50"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? (progress || "Connexion...") : "Connexion"}
                </button>
              </div>
            )}

            <div className="my-4 h-px" style={{ background: "#1C1C24" }} />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onLoadDemo();
                  onClose();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-medium transition-colors hover:bg-[#242430]"
                style={{ background: "#1C1C24", color: "#F5F5F7" }}
              >
                <Tv size={14} /> Chaînes démo (24)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
