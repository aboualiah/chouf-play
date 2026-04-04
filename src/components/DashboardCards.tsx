import { useMemo } from "react";
import { Tv, Film, Clapperboard, BookOpen, Rewind, Circle, Radio, Play, ArrowRight, Crown } from "lucide-react";
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
    gradient: "linear-gradient(135deg, rgba(255,109,0,0.20), rgba(255,214,10,0.12))",
    border: "rgba(255,109,0,0.25)",
    iconColor: "#FF6D00",
    accentGlow: "0 0 40px rgba(255,109,0,0.10)",
    shimmer: "linear-gradient(135deg, rgba(255,109,0,0.08) 0%, transparent 60%)",
  },
  {
    id: "films",
    label: "FILMS",
    icon: Film,
    gradient: "linear-gradient(135deg, rgba(201,168,76,0.20), rgba(255,159,10,0.12))",
    border: "rgba(201,168,76,0.25)",
    iconColor: "#C9A84C",
    accentGlow: "0 0 40px rgba(201,168,76,0.10)",
    shimmer: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, transparent 60%)",
  },
  {
    id: "series",
    label: "SÉRIES",
    icon: Clapperboard,
    gradient: "linear-gradient(135deg, rgba(124,58,237,0.20), rgba(59,130,246,0.12))",
    border: "rgba(124,58,237,0.25)",
    iconColor: "#7C3AED",
    accentGlow: "0 0 40px rgba(124,58,237,0.10)",
    shimmer: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, transparent 60%)",
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
  const activePlaylist = playlists.find(p => p.id === activePlaylistId) || (playlists.length > 0 ? playlists[0] : null);

  const counts = useMemo(() => ({
    live: allChannels.length,
    films: allVod.length,
    series: allSeries.length,
  }), [allChannels.length, allVod.length, allSeries.length]);

  const recentIds = getRecent();
  const recentChannels = useMemo(() => {
    const all = [...allChannels, ...allVod, ...allSeries];
    return recentIds.slice(0, 10).map(id => all.find(c => c.id === id)).filter(Boolean) as Channel[];
  }, [recentIds, allChannels, allVod, allSeries]);

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
      {/* No playlist selector here - it's in the sidebar */}

      {/* 3 Stat cards — transparent premium */}
      <div className="grid grid-cols-3 gap-3">
        {STAT_CARDS.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onTabSelect(card.id)}
            className="group relative rounded-2xl p-4 text-left overflow-hidden transition-all backdrop-blur-md"
            style={{
              background: card.gradient,
              border: `1px solid ${card.border}`,
              boxShadow: card.accentGlow,
            }}
            whileHover={{ scale: 1.03 }}
          >
            {/* Inner shimmer highlight */}
            <div className="absolute inset-0 pointer-events-none opacity-60" style={{ background: card.shimmer }} />
            {/* Metallic icon glow */}
            <div className="relative mb-2">
              <card.icon size={24} style={{ color: card.iconColor, filter: `drop-shadow(0 0 6px ${card.iconColor}55)` }} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: `${card.iconColor}CC` }}>{card.label}</p>
            <p className="text-2xl font-black mt-0.5 tabular-nums" style={{ color: "#F5F5F7" }}>
              {counts[card.id as keyof typeof counts].toLocaleString()}
            </p>
            <ArrowRight size={16} className="absolute bottom-4 right-4 transition-colors" style={{ color: `${card.iconColor}50` }} />
          </motion.button>
        ))}
      </div>

      {/* Continue Watching removed from dashboard - now in Live TV */}

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
            className="flex flex-col items-center gap-2 rounded-xl py-3 px-2 transition-all hover:bg-white/5 backdrop-blur-sm"
            style={{ background: "rgba(19,19,24,0.5)", border: "1px solid rgba(28,28,36,0.5)" }}
          >
            <btn.icon size={18} style={{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.3))" }} />
            <span className="text-[10px] font-medium" style={{ color: "#86868B" }}>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Subscription info moved to sidebar */}
    </div>
  );
}
