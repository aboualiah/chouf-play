import { Zap, Shield, Crown, Plus, Play, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { DEMO_CHANNELS, Channel, CATEGORY_GRADIENTS } from "@/lib/channels";
import heroBg from "@/assets/hero-bg.jpg";
import React, { useState, useCallback } from "react";

interface EmptyStateProps {
  onAddPlaylist: () => void;
  onLoadDemo: () => void;
  onPlayDemo?: (channel: Channel) => void;
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export function EmptyState({ onAddPlaylist, onLoadDemo, onPlayDemo }: EmptyStateProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handlePlay = useCallback((ch: Channel) => {
    if (onPlayDemo) onPlayDemo(ch);
  }, [onPlayDemo]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin">
      <div className="w-full max-w-5xl mx-auto">
        {/* Hero */}
        <div className="relative w-full overflow-hidden" style={{ height: 280 }}>
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

        {/* Feature pills — compact row */}
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

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-2 mt-8 px-6">
          <button onClick={onAddPlaylist}
            className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] bg-gradient-orange glow-orange-soft"
            style={{ color: "#F5F5F7" }}>
            <Plus size={18} />
            Ajouter une playlist
          </button>
          <p className="text-xs text-center" style={{ color: "#48484A" }}>
            M3U, URL ou Xtream Codes
          </p>
        </motion.div>

        {/* Demo Channels Showcase — SEPARATE from IPTV */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-10 px-6 pb-12">
          <div className="flex items-center gap-2 mb-4">
            <Radio size={16} style={{ color: "#FF6D00" }} />
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#86868B" }}>
              Chaînes Gratuites — Démo
            </h3>
            <div className="h-px flex-1" style={{ background: "#1C1C24" }} />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {DEMO_CHANNELS.map((ch, i) => (
              <motion.button
                key={ch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.03 }}
                onClick={() => handlePlay(ch)}
                onMouseEnter={() => setHoveredId(ch.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all"
                style={{
                  background: hoveredId === ch.id ? "#1C1C24" : "#131318",
                  border: `1px solid ${hoveredId === ch.id ? "rgba(255,109,0,0.3)" : "#1C1C24"}`,
                }}
              >
                {/* Logo */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-gradient-to-br ${CATEGORY_GRADIENTS[ch.category] || "from-gray-700/30 to-gray-900/20"}`}>
                  {ch.logo ? (
                    <img src={ch.logo} alt="" loading="lazy" className="h-6 w-6 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <span className="text-[9px] font-bold" style={{ color: "#F5F5F7" }}>{getInitials(ch.name)}</span>
                  )}
                </div>
                {/* Name + category */}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold truncate" style={{ color: "#F5F5F7" }}>{ch.name}</p>
                  <p className="text-[9px] truncate" style={{ color: "#48484A" }}>{ch.category}</p>
                </div>
                {/* Play icon on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={12} style={{ color: "#FF6D00" }} fill="#FF6D00" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
