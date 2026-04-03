import { useState, useEffect, useMemo, useCallback } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { ChannelGrid } from "@/components/ChannelGrid";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PlaylistModal } from "@/components/PlaylistModal";
import { MatchCarousel } from "@/components/MatchCarousel";
import { EmptyState } from "@/components/EmptyState";
import { DEMO_CHANNELS, Channel } from "@/lib/channels";
import { getFavorites, toggleFavorite, getPlaylists, savePlaylists, addRecent, Playlist } from "@/lib/storage";
import { XtreamPlaylistData } from "@/lib/xtream";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDebounce } from "@/hooks/useDebounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { toast } from "sonner";

export default function Index() {
  const [splash, setSplash] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("live");
  const [activeSubTab, setActiveSubTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [playlists, setPlaylists] = useState<Playlist[]>(getPlaylists());
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleTabSelect = useCallback((tab: string) => {
    setActiveTab(tab);
    setActiveCategory(null);
    if (isMobile) setMobileDrawerOpen(false);
  }, [isMobile]);

  const handleCategorySelect = useCallback((cat: string | null) => {
    setActiveCategory(cat);
    if (isMobile) setMobileDrawerOpen(false);
  }, [isMobile]);

  const allChannels = useMemo(() => {
    const base = demoLoaded ? DEMO_CHANNELS : [];
    const extra = playlists.flatMap(p => p.channels);
    return [...base, ...extra];
  }, [playlists, demoLoaded]);

  const allVod = useMemo(() => playlists.flatMap(p => p.vodStreams || []), [playlists]);
  const allSeries = useMemo(() => playlists.flatMap(p => p.series || []), [playlists]);

  const contentForTab = useMemo(() => {
    switch (activeTab) {
      case "films": return allVod;
      case "series": return allSeries;
      case "favorites": return [...allChannels, ...allVod, ...allSeries].filter(c => favorites.includes(c.id));
      default: return allChannels;
    }
  }, [activeTab, allChannels, allVod, allSeries, favorites]);

  const filteredChannels = useMemo(() => {
    let chs = contentForTab;
    if (activeCategory) chs = chs.filter(c => c.category === activeCategory);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      chs = chs.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    return chs;
  }, [contentForTab, activeCategory, debouncedSearch]);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites(toggleFavorite(id));
  }, []);

  const handlePlay = useCallback((channel: Channel) => {
    setActiveChannel(channel);
    addRecent(channel.id);
    if (isMobile) setMobileDrawerOpen(false);
  }, [isMobile]);

  const handleLoadDemo = useCallback(() => {
    setDemoLoaded(true);
    toast.success("24 chaînes démo chargées");
  }, []);

  const handlePlaylistLoaded = useCallback((name: string, channels: Channel[], xtreamData?: XtreamPlaylistData) => {
    const newPlaylist: Playlist = {
      id: xtreamData ? `xt_${Date.now()}` : `pl_${Date.now()}`,
      name, channels, addedAt: Date.now(),
      isXtream: !!xtreamData,
      xtreamCredentials: xtreamData?.credentials,
      xtreamAccountInfo: xtreamData?.accountInfo,
      xtreamMac: xtreamData?.mac,
      vodStreams: xtreamData?.vodStreams || [],
      series: xtreamData?.series || [],
    };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    savePlaylists(updated);
  }, [playlists]);

  const handleDeletePlaylist = useCallback((id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    setPlaylists(updated);
    savePlaylists(updated);
    toast.success("Playlist supprimée");
  }, [playlists]);

  const handlePrevChannel = useCallback(() => {
    if (!activeChannel) return;
    const idx = filteredChannels.findIndex(c => c.id === activeChannel.id);
    if (idx > 0) handlePlay(filteredChannels[idx - 1]);
  }, [activeChannel, filteredChannels, handlePlay]);

  const handleNextChannel = useCallback(() => {
    if (!activeChannel) return;
    const idx = filteredChannels.findIndex(c => c.id === activeChannel.id);
    if (idx < filteredChannels.length - 1) handlePlay(filteredChannels[idx + 1]);
  }, [activeChannel, filteredChannels, handlePlay]);

  useKeyboardShortcuts({
    onToggleFavorite: activeChannel ? () => handleToggleFavorite(activeChannel.id) : undefined,
    onBack: activeChannel ? () => setActiveChannel(null) : undefined,
    onTogglePlay: activeChannel ? () => {
      const v = document.querySelector("video");
      if (v) v.paused ? v.play() : v.pause();
    } : undefined,
    onPrevChannel: handlePrevChannel,
    onNextChannel: handleNextChannel,
    onToggleFullscreen: activeChannel ? () => {
      const c = document.querySelector("[data-player-container]");
      if (c) {
        if (document.fullscreenElement) document.exitFullscreen();
        else (c as HTMLElement).requestFullscreen();
      }
    } : undefined,
  });

  const hasContent = allChannels.length > 0 || allVod.length > 0 || allSeries.length > 0;

  const sidebarContent = (
    <AppSidebar
      channels={activeTab === "films" ? allVod : activeTab === "series" ? allSeries : allChannels}
      favorites={favorites}
      activeCategory={activeCategory}
      activeTab={activeTab}
      activeSubTab={activeSubTab}
      onCategorySelect={handleCategorySelect}
      onTabSelect={handleTabSelect}
      onSubTabSelect={setActiveSubTab}
      onAddPlaylist={() => setPlaylistModalOpen(true)}
      onDeletePlaylist={handleDeletePlaylist}
      onRefreshPlaylist={() => {}}
      playlists={playlists}
      collapsed={!isMobile && sidebarCollapsed}
      onToggleCollapse={() => isMobile ? setMobileDrawerOpen(false) : setSidebarCollapsed(!sidebarCollapsed)}
    />
  );

  return (
    <>
      <SplashScreen show={splash} />

      {!splash && (
        <div className="flex h-screen w-full overflow-hidden" style={{ background: "#0A0A0F" }}>
          {/* Desktop sidebar */}
          <div className="hidden md:flex">{sidebarContent}</div>

          {/* Mobile drawer */}
          <AnimatePresence>
            {isMobile && mobileDrawerOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)" }}
                  onClick={() => setMobileDrawerOpen(false)} />
                <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                  transition={{ type: "spring", damping: 25, stiffness: 250 }}
                  className="fixed left-0 top-0 z-50 h-full">
                  {sidebarContent}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Mobile header */}
            {isMobile && !activeChannel && (
              <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid #1C1C24", background: "rgba(10,10,15,0.8)" }}>
                <button onClick={() => setMobileDrawerOpen(true)} className="rounded-lg p-2" style={{ background: "#131318", color: "#86868B" }}>
                  <Menu size={18} />
                </button>
                <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} viewMode={viewMode} onViewModeChange={setViewMode}
                  activeTab={activeTab} onTabSelect={handleTabSelect} compact />
              </div>
            )}

            {/* Desktop header */}
            {!isMobile && !activeChannel && (
              <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} viewMode={viewMode} onViewModeChange={setViewMode}
                activeTab={activeTab} onTabSelect={handleTabSelect} />
            )}

            <div className="flex flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeChannel ? (
                  <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1">
                    {/* Split view channel list */}
                    <div className="hidden w-[340px] flex-col border-r lg:flex overflow-y-auto scrollbar-thin" style={{ background: "#131318", borderColor: "#1C1C24" }}>
                      <div className="p-3" style={{ borderBottom: "1px solid #1C1C24" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#48484A" }}>Chaînes</p>
                      </div>
                      {filteredChannels.map((ch, i) => (
                        <button
                          key={ch.id}
                          onClick={() => handlePlay(ch)}
                          className="flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#1C1C24]"
                          style={activeChannel?.id === ch.id ? { background: "rgba(255,109,0,0.06)", borderLeft: "2px solid #FF6D00" } : {}}
                        >
                          <span className="text-[10px] font-mono w-5 text-right" style={{ color: "#48484A" }}>{i + 1}</span>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "#1C1C24" }}>
                            {ch.logo ? (
                              <img src={ch.logo} loading="lazy" className="h-6 w-6 rounded object-contain" alt="" />
                            ) : (
                              <span className="text-[10px] font-bold" style={{ color: "#86868B" }}>
                                {ch.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-medium truncate" style={{ color: "#F5F5F7" }}>{ch.name}</p>
                            <p className="text-[10px]" style={{ color: "#48484A" }}>{ch.category}</p>
                          </div>
                          {activeChannel?.id === ch.id && (
                            <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#FF3B30" }} />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Player */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex-1">
                        <VideoPlayer
                          channel={activeChannel}
                          isFavorite={favorites.includes(activeChannel.id)}
                          onBack={() => setActiveChannel(null)}
                          onToggleFavorite={() => handleToggleFavorite(activeChannel.id)}
                          onPrev={handlePrevChannel}
                          onNext={handleNextChannel}
                        />
                      </div>
                      {/* Now playing bar */}
                      <div className="flex items-center gap-3 px-4 py-2" style={{ background: "#131318", borderTop: "1px solid #1C1C24" }}>
                        <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#34C759" }} />
                        <span className="text-[12px] font-medium flex-1 truncate" style={{ color: "#F5F5F7" }}>{activeChannel.name}</span>
                        <div className="flex gap-2">
                          {[
                            { color: "#FF3B30", glow: "rgba(255,59,48,0.3)" },
                            { color: "#34C759", glow: "rgba(52,199,89,0.3)" },
                            { color: "#FFD60A", glow: "rgba(255,214,10,0.3)" },
                            { color: "#007AFF", glow: "rgba(0,122,255,0.3)" },
                          ].map((dot, i) => (
                            <div key={i} className="h-3 w-3 rounded-full" style={{ background: dot.color, boxShadow: `0 0 6px ${dot.glow}` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : !hasContent ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
                    <EmptyState onAddPlaylist={() => setPlaylistModalOpen(true)} onLoadDemo={handleLoadDemo} />
                  </motion.div>
                ) : (
                  <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 overflow-y-auto scrollbar-thin">
                    {activeTab === "live" && <MatchCarousel />}
                    <ChannelGrid
                      channels={filteredChannels}
                      favorites={favorites}
                      activeChannelId={activeChannel?.id}
                      onPlay={handlePlay}
                      onToggleFavorite={handleToggleFavorite}
                      viewMode={viewMode}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <PlaylistModal
            open={playlistModalOpen}
            onClose={() => setPlaylistModalOpen(false)}
            onPlaylistLoaded={handlePlaylistLoaded}
            onLoadDemo={handleLoadDemo}
          />
        </div>
      )}
    </>
  );
}
