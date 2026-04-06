import { useMemo, useState, useRef, useEffect } from "react";
import { Channel } from "@/lib/channels";
import { Search, Tv, Film, Clapperboard, Radio, Play, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { colors, effects } from "@/lib/theme";

interface SearchOverlayProps {
  query: string;
  onQueryChange: (q: string) => void;
  allChannels: Channel[];
  allVod: Channel[];
  allSeries: Channel[];
  onPlay: (ch: Channel) => void;
  onTabSelect: (tab: string) => void;
  compact?: boolean;
}

type FilterType = "all" | "live" | "films" | "series" | "radio";

const TYPE_FILTERS: { id: FilterType; label: string; icon: typeof Tv }[] = [
  { id: "all", label: "Tout", icon: Search },
  { id: "live", label: "TV", icon: Tv },
  { id: "films", label: "Films", icon: Film },
  { id: "series", label: "Séries", icon: Clapperboard },
  { id: "radio", label: "Radio", icon: Radio },
];

export function SearchOverlay({ query, onQueryChange, allChannels, allVod, allSeries, onPlay, onTabSelect, compact }: SearchOverlayProps) {
  const [focused, setFocused] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQ = useDebounce(query, 300);

  const q = debouncedQ.toLowerCase().trim();

  const results = useMemo(() => {
    if (!q) return { tv: [], films: [], series: [], radio: [] };

    const matchTV = (filter === "all" || filter === "live")
      ? allChannels.filter(c => !c.category?.toLowerCase().includes("radio") && (c.name.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q))).slice(0, 15)
      : [];
    const matchFilms = (filter === "all" || filter === "films")
      ? allVod.filter(c => c.name.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)).slice(0, 15)
      : [];
    const matchSeries = (filter === "all" || filter === "series")
      ? allSeries.filter(c => c.name.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)).slice(0, 15)
      : [];
    const matchRadio = (filter === "all" || filter === "radio")
      ? allChannels.filter(c => c.category?.toLowerCase().includes("radio") && (c.name.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q))).slice(0, 15)
      : [];

    return { tv: matchTV, films: matchFilms, series: matchSeries, radio: matchRadio };
  }, [q, filter, allChannels, allVod, allSeries]);

  const totalResults = results.tv.length + results.films.length + results.series.length + results.radio.length;
  const showDropdown = focused && q.length > 0;

  // Close on click outside
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const ResultGroup = ({ title, icon: Icon, items, color }: { title: string; icon: typeof Tv; items: Channel[]; color: string }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-2">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Icon size={13} style={{ color }} />
          <span className="text-[11px] font-semibold" style={{ color }}>{title}</span>
          <span className="text-[10px]" style={{ color: colors.textDim }}>({items.length})</span>
        </div>
        {items.map(ch => (
          <button key={ch.id} onClick={() => { onPlay(ch); setFocused(false); onQueryChange(""); }}
            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[#1C1C24] rounded-lg">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden" style={{ background: colors.surfaceSolid2 }}>
              {ch.logo ? (
                <img src={ch.logo} className="h-5 w-5 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <span className="text-[9px] font-bold" style={{ color: colors.textMuted }}>{ch.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate" style={{ color: colors.text }}>{ch.name}</p>
              <p className="text-[9px] truncate" style={{ color: colors.textDim }}>{ch.category}</p>
            </div>
            <Play size={12} style={{ color: colors.textDim }} />
          </button>
        ))}
      </div>
    );
  };

  if (compact) {
    return (
      <div ref={containerRef} className="relative flex-1">
        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ background: colors.surfaceSolid2 }}>
          <Search size={14} style={{ color: colors.textDim }} />
          <input value={query} onChange={e => onQueryChange(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Rechercher..."
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#48484A]" style={{ color: colors.text }} />
          {query && <button onClick={() => onQueryChange("")}><X size={12} style={{ color: colors.textDim }} /></button>}
        </div>
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl max-h-[60vh] overflow-y-auto scrollbar-thin"
            style={{ background: colors.surfaceSolid, border: "1px solid #1C1C24", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            {totalResults === 0 ? (
              <p className="p-4 text-center text-[12px]" style={{ color: colors.textDim }}>Aucun résultat</p>
            ) : (
              <div className="p-2">
                <ResultGroup title="TV" icon={Tv} items={results.tv} color="#FF6D00" />
                <ResultGroup title="Films" icon={Film} items={results.films} color="#FF3B80" />
                <ResultGroup title="Séries" icon={Clapperboard} items={results.series} color="#7C3AED" />
                <ResultGroup title="Radio" icon={Radio} items={results.radio} color="#34C759" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm mx-auto">
      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: colors.surfaceSolid2, border: "1px solid #242430" }}>
        <Search size={15} style={{ color: colors.textDim }} />
        <input value={query} onChange={e => onQueryChange(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Rechercher TV, Films, Séries, Radio..."
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#48484A]" style={{ color: colors.text }} />
        {query && <button onClick={() => onQueryChange("")}><X size={14} style={{ color: colors.textDim }} /></button>}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl max-h-[70vh] overflow-hidden"
          style={{ background: colors.surfaceSolid, border: "1px solid #1C1C24", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          {/* Type filters */}
          <div className="flex items-center gap-1 p-2 border-b" style={{ borderColor: colors.surfaceSolid2 }}>
            {TYPE_FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all"
                style={filter === f.id ? { background: "rgba(255,109,0,0.15)", color: colors.orange } : { color: colors.textDim }}>
                <f.icon size={11} /> {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[calc(70vh-40px)] scrollbar-thin p-2">
            {totalResults === 0 ? (
              <p className="p-4 text-center text-[12px]" style={{ color: colors.textDim }}>Aucun résultat pour "{query}"</p>
            ) : (
              <>
                <ResultGroup title="📺 TV" icon={Tv} items={results.tv} color="#FF6D00" />
                <ResultGroup title="🎬 Films" icon={Film} items={results.films} color="#FF3B80" />
                <ResultGroup title="📺 Séries" icon={Clapperboard} items={results.series} color="#7C3AED" />
                <ResultGroup title="📻 Radio" icon={Radio} items={results.radio} color="#34C759" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
