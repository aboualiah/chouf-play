import { useState } from "react";
import { X, Link, Upload, Server, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Channel } from "@/lib/channels";
import { toast } from "sonner";
import { detectXtreamUrl, loadXtreamPlaylist, XtreamPlaylistData } from "@/lib/xtream";

interface PlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onPlaylistLoaded: (name: string, channels: Channel[], xtreamData?: XtreamPlaylistData) => void;
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
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

export function PlaylistModal({ open, onClose, onPlaylistLoaded }: PlaylistModalProps) {
  const [tab, setTab] = useState<"url" | "file" | "xtream">("url");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [xtream, setXtream] = useState({ server: "", user: "", pass: "" });

  const loadFromUrl = async () => {
    if (!url) return;
    setLoading(true);
    setProgress("");

    // Auto-detect Xtream URL
    const creds = detectXtreamUrl(url);
    if (creds) {
      setProgress("Xtream détecté, connexion...");
      try {
        const playlistId = `xt_${Date.now()}`;
        const data = await loadXtreamPlaylist(creds, playlistId, setProgress);
        const totalCount = data.liveChannels.length + data.vodStreams.length + data.series.length;
        toast.success(`${totalCount} éléments chargés (${data.liveChannels.length} TV, ${data.vodStreams.length} films, ${data.series.length} séries)`);
        onPlaylistLoaded(creds.server.replace(/https?:\/\//, ""), data.liveChannels, data);
        onClose();
        return;
      } catch {
        toast.error("Erreur de connexion Xtream");
      } finally {
        setLoading(false);
        setProgress("");
      }
      return;
    }

    // Regular M3U
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
      } else {
        toast.error("Aucune chaîne trouvée");
      }
    };
    reader.readAsText(file);
  };

  const loadXtream = async () => {
    if (!xtream.server || !xtream.user || !xtream.pass) return;
    setLoading(true);
    const server = xtream.server.replace(/\/$/, "");
    const creds = { server, username: xtream.user, password: xtream.pass };

    try {
      const playlistId = `xt_${Date.now()}`;
      const data = await loadXtreamPlaylist(creds, playlistId, setProgress);
      const totalCount = data.liveChannels.length + data.vodStreams.length + data.series.length;
      toast.success(`${totalCount} éléments chargés`);
      onPlaylistLoaded(server.replace(/https?:\/\//, ""), data.liveChannels, data);
      onClose();
    } catch {
      toast.error("Connexion échouée");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const TABS = [
    { id: "url" as const, label: "URL M3U", icon: Link },
    { id: "file" as const, label: "Fichier", icon: Upload },
    { id: "xtream" as const, label: "Xtream", icon: Server },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Ajouter une playlist</h2>
              <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-5 flex rounded-lg bg-secondary p-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* URL tab */}
            {tab === "url" && (
              <div className="space-y-3">
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="URL M3U ou Xtream (auto-détection)"
                  className="w-full rounded-lg bg-secondary px-4 py-3 text-sm text-foreground outline-none ring-1 ring-transparent focus:ring-primary placeholder:text-muted-foreground"
                />
                {url && detectXtreamUrl(url) && (
                  <p className="text-[11px] text-primary flex items-center gap-1">
                    <Server size={12} /> Xtream Codes détecté automatiquement
                  </p>
                )}
                <button
                  onClick={loadFromUrl}
                  disabled={loading || !url}
                  className="w-full rounded-lg bg-gradient-orange py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? (progress || "Chargement...") : "Charger"}
                </button>
              </div>
            )}

            {/* File tab */}
            {tab === "file" && (
              <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 cursor-pointer hover:border-primary/30 transition-colors">
                <Upload size={32} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cliquez pour sélectionner un fichier .m3u</span>
                <input type="file" accept=".m3u,.m3u8" onChange={loadFromFile} className="hidden" />
              </label>
            )}

            {/* Xtream tab */}
            {tab === "xtream" && (
              <div className="space-y-3">
                <input
                  value={xtream.server}
                  onChange={e => setXtream({ ...xtream, server: e.target.value })}
                  placeholder="http://serveur.com:port"
                  className="w-full rounded-lg bg-secondary px-4 py-3 text-sm text-foreground outline-none ring-1 ring-transparent focus:ring-primary placeholder:text-muted-foreground"
                />
                <input
                  value={xtream.user}
                  onChange={e => setXtream({ ...xtream, user: e.target.value })}
                  placeholder="Nom d'utilisateur"
                  className="w-full rounded-lg bg-secondary px-4 py-3 text-sm text-foreground outline-none ring-1 ring-transparent focus:ring-primary placeholder:text-muted-foreground"
                />
                <input
                  value={xtream.pass}
                  onChange={e => setXtream({ ...xtream, pass: e.target.value })}
                  placeholder="Mot de passe"
                  type="password"
                  className="w-full rounded-lg bg-secondary px-4 py-3 text-sm text-foreground outline-none ring-1 ring-transparent focus:ring-primary placeholder:text-muted-foreground"
                />
                <button
                  onClick={loadXtream}
                  disabled={loading || !xtream.server || !xtream.user || !xtream.pass}
                  className="w-full rounded-lg bg-gradient-orange py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? (progress || "Connexion...") : "Connexion"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
