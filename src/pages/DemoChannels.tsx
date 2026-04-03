import { useState, useCallback } from "react";
import { ArrowLeft, Play, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DEMO_CHANNELS, Channel, CATEGORY_GRADIENTS, getCategories } from "@/lib/channels";
import { VideoPlayer } from "@/components/VideoPlayer";
import { motion, AnimatePresence } from "framer-motion";

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function DemoChannels() {
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categories = getCategories(DEMO_CHANNELS);

  const filtered = activeCategory
    ? DEMO_CHANNELS.filter(c => c.category === activeCategory)
    : DEMO_CHANNELS;

  const handlePlay = useCallback((ch: Channel) => setActiveChannel(ch), []);

  const handlePrev = useCallback(() => {
    if (!activeChannel) return;
    const idx = filtered.findIndex(c => c.id === activeChannel.id);
    if (idx > 0) setActiveChannel(filtered[idx - 1]);
  }, [activeChannel, filtered]);

  const handleNext = useCallback(() => {
    if (!activeChannel) return;
    const idx = filtered.findIndex(c => c.id === activeChannel.id);
    if (idx < filtered.length - 1) setActiveChannel(filtered[idx + 1]);
  }, [activeChannel, filtered]);

  return (
    <div className="flex h-screen flex-col" style={{ background: "#0A0A0F" }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1C1C24" }}>
        <button onClick={() => navigate("/")} className="rounded-xl p-2" style={{ background: "#131318", color: "#86868B" }}>
          <ArrowLeft size={18} />
        </button>
        <Radio size={18} style={{ color: "#FF6D00" }} />
        <h1 className="text-base font-bold" style={{ color: "#F5F5F7" }}>Chaînes Gratuites — Démo</h1>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(255,109,0,0.1)", color: "#FF6D00" }}>
          {DEMO_CHANNELS.length} chaînes
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Channel list */}
        <div className="w-full max-w-md flex flex-col border-r overflow-hidden" style={{ background: "#131318", borderColor: "#1C1C24" }}>
          {/* Category filter */}
          <div className="flex gap-1.5 px-3 py-2.5 overflow-x-auto scrollbar-none shrink-0" style={{ borderBottom: "1px solid #1C1C24" }}>
            <button
              onClick={() => setActiveCategory(null)}
              className="shrink-0 rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors"
              style={!activeCategory ? { background: "rgba(255,109,0,0.12)", color: "#FF6D00" } : { background: "#1C1C24", color: "#48484A" }}
            >
              Toutes
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="shrink-0 rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors"
                style={activeCategory === cat ? { background: "rgba(255,109,0,0.12)", color: "#FF6D00" } : { background: "#1C1C24", color: "#48484A" }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Channel items */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filtered.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => handlePlay(ch)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-[#1C1C24] group"
                style={activeChannel?.id === ch.id ? { background: "rgba(255,109,0,0.06)", borderLeft: "3px solid #FF6D00" } : { borderLeft: "3px solid transparent" }}
              >
                <span className="text-[10px] font-mono w-5 text-right tabular-nums" style={{ color: "#48484A" }}>{i + 1}</span>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-gradient-to-br ${CATEGORY_GRADIENTS[ch.category] || "from-gray-700/30 to-gray-900/20"}`}>
                  {ch.logo ? (
                    <img src={ch.logo} loading="lazy" className="h-6 w-6 object-contain" alt=""
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <span className="text-[9px] font-bold" style={{ color: "#F5F5F7" }}>{getInitials(ch.name)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium truncate" style={{ color: activeChannel?.id === ch.id ? "#F5F5F7" : "#B0B0B5" }}>{ch.name}</p>
                  <p className="text-[10px]" style={{ color: "#48484A" }}>{ch.category}</p>
                </div>
                {activeChannel?.id === ch.id ? (
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#FF3B30" }} />
                    <span className="text-[8px] font-bold" style={{ color: "#FF3B30" }}>LIVE</span>
                  </div>
                ) : (
                  <Play size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#FF6D00" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Player area */}
        <div className="flex-1 hidden md:flex flex-col">
          <AnimatePresence mode="wait">
            {activeChannel ? (
              <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                <VideoPlayer
                  channel={activeChannel}
                  isFavorite={false}
                  onBack={() => setActiveChannel(null)}
                  onToggleFavorite={() => {}}
                  onPrev={handlePrev}
                  onNext={handleNext}
                />
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <Radio size={48} style={{ color: "#1C1C24" }} className="mx-auto mb-4" />
                  <p className="text-sm font-medium" style={{ color: "#48484A" }}>Sélectionnez une chaîne pour commencer</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
