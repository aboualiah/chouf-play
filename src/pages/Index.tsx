import { useState, useEffect, useMemo, useCallback } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { ChannelGrid } from "@/components/ChannelGrid";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PlaylistModal } from "@/components/PlaylistModal";
import { MatchCarousel } from "@/components/MatchCarousel";
import { DEMO_CHANNELS, Channel } from "@/lib/channels";
import { getFavorites, toggleFavorite, getPlaylists, savePlaylists, addRecent, getRecent, Playlist } from "@/lib/storage";
import { XtreamPlaylistData } from "@/lib/xtream";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { motion, AnimatePresence } from "framer-motion";

export default function Index() {
  const [splash, setSplash] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("live");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [playlists, setPlaylists] = useState<Playlist[]>(getPlaylists());
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [recentIds] = useState<string[]>(getRecent());

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // All channels including Xtream
  const allChannels = useMemo(() => {
    const extra = playlists.flatMap(p => p.channels);
    return [...DEMO_CHANNELS, ...extra];
  }, [playlists]);

  // All VOD
  const allVod = useMemo(() => {
    return playlists.flatMap(p => p.vodStreams || []);
  }, [playlists]);

  // All Series
  const allSeries = useMemo(() => {
    return playlists.flatMap(p => p.series || []);
  }, [playlists]);

  // Content based on active tab
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

    if (activeCategory) {
      chs = chs.filter(c => c.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      chs = chs.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }

    return chs;
  }, [contentForTab, activeCategory, searchQuery]);

  const handleToggleFavorite = useCallback((id: string) => {
    const ch = [...allChannels, ...allVod, ...allSeries].find(c => c.id === id);
    const newFavs = toggleFavorite(id, ch?.playlistId, ch?.type);
    setFavorites(newFavs);
  }, [allChannels, allVod, allSeries]);

  const handlePlay = useCallback((channel: Channel) => {
    setActiveChannel(channel);
    addRecent(channel.id);
  }, []);

  const handlePlaylistLoaded = useCallback((name: string, channels: Channel[], xtreamData?: XtreamPlaylistData) => {
    const newPlaylist: Playlist = {
      id: xtreamData ? `xt_${Date.now()}` : `pl_${Date.now()}`,
      name,
      channels,
      addedAt: Date.now(),
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

  // Keyboard shortcuts
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

  return (
    <>
      <SplashScreen show={splash} />

      {!splash && (
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <AppSidebar
            channels={activeTab === "films" ? allVod : activeTab === "series" ? allSeries : allChannels}
            favorites={favorites}
            activeCategory={activeCategory}
            activeTab={activeTab}
            onCategorySelect={setActiveCategory}
            onTabSelect={(tab) => { setActiveTab(tab); setActiveCategory(null); }}
            onAddPlaylist={() => setPlaylistModalOpen(true)}
            playlists={playlists}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <div className="flex flex-1 flex-col overflow-hidden">
            {!activeChannel && (
              <HeaderBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            )}

            <div className="flex flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeChannel ? (
                  <motion.div
                    key="player"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-1"
                  >
                    {/* Split view: channel list + player */}
                    <div className="hidden w-72 flex-col border-r border-border bg-card md:flex overflow-y-auto scrollbar-thin">
                      <div className="p-3 border-b border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chaînes</p>
                      </div>
                      {filteredChannels.map(ch => (
                        <button
                          key={ch.id}
                          onClick={() => handlePlay(ch)}
                          className={`flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary ${activeChannel?.id === ch.id ? "bg-primary/10 border-l-2 border-primary" : ""}`}
                        >
                          <div className="h-2 w-2 rounded-full bg-success" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{ch.name}</p>
                            <p className="text-[10px] text-muted-foreground">{ch.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex-1" data-player-container>
                      <VideoPlayer
                        channel={activeChannel}
                        isFavorite={favorites.includes(activeChannel.id)}
                        onBack={() => setActiveChannel(null)}
                        onToggleFavorite={() => handleToggleFavorite(activeChannel.id)}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 overflow-y-auto scrollbar-thin"
                  >
                    {activeTab === "live" && <MatchCarousel />}
                    <ChannelGrid
                      channels={filteredChannels}
                      favorites={favorites}
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
          />
        </div>
      )}
    </>
  );
}
