import { Tv, Film, Clapperboard, Heart, LayoutDashboard, Settings, Plus, ChevronDown, Radio, Star, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Channel, getCategories } from "@/lib/channels";
import { useState } from "react";
import { TvIcon } from "./TvIcon";
import { Playlist } from "@/lib/storage";

interface AppSidebarProps {
  channels: Channel[];
  favorites: string[];
  activeCategory: string | null;
  activeTab: string;
  onCategorySelect: (cat: string | null) => void;
  onTabSelect: (tab: string) => void;
  onAddPlaylist: () => void;
  playlists: Playlist[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS = [
  { id: "live", label: "TV en direct", icon: Tv, count: null },
  { id: "films", label: "Films", icon: Film, count: 0 },
  { id: "series", label: "Séries", icon: Clapperboard, count: 0 },
];

const SUB_TABS = [
  { id: "all", label: "Toutes", icon: Radio },
  { id: "favorites", label: "Favoris", icon: Star },
  { id: "recent", label: "Récentes", icon: Clock },
];

function formatExpiry(expTimestamp: string | number | undefined) {
  if (!expTimestamp) return null;
  const exp = new Date(Number(expTimestamp) * 1000);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const dateStr = exp.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  let color = "text-success";
  if (diffDays < 0) color = "text-destructive";
  else if (diffDays < 7) color = "text-warning";

  return { dateStr, diffDays, color, expired: diffDays < 0 };
}

export function AppSidebar({
  channels, favorites, activeCategory, activeTab, onCategorySelect,
  onTabSelect, onAddPlaylist, playlists, collapsed, onToggleCollapse
}: AppSidebarProps) {
  const [catOpen, setCatOpen] = useState(true);
  const categories = getCategories(channels);

  if (collapsed) {
    return (
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: 64 }}
        className="flex h-screen flex-col border-r border-border bg-card py-4"
      >
        <button onClick={onToggleCollapse} className="mx-auto mb-6">
          <TvIcon size={40} showStand={false} />
        </button>
        <nav className="flex flex-col items-center gap-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onTabSelect(item.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${activeTab === item.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <item.icon size={20} />
            </button>
          ))}
          <button
            onClick={() => onTabSelect("favorites")}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${activeTab === "favorites" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Heart size={20} />
          </button>
        </nav>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ width: 64 }}
      animate={{ width: 260 }}
      className="flex h-screen w-[260px] flex-col border-r border-border bg-card overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <button onClick={onToggleCollapse} className="shrink-0">
          <TvIcon size={40} showStand={false} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold leading-tight text-foreground">CHOUF<span className="font-light text-primary">Play</span></h1>
          <p className="text-[10px] tracking-[0.15em] text-muted-foreground">IPTV PLAYER</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">
        {/* Main Nav */}
        <div className="mb-1">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Navigation</p>
          {NAV_ITEMS.map(item => {
            const count = item.id === "films"
              ? playlists.reduce((s, p) => s + (p.vodStreams?.length || 0), 0)
              : item.id === "series"
                ? playlists.reduce((s, p) => s + (p.series?.length || 0), 0)
                : null;
            return (
              <button
                key={item.id}
                onClick={() => onTabSelect(item.id)}
                className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${activeTab === item.id ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {count != null && count > 0 && (
                  <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">{count}</span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => onTabSelect("favorites")}
            className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${activeTab === "favorites" ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          >
            <Heart size={18} />
            <span>Favoris</span>
            {favorites.length > 0 && (
              <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">{favorites.length}</span>
            )}
          </button>
        </div>

        {/* Sub tabs for Live */}
        {activeTab === "live" && (
          <div className="mb-3">
            <div className="flex gap-1 rounded-lg bg-secondary p-1">
              {SUB_TABS.map(t => (
                <button key={t.id} className="flex-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground"
                  data-active={(activeCategory === null && t.id === "all") ? true : undefined}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {(activeTab === "live" || activeTab === "films" || activeTab === "series") && (
          <div className="mb-3">
            <button onClick={() => setCatOpen(!catOpen)} className="mb-1 flex w-full items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Catégories</span>
              <ChevronDown size={12} className={`transition-transform ${catOpen ? "" : "-rotate-90"}`} />
            </button>
            {catOpen && (
              <div className="space-y-0.5">
                <button
                  onClick={() => onCategorySelect(null)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${activeCategory === null ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  Toutes ({channels.length})
                </button>
                {categories.map(cat => {
                  const count = channels.filter(c => c.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => onCategorySelect(cat)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${activeCategory === cat ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                    >
                      <span className="truncate">{cat}</span>
                      <span className="text-[10px]">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Playlists */}
        <div>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mes Listes</p>
          {playlists.map(p => {
            const expiry = p.isXtream && p.xtreamAccountInfo ? formatExpiry(p.xtreamAccountInfo.exp_date) : null;
            return (
              <div key={p.id} className="mb-2 rounded-lg bg-secondary/50 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                  <Radio size={14} className="shrink-0" />
                  <span className="truncate flex-1">{p.name}</span>
                  <span className="text-[10px]">{p.channels.length + (p.vodStreams?.length || 0) + (p.series?.length || 0)}</span>
                </div>

                {/* Xtream account info */}
                {p.isXtream && (
                  <div className="px-3 pb-2 space-y-0.5">
                    {p.xtreamMac && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        📡 MAC: <span className="font-mono text-foreground/70">{p.xtreamMac}</span>
                      </p>
                    )}
                    {p.xtreamAccountInfo && (
                      <>
                        <p className={`text-[10px] flex items-center gap-1 ${expiry?.color || "text-muted-foreground"}`}>
                          {expiry?.expired ? (
                            <><AlertTriangle size={10} className="text-destructive" /> Expiré</>
                          ) : (
                            <>🟢 Actif</>
                          )}
                          {expiry && (
                            <span className="text-muted-foreground">
                              {" "}| Exp: {expiry.dateStr} ({expiry.diffDays > 0 ? `${expiry.diffDays}j` : "expiré"})
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          🔗 Max: {p.xtreamAccountInfo.max_connections || "?"} connexions
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={onAddPlaylist}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus size={16} />
            <span>Ajouter une liste</span>
          </button>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3 space-y-0.5">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <Settings size={18} />
          <span>Paramètres</span>
        </button>
      </div>
    </motion.aside>
  );
}
