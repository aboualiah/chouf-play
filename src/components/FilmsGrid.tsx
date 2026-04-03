import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Channel } from "@/lib/channels";
import { Play, Star, ChevronLeft, ChevronRight, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilmsGridProps {
  films: Channel[];
  favorites: string[];
  onPlay: (film: Channel) => void;
  onToggleFavorite: (id: string) => void;
}

type SortMode = "default" | "az" | "za" | "rating";

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const POSTER_COLORS = [
  "from-orange-600/60 to-amber-900/40",
  "from-rose-600/60 to-pink-900/40",
  "from-violet-600/60 to-purple-900/40",
  "from-blue-600/60 to-indigo-900/40",
  "from-emerald-600/60 to-teal-900/40",
  "from-cyan-600/60 to-sky-900/40",
];

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return POSTER_COLORS[Math.abs(h) % POSTER_COLORS.length];
}

// Film detail modal
function FilmModal({ film, open, onClose, onPlay, isFav, onToggleFav }: {
  film: Channel | null; open: boolean; onClose: () => void; onPlay: () => void; isFav: boolean; onToggleFav: () => void;
}) {
  if (!film) return null;
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg rounded-2xl overflow-hidden"
            style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            {/* Poster header */}
            <div className="relative h-64 overflow-hidden">
              {film.logo ? (
                <>
                  <img src={film.logo} className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(20px) brightness(0.4)" }} alt="" />
                  <img src={film.logo} className="relative z-10 mx-auto h-full object-contain p-6" alt={film.name} />
                </>
              ) : (
                <div className={`flex h-full items-center justify-center bg-gradient-to-br ${hashColor(film.name)}`}>
                  <span className="text-4xl font-black" style={{ color: "#F5F5F7" }}>{getInitials(film.name)}</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#131318]" />
              <button onClick={onClose} className="absolute right-3 top-3 z-20 rounded-full p-2" style={{ background: "rgba(0,0,0,0.5)" }}>
                <X size={16} style={{ color: "#F5F5F7" }} />
              </button>
            </div>
            <div className="px-5 pb-5 -mt-6 relative z-10">
              <h2 className="text-lg font-bold mb-1" style={{ color: "#F5F5F7" }}>{film.name}</h2>
              <p className="text-[12px] mb-4" style={{ color: "#86868B" }}>{film.category}</p>
              <div className="flex gap-3">
                <button onClick={onPlay}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-transform hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #FF6D00, #FFD60A)", color: "#0A0A0F" }}>
                  <Play size={16} fill="currentColor" /> Regarder
                </button>
                <button onClick={onToggleFav}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                  style={{ background: "#1C1C24", color: isFav ? "#FF3B30" : "#86868B" }}>
                  <Heart size={14} className={isFav ? "fill-current" : ""} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const PosterCard = React.memo(({ film, isFav, onClick }: { film: Channel; isFav: boolean; onClick: () => void }) => (
  <div onClick={onClick}
    className="group cursor-pointer flex-shrink-0 transition-all duration-200 hover:scale-105"
    style={{ width: 140 }}>
    <div className="relative rounded-xl overflow-hidden mb-1.5" style={{ aspectRatio: "2/3", border: "1px solid #1C1C24" }}>
      {film.logo ? (
        <img src={film.logo} alt={film.name} loading="lazy" className="h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${hashColor(film.name)}`}>
          <span className="text-lg font-black" style={{ color: "#F5F5F7" }}>{getInitials(film.name)}</span>
        </div>
      )}
      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, #FF6D00, #FFD60A)" }}>
          <Play size={16} className="text-black" fill="currentColor" />
        </div>
      </div>
      {isFav && (
        <div className="absolute right-1.5 top-1.5">
          <Heart size={12} className="fill-[#FF3B30] text-[#FF3B30]" />
        </div>
      )}
    </div>
    <p className="text-[11px] font-medium leading-tight line-clamp-2 px-0.5" style={{ color: "#B0B0B5" }}>{film.name}</p>
    <p className="text-[9px] px-0.5 truncate" style={{ color: "#48484A" }}>{film.category}</p>
  </div>
));
PosterCard.displayName = "PosterCard";

const BATCH = 60;

export function FilmsGrid({ films, favorites, onPlay, onToggleFavorite }: FilmsGridProps) {
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [selectedFilm, setSelectedFilm] = useState<Channel | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Hero films (ones with logos)
  const heroFilms = useMemo(() => films.filter(f => f.logo).slice(0, 20), [films]);

  useEffect(() => {
    if (heroFilms.length <= 1) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroFilms.length), 10000);
    return () => clearInterval(t);
  }, [heroFilms.length]);

  const sorted = useMemo(() => {
    const copy = [...films];
    switch (sortMode) {
      case "az": return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "za": return copy.sort((a, b) => b.name.localeCompare(a.name));
      default: return copy;
    }
  }, [films, sortMode]);

  const visible = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount]);

  useEffect(() => { setVisibleCount(BATCH); }, [films, sortMode]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= sorted.length) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisibleCount(c => Math.min(c + BATCH, sorted.length)); }, { rootMargin: "400px" });
    obs.observe(node);
    return () => obs.disconnect();
  }, [visibleCount, sorted.length]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, Channel[]>();
    visible.forEach(f => {
      const cat = f.category || "Autres";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(f);
    });
    return Array.from(map.entries());
  }, [visible]);

  const heroFilm = heroFilms[heroIdx];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Hero Banner */}
      {heroFilm && (
        <div className="relative h-[250px] overflow-hidden mb-4" onClick={() => setSelectedFilm(heroFilm)}>
          <AnimatePresence mode="wait">
            <motion.div key={heroIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              {heroFilm.logo && (
                <img src={heroFilm.logo} className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(25px) brightness(0.3) saturate(1.4)" }} alt="" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/80 to-transparent" />
              <div className="relative z-10 flex h-full items-end p-6 gap-5">
                {heroFilm.logo && (
                  <img src={heroFilm.logo} className="h-40 w-28 rounded-xl object-cover shadow-2xl hidden sm:block" style={{ border: "1px solid rgba(255,255,255,0.1)" }} alt="" />
                )}
                <div className="flex-1 min-w-0 pb-2">
                  <h2 className="text-2xl font-bold mb-1 line-clamp-1" style={{ color: "#F5F5F7" }}>{heroFilm.name}</h2>
                  <p className="text-[12px] mb-3" style={{ color: "#86868B" }}>{heroFilm.category}</p>
                  <button onClick={(e) => { e.stopPropagation(); onPlay(heroFilm); }}
                    className="flex items-center gap-2 rounded-xl px-5 py-2 text-[13px] font-semibold transition-transform hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #FF6D00, #FFD60A)", color: "#0A0A0F" }}>
                    <Play size={16} fill="currentColor" /> Regarder
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Hero nav dots */}
          <div className="absolute bottom-3 right-5 z-20 flex gap-1.5">
            {heroFilms.slice(0, 10).map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setHeroIdx(i); }}
                className="h-1.5 rounded-full transition-all" style={{ width: i === heroIdx ? 16 : 6, background: i === heroIdx ? "#FF6D00" : "#48484A" }} />
            ))}
          </div>
        </div>
      )}

      {/* Sort bar */}
      <div className="flex items-center gap-2 px-5 pb-3">
        <span className="text-[11px] font-semibold" style={{ color: "#48484A" }}>Trier :</span>
        {([["default", "Par défaut"], ["az", "A → Z"], ["za", "Z → A"]] as [SortMode, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setSortMode(id)}
            className="rounded-full px-3 py-1 text-[10px] font-medium transition-all"
            style={sortMode === id ? { background: "rgba(255,109,0,0.15)", color: "#FF6D00", border: "1px solid rgba(255,109,0,0.3)" } : { color: "#86868B", border: "1px solid #1C1C24" }}>
            {label}
          </button>
        ))}
        <span className="ml-auto text-[11px]" style={{ color: "#48484A" }}>{films.length} films</span>
      </div>

      {/* Grouped rows */}
      {grouped.map(([cat, catFilms]) => (
        <div key={cat} className="mb-5">
          <h3 className="px-5 mb-2 text-[13px] font-semibold" style={{ color: "#B0B0B5" }}>{cat}</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-thin px-5 pb-2">
            {catFilms.map(f => (
              <PosterCard key={f.id} film={f} isFav={favorites.includes(f.id)} onClick={() => setSelectedFilm(f)} />
            ))}
          </div>
        </div>
      ))}

      {visibleCount < sorted.length && <div ref={sentinelRef} className="h-8" />}

      <FilmModal film={selectedFilm} open={!!selectedFilm} onClose={() => setSelectedFilm(null)}
        onPlay={() => { if (selectedFilm) { onPlay(selectedFilm); setSelectedFilm(null); } }}
        isFav={selectedFilm ? favorites.includes(selectedFilm.id) : false}
        onToggleFav={() => { if (selectedFilm) onToggleFavorite(selectedFilm.id); }} />
    </div>
  );
}
