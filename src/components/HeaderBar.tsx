import { LayoutGrid, List, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchOverlay } from "./SearchOverlay";
import { Channel } from "@/lib/channels";
import ChoufPlayLogo from "./ChoufPlayLogo";

interface HeaderBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (m: "grid" | "list") => void;
  activeTab: string;
  onTabSelect: (tab: string) => void;
  compact?: boolean;
  allChannels?: Channel[];
  allVod?: Channel[];
  allSeries?: Channel[];
  onPlay?: (ch: Channel) => void;
  onBackToDashboard?: () => void;
}

const TABS = [
  { id: "live", label: "TV en direct" },
  { id: "films", label: "Films" },
  { id: "series", label: "Séries" },
  { id: "favorites", label: "Favoris" },
];

const APPLE_FONT = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function HeaderBar({ searchQuery, onSearchChange, viewMode, onViewModeChange, activeTab, onTabSelect, compact, allChannels = [], allVod = [], allSeries = [], onPlay, onBackToDashboard }: HeaderBarProps) {
  const now = useClock();
  const time = now.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  const handlePlay = onPlay || (() => {});

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <SearchOverlay query={searchQuery} onQueryChange={onSearchChange}
          allChannels={allChannels} allVod={allVod} allSeries={allSeries}
          onPlay={handlePlay} onTabSelect={onTabSelect} compact />
      </div>
    );
  }

  return (
    <header
      className="flex items-center gap-4 px-5 py-2.5"
      style={{
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1C1C24",
      }}
    >
      {/* Back to dashboard */}
      {onBackToDashboard && (
        <button onClick={onBackToDashboard} className="rounded-lg p-2 transition-colors hover:bg-white/5" style={{ color: "#FF6D00" }}>
          <ArrowLeft size={18} />
        </button>
      )}
      {/* Tabs */}
      <div className="flex items-center gap-0.5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className="relative px-3 py-2 text-[13px] font-medium transition-colors"
            style={{ color: activeTab === tab.id ? "#FF6D00" : "#86868B" }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full" style={{ background: "#FF6D00" }} />
            )}
          </button>
        ))}
      </div>

      {/* Search with overlay */}
      <SearchOverlay query={searchQuery} onQueryChange={onSearchChange}
        allChannels={allChannels} allVod={allVod} allSeries={allSeries}
        onPlay={handlePlay} onTabSelect={onTabSelect} />

      {/* View toggle + weather + clock */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg p-0.5" style={{ background: "#1C1C24" }}>
          <button
            onClick={() => onViewModeChange("grid")}
            className="rounded-md p-1.5 transition-colors"
            style={viewMode === "grid" ? { background: "#242430", color: "#F5F5F7" } : { color: "#48484A" }}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className="rounded-md p-1.5 transition-colors"
            style={viewMode === "list" ? { background: "#242430", color: "#F5F5F7" } : { color: "#48484A" }}
          >
            <List size={15} />
          </button>
        </div>

        

        <div className="text-right hidden sm:block">
          <p className="text-[14px] font-semibold tabular-nums tracking-tight" style={{ color: "#F5F5F7", fontFamily: APPLE_FONT, letterSpacing: "-0.02em" }}>{time}</p>
          <p className="text-[10px] capitalize" style={{ color: "#48484A", fontFamily: APPLE_FONT }}>{date}</p>
        </div>
      </div>
    </header>
  );
}
