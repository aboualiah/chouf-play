import { useState, useEffect, useMemo } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { ChannelGrid } from "@/components/ChannelGrid";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PlaylistModal } from "@/components/PlaylistModal";
import { DEMO_CHANNELS, Channel } from "@/lib/channels";
import { getFavorites, toggleFavorite, getPlaylists, savePlaylists, addRecent, getRecent, Playlist } from "@/lib/storage";
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

  const allChannels = useMemo(() => {
    const extra = playlists.flatMap(p => p.channels);
    return [...DEMO_CHANNELS, ...extra];
  }, [playlists]);

  const filteredChannels = useMemo(() => {
    let chs = allChannels;

    if (activeTab === "favorites") {
      chs = chs.filter(c => favorites.includes(c.id));
    }

    if (activeCategory) {
      chs = chs.filter(c => c.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      chs = chs.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }

    return chs;
  }, [allChannels, activeTab, activeCategory, searchQuery, favorites]);

  const handleToggleFavorite = (id: string) => {
    const newFavs = toggleFavorite(id);
    setFavorites(newFavs);
  };

  const handlePlay = (channel: Channel) => {
    setActiveChannel(channel);
    addRecent(channel.id);
  };

  const handlePlaylistLoaded = (name: string, channels: Channel[]) => {
    const newPlaylist: Playlist = { id: `pl_${Date.now()}`, name, channels, addedAt: Date.now() };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    savePlaylists(updated);
  };

  return (
    <>
      <SplashScreen show={splash} />

      {!splash && (
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <AppSidebar
            channels={allChannels}
            favorites={favorites}
            activeCategory={activeCategory}
            activeTab={activeTab}
            onCategorySelect={setActiveCategory}
            onTabSelect={setActiveTab}
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
                    <div className="flex-1">
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
