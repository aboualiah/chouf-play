import { Channel } from "@/lib/channels";
import { Heart, Play } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface ChannelGridProps {
  channels: Channel[];
  favorites: string[];
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  viewMode: "grid" | "list";
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const CATEGORY_COLORS: Record<string, string> = {
  "Religion": "from-amber-900/40 to-amber-800/20",
  "Info FR": "from-blue-900/40 to-blue-800/20",
  "Info EN": "from-indigo-900/40 to-indigo-800/20",
  "Info AR": "from-emerald-900/40 to-emerald-800/20",
  "Info DE": "from-red-900/40 to-red-800/20",
  "Sport": "from-orange-900/40 to-orange-800/20",
  "Culture": "from-purple-900/40 to-purple-800/20",
};

const ChannelCard = React.memo(({ ch, isFav, onPlay, onToggleFavorite }: {
  ch: Channel;
  isFav: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    onClick={onPlay}
    className="group relative cursor-pointer overflow-hidden rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:scale-[1.02]"
  >
    <div className={`flex h-20 sm:h-24 items-center justify-center bg-gradient-to-br ${CATEGORY_COLORS[ch.category] || "from-muted to-secondary"}`}>
      {ch.logo ? (
        <img src={ch.logo} alt={ch.name} loading="lazy" className="h-12 w-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <span className="text-xl sm:text-2xl font-bold text-foreground/80">{getInitials(ch.name)}</span>
      )}
    </div>
    <div className="p-2 sm:p-3">
      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{ch.name}</p>
      <p className="text-[10px] text-muted-foreground truncate">{ch.category}</p>
    </div>
    <button
      onClick={e => { e.stopPropagation(); onToggleFavorite(); }}
      className="absolute right-2 top-2 rounded-full bg-background/60 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
    >
      <Heart size={12} className={isFav ? "fill-destructive text-destructive" : "text-foreground"} />
    </button>
    <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
      <div className="rounded-full bg-primary p-2.5 sm:p-3">
        <Play size={18} className="text-primary-foreground" fill="currentColor" />
      </div>
    </div>
  </motion.div>
));
ChannelCard.displayName = "ChannelCard";

const ChannelListItem = React.memo(({ ch, isFav, index, onPlay, onToggleFavorite }: {
  ch: Channel;
  isFav: boolean;
  index: number;
  onPlay: () => void;
  onToggleFavorite: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: Math.min(index * 0.02, 0.5) }}
    className="group flex items-center gap-3 rounded-lg bg-card px-3 sm:px-4 py-3 cursor-pointer hover:bg-secondary transition-colors"
    onClick={onPlay}
  >
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[ch.category] || "from-muted to-secondary"}`}>
      {ch.logo ? (
        <img src={ch.logo} alt={ch.name} loading="lazy" className="h-6 w-6 object-contain" />
      ) : (
        <span className="text-xs font-bold text-foreground">{getInitials(ch.name)}</span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{ch.name}</p>
      <p className="text-[11px] text-muted-foreground">{ch.category}</p>
    </div>
    <button onClick={e => { e.stopPropagation(); onToggleFavorite(); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
      <Heart size={16} className={isFav ? "fill-destructive text-destructive" : "text-muted-foreground"} />
    </button>
    <Play size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
));
ChannelListItem.displayName = "ChannelListItem";

export function ChannelGrid({ channels, favorites, onPlay, onToggleFavorite, viewMode }: ChannelGridProps) {
  if (channels.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground p-8">
        <p>Aucune chaîne trouvée</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-1 p-3 sm:p-4">
        {channels.map((ch, i) => (
          <ChannelListItem
            key={ch.id}
            ch={ch}
            isFav={favorites.includes(ch.id)}
            index={i}
            onPlay={() => onPlay(ch)}
            onToggleFavorite={() => onToggleFavorite(ch.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-3 sm:p-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {channels.map((ch) => (
        <ChannelCard
          key={ch.id}
          ch={ch}
          isFav={favorites.includes(ch.id)}
          onPlay={() => onPlay(ch)}
          onToggleFavorite={() => onToggleFavorite(ch.id)}
        />
      ))}
    </div>
  );
}
