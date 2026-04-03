import { Zap, Shield, Crown, Plus, QrCode } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodePortal } from "@/components/QRCodePortal";
import heroBg from "@/assets/hero-bg.jpg";

interface EmptyStateProps {
  onAddPlaylist: () => void;
  onLoadDemo: () => void;
}

const COMPETITION_LOGOS: Record<string, string> = {
  "Champions League": "https://img.icons8.com/color/48/uefa-champions-league.png",
  "Ligue 1": "https://img.icons8.com/color/48/ligue-1.png",
  "NBA": "https://img.icons8.com/color/48/nba.png",
};

const FEATURED_MATCHES = [
  { id: "f1", icon: "⚽", league: "Champions League", team1: "Real Madrid", team1Logo: "https://img.icons8.com/color/48/real-madrid.png", team2: "Man City", team2Logo: "https://img.icons8.com/color/48/manchester-city.png", status: "live" as const, time: "67'", score: "2-1", channel: "RMC Sport 1" },
  { id: "f2", icon: "⚽", league: "Ligue 1", team1: "PSG", team1Logo: "https://img.icons8.com/color/48/paris-saint-germain.png", team2: "OM", team2Logo: "https://img.icons8.com/color/48/olympique-de-marseille.png", status: "upcoming" as const, time: "Ce soir 21h", channel: "beIN Sports 1" },
  { id: "f3", icon: "🏀", league: "NBA", team1: "Lakers", team1Logo: "https://img.icons8.com/color/48/los-angeles-lakers.png", team2: "Celtics", team2Logo: "https://img.icons8.com/color/48/boston-celtics.png", status: "upcoming" as const, time: "Demain 02h", channel: "beIN Sports 4" },
];

export function EmptyState({ onAddPlaylist, onLoadDemo }: EmptyStateProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const [matchSettings, setMatchSettings] = useState(getMatchSettings);
  const [showMatches, setShowMatches] = useState(matchSettings.showBanner);

  const toggleShowMatches = () => {
    setShowMatches(v => !v);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin">
      <div className="w-full max-w-5xl mx-auto">
        {/* Hero */}
        <div className="relative w-full overflow-hidden" style={{ height: 260 }}>
          <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 10%, #0A0A0F 95%)" }} />
          <div className="absolute bottom-8 left-8 right-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl font-bold" style={{ color: "#F5F5F7" }}>
                Bienvenue sur <span style={{ color: "#FF6D00" }}>CHOUF</span> Play
              </h2>
              <p className="mt-1.5 text-sm" style={{ color: "#86868B" }}>
                Le lecteur IPTV le plus léger et rapide
              </p>
            </motion.div>
          </div>
        </div>

        {/* Feature pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex gap-3 px-6 mt-6 flex-wrap justify-center">
          {[
            { icon: Zap, label: "Ultra-rapide", color: "#FF6D00" },
            { icon: Shield, label: "Zéro pub", color: "#34C759" },
            { icon: Crown, label: "Jusqu'à 4K", color: "#C9A84C" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
              <f.icon size={14} style={{ color: f.color }} />
              <span className="text-xs font-semibold" style={{ color: "#F5F5F7" }}>{f.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA - Ajouter + À distance côte à côte */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-3 mt-8 px-6">
          <div className="flex items-center gap-3">
            <button onClick={onAddPlaylist}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] bg-gradient-orange glow-orange-soft"
              style={{ color: "#F5F5F7" }}>
              <Plus size={18} />
              Ajouter une playlist
            </button>
            <button onClick={() => setQrOpen(true)}
              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", color: "#F5F5F7" }}>
              <QrCode size={18} />
              À distance
            </button>
          </div>
          <p className="text-xs text-center" style={{ color: "#48484A" }}>
            M3U, URL ou Xtream Codes
          </p>
        </motion.div>

        <QRCodePortal open={qrOpen} onClose={() => setQrOpen(false)} />

        {/* 3 Match Banners with toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-10 px-6 pb-12">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} style={{ color: "#C9A84C" }} />
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#86868B" }}>
              Matchs en vedette
            </h3>
            <div className="h-px flex-1" style={{ background: "#1C1C24" }} />
            <button
              onClick={toggleShowMatches}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all"
              style={{ background: "#1C1C24", color: showMatches ? "#34C759" : "#48484A" }}
            >
              {showMatches ? <Eye size={12} /> : <EyeOff size={12} />}
              {showMatches ? "Masquer" : "Afficher"}
            </button>
          </div>

          {showMatches && <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FEATURED_MATCHES.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #1C1C24, #131318)",
                  border: match.status === "live" ? "1.5px solid rgba(255, 109, 0, 0.5)" : "1px solid #1C1C24",
                  boxShadow: match.status === "live" ? "0 0 30px rgba(255,109,0,0.1)" : "none",
                }}
              >
                {/* League header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    {COMPETITION_LOGOS[match.league] && (
                      <img src={COMPETITION_LOGOS[match.league]} alt="" className="h-4 w-4 object-contain" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#48484A" }}>
                      {match.league}
                    </span>
                  </div>
                  {match.status === "live" && (
                    <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: "rgba(255,59,48,0.15)", color: "#FF3B30" }}>
                      <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#FF3B30" }} />
                      LIVE
                    </span>
                  )}
                </div>

                {/* Teams + score with logos */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.team1Logo && <img src={match.team1Logo} alt="" className="h-7 w-7 object-contain" />}
                    <p className="text-[14px] font-bold truncate" style={{ color: "#F5F5F7" }}>{match.team1}</p>
                  </div>
                  {match.score ? (
                    <span className="mx-2 rounded-lg px-3 py-1.5 text-sm font-black tabular-nums shrink-0"
                      style={{ background: "rgba(255,109,0,0.12)", color: "#FF6D00", border: "1px solid rgba(255,109,0,0.2)" }}>
                      {match.score}
                    </span>
                  ) : (
                    <span className="mx-2 text-xs shrink-0" style={{ color: "#48484A" }}>vs</span>
                  )}
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <p className="text-[14px] font-bold text-right truncate" style={{ color: "#F5F5F7" }}>{match.team2}</p>
                    {match.team2Logo && <img src={match.team2Logo} alt="" className="h-7 w-7 object-contain" />}
                  </div>
                </div>

                {/* Bottom info */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: match.status === "live" ? "#FF6D00" : "#86868B" }}>
                    {match.time}
                  </span>
                  {match.channel && (
                    <span className="text-[10px] font-medium" style={{ color: "#48484A" }}>📺 {match.channel}</span>
                  )}
                </div>

                {match.status === "live" && (
                  <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold text-white bg-gradient-orange active:scale-[0.97] transition-transform">
                    <Play size={12} fill="currentColor" /> Regarder
                  </button>
                )}
              </motion.div>
            ))}
          </div>}
          {!showMatches && (
            <p className="text-center text-[11px] py-4" style={{ color: "#48484A" }}>
              Bannière matchs masquée. Activez dans les Paramètres.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
