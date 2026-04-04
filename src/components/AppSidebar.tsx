import { Tv, Film, Clapperboard, Heart, LayoutDashboard, Settings, Plus, ChevronDown, ChevronUp, Layers, RefreshCw, Trash2, QrCode, Radio, Menu } from "lucide-react";
import { Channel, getCategories } from "@/lib/channels";
import { Playlist } from "@/lib/storage";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChoufPlayLogo from "./ChoufPlayLogo";
import { Badge } from "@/components/ui/badge";
import { XtreamAccountBadge } from "./XtreamAccountBadge";
import { QRCodePortal } from "./QRCodePortal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";

interface AppSidebarProps {
  channels: Channel[];
  favorites: string[];
  activeCategory: string | null;
  activeTab: string;
  onCategorySelect: (cat: string | null) => void;
  onTabSelect: (tab: string) => void;
  onAddPlaylist: () => void;
  onDeletePlaylist: (id: string) => void;
  onRefreshPlaylist: (id: string) => void;
  playlists: Playlist[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_KEYS = [
  { id: "live", key: "nav.live", icon: Tv },
  { id: "films", key: "nav.films", icon: Film },
  { id: "series", key: "nav.series", icon: Clapperboard },
  { id: "favorites", key: "nav.favorites", icon: Heart },
  { id: "radio", key: "nav.radio", icon: Radio },
];

export function AppSidebar({
  channels, favorites, activeCategory, activeTab,
  onCategorySelect, onTabSelect, onAddPlaylist,
  onDeletePlaylist, onRefreshPlaylist, playlists, collapsed, onToggleCollapse
}: AppSidebarProps) {
  const { t } = useI18n();
  const NAV_ITEMS = NAV_KEYS.map(n => ({ ...n, label: t(n.key) }));
  const [catOpen, setCatOpen] = useState(true);
  const [listsOpen, setListsOpen] = useState(true);
  const [hoverPlaylist, setHoverPlaylist] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const categories = getCategories(channels);
  const navigate = useNavigate();

  // Collapsed mode with tooltips
  if (collapsed) {
    return (
      <TooltipProvider delayDuration={200}>
        <aside className="flex h-screen w-16 flex-col items-center border-r py-4" style={{ background: "rgba(19,19,24,0.85)", backdropFilter: "blur(20px)", borderColor: "#1C1C24" }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onToggleCollapse} className="mb-6 transition-transform hover:scale-110">
                <Menu size={20} style={{ color: "#C9A84C" }} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right"><p>{t("sidebar.open")}</p></TooltipContent>
          </Tooltip>

          <nav className="flex flex-col items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onTabSelect(item.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-all"
                    style={activeTab === item.id
                      ? { background: "rgba(255,109,0,0.12)", color: "#FF6D00" }
                      : { color: "#86868B" }
                    }
                  >
                    <item.icon size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
              </Tooltip>
            ))}
          </nav>

          <div className="mt-auto flex flex-col items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => navigate("/dashboard")} className="flex h-11 w-11 items-center justify-center rounded-xl text-[#86868B] hover:text-[#F5F5F7] transition-colors">
                  <LayoutDashboard size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Dashboard</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => navigate("/settings")} className="flex h-11 w-11 items-center justify-center rounded-xl text-[#86868B] hover:text-[#F5F5F7] transition-colors">
                  <Settings size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Paramètres</p></TooltipContent>
            </Tooltip>
          </div>
        </aside>
      </TooltipProvider>
    );
  }

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r overflow-hidden" style={{ background: "rgba(19,19,24,0.85)", backdropFilter: "blur(20px)", borderColor: "#1C1C24" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button onClick={onToggleCollapse} className="shrink-0 transition-transform hover:scale-110" title="Réduire">
          <Menu size={20} style={{ color: "#C9A84C" }} />
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
                  activeTab === item.id ? "font-semibold" : "font-medium hover:bg-[#1C1C24]"
                }`}
                style={activeTab === item.id ? { background: "rgba(255,109,0,0.1)", color: "#FF6D00" } : { color: "#86868B" }}
              >
                <item.icon size={17} style={activeTab === item.id ? { filter: "drop-shadow(0 0 4px rgba(255,109,0,0.4))" } : {}} />
                <span>{item.label}</span>
                {count != null && count > 0 && (
                  <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,109,0,0.15)", color: "#FF6D00" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mx-2 my-2 h-px" style={{ background: "#1C1C24" }} />

        {/* Categories */}
        {activeTab === "live" && (
          <div className="mb-2">
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#48484A" }}
            >
              <span>{t("cat.categories")}</span>
              {catOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {catOpen && (
              <div className="mt-0.5 space-y-0.5 max-h-48 overflow-y-auto scrollbar-thin">
                <button
                  onClick={() => onCategorySelect(null)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[12px] transition-colors ${!activeCategory ? "font-medium" : "hover:bg-[#1C1C24]"}`}
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
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[12px] transition-colors ${activeCategory === cat ? "font-medium" : "hover:bg-[#1C1C24]"}`}
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
                  className="group rounded-lg px-3 py-2 text-[12px] transition-colors hover:bg-[#1C1C24] cursor-pointer"
                  style={{ color: "#86868B" }}
                  onMouseEnter={() => setHoverPlaylist(p.id)}
                  onMouseLeave={() => setHoverPlaylist(null)}
                >
                  <div className="flex items-start gap-2">
                    <Layers size={14} className="mt-0.5 shrink-0" style={{ color: "#48484A" }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate flex-1">{p.name}</span>
                        {p.isXtream && <Badge variant="outline" className="border-[#FF6D0030] bg-[#FF6D0012] text-[9px] uppercase tracking-wide" style={{ color: "#FF6D00" }}>Xtream</Badge>}
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
                      <XtreamAccountBadge playlist={p} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onAddPlaylist}
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors hover:bg-[#1C1C24]"
                  style={{ color: "#FF6D00", border: "1px solid #1C1C24" }}
                >
                  <Plus size={14} />
                  <span>Ajouter</span>
                </button>
                <button
                  onClick={() => setQrOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors hover:bg-[#1C1C24]"
                  style={{ color: "#C9A84C", border: "1px solid #1C1C24" }}
                >
                  <QrCode size={14} />
                  <span>À distance</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t px-2.5 py-2 space-y-0.5" style={{ borderColor: "#1C1C24" }}>
        <button onClick={() => navigate("/demo")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[#1C1C24]" style={{ color: "#FF6D00" }}>
          <Tv size={17} />
          <span>Chaînes Démo</span>
        </button>
        <button onClick={() => navigate("/dashboard")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[#1C1C24]" style={{ color: "#86868B" }}>
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </button>
        <button onClick={() => navigate("/settings")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors hover:bg-[#1C1C24]" style={{ color: "#86868B" }}>
          <Settings size={17} />
          <span>Paramètres</span>
        </button>
      </div>
      <QRCodePortal open={qrOpen} onClose={() => setQrOpen(false)} />
    </aside>
  );
}
