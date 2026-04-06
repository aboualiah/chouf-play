import { Zap, Shield, Crown, Plus, QrCode } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodePortal } from "@/components/QRCodePortal";
import heroBg from "@/assets/hero-bg.jpg";
import { colors, effects } from "@/lib/theme";

interface EmptyStateProps {
  onAddPlaylist: () => void;
  onLoadDemo: () => void;
}


export function EmptyState({ onAddPlaylist, onLoadDemo }: EmptyStateProps) {
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin">
      <div className="w-full max-w-5xl mx-auto">
        {/* Hero */}
        <div className="relative w-full overflow-hidden" style={{ height: 260 }}>
          <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 10%, #0A0A0F 95%)" }} />
          <div className="absolute bottom-8 left-8 right-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                Bienvenue sur <span style={{ color: colors.orange }}>CHOUF</span> Play
              </h2>
              <p className="mt-1.5 text-sm" style={{ color: colors.textMuted }}>
                Le lecteur IPTV le plus léger et rapide
              </p>
            </motion.div>
          </div>
        </div>

        {/* Feature pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex gap-3 px-6 mt-6 flex-wrap justify-center">
          {[
            { icon: Zap, label: "Ultra-rapide", color: colors.orange },
            { icon: Shield, label: "Zéro pub", color: colors.green },
            { icon: Crown, label: "Jusqu'à 4K", color: colors.gold },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: colors.surfaceSolid, border: "1px solid #1C1C24" }}>
              <f.icon size={14} style={{ color: f.color }} />
              <span className="text-xs font-semibold" style={{ color: colors.text }}>{f.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA - Ajouter + À distance côte à côte */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-3 mt-8 px-6">
          <div className="flex items-center gap-3">
            <button onClick={onAddPlaylist}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] bg-gradient-orange glow-orange-soft"
              style={{ color: colors.text }}>
              <Plus size={18} />
              Ajouter une playlist
            </button>
            <button onClick={() => setQrOpen(true)}
              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", color: colors.text }}>
              <QrCode size={18} />
              À distance
            </button>
          </div>
          <p className="text-xs text-center" style={{ color: colors.textDim }}>
            M3U, URL ou Xtream Codes
          </p>
        </motion.div>

        <QRCodePortal open={qrOpen} onClose={() => setQrOpen(false)} />
      </div>
    </div>
  );
}
