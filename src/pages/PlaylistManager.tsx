import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Wifi, RefreshCw, Layers, Radio, Tv, Film, Clapperboard, Clock, Globe, QrCode, Link, Upload, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPlaylists, savePlaylists, Playlist } from "@/lib/storage";
import { PlaylistModal } from "@/components/PlaylistModal";
import { XtreamPlaylistData } from "@/lib/xtream";
import { Channel } from "@/lib/channels";
import { QRCodePortal } from "@/components/QRCodePortal";
import { TvFocusable } from "@/components/TvFocusable";
import { useTvNavigation } from "@/hooks/useTvNavigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function PlaylistManager() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"add" | "manage">("manage");

  // Reload playlists on mount (fixes TV/box localStorage read issue)
  useEffect(() => {
    const pls = getPlaylists();
    console.log("PLAYLISTS LOADED:", pls);
    setPlaylists(pls);
  }, []);

  const handleDelete = (id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    savePlaylists(updated);
    setPlaylists(updated);
    if (updated.length === 0) localStorage.removeItem("chouf_has_setup");
    toast.success("Playlist supprimée");
  };

  const handleRefresh = (pl: Playlist) => {
    setRefreshingId(pl.id);
    setTimeout(() => { setRefreshingId(null); toast.success(`${pl.name} actualisée`); }, 1500);
  };

  const handlePlaylistLoaded = (name: string, channels: Channel[], xtreamData?: XtreamPlaylistData) => {
    const newPlaylist: Playlist = {
      id: xtreamData ? `xt_${Date.now()}` : `pl_${Date.now()}`,
      name, channels, addedAt: Date.now(),
      isXtream: !!xtreamData,
      xtreamCredentials: xtreamData?.credentials,
      xtreamAccountInfo: xtreamData?.accountInfo,
      xtreamMac: xtreamData?.mac,
      vodStreams: xtreamData?.vodStreams || [],
      series: xtreamData?.series || [],
    };
    const updated = [...playlists, newPlaylist];
    savePlaylists(updated);
    setPlaylists(updated);
    localStorage.setItem("chouf_has_setup", "true");
    setActiveTab("manage");
  };

  const totalChannels = playlists.reduce((s, p) => s + p.channels.length, 0);
  const totalVod = playlists.reduce((s, p) => s + (p.vodStreams?.length || 0), 0);
  const totalSeries = playlists.reduce((s, p) => s + (p.series?.length || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "#12121A" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 sm:px-6"
        style={{ background: "rgba(18,18,26,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid #252530" }}>
        <button onClick={() => navigate("/", { replace: true })} className="rounded-xl p-2 transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #1C1C24, #242430)", border: "1px solid #2A2A36" }}>
          <ArrowLeft size={18} style={{ color: "#FF6D00" }} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>Mes Playlists</h1>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-5">
        {/* Stats cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Layers, label: "Total playlists", count: playlists.length, color: "#FF6D00", bg: "rgba(255,109,0,0.08)" },
            { icon: Tv, label: "Total chaînes", count: totalChannels, color: "#FF6D00", bg: "rgba(255,109,0,0.08)" },
            { icon: Film, label: "Total films", count: totalVod, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
            { icon: Clapperboard, label: "Total séries", count: totalSeries, color: "#34C759", bg: "rgba(52,199,89,0.08)" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(26,26,36,0.85)", backdropFilter: "blur(10px)", border: "1px solid #252530" }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ background: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <p className="text-[22px] font-bold" style={{ color: "#F5F5F7" }}>{s.count.toLocaleString()}</p>
              <p className="text-[11px]" style={{ color: "#48484A" }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Liaison TV / Remote add */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5" style={{ background: "rgba(26,26,36,0.85)", backdropFilter: "blur(10px)", border: "1px solid #252530" }}>
          <div className="flex items-center gap-3 mb-4">
            <Smartphone size={18} style={{ color: "#48484A" }} />
            <div>
              <p className="text-[14px] font-semibold" style={{ color: "#F5F5F7" }}>Liaison TV</p>
              <p className="text-[11px]" style={{ color: "#48484A" }}>Scannez le code ou entrez-le sur votre TV pour lier les appareils</p>
            </div>
          </div>
          <button onClick={() => setShowQr(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #FF6D00, #FF8C38)", color: "#fff" }}>
            <QrCode size={18} />
            Générer un code
          </button>
        </motion.div>

        {/* Add + Manage tabs */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: "#1A1A24" }}>
          {[
            { id: "add" as const, icon: Plus, label: "Ajouter une playlist" },
            { id: "manage" as const, icon: Layers, label: "Gérer les playlists" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium transition-all"
              style={activeTab === tab.id
                ? { background: "rgba(255,109,0,0.1)", color: "#FF6D00" }
                : { color: "#48484A" }}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "add" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {[
              { icon: Link, label: "URL M3U", sub: "Coller l'URL de votre playlist", action: () => setModalOpen(true) },
              { icon: Upload, label: "Fichier", sub: "Charger un fichier .m3u depuis votre appareil", action: () => setModalOpen(true) },
              { icon: Radio, label: "Xtream Codes", sub: "Serveur, utilisateur, mot de passe", action: () => setModalOpen(true) },
              { icon: Wifi, label: "Liaison TV", sub: "Scannez le code ou entrez-le sur votre TV", action: () => setShowQr(true) },
            ].map((item, i) => (
              <button key={i} onClick={item.action}
                className="flex w-full items-center gap-4 rounded-2xl p-4 transition-all hover:bg-[#1A1A22]"
                style={{ background: "#1A1A24", border: "1px solid #252530" }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(255,109,0,0.08)" }}>
                  <item.icon size={18} style={{ color: "#FF6D00" }} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[13px] font-semibold" style={{ color: "#F5F5F7" }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: "#48484A" }}>{item.sub}</p>
                </div>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnimatePresence>
              {playlists.map((pl, i) => {
                const addedDate = new Date(pl.addedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
                return (
                  <motion.div key={pl.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl p-4 mb-3 transition-all"
                    style={{ background: "rgba(26,26,36,0.85)", backdropFilter: "blur(10px)", border: "1px solid #252530" }}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                        style={{ background: pl.isXtream ? "rgba(124,58,237,0.12)" : "rgba(201,168,76,0.12)" }}>
                        {pl.isXtream ? <Radio size={20} style={{ color: "#7C3AED" }} /> : <Layers size={20} style={{ color: "#C9A84C" }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[14px] font-semibold truncate" style={{ color: "#F5F5F7" }}>{pl.name}</p>
                          {pl.isXtream && <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>Xtream</span>}
                        </div>
                        <div className="flex items-center gap-4 mb-1">
                          <div className="flex items-center gap-1"><Tv size={11} style={{ color: "#48484A" }} /><span className="text-[10px]" style={{ color: "#48484A" }}>{pl.channels.length}</span></div>
                          {(pl.vodStreams?.length || 0) > 0 && <div className="flex items-center gap-1"><Film size={11} style={{ color: "#48484A" }} /><span className="text-[10px]" style={{ color: "#48484A" }}>{pl.vodStreams!.length}</span></div>}
                          {(pl.series?.length || 0) > 0 && <div className="flex items-center gap-1"><Clapperboard size={11} style={{ color: "#48484A" }} /><span className="text-[10px]" style={{ color: "#48484A" }}>{pl.series!.length}</span></div>}
                          <div className="flex items-center gap-1"><Clock size={11} style={{ color: "#48484A" }} /><span className="text-[10px]" style={{ color: "#48484A" }}>{addedDate}</span></div>
                        </div>
                        {pl.xtreamCredentials && (
                          <div className="flex items-center gap-1">
                            <Globe size={10} style={{ color: "#48484A" }} />
                            <span className="text-[9px] font-mono" style={{ color: "#48484A" }}>{pl.xtreamCredentials.server?.replace(/https?:\/\//, "").split("/")[0] || "—"}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleRefresh(pl)} className="rounded-lg p-2 transition-all hover:bg-white/5 active:scale-90" title="Rafraîchir">
                          <RefreshCw size={14} className={refreshingId === pl.id ? "animate-spin" : ""} style={{ color: "#48484A" }} />
                        </button>
                        <button onClick={() => handleDelete(pl.id)} className="rounded-lg p-2 transition-all hover:bg-red-500/10 active:scale-90" title="Supprimer">
                          <Trash2 size={14} style={{ color: "#FF3B30" }} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {playlists.length === 0 && (
              <div className="text-center py-16 rounded-2xl" style={{ background: "#1A1A24", border: "1px solid #252530" }}>
                <Layers size={48} className="mx-auto mb-4" style={{ color: "#1C1C24" }} />
                <p className="text-[14px] font-medium mb-1" style={{ color: "#48484A" }}>Aucune playlist chargée</p>
                <p className="text-[12px]" style={{ color: "#2C2C34" }}>Ajoutez une playlist pour commencer</p>
              </div>
            )}
            {/* Floating add button */}
            <button onClick={() => { setModalOpen(true); setActiveTab("add"); }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 mt-4 text-[14px] font-bold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #FF6D00, #FF8C38)", color: "#fff", boxShadow: "0 4px 20px rgba(255,109,0,0.3)" }}>
              <Plus size={18} />
              Ajouter une playlist
            </button>
          </motion.div>
        )}
      </div>

      <PlaylistModal open={modalOpen} onClose={() => setModalOpen(false)} onPlaylistLoaded={handlePlaylistLoaded} onLoadDemo={() => {}} />
      {showQr && <QRCodePortal open={showQr} onClose={() => setShowQr(false)} />}
    </div>
  );
}
