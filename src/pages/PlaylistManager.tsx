import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Wifi, RefreshCw, Layers, Radio, Globe, Clock, Tv, Film, Clapperboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPlaylists, savePlaylists, Playlist } from "@/lib/storage";
import { PlaylistModal } from "@/components/PlaylistModal";
import { XtreamPlaylistData } from "@/lib/xtream";
import { Channel } from "@/lib/channels";
import { QRCodePortal } from "@/components/QRCodePortal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function PlaylistManager() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>(getPlaylists());
  const [modalOpen, setModalOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    savePlaylists(updated);
    setPlaylists(updated);
    if (updated.length === 0) localStorage.removeItem("chouf_has_setup");
    toast.success("Playlist supprimée");
  };

  const handleRefresh = async (pl: Playlist) => {
    setRefreshingId(pl.id);
    setTimeout(() => {
      setRefreshingId(null);
      toast.success(`${pl.name} actualisée`);
    }, 1500);
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
  };

  const totalChannels = playlists.reduce((s, p) => s + p.channels.length, 0);
  const totalVod = playlists.reduce((s, p) => s + (p.vodStreams?.length || 0), 0);
  const totalSeries = playlists.reduce((s, p) => s + (p.series?.length || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 sm:px-6"
        style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid #1C1C24" }}>
        <button onClick={() => navigate("/", { replace: true })} className="rounded-xl p-2 transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #1C1C24, #242430)", border: "1px solid #2A2A36" }}>
          <ArrowLeft size={18} style={{ color: "#FF6D00" }} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>Mes Playlists</h1>
          <p className="text-[10px]" style={{ color: "#48484A" }}>
            {playlists.length} playlist{playlists.length !== 1 ? "s" : ""} • {totalChannels} chaînes
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl p-4 sm:p-6 space-y-5">
        {/* Stats bar */}
        {playlists.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3">
            {[
              { icon: Tv, label: "Chaînes", count: totalChannels, color: "#FF6D00" },
              { icon: Film, label: "Films", count: totalVod, color: "#C9A84C" },
              { icon: Clapperboard, label: "Séries", count: totalSeries, color: "#7C3AED" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: `rgba(${s.color === "#FF6D00" ? "255,109,0" : s.color === "#C9A84C" ? "201,168,76" : "124,58,237"},0.06)`, border: `1px solid rgba(${s.color === "#FF6D00" ? "255,109,0" : s.color === "#C9A84C" ? "201,168,76" : "124,58,237"},0.12)` }}>
                <s.icon size={18} style={{ color: s.color }} />
                <div>
                  <p className="text-[16px] font-bold" style={{ color: "#F5F5F7" }}>{s.count.toLocaleString()}</p>
                  <p className="text-[10px]" style={{ color: "#48484A" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "rgba(255,109,0,0.08)", border: "1px dashed rgba(255,109,0,0.3)" }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(255,109,0,0.15)" }}>
              <Plus size={20} style={{ color: "#FF6D00" }} />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold" style={{ color: "#F5F5F7" }}>Ajouter</p>
              <p className="text-[10px]" style={{ color: "#48484A" }}>M3U, Xtream, URL</p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            onClick={() => setShowQr(true)}
            className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "rgba(52,199,89,0.06)", border: "1px dashed rgba(52,199,89,0.25)" }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(52,199,89,0.12)" }}>
              <Wifi size={20} style={{ color: "#34C759" }} />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold" style={{ color: "#F5F5F7" }}>À distance</p>
              <p className="text-[10px]" style={{ color: "#48484A" }}>QR Code / Portail</p>
            </div>
          </motion.button>
        </div>

        {/* Playlist list */}
        <AnimatePresence>
          {playlists.map((pl, i) => {
            const addedDate = new Date(pl.addedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
            return (
              <motion.div
                key={pl.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-4 transition-all"
                style={{ background: "#131318", border: "1px solid #1C1C24" }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
                    style={{ background: pl.isXtream ? "rgba(124,58,237,0.12)" : "rgba(201,168,76,0.12)" }}>
                    {pl.isXtream ? <Radio size={20} style={{ color: "#7C3AED" }} /> : <Layers size={20} style={{ color: "#C9A84C" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[14px] font-semibold truncate" style={{ color: "#F5F5F7" }}>{pl.name}</p>
                      {pl.isXtream && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>Xtream</span>
                      )}
                    </div>
                    {/* Stats row */}
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        <Tv size={11} style={{ color: "#48484A" }} />
                        <span className="text-[10px]" style={{ color: "#48484A" }}>{pl.channels.length}</span>
                      </div>
                      {(pl.vodStreams?.length || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Film size={11} style={{ color: "#48484A" }} />
                          <span className="text-[10px]" style={{ color: "#48484A" }}>{pl.vodStreams!.length}</span>
                        </div>
                      )}
                      {(pl.series?.length || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Clapperboard size={11} style={{ color: "#48484A" }} />
                          <span className="text-[10px]" style={{ color: "#48484A" }}>{pl.series!.length}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock size={11} style={{ color: "#48484A" }} />
                        <span className="text-[10px]" style={{ color: "#48484A" }}>{addedDate}</span>
                      </div>
                    </div>
                    {/* Xtream info */}
                    {pl.xtreamAccountInfo && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Globe size={10} style={{ color: "#48484A" }} />
                          <span className="text-[9px] font-mono" style={{ color: "#48484A" }}>
                            {pl.xtreamCredentials?.server?.replace(/https?:\/\//, "").split("/")[0] || "—"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleRefresh(pl)}
                      className="rounded-lg p-2 transition-all hover:bg-white/5 active:scale-90" title="Rafraîchir">
                      <RefreshCw size={14} className={refreshingId === pl.id ? "animate-spin" : ""} style={{ color: "#48484A" }} />
                    </button>
                    <button onClick={() => handleDelete(pl.id)}
                      className="rounded-lg p-2 transition-all hover:bg-red-500/10 active:scale-90" title="Supprimer">
                      <Trash2 size={14} style={{ color: "#FF3B30" }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {playlists.length === 0 && (
          <div className="text-center py-20">
            <Layers size={48} className="mx-auto mb-4" style={{ color: "#1C1C24" }} />
            <p className="text-[15px] font-medium mb-1" style={{ color: "#48484A" }}>Aucune playlist</p>
            <p className="text-[12px]" style={{ color: "#2C2C34" }}>Ajoutez une playlist pour commencer à regarder</p>
          </div>
        )}
      </div>

      <PlaylistModal open={modalOpen} onClose={() => setModalOpen(false)} onPlaylistLoaded={handlePlaylistLoaded} onLoadDemo={() => {}} />
      {showQr && <QRCodePortal open={showQr} onClose={() => setShowQr(false)} />}
    </div>
  );
}
