import React, { useState, useMemo, useRef, useEffect } from "react";
import { Channel } from "@/lib/channels";
import { Play, Heart, X, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SeriesGridProps {
  series: Channel[];
  favorites: string[];
  onPlay: (ch: Channel) => void;
  onToggleFavorite: (id: string) => void;
}

const POSTER_COLORS = [
  "from-violet-600/60 to-purple-900/40",
  "from-blue-600/60 to-indigo-900/40",
  "from-rose-600/60 to-pink-900/40",
  "from-emerald-600/60 to-teal-900/40",
  "from-orange-600/60 to-amber-900/40",
  "from-cyan-600/60 to-sky-900/40",
];

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return POSTER_COLORS[Math.abs(h) % POSTER_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// Series detail modal with seasons
function SeriesModal({ series, open, onClose, onPlay, isFav, onToggleFav }: {
  series: Channel | null; open: boolean; onClose: () => void; onPlay: () => void; isFav: boolean; onToggleFav: () => void;
}) {
  const [openSeason, setOpenSeason] = useState<number | null>(1);

  if (!series) return null;

  // Mock seasons from series info (Xtream API would provide real data)
  const seasons = [
    { num: 1, episodes: Array.from({ length: 8 }, (_, i) => ({ num: i + 1, title: `Épisode ${i + 1}` })) },
    { num: 2, episodes: Array.from({ length: 6 }, (_, i) => ({ num: i + 1, title: `Épisode ${i + 1}` })) },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
            style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            {/* Header */}
            <div className="relative h-48 overflow-hidden shrink-0">
              {series.logo ? (
                <>
                  <img src={series.logo} className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(20px) brightness(0.4)" }} alt="" />
                  <img src={series.logo} className="relative z-10 mx-auto h-full object-contain p-4" alt={series.name} />
                </>
              ) : (
                <div className={`flex h-full items-center justify-center bg-gradient-to-br ${hashColor(series.name)}`}>
                  <span className="text-3xl font-black" style={{ color: "#F5F5F7" }}>{getInitials(series.name)}</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#131318]" />
              <button onClick={onClose} className="absolute right-3 top-3 z-20 rounded-full p-2" style={{ background: "rgba(0,0,0,0.5)" }}>
                <X size={16} style={{ color: "#F5F5F7" }} />
              </button>
            </div>

            <div className="px-5 pb-2 -mt-4 relative z-10 shrink-0">
              <h2 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>{series.name}</h2>
              <p className="text-[12px] mb-3" style={{ color: "#86868B" }}>{series.category}</p>
              <div className="flex gap-3 mb-4">
                <button onClick={onPlay}
                  className="flex items-center gap-2 rounded-xl px-5 py-2 text-[13px] font-semibold transition-transform hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)", color: "#F5F5F7" }}>
                  <Play size={16} fill="currentColor" /> Regarder
                </button>
                <button onClick={onToggleFav}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px]"
                  style={{ background: "#1C1C24", color: isFav ? "#FF3B30" : "#86868B" }}>
                  <Heart size={14} className={isFav ? "fill-current" : ""} />
                </button>
              </div>
            </div>

            {/* Seasons accordion */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 scrollbar-thin">
              {seasons.map(s => (
                <div key={s.num} className="mb-2">
                  <button onClick={() => setOpenSeason(openSeason === s.num ? null : s.num)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors"
                    style={{ background: openSeason === s.num ? "rgba(124,58,237,0.1)" : "#1C1C24", color: openSeason === s.num ? "#A78BFA" : "#86868B" }}>
                    {openSeason === s.num ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Saison {s.num}
                    <span className="ml-auto text-[10px]" style={{ color: "#48484A" }}>{s.episodes.length} épisodes</span>
                  </button>
                  <AnimatePresence>
                    {openSeason === s.num && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        {s.episodes.map(ep => (
                          <button key={ep.num} onClick={onPlay}
                            className="flex w-full items-center gap-3 px-4 py-2 text-[12px] transition-colors hover:bg-[#1C1C24] rounded-lg"
                            style={{ color: "#B0B0B5" }}>
                            <span className="font-mono text-[10px] w-5 text-right" style={{ color: "#48484A" }}>{ep.num}</span>
                            <span className="flex-1 text-left">{ep.title}</span>
                            <Play size={12} style={{ color: "#48484A" }} />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const BATCH = 60;

export function SeriesGrid({ series, favorites, onPlay, onToggleFavorite }: SeriesGridProps) {
  const [selected, setSelected] = useState<Channel | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setVisibleCount(BATCH); }, [series]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= series.length) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisibleCount(c => Math.min(c + BATCH, series.length)); }, { rootMargin: "400px" });
    obs.observe(node);
    return () => obs.disconnect();
  }, [visibleCount, series.length]);

  const visible = useMemo(() => series.slice(0, visibleCount), [series, visibleCount]);

  const grouped = useMemo(() => {
    const map = new Map<string, Channel[]>();
    visible.forEach(s => {
      const cat = s.category || "Autres";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    });
    return Array.from(map.entries());
  }, [visible]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="flex items-center gap-2 px-5 py-3">
        <span className="text-[14px] font-bold" style={{ color: "#F5F5F7" }}>📺 Séries</span>
        <span className="text-[11px]" style={{ color: "#48484A" }}>{series.length} séries</span>
      </div>

      {grouped.map(([cat, catSeries]) => (
        <div key={cat} className="mb-5">
          <h3 className="px-5 mb-2 text-[13px] font-semibold" style={{ color: "#B0B0B5" }}>{cat}</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-thin px-5 pb-2">
            {catSeries.map(s => (
              <div key={s.id} onClick={() => setSelected(s)}
                className="group cursor-pointer flex-shrink-0 transition-all duration-200 hover:scale-105" style={{ width: 140 }}>
                <div className="relative rounded-xl overflow-hidden mb-1.5" style={{ aspectRatio: "2/3", border: "1px solid #1C1C24" }}>
                  {s.logo ? (
                    <img src={s.logo} alt={s.name} loading="lazy" className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${hashColor(s.name)}`}>
                      <span className="text-lg font-black" style={{ color: "#F5F5F7" }}>{getInitials(s.name)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)" }}>
                      <Play size={16} className="text-white" fill="currentColor" />
                    </div>
                  </div>
                  {favorites.includes(s.id) && (
                    <div className="absolute right-1.5 top-1.5">
                      <Heart size={12} className="fill-[#FF3B30] text-[#FF3B30]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-medium leading-tight line-clamp-2 px-0.5" style={{ color: "#B0B0B5" }}>{s.name}</p>
                <p className="text-[9px] px-0.5 truncate" style={{ color: "#48484A" }}>{s.category}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {visibleCount < series.length && <div ref={sentinelRef} className="h-8" />}

      <SeriesModal series={selected} open={!!selected} onClose={() => setSelected(null)}
        onPlay={() => { if (selected) { onPlay(selected); setSelected(null); } }}
        isFav={selected ? favorites.includes(selected.id) : false}
        onToggleFav={() => { if (selected) onToggleFavorite(selected.id); }} />
    </div>
  );
}
