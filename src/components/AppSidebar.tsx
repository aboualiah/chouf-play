import { Tv, Film, Clapperboard, Heart, LayoutDashboard, Settings, Plus, ChevronDown, ChevronUp, Radio, Star, Clock, Layers, RefreshCw, Trash2 } from "lucide-react";
import { Channel, getCategories } from "@/lib/channels";
import { Playlist } from "@/lib/storage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChoufPlayLogo from "./ChoufPlayLogo";

interface AppSidebarProps {
  channels: Channel[];
  favorites: string[];
  activeCategory: string | null;
  activeTab: string;
  activeSubTab: string;
  onCategorySelect: (cat: string | null) => void;
  onTabSelect: (tab: string) => void;
  onSubTabSelect: (tab: string) => void;
  onAddPlaylist: () => void;
  onDeletePlaylist: (id: string) => void;
  onRefreshPlaylist: (id: string) => void;
  playlists: Playlist[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS = [
  { id: "live", label: "TV en direct", icon: Tv },
  { id: "films", label: "Films", icon: Film },
  { id: "series", label: "Séries", icon: Clapperboard },
  { id: "favorites", label: "Favoris", icon: Heart },
];

const SUB_TABS = [
  { id: "all", label: "Toutes les chaînes", icon: Radio },
  { id: "favorites", label: "Favoris", icon: Star },
  { id: "recent", label: "Récentes", icon: Clock },
];

export function AppSidebar({
  channels, favorites, activeCategory, activeTab, activeSubTab,
  onCategorySelect, onTabSelect, onSubTabSelect, onAddPlaylist,
  onDeletePlaylist, onRefreshPlaylist, playlists, collapsed, onToggleCollapse
}: AppSidebarProps) {
  const [catOpen, setCatOpen] = useState(true);
  const [listsOpen, setListsOpen] = useState(true);
  const [hoverPlaylist, setHoverPlaylist] = useState<string | null>(null);
  const categories = getCategories(channels);
  const navigate = useNavigate();

  if (collapsed) {
    return (
      <aside className="flex h-screen w-16 flex-col items-center border-r py-4" style={{ background: "#131318", borderColor: "#1C1C24" }}>
        <button onClick={onToggleCollapse} className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-orange">
          <span className="text-xs font-black text-white">CP</span>
        </button>
        <nav className="flex flex-col items-center gap-1.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onTabSelect(item.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                activeTab === item.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={activeTab === item.id ? { background: "hsl(24 100% 50% / 0.1)" } : {}}
            >
              <item.icon size={20} />
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-1.5">
          <button onClick={() => navigate("/dashboard")} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <LayoutDashboard size={18} />
          </button>
          <button onClick={() => navigate("/settings")} className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r overflow-hidden" style={{ background: "#131318", borderColor: "#1C1C24" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button onClick={onToggleCollapse} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-orange glow-orange-soft">
          <span className="text-xs font-black text-white">CP</span>
        </button>
        <div className="min-w-0">
          <h1 className="text-base leading-tight">
            <span className="font-black" style={{ color: "#F5F5F7" }}>CHOUF</span>
            <span className="font-light" style={{ color: "#FF6D00" }}>Play</span>
          </h1>
          <p className="text-[8px] font-medium uppercase" style={{ color: "#C9A84C", letterSpacing: "2px" }}>IPTV PLAYER</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2.5 pb-3">
        {/* Main navigation */}
        <nav className="mb-1 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const count = item.id === "favorites" ? favorites.length
              : item.id === "films" ? playlists.reduce((s, p) => s + (p.vodStreams?.length || 0), 0)
              : item.id === "series" ? playlists.reduce((s, p) => s + (p.series?.length || 0), 0)
              : null;
            return (
              <button
                key={item.id}
                onClick={() => onTabSelect(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all ${
                  activeTab === item.id
                    ? "font-semibold"
                    : "font-medium hover:bg-[#1C1C24]"
                }`}
                style={activeTab === item.id ? { background: "hsl(24 100% 50% / 0.1)", color: "#FF6D00" } : { color: "#86868B" }}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
                {count != null && count > 0 && (
                  <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "hsl(24 100% 50% / 0.15)", color: "#FF6D00" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="mx-2 my-2 h-px" style={{ background: "#1C1C24" }} />

        {/* Sub tabs for Live */}
        {activeTab === "live" && (
          <div className="mb-2 space-y-0.5">
            {SUB_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => onSubTabSelect(t.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-[12px] transition-all ${
                  activeSubTab === t.id ? "font-medium" : "hover:bg-[#1C1C24]"
                }`}
                style={activeSubTab === t.id ? { color: "#FF6D00" } : { color: "#48484A" }}
              >
                <t.icon size={14} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Categories */}
        {activeTab === "live" && (
          <div className="mb-2">
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#48484A" }}
            >
              <span>Catégories</span>
              {catOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {catOpen && (
              <div className="mt-0.5 space-y-0.5">
                <button
                  onClick={() => onCategorySelect(null)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[12px] transition-colors ${
                    !activeCategory ? "font-medium" : "hover:bg-[#1C1C24]"
                  }`}
                  style={!activeCategory ? { color: "#FF6D00" } : { color: "#86868B" }}
                >
                  <span>Toutes</span>
                  <span className="text-[10px]" style={{ color: "#48484A" }}>{channels.length}</span>
                </button>
                {categories.map(cat => {
                  const count = channels.filter(c => c.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => onCategorySelect(cat)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[12px] transition-colors ${
                        activeCategory === cat ? "font-medium" : "hover:bg-[#1C1C24]"
                      }`}
                      style={activeCategory === cat ? { color: "#FF6D00" } : { color: "#86868B" }}
                    >
                      <span className="truncate">{cat}</span>
                      <span className="text-[10px]" style={{ color: "#48484A" }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Separator */}
        <div className="mx-2 my-2 h-px" style={{ background: "#1C1C24" }} />

        {/* Mes Listes */}
        <div>
          <button
            onClick={() => setListsOpen(!listsOpen)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "#48484A" }}
          >
            <span>Mes Listes</span>
            {listsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {listsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {playlists.map(p => (
                <div
                  key={p.id}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] transition-colors hover:bg-[#1C1C24] cursor-pointer"
                  style={{ color: "#86868B" }}
                  onMouseEnter={() => setHoverPlaylist(p.id)}
                  onMouseLeave={() => setHoverPlaylist(null)}
                >
                  <Layers size={14} className="shrink-0" style={{ color: "#48484A" }} />
                  <span className="truncate flex-1">{p.name}</span>
                  {hoverPlaylist === p.id ? (
                    <div className="flex gap-0.5">
                      <button onClick={(e) => { e.stopPropagation(); onRefreshPlaylist(p.id); }} className="rounded p-0.5 hover:bg-[#242430]">
                        <RefreshCw size={11} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeletePlaylist(p.id); }} className="rounded p-0.5 hover:bg-[#242430] text-destructive">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px]" style={{ color: "#48484A" }}>
                      {p.channels.length + (p.vodStreams?.length || 0) + (p.series?.length || 0)}
                    </span>
                  )}
                </div>
              ))}
              <button
                onClick={onAddPlaylist}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors hover:bg-[#1C1C24]"
                style={{ color: "#FF6D00" }}
              >
                <Plus size={14} />
                <span>Ajouter une liste</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t px-2.5 py-2 space-y-0.5" style={{ borderColor: "#1C1C24" }}>
        <button onClick={() => navigate("/dashboard")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[#1C1C24]" style={{ color: "#86868B" }}>
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </button>
        <button onClick={() => navigate("/settings")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[#1C1C24]" style={{ color: "#86868B" }}>
          <Settings size={17} />
          <span>Paramètres</span>
        </button>
      </div>
    </aside>
  );
}
