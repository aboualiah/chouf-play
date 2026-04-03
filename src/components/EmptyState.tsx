import { Zap, Shield, Crown, Plus, Tv, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onAddPlaylist: () => void;
  onLoadDemo: () => void;
}

export function EmptyState({ onAddPlaylist, onLoadDemo }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto scrollbar-thin p-6">
      {/* Hero blur */}
      <div className="relative w-full max-w-xl mb-8">
        <div className="absolute inset-0 rounded-3xl" style={{
          background: "linear-gradient(to bottom, rgba(255, 109, 0, 0.05), rgba(10, 10, 15, 1))",
        }} />
        <div className="relative px-8 pt-12 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#F5F5F7" }}>
              Bienvenue sur <span style={{ color: "#FF6D00" }}>CHOUF</span>Play
            </h2>
            <p className="text-sm mb-6" style={{ color: "#86868B" }}>
              Votre lecteur IPTV premium, léger et rapide
            </p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {[
              { icon: Zap, label: "Ultra-rapide", color: "#FF6D00" },
              { icon: Shield, label: "Sans pub", color: "#34C759" },
              { icon: Crown, label: "Qualité HD", color: "#C9A84C" },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-2xl p-4"
                style={{ background: "#131318", border: "1px solid #1C1C24" }}
              >
                <f.icon size={22} style={{ color: f.color }} />
                <span className="text-[11px] font-medium" style={{ color: "#86868B" }}>{f.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-3"
          >
            <button
              onClick={onAddPlaylist}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] bg-gradient-orange glow-orange-soft"
            >
              <Plus size={18} />
              Ajouter une playlist
            </button>

            <div className="flex gap-2">
              <button
                onClick={onLoadDemo}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium transition-colors hover:bg-[#242430]"
                style={{ background: "#1C1C24", color: "#F5F5F7" }}
              >
                <Tv size={15} />
                Chaînes démo (24)
              </button>
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium transition-colors hover:bg-[#242430]"
                style={{ background: "#1C1C24", color: "#F5F5F7" }}
              >
                <Globe size={15} />
                Free-TV (500+)
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Premium card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full max-w-sm rounded-2xl p-4"
        style={{ background: "linear-gradient(135deg, rgba(201, 168, 76, 0.08), rgba(255, 109, 0, 0.05))", border: "1px solid rgba(201, 168, 76, 0.15)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(201, 168, 76, 0.15)" }}>
            <Crown size={20} style={{ color: "#C9A84C" }} />
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#C9A84C" }}>CHOUF Play Premium</p>
            <p className="text-[11px]" style={{ color: "#48484A" }}>EPG, enregistrement, multi-écrans</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
