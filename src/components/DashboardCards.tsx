import { useState, useMemo } from "react";
import { Tv, Film, Clapperboard, BookOpen, Rewind, Circle, Radio, ChevronDown, Play, ArrowRight } from "lucide-react";
import { Playlist, getRecent } from "@/lib/storage";
import { Channel } from "@/lib/channels";
import { motion } from "framer-motion";

interface DashboardCardsProps {
  playlists: Playlist[];
  allChannels: Channel[];
  allVod: Channel[];
  allSeries: Channel[];
  onTabSelect: (tab: string) => void;
  onPlay: (channel: Channel) => void;
  activePlaylistId: string | null;
  onPlaylistSelect: (id: string | null) => void;
  onShowEpg?: () => void;
  onShowRecordings?: () => void;
}

const STAT_CARDS = [
  {
    id: "live",
    label: "LIVE TV",
    icon: Tv,
    gradient: "linear-gradient(135deg, #FF6D00, #FFD60A)",
    shadow: "0 8px 32px rgba(255,109,0,0.3)",
  },
  {
    id: "films",
    label: "FILMS",
    icon: Film,
    gradient: "linear-gradient(135deg, #FF3B80, #8B5CF6)",
    shadow: "0 8px 32px rgba(255,59,128,0.3)",
  },
  {
    id: "series",
    label: "SÉRIES",
    icon: Clapperboard,
    gradient: "linear-gradient(135deg, #7C3AED, #3B82F6)",
    shadow: "0 8px 32px rgba(124,58,237,0.3)",
  },
];

const QUICK_BUTTONS = [
  { label: "EPG Guide", icon: BookOpen, action: "epg" },
  { label: "Catch Up", icon: Rewind, action: "catchup" },
  { label: "Enregistrements", icon: Circle, action: "recordings" },
  { label: "Radio", icon: Radio, action: "radio" },
];

export function DashboardCards({
  playlists, allChannels, allVod, allSeries,
  onTabSelect, onPlay, activePlaylistId, onPlaylistSelect,
  onShowEpg, onShowRecordings,
}: DashboardCardsProps) {
  const [playlistDropdown, setPlaylistDropdown] = useState(false);

  const activePlaylist = playlists.find(p => p.id === activePlaylistId) || (playlists.length > 0 ? playlists[0] : null);

  const counts = useMemo(() => ({
    live: allChannels.length,
    films: allVod.length,
    series: allSeries.length,
  }), [allChannels.length, allVod.length, allSeries.length]);

  // Recent channels
  const recentIds = getRecent();
  const recentChannels = useMemo(() => {
    const all = [...allChannels, ...allVod, ...allSeries];
    return recentIds.slice(0, 10).map(id => all.find(c => c.id === id)).filter(Boolean) as Channel[];
  }, [recentIds, allChannels, allVod, allSeries]);

  // Subscription info from active playlist
  const accountInfo = activePlaylist?.xtreamAccountInfo;
  let expiresLabel = "—";
  let daysLeft: number | null = null;
  if (accountInfo?.exp_date) {
    const num = Number(accountInfo.exp_date);
    let expDate: Date | null = null;
    if (!Number.isNaN(num) && num > 0) {
      expDate = new Date(num > 1e12 ? num : num * 1000);
    }
    if (expDate && !Number.isNaN(expDate.getTime())) {
      expiresLabel = expDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
      daysLeft = Math.ceil((expDate.getTime() - Date.now()) / 86400000);
    }
  }

  return (
    <div className="space-y-5 px-5 py-4">
      {/* Playlist selector */}
      <div className="relative">
        <button
          onClick={() => setPlaylistDropdown(!playlistDropdown)}
          className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all w-full"
          style={{ background: "rgba(255,109,0,0.08)", border: "1px solid rgba(255,109,0,0.15)", color: "#F5F5F7" }}
        >
          <span className="text-base">📡</span>
          <span className="flex-1 text-left truncate">
            {activePlaylist?.name || "Sélectionner une playlist"}
          </span>
          <span className="text-[11px] font-normal" style={{ color: "#86868B" }}>
            {activePlaylist ? `${(activePlaylist.channels?.length || 0)} chaînes` : ""}
          </span>
          <ChevronDown size={14} style={{ color: "#FF6D00" }} className={`transition-transform ${playlistDropdown ? "rotate-180" : ""}`} />
        </button>
        {playlistDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl overflow-hidden shadow-2xl"
            style={{ background: "#131318", border: "1px solid #1C1C24" }}
          >
            <button
              onClick={() => { onPlaylistSelect(null); setPlaylistDropdown(false); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] hover:bg-[#1C1C24] transition-colors"
              style={{ color: !activePlaylistId ? "#FF6D00" : "#86868B" }}
            >
              Toutes les playlists
            </button>
            {playlists.map(p => (
              <button
                key={p.id}
                onClick={() => { onPlaylistSelect(p.id); setPlaylistDropdown(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] hover:bg-[#1C1C24] transition-colors"
                style={{ color: activePlaylistId === p.id ? "#FF6D00" : "#F5F5F7" }}
              >
                <span className="truncate flex-1 text-left">{p.name}</span>
                <span className="text-[10px]" style={{ color: "#48484A" }}>
                  {p.channels.length + (p.vodStreams?.length || 0)}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* 3 Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {STAT_CARDS.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onTabSelect(card.id)}
            className="group relative rounded-2xl p-4 text-left overflow-hidden transition-all hover:scale-[1.03]"
            style={{ background: card.gradient, boxShadow: card.shadow }}
            whileHover={{ scale: 1.03 }}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)" }} />
            <card.icon size={24} className="text-white/90 mb-2" />
            <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-black text-white mt-0.5 tabular-nums">{counts[card.id as keyof typeof counts].toLocaleString()}</p>
            <ArrowRight size={16} className="absolute bottom-4 right-4 text-white/50 group-hover:text-white/80 transition-colors" />
          </motion.button>
        ))}
      </div>

      {/* Continue Watching */}
      {recentChannels.length > 0 && (
        <div>
          <p className="text-[13px] font-semibold mb-3 flex items-center gap-2" style={{ color: "#F5F5F7" }}>
            <span>🔥</span> Continuer à regarder
          </p>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            {recentChannels.map(ch => (
              <button
                key={ch.id}
                onClick={() => onPlay(ch)}
                className="group shrink-0 rounded-xl overflow-hidden transition-all hover:scale-105"
                style={{ width: 120, background: "#131318", border: "1px solid #1C1C24" }}
              >
                <div className="relative h-[72px] flex items-center justify-center" style={{ background: "#1C1C24" }}>
                  {ch.logo ? (
                    <img src={ch.logo} className="h-10 w-10 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <span className="text-[14px] font-bold" style={{ color: "#48484A" }}>
                      {ch.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.5)" }}>
                    <Play size={20} className="text-white" fill="white" />
                  </div>
                </div>
                <p className="px-2 py-1.5 text-[10px] font-medium truncate" style={{ color: "#B0B0B5" }}>{ch.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick buttons */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_BUTTONS.map(btn => (
          <button
            key={btn.label}
            onClick={() => {
              if (btn.action === "radio") onTabSelect("radio");
              else if (btn.action === "epg") onShowEpg?.();
              else if (btn.action === "recordings") onShowRecordings?.();
            }}
            className="flex flex-col items-center gap-2 rounded-xl py-3 px-2 transition-all hover:bg-[#1C1C24]"
            style={{ background: "#131318", border: "1px solid #1C1C24" }}
          >
            <btn.icon size={18} style={{ color: "#C9A84C" }} />
            <span className="text-[10px] font-medium" style={{ color: "#86868B" }}>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Subscription bar */}
      {accountInfo && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
          <span className="text-[11px] font-medium" style={{ color: "#86868B" }}>
            Expire: <span style={{ color: daysLeft !== null && daysLeft < 7 ? "#FF9F0A" : "#F5F5F7" }}>{expiresLabel}</span>
            {daysLeft !== null && (
              <span style={{ color: daysLeft < 7 ? "#FF9F0A" : "#34C759" }}> ({daysLeft}j)</span>
            )}
          </span>
          {daysLeft !== null && (
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1C1C24" }}>
              <div className="h-full rounded-full" style={{
                width: `${Math.max(0, Math.min(100, (daysLeft / 365) * 100))}%`,
                background: daysLeft < 7 ? "#FF9F0A" : daysLeft < 30 ? "#FFD60A" : "#34C759",
              }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
