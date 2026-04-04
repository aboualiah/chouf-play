import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Radio, Star, Clock, Play, Filter } from "lucide-react";
import { getRecent } from "@/lib/storage";
import { getCategories } from "@/lib/channels";
import { SplashScreen } from "@/components/SplashScreen";
import { HeaderBar } from "@/components/HeaderBar";
import { ChannelGrid } from "@/components/ChannelGrid";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PlaylistModal } from "@/components/PlaylistModal";
import { DashboardCards } from "@/components/DashboardCards";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { EpgPanel } from "@/components/EpgPanel";
import { EpgGrid } from "@/components/EpgGrid";
import { CatchupPanel } from "@/components/CatchupPanel";
import { RecordingsPanel } from "@/components/RecordingsPanel";
import { FilmsGrid } from "@/components/FilmsGrid";
import { SeriesGrid } from "@/components/SeriesGrid";
import { RadioList, RadioMiniPlayer, useRadioPlayer } from "@/components/RadioPlayer";
import { DEMO_CHANNELS, RADIO_STATIONS, Channel } from "@/lib/channels";
import { getFavorites, toggleFavorite, getPlaylists, savePlaylists, loadPlaylistsAsync, addRecent, Playlist } from "@/lib/storage";
import { XtreamPlaylistData } from "@/lib/xtream";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDebounce } from "@/hooks/useDebounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { useI18n } from "@/lib/i18n";
import { getParentalSettings, isCategoryHidden, isChannelLocked, verifyPin } from "@/lib/parental";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Index() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [splash, setSplash] = useState(() => !sessionStorage.getItem("chouf_splash_done"));
  const SPLASH_DURATION = 3000;
  const hasCompletedSetup = () => localStorage.getItem("chouf_has_setup") === "true";
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [view, setView] = useState<"dashboard" | "content">("dashboard");
  const [activeTab, setActiveTab] = useState("live");
  const [activeSubTab, setActiveSubTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const [playlists, setPlaylists] = useState<Playlist[]>(getPlaylists());
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [showEpg, setShowEpg] = useState(false);
  const [showCatchup, setShowCatchup] = useState(false);
  const [showEpgGrid, setShowEpgGrid] = useState(false);
  const [showRecordings, setShowRecordings] = useState(false);

  // Radio player hook
  const { radioStation, radioPlaying, radioVolume, setRadioVolume, playRadio, toggleRadio, stopRadio } = useRadioPlayer();

  useEffect(() => {
    if (!splash) return;
    const t = setTimeout(() => {
      setSplash(false);
      sessionStorage.setItem("chouf_splash_done", "1");
    }, SPLASH_DURATION);
    return () => clearTimeout(t);
  }, [splash]);

  useEffect(() => {
    loadPlaylistsAsync().then(p => { if (p.length > 0) setPlaylists(p); });
  }, []);

  useEffect(() => {
    if (searchParams.get("addPlaylist") && !splash) {
      setPlaylistModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, splash, setSearchParams]);

  const handleTabSelect = useCallback((tab: string) => {
    // Stop radio when leaving radio tab
    if (activeTab === "radio" && tab !== "radio" && radioPlaying) {
      stopRadio();
    }
    setActiveTab(tab);
    setActiveCategory(null);
    setView("content");
  }, [isMobile, activeTab, radioPlaying, stopRadio]);

  const handleBackToDashboard = useCallback(() => {
    // Stop radio when going back to dashboard
    if (activeTab === "radio" && radioPlaying) {
      stopRadio();
    }
    setActiveChannel(null);
    setView("dashboard");
    setShowEpgGrid(false);
    setShowRecordings(false);
  }, [activeTab, radioPlaying, stopRadio]);

  const handleCategorySelect = useCallback((cat: string | null) => {
    setActiveCategory(cat);
  }, []);

  const parentalFilter = useCallback((ch: Channel) => {
    const ps = getParentalSettings();
    if (!ps.enabled) return true;
    if (isChannelLocked(ch.id)) return false;
    if (ch.category && isCategoryHidden(ch.category)) return false;
    return true;
  }, []);

  const allChannels = useMemo(() => {
    // Demo channels are separate - they have their own page. Only playlist channels here.
    const extra = playlists.flatMap(p => p.channels);
    return extra.filter(parentalFilter);
  }, [playlists, parentalFilter]);

  const allVod = useMemo(() => playlists.flatMap(p => p.vodStreams || []).filter(parentalFilter), [playlists, parentalFilter]);
  const allSeries = useMemo(() => playlists.flatMap(p => p.series || []).filter(parentalFilter), [playlists, parentalFilter]);

  const contentForTab = useMemo(() => {
    switch (activeTab) {
      case "films": return allVod;
      case "series": return allSeries;
      case "favorites": return [...allChannels, ...allVod, ...allSeries].filter(c => favorites.includes(c.id));
      case "radio": return [...allChannels.filter(c => c.category?.toLowerCase().includes("radio")), ...RADIO_STATIONS];
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
    // Stop radio when playing video
    if (radioPlaying) stopRadio();
    setActiveChannel(channel);
    addRecent(channel.id);
    setShowEpg(false);
    if (isMobile) setMobileDrawerOpen(false);
  }, [isMobile, radioPlaying, stopRadio]);

  const handleRadioSelect = useCallback((station: Channel) => {
    // Stop video when playing radio
    setActiveChannel(null);
    playRadio(station);
  }, [playRadio]);

  const handleLoadDemo = useCallback(() => {
    setDemoLoaded(true);
    localStorage.setItem("chouf_has_setup", "true");
    toast.success(t("msg.demo_loaded"));
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
    setPlaylists(prev => {
      const updated = [...prev, newPlaylist];
      savePlaylists(updated);
      localStorage.setItem("chouf_has_setup", "true");
      return updated;
    });
  }, []);

  const handleDeletePlaylist = useCallback((id: string) => {
    setPlaylists(prev => {
      const updated = prev.filter(p => p.id !== id);
      savePlaylists(updated);
      if (updated.length === 0 && !demoLoaded) {
        localStorage.removeItem("chouf_has_setup");
      }
      return updated;
    });
    toast.success(t("msg.playlist_deleted"));
  }, [demoLoaded]);

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

  const hasContent = demoLoaded || allChannels.length > 0 || allVod.length > 0 || allSeries.length > 0;

  const sidebarContent = (
    <AppSidebar
      channels={activeTab === "films" ? allVod : activeTab === "series" ? allSeries : allChannels}
      favorites={favorites}
      activeCategory={activeCategory}
      activeTab={activeTab}
      onCategorySelect={handleCategorySelect}
      onTabSelect={handleTabSelect}
      onAddPlaylist={() => setPlaylistModalOpen(true)}
      onDeletePlaylist={handleDeletePlaylist}
      onRefreshPlaylist={() => {}}
      playlists={playlists}
      collapsed={!isMobile && sidebarCollapsed}
      onToggleCollapse={() => {
        if (isMobile) {
          setMobileDrawerOpen(false);
        } else {
          const next = !sidebarCollapsed;
          setSidebarCollapsed(next);
          localStorage.setItem("chouf_sidebar_collapsed", String(next));
        }
      }}
      activePlaylistId={activePlaylistId}
      onPlaylistSelect={setActivePlaylistId}
    />
  );

  const COLOR_PASTILLES = [
    { color: "#FF3B30", glow: "rgba(255,59,48,0.4)", label: "Favoris", action: () => activeChannel && handleToggleFavorite(activeChannel.id) },
    { color: "#34C759", glow: "rgba(52,199,89,0.4)", label: "EPG", action: () => setShowEpg(!showEpg) },
    { color: "#FFD60A", glow: "rgba(255,214,10,0.4)", label: "Listes", action: () => setActiveChannel(null) },
    { color: "#007AFF", glow: "rgba(0,122,255,0.4)", label: "Options", action: () => {} },
  ];

  // Determine which content view to render (content mode only, not dashboard)
  const renderContent = () => {
    if (showEpgGrid) {
      return <EpgGrid channels={allChannels} onPlay={handlePlay} />;
    }
    if (showRecordings) {
      return <RecordingsPanel />;
    }
    if (activeTab === "films" && allVod.length > 0) {
      return <FilmsGrid films={filteredChannels} favorites={favorites} onPlay={handlePlay} onToggleFavorite={handleToggleFavorite} />;
    }
    if (activeTab === "series" && allSeries.length > 0) {
      return <SeriesGrid series={filteredChannels} favorites={favorites} onPlay={handlePlay} onToggleFavorite={handleToggleFavorite} />;
    }
    if (activeTab === "radio") {
      return <RadioList channels={allChannels} activeStation={radioStation} onSelect={handleRadioSelect} />;
    }
    // Live TV with Continue Watching
    const recentIds = getRecent();
    const allContent = [...allChannels, ...allVod, ...allSeries];
    const recentChannels = recentIds.slice(0, 10).map(id => allContent.find(c => c.id === id)).filter(Boolean) as Channel[];

    return (
      <>
        {activeTab === "live" && (() => {
          const categories = getCategories(allChannels);
          return (
            <>
              <div className="flex items-center gap-2 px-5 py-3 overflow-x-auto scrollbar-none">
                {[
                  { id: "all", label: t("cat.all"), icon: Radio },
                  { id: "favorites", label: t("nav.favorites"), icon: Star },
                  { id: "recent", label: t("cat.recent"), icon: Clock },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveSubTab(tab.id); setActiveCategory(null); setShowEpgGrid(false); setShowRecordings(false); }}
                    className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all shrink-0"
                    style={activeSubTab === tab.id && !activeCategory
                      ? { background: "rgba(255,109,0,0.15)", color: "#FF6D00", border: "1px solid rgba(255,109,0,0.3)" }
                      : { color: "#86868B", border: "1px solid #1C1C24" }
                    }
                  >
                    <tab.icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                ))}
                {categories.length > 0 && (
                  <div className="h-4 w-px mx-1 shrink-0" style={{ background: "#1C1C24" }} />
                )}
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(activeCategory === cat ? null : cat); setActiveSubTab("all"); }}
                    className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-all shrink-0 whitespace-nowrap"
                    style={activeCategory === cat
                      ? { background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }
                      : { color: "#48484A", border: "1px solid #1C1C24" }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>

            {/* Continue Watching */}
            {recentChannels.length > 0 && (
              <div className="px-5 pb-3">
                <p className="text-[12px] font-semibold mb-2 flex items-center gap-2" style={{ color: "#F5F5F7" }}>
                  <Clock size={13} style={{ color: "#FF6D00" }} /> Continuer à regarder
                </p>
                <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
                  {recentChannels.map(ch => (
                    <button key={ch.id} onClick={() => handlePlay(ch)}
                      className="group shrink-0 rounded-xl overflow-hidden transition-all hover:scale-105 backdrop-blur-sm"
                      style={{ width: 110, background: "rgba(19,19,24,0.7)", border: "1px solid rgba(28,28,36,0.6)" }}>
                      <div className="relative h-[64px] flex items-center justify-center" style={{ background: "rgba(28,28,36,0.5)" }}>
                        {ch.logo ? (
                          <img src={ch.logo} className="h-9 w-9 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <span className="text-[12px] font-bold" style={{ color: "#48484A" }}>
                            {ch.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </span>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "rgba(0,0,0,0.5)" }}>
                          <Play size={18} className="text-white" fill="white" />
                        </div>
                      </div>
                      <p className="px-2 py-1.5 text-[9px] font-medium truncate" style={{ color: "#B0B0B5" }}>{ch.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
          );
        })()}
        <ChannelGrid
          channels={filteredChannels}
          favorites={favorites}
          activeChannelId={activeChannel?.id}
          onPlay={handlePlay}
          onToggleFavorite={handleToggleFavorite}
          viewMode={viewMode}
        />
      </>
    );
  };

  return (
    <>
      <SplashScreen show={splash} />

      {!splash && (
        <div className="flex h-screen w-full overflow-hidden" style={{ background: "#0A0A0F" }}>
          {/* Sidebar: only in dashboard view */}
          {hasContent && view === "dashboard" && (
            <>
              <div className="hidden md:flex">{sidebarContent}</div>
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
            </>
          )}

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header: always show when not in player, but adapt for dashboard vs content */}
            {!activeChannel && (
              <>
              {/* Mobile header - dashboard */}
                {isMobile && view === "dashboard" && hasContent && (
                  <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid #1C1C24", background: "rgba(10,10,15,0.8)" }}>
                    <button onClick={() => setMobileDrawerOpen(true)} className="rounded-lg p-2" style={{ background: "#131318", color: "#C9A84C" }}>
                      <Menu size={18} />
                    </button>
                    <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} viewMode={viewMode} onViewModeChange={setViewMode}
                      activeTab={activeTab} onTabSelect={handleTabSelect} compact
                      allChannels={allChannels} allVod={allVod} allSeries={allSeries} onPlay={handlePlay} />
                  </div>
                )}
                {/* Mobile header - content */}
                {isMobile && view === "content" && (
                  <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid #1C1C24", background: "rgba(10,10,15,0.8)" }}>
                    <button onClick={handleBackToDashboard} className="rounded-lg p-2" style={{ background: "#131318", color: "#FF6D00" }}>
                      <ArrowLeft size={18} />
                    </button>
                    <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} viewMode={viewMode} onViewModeChange={setViewMode}
                      activeTab={activeTab} onTabSelect={handleTabSelect} compact
                      allChannels={allChannels} allVod={allVod} allSeries={allSeries} onPlay={handlePlay} />
                  </div>
                )}
                {/* Desktop header */}
                {!isMobile && hasContent && (
                  <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} viewMode={viewMode} onViewModeChange={setViewMode}
                    activeTab={activeTab} onTabSelect={handleTabSelect}
                    allChannels={allChannels} allVod={allVod} allSeries={allSeries} onPlay={handlePlay}
                    onBackToDashboard={view === "content" ? handleBackToDashboard : undefined} />
                )}
              </>
            )}

            <div className="flex flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout">
                {activeChannel ? (
                  <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1">
                    {/* Split view channel list */}
                    <div className="hidden w-[360px] flex-col border-r lg:flex overflow-y-auto scrollbar-thin" style={{ background: "#131318", borderColor: "#1C1C24" }}>
                      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #1C1C24" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#48484A" }}>Chaînes ({filteredChannels.length})</p>
                        <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: "#1C1C24" }}>
                          <input placeholder="Filtrer..." className="bg-transparent text-[10px] w-20 outline-none placeholder:text-[#48484A]" style={{ color: "#F5F5F7" }} />
                        </div>
                      </div>
                      {filteredChannels.map((ch, i) => (
                        <button key={ch.id} onClick={() => handlePlay(ch)}
                          className="flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-[#1C1C24] group"
                          style={activeChannel?.id === ch.id ? { background: "rgba(255,109,0,0.06)", borderLeft: "3px solid #FF6D00" } : { borderLeft: "3px solid transparent" }}>
                          <span className="text-[10px] font-mono w-5 text-right tabular-nums" style={{ color: "#48484A" }}>{i + 1}</span>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden" style={{ background: "#1C1C24" }}>
                            {ch.logo ? (
                              <img src={ch.logo} loading="lazy" className="h-6 w-6 rounded object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <span className="text-[10px] font-bold" style={{ color: "#86868B" }}>{ch.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-medium truncate" style={{ color: activeChannel?.id === ch.id ? "#F5F5F7" : "#B0B0B5" }}>{ch.name}</p>
                            <p className="text-[10px]" style={{ color: "#48484A" }}>{ch.category}</p>
                          </div>
                          {activeChannel?.id === ch.id && (
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#FF3B30" }} />
                              <span className="text-[8px] font-bold" style={{ color: "#FF3B30" }}>LIVE</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Player + EPG */}
                    <div className="flex flex-1 flex-col min-w-0">
                      <div className="flex flex-1 overflow-hidden">
                        <div className="flex-1">
                          <VideoPlayer
                            channel={activeChannel}
                            isFavorite={favorites.includes(activeChannel.id)}
                            onBack={() => setActiveChannel(null)}
                            onToggleFavorite={() => handleToggleFavorite(activeChannel.id)}
                            onPrev={handlePrevChannel}
                            onNext={handleNextChannel}
                            onShowCatchup={() => setShowCatchup(true)}
                            onShowEpg={() => setShowEpg(!showEpg)}
                          />
                        </div>
                        <AnimatePresence>
                          {showEpg && (
                            <motion.div
                              initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                              transition={{ type: "spring", damping: 25, stiffness: 300 }}
                              className="hidden lg:flex overflow-hidden border-l" style={{ borderColor: "#1C1C24" }}>
                              <EpgPanel channel={activeChannel} onClose={() => setShowEpg(false)} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {/* Now playing bar */}
                      <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "#131318", borderTop: "1px solid #1C1C24" }}>
                        <div className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ background: "#34C759", boxShadow: "0 0 8px rgba(52,199,89,0.5)" }} />
                        <span className="text-[12px] font-semibold flex-1 truncate" style={{ color: "#F5F5F7" }}>{activeChannel.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,109,0,0.1)", color: "#FF6D00" }}>{activeChannel.category}</span>
                        <div className="flex gap-2 ml-2">
                          {COLOR_PASTILLES.map((dot, i) => (
                            <button key={i} onClick={dot.action} className="group relative" title={dot.label}>
                              <div className="h-3.5 w-3.5 rounded-full transition-transform hover:scale-125"
                                style={{ background: dot.color, boxShadow: `0 0 8px ${dot.glow}` }} />
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                style={{ background: "#1C1C24", color: "#F5F5F7" }}>{dot.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : !hasContent ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex">
                    <WelcomeScreen onAddPlaylist={() => setPlaylistModalOpen(true)} onSkipTrial={handleLoadDemo} />
                  </motion.div>
                ) : view === "dashboard" ? (
                  <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 overflow-y-auto scrollbar-thin">
                    <DashboardCards
                      playlists={playlists}
                      allChannels={demoLoaded && allChannels.length === 0 ? DEMO_CHANNELS : allChannels}
                      allVod={allVod}
                      allSeries={allSeries}
                      onTabSelect={(tab) => {
                        if (demoLoaded && allChannels.length === 0 && tab === "live") {
                          // Demo mode: go to demo channels page
                          window.location.href = "/demo";
                          return;
                        }
                        handleTabSelect(tab);
                      }}
                      onPlay={handlePlay}
                      activePlaylistId={activePlaylistId}
                      onPlaylistSelect={setActivePlaylistId}
                      onShowEpg={() => { setShowEpgGrid(true); setShowRecordings(false); setView("content"); }}
                      onShowRecordings={() => { setShowRecordings(true); setShowEpgGrid(false); setView("content"); }}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 overflow-y-auto scrollbar-thin" style={{ paddingBottom: radioStation ? 56 : 0 }}>
                    {renderContent()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Radio mini player */}
      <AnimatePresence>
        {radioStation && (
          <RadioMiniPlayer station={radioStation} playing={radioPlaying}
            onToggle={toggleRadio} onClose={stopRadio}
            volume={radioVolume} onVolumeChange={setRadioVolume} />
        )}
      </AnimatePresence>

      <PlaylistModal
        open={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        onPlaylistLoaded={handlePlaylistLoaded}
        onLoadDemo={handleLoadDemo}
      />

      {/* Catchup panel */}
      {activeChannel && (
        <CatchupPanel
          channel={activeChannel}
          open={showCatchup}
          onClose={() => setShowCatchup(false)}
          onPlay={(url) => { setShowCatchup(false); toast.info("Catch-up sera disponible dans une future version"); }}
        />
      )}
    </>
  );
}
