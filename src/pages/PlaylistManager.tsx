import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Wifi, RefreshCw, Layers, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPlaylists, savePlaylists, Playlist } from "@/lib/storage";
import { PlaylistModal } from "@/components/PlaylistModal";
import { XtreamPlaylistData } from "@/lib/xtream";
import { Channel } from "@/lib/channels";
import { QRCodePortal } from "@/components/QRCodePortal";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PlaylistManager() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>(getPlaylists());
  const [modalOpen, setModalOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleDelete = (id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    savePlaylists(updated);
    setPlaylists(updated);
    if (updated.length === 0) localStorage.removeItem("chouf_has_setup");
    toast.success("Playlist supprimée");
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

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 sm:px-6"
        style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1C1C24" }}>
        <button onClick={() => navigate("/")} className="rounded-xl p-2 transition-colors hover:bg-white/5"
          style={{ background: "#131318", color: "#C9A84C" }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>Mes Playlists</h1>
          <p className="text-[10px]" style={{ color: "#48484A" }}>{playlists.length} playlist{playlists.length !== 1 ? "s" : ""} configurée{playlists.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowQr(true)} className="rounded-xl p-2 transition-colors hover:bg-white/5"
          style={{ background: "#131318" }} title="Ajout à distance">
          <Wifi size={16} style={{ color: "#C9A84C" }} />
        </button>
      </header>

      <div className="mx-auto max-w-3xl p-4 sm:p-6 space-y-4">
        {/* Add button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => setModalOpen(true)}
          className="w-full flex items-center gap-4 rounded-2xl p-5 transition-all hover:scale-[1.01]"
          style={{ background: "rgba(255,109,0,0.06)", border: "1px dashed rgba(255,109,0,0.3)" }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "rgba(255,109,0,0.12)" }}>
            <Plus size={22} style={{ color: "#FF6D00" }} />
          </div>
          <div className="text-left">
            <p className="text-[14px] font-bold" style={{ color: "#F5F5F7" }}>Ajouter une playlist</p>
            <p className="text-[11px]" style={{ color: "#48484A" }}>M3U, Xtream Codes, URL...</p>
          </div>
        </motion.button>

        {/* Playlist list */}
        {playlists.map((pl, i) => (
          <motion.div
            key={pl.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-4 rounded-2xl p-4 transition-all"
            style={{ background: "#131318", border: "1px solid #1C1C24" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0"
              style={{ background: pl.isXtream ? "rgba(124,58,237,0.12)" : "rgba(201,168,76,0.12)" }}>
              {pl.isXtream ? <Radio size={20} style={{ color: "#7C3AED" }} /> : <Layers size={20} style={{ color: "#C9A84C" }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold truncate" style={{ color: "#F5F5F7" }}>{pl.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px]" style={{ color: "#48484A" }}>
                  {pl.channels.length} chaînes
                </span>
                {(pl.vodStreams?.length || 0) > 0 && (
                  <span className="text-[10px]" style={{ color: "#48484A" }}>
                    {pl.vodStreams!.length} films
                  </span>
                )}
                {(pl.series?.length || 0) > 0 && (
                  <span className="text-[10px]" style={{ color: "#48484A" }}>
                    {pl.series!.length} séries
                  </span>
                )}
                {pl.isXtream && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>Xtream</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 transition-colors hover:bg-white/5" title="Rafraîchir">
                <RefreshCw size={14} style={{ color: "#48484A" }} />
              </button>
              <button onClick={() => handleDelete(pl.id)} className="rounded-lg p-2 transition-colors hover:bg-red-500/10" title="Supprimer">
                <Trash2 size={14} style={{ color: "#FF3B30" }} />
              </button>
            </div>
          </motion.div>
        ))}

        {playlists.length === 0 && (
          <div className="text-center py-16">
            <Layers size={40} className="mx-auto mb-4" style={{ color: "#1C1C24" }} />
            <p className="text-[14px] font-medium" style={{ color: "#48484A" }}>Aucune playlist</p>
            <p className="text-[11px] mt-1" style={{ color: "#2C2C34" }}>Ajoutez une playlist pour commencer</p>
          </div>
        )}
      </div>

      <PlaylistModal open={modalOpen} onClose={() => setModalOpen(false)} onPlaylistLoaded={handlePlaylistLoaded} />
      {showQr && <QRCodePortal onClose={() => setShowQr(false)} />}
    </div>
  );
}
