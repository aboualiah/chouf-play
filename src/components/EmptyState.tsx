import { Zap, Shield, Crown, Plus } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

interface EmptyStateProps {
  onAddPlaylist: () => void;
  onLoadDemo: () => void;
}

export function EmptyState({ onAddPlaylist, onLoadDemo }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto scrollbar-thin">
      <div className="w-full max-w-3xl">
        {/* Hero image with gradient overlay */}
        <div className="relative w-full overflow-hidden rounded-b-3xl" style={{ height: 340 }}>
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            width={1920}
            height={800}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, transparent 20%, hsl(var(--background)) 95%)",
            }}
          />
          <div className="absolute bottom-8 left-8 right-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground">
                Bienvenue sur <span className="text-primary">CHOUF</span> Play
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Le lecteur IPTV le plus léger et rapide. Chargez votre playlist M3U et profitez de vos chaînes.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-8 grid grid-cols-3 gap-4 px-6"
        >
          {[
            { icon: Zap, label: "Ultra-rapide", desc: "Démarrage en moins de 2 secondes", color: "text-primary" },
            { icon: Shield, label: "Zéro pub", desc: "Aucune publicité, aucune interruption", color: "text-[hsl(var(--cp-green))]" },
            { icon: Crown, label: "Jusqu'à 4K", desc: "Qualité maximale sur tous vos écrans", color: "text-accent" },
          ].map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center"
            >
              <f.icon size={24} className={f.color} />
              <span className="text-sm font-bold text-foreground">{f.label}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{f.desc}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex flex-col items-center gap-3 px-6 pb-10"
        >
          <button
            onClick={onAddPlaylist}
            className="flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] bg-gradient-orange glow-orange-soft"
          >
            <Plus size={18} />
            Ajouter
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Chargez votre playlist M3U par URL, fichier local, ou connectez-vous via Xtream Codes
          </p>
        </motion.div>
      </div>
    </div>
  );
}
