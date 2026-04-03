import { Channel, CATEGORY_GRADIENTS } from "@/lib/channels";
import { Heart, Play, Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface ChannelGridProps {
  channels: Channel[];
  favorites: string[];
  activeChannelId?: string | null;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  viewMode: "grid" | "list";
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const GRID_BATCH_SIZE = 40;
const LIST_BATCH_SIZE = 120;

const ChannelCard = React.memo(({ ch, isFav, isActive, onPlay, onToggleFavorite }: {
  ch: Channel; isFav: boolean; isActive: boolean;
  onPlay: () => void; onToggleFavorite: () => void;
}) => (
  <div
    onClick={onPlay}
    className="group relative cursor-pointer overflow-hidden rounded-[14px] transition-all duration-200 hover:scale-[1.02]"
    style={{
      background: "#131318",
      border: `1px solid ${isActive ? "rgba(255, 109, 0, 0.5)" : "rgba(28, 28, 36, 0.5)"}`,
      boxShadow: isActive ? "0 0 20px rgba(255, 109, 0, 0.1)" : "none",
    }}
  >
    <div className={`flex h-20 items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENTS[ch.category] || "from-gray-700/30 to-gray-900/20"}`}>
      {ch.logo ? (
        <img src={ch.logo} alt={ch.name} loading="lazy" className="h-[52px] w-[52px] rounded-xl object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[ch.category] || "from-gray-600/40 to-gray-800/30"}`}>
          <span className="text-sm font-bold" style={{ color: "#F5F5F7" }}>{getInitials(ch.name)}</span>
        </div>
      )}
    </div>
    <div className="px-3 py-2.5">
      <p className="text-[11px] font-semibold truncate" style={{ color: "#F5F5F7" }}>{ch.name}</p>
      <p className="text-[9px] truncate" style={{ color: "#48484A" }}>{ch.category}</p>
    </div>

    {/* Active badge */}
    {isActive && (
      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: "rgba(52, 199, 89, 0.15)" }}>
        <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#34C759" }} />
        <span className="text-[8px] font-bold" style={{ color: "#34C759" }}>EN DIRECT</span>
      </div>
    )}

    {/* Fav button */}
    <button
      onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
      className="absolute right-2 top-2 rounded-full p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
      style={{ background: "rgba(10, 10, 15, 0.6)", backdropFilter: "blur(4px)" }}
    >
      <Heart size={11} className={isFav ? "fill-[#FF3B30] text-[#FF3B30]" : ""} style={isFav ? {} : { color: "#F5F5F7" }} />
    </button>

    {/* Play overlay */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "rgba(10, 10, 15, 0.45)" }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-orange">
        <Play size={16} className="text-white" fill="currentColor" />
      </div>
    </div>
  </div>
));
ChannelCard.displayName = "ChannelCard";

export function ChannelGrid({ channels, favorites, activeChannelId, onPlay, onToggleFavorite, viewMode }: ChannelGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const batchSize = viewMode === "list" ? LIST_BATCH_SIZE : GRID_BATCH_SIZE;
  const [visibleCount, setVisibleCount] = useState(batchSize);

  useEffect(() => {
    setVisibleCount(batchSize);
  }, [channels, viewMode, batchSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= channels.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + batchSize, channels.length));
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, channels.length, batchSize]);

  const visibleChannels = useMemo(() => channels.slice(0, visibleCount), [channels, visibleCount]);
  const hasMore = visibleCount < channels.length;

  if (channels.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm" style={{ color: "#48484A" }}>Aucune chaîne trouvée</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-0.5 p-3">
        {visibleChannels.map(ch => (
          <div
            key={ch.id}
            onClick={() => onPlay(ch)}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors hover:bg-[#131318]"
            style={activeChannelId === ch.id ? { background: "rgba(255, 109, 0, 0.06)", borderLeft: "2px solid #FF6D00" } : {}}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${CATEGORY_GRADIENTS[ch.category] || "from-gray-700/30 to-gray-900/20"}`}>
              {ch.logo ? (
                <img src={ch.logo} alt={ch.name} loading="lazy" className="h-6 w-6 rounded object-contain" />
              ) : (
                <span className="text-[10px] font-bold" style={{ color: "#F5F5F7" }}>{getInitials(ch.name)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate" style={{ color: "#F5F5F7" }}>{ch.name}</p>
              <p className="text-[10px]" style={{ color: "#48484A" }}>{ch.category}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); onToggleFavorite(ch.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart size={14} className={favorites.includes(ch.id) ? "fill-[#FF3B30] text-[#FF3B30]" : ""} style={favorites.includes(ch.id) ? {} : { color: "#48484A" }} />
            </button>
          </div>
        ))}
        {hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-4">
            <button
              onClick={() => setVisibleCount((current) => Math.min(current + batchSize, channels.length))}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-medium"
              style={{ background: "#131318", color: "#86868B", border: "1px solid #1C1C24" }}
            >
              <Loader2 size={14} className="animate-spin" />
              {visibleCount} / {channels.length}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
        {visibleChannels.map(ch => (
          <ChannelCard
            key={ch.id}
            ch={ch}
            isFav={favorites.includes(ch.id)}
            isActive={activeChannelId === ch.id}
            onPlay={() => onPlay(ch)}
            onToggleFavorite={() => onToggleFavorite(ch.id)}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-4">
          <button
            onClick={() => setVisibleCount((current) => Math.min(current + batchSize, channels.length))}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-medium"
            style={{ background: "#131318", color: "#86868B", border: "1px solid #1C1C24" }}
          >
            <Loader2 size={14} className="animate-spin" />
            Charger plus ({visibleCount} / {channels.length})
          </button>
        </div>
      )}
    </div>
  );
}
