import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Radio, Star, Play, Filter, ArrowLeft, Heart } from "lucide-react";
import { getCurrentProgram } from "@/components/MiniEpg";
import { MiniEpg } from "@/components/MiniEpg";
import { useTvNavigation } from "@/hooks/useTvNavigation";
import { TvFocusable } from "@/components/TvFocusable";
import { TvSection, TvCounts, TvFocusState } from "@/lib/tvNavigation";
import { getCategories } from "@/lib/channels";
import { SplashScreen } from "@/components/SplashScreen";
import { TermsScreen } from "@/components/TermsScreen";
import { PermissionsScreen } from "@/components/PermissionsScreen";
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
import { toast } from "sonner";

export default function Index() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [splash, setSplash] = useState(() => !sessionStorage.getItem("chouf_splash_done"));
  const SPLASH_DURATION = 5000;
  const hasCompletedSetup = () => localStorage.getItem("chouf_has_setup") === "true";
  const isOnboardingDone = () => localStorage.getItem("chouf_onboarding_done") === "true";

  // Onboarding step: "splash" | "terms" | "permissions" | "welcome" | "app"
  const [onboardingStep, setOnboardingStep] = useState<"splash" | "terms" | "permissions" | "welcome" | "app">("splash");

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
  const [previewChannel, setPreviewChannel] = useState<Channel | null>(null);
  const [headerTvFocus, setHeaderTvFocus] = useState<number | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Radio player hook
  const { radioStation, radioPlaying, radioVolume, setRadioVolume, playRadio, toggleRadio, stopRadio } = useRadioPlayer();

  const isCguAccepted = () => localStorage.getItem("chouf_cgu_accepted") === "true";
  const isPermissionsDone = () => localStorage.getItem("chouf_permissions_done") === "true";

  const determineStep = useCallback(() => {
    if (!isCguAccepted()) return "terms";
    if (!isPermissionsDone()) return "permissions";
    if (hasCompletedSetup() && getPlaylists().length > 0) return "app";
    return "welcome";
  }, []);

  useEffect(() => {
    if (!splash) return;
    const t = setTimeout(() => {
      setSplash(false);
      sessionStorage.setItem("chouf_splash_done", "1");
      setOnboardingStep(determineStep());
    }, SPLASH_DURATION);
    return () => clearTimeout(t);
  }, [splash, determineStep]);

  // If splash already done on mount, set correct step
  useEffect(() => {
    if (!splash) {
      setOnboardingStep(determineStep());
    }
  }, []);

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
  }, [radioPlaying, stopRadio]);

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
      // Detailed success toast
      const chCount = channels.length;
      const vodCount = xtreamData?.vodStreams?.length || 0;
      const serCount = xtreamData?.series?.length || 0;
      const parts = [`${chCount} chaînes`];
      if (vodCount > 0) parts.push(`${vodCount} films`);
      if (serCount > 0) parts.push(`${serCount} séries`);
      toast.success(`✅ ${parts.join(", ")} chargés !`, { duration: 5000 });
      // Auto-navigate to dashboard after 2s
      setTimeout(() => {
        setOnboardingStep("app");
        setView("dashboard");
      }, 2000);
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

  const { colorFlash } = useKeyboardShortcuts({
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
    onShowEpg: activeChannel ? () => setShowEpg(true) : undefined,
    onShowPlaylists: () => navigate("/playlists"),
    onShowSettings: () => navigate("/settings"),
  });

  const hasContent = demoLoaded || allChannels.length > 0 || allVod.length > 0 || allSeries.length > 0;

  // ── Android TV: Back button navigation ──
  // History guard active on ALL steps to prevent hardware back from exiting
  useEffect(() => {
    window.history.pushState({ chouf: true }, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState({ chouf: true }, '', window.location.href);
      window.dispatchEvent(new CustomEvent('chouf-back'));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Listen for internal back navigation (from keydown or popstate)
  useEffect(() => {
    // During onboarding, back is handled by individual screens (Welcome, etc.)
    if (onboardingStep !== "app") return;
    const handleBack = () => {
      if (showEpg) { setShowEpg(false); return; }
      if (activeChannel) { setActiveChannel(null); return; }
      if (previewChannel) { setPreviewChannel(null); return; }
      if (view === "content" || showEpgGrid || showRecordings) {
        setView("dashboard");
        setShowEpgGrid(false);
        setShowRecordings(false);
        return;
      }
      // At dashboard root: do nothing — don't quit
    };
    window.addEventListener("chouf-back", handleBack);
    return () => window.removeEventListener("chouf-back", handleBack);
  }, [onboardingStep, activeChannel, view, showEpgGrid, showRecordings, showEpg, previewChannel]);

  // ── Auto-scroll focused elements into view (D-PAD navigation) ──
  useEffect(() => {
    const handler = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (el?.scrollIntoView) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    };
    document.addEventListener("focusin", handler);
    return () => document.removeEventListener("focusin", handler);
  }, []);


  const COLOR_PASTILLES = [
    { color: "#FF3B30", glow: "rgba(255,59,48,0.4)", label: "Favoris", action: () => activeChannel && handleToggleFavorite(activeChannel.id) },
    { color: "#34C759", glow: "rgba(52,199,89,0.4)", label: "EPG", action: () => setShowEpg(!showEpg) },
    { color: "#FFD60A", glow: "rgba(255,214,10,0.4)", label: "Listes", action: () => setActiveChannel(null) },
    { color: "#007AFF", glow: "rgba(0,122,255,0.4)", label: "Options", action: () => {} },
  ];

  // ── TV Navigation for 3-column Live TV ──
  const categories = getCategories(allChannels);

  const categoryItems = [
    { id: null, label: t("cat.all") },
    { id: "__fav", label: t("nav.favorites") },
    ...categories.map((cat) => ({ id: cat, label: cat })),
  ];

  const previewButtons = [
    { id: "tv_play", color: "#FF6D00", label: "▶ Regarder" },
    { id: "tv_fav", color: "#FF3B30", label: "Favoris" },
    { id: "tv_epg", color: "#34C759", label: "EPG" },
    { id: "tv_options", color: "#FFD60A", label: "Options" },
  ];

  const counts: TvCounts = {
    categories: categoryItems.length,
    channels: filteredChannels.length,
    preview: previewChannel ? 4 : 1,
  };

  const { focus, isFocused, setFocus } = useTvNavigation({
    counts,
    enabled: !activeChannel,
    onEnter: (state) => {
      if (state.section === "categories") {
        const item = categoryItems[state.indices.categories];
        if (!item) return;
        if (item.id === null) {
          setActiveCategory(null);
          setActiveSubTab("all");
        } else if (item.id === "__fav") {
          setActiveCategory("__fav" as any);
          setActiveSubTab("favorites");
        } else {
          setActiveCategory(item.id as string);
          setActiveSubTab("all");
        }
      }
      if (state.section === "channels") {
        const ch = filteredChannels[state.indices.channels];
        if (ch) {
          setPreviewChannel(ch);
        }
      }
      if (state.section === "preview") {
        if (previewChannel) {
          if (state.indices.preview === 0) handlePlay(previewChannel);
          if (state.indices.preview === 1) handleToggleFavorite(previewChannel.id);
          if (state.indices.preview === 2) {
            handlePlay(previewChannel);
            setTimeout(() => setShowEpg(true), 300);
          }
        }
      }
    },
    onBack: () => {
      if (showEpg) {
        setShowEpg(false);
        return;
      }
      if (previewChannel) {
        setPreviewChannel(null);
        setFocus((prev) => ({ ...prev, section: "channels" }));
        return;
      }
      handleBackToDashboard();
    },
  });

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
    // Live TV with 3-panel layout: Categories | Channels | Preview
    if (activeTab === "live") {
      return (
        <div className="flex flex-1 h-full overflow-hidden">
          {/* ═══ Column 1: Categories ═══ */}
          <div className="w-[220px] shrink-0 flex flex-col overflow-hidden" style={{ background: "#14142A", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-4 py-3 flex items-center gap-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
              <div className="h-2 w-2 rounded-full" style={{ background: "#FF6D00", boxShadow: "0 0 8px rgba(255,109,0,0.5)" }} />
              <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "#86868B" }}>Catégories</p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
              {categoryItems.map((item, catIdx) => {
                const isAll = item.id === null;
                const isFavItem = item.id === "__fav";
                const isItemActive = (isAll && !activeCategory && activeSubTab === "all") || (isFavItem && activeSubTab === "favorites") || activeCategory === item.id;
                const isTvFocused = isFocused("categories", catIdx);
                const count = isAll ? allChannels.length : isFavItem ? allChannels.filter(c => favorites.includes(c.id)).length : allChannels.filter(c => c.category === item.id).length;
                const Icon = isAll ? Radio : isFavItem ? Star : null;

                return (
                  <TvFocusable
                    key={item.id ?? "__all"}
                    section="categories"
                    index={catIdx}
                    focused={isTvFocused}
                    onClick={() => {
                      if (isFavItem) { setActiveCategory("__fav" as any); setActiveSubTab("favorites"); }
                      else if (isAll) { setActiveCategory(null); setActiveSubTab("all"); }
                      else { setActiveCategory(isItemActive ? null : item.id); setActiveSubTab("all"); }
                    }}
                    className="mx-2 my-0.5 rounded-lg"
                    style={
                      isTvFocused
                        ? { background: "linear-gradient(90deg, rgba(255,109,0,0.25) 0%, rgba(255,109,0,0.08) 100%)", borderLeft: "4px solid #FF6D00" }
                        : isItemActive
                          ? { background: "linear-gradient(90deg, rgba(255,109,0,0.10) 0%, transparent 100%)", borderLeft: "4px solid rgba(255,109,0,0.5)" }
                          : { borderLeft: "4px solid transparent" }
                    }
                  >
                    <div className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer">
                      {Icon && <Icon size={15} style={{ color: isItemActive || isTvFocused ? "#FF6D00" : "#48484A" }} />}
                      <span className="text-[13px] font-semibold flex-1 truncate" style={{ color: isTvFocused ? "#FFFFFF" : isItemActive ? "#F5F5F7" : "#86868B" }}>
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md tabular-nums" style={{
                        background: isTvFocused ? "rgba(255,109,0,0.2)" : isItemActive ? "rgba(255,109,0,0.1)" : "rgba(255,255,255,0.03)",
                        color: isTvFocused || isItemActive ? "#FF6D00" : "#48484A"
                      }}>{count}</span>
                    </div>
                  </TvFocusable>
                );
              })}
            </div>
          </div>

          {/* ═══ Column 2: Channel List ═══ */}
          <div className="w-[340px] shrink-0 flex flex-col overflow-hidden" style={{ background: "#181830", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#34C759", boxShadow: "0 0 8px rgba(52,199,89,0.5)" }} />
                <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "#86868B" }}>Chaînes</p>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,109,0,0.1)", color: "#FF6D00" }}>
                {filteredChannels.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
              {filteredChannels.length === 0 && (
                <div className="flex items-center justify-center h-32">
                  <p className="text-[13px]" style={{ color: "#48484A" }}>Aucune chaîne</p>
                </div>
              )}
              {filteredChannels.map((ch, i) => {
                const focused = isFocused("channels", i);
                const isSelected = previewChannel?.id === ch.id;
                const isPlaying = activeChannel?.id === ch.id;
                const isFav = favorites.includes(ch.id);

                return (
                  <TvFocusable
                    key={ch.id}
                    section="channels"
                    index={i}
                    focused={focused}
                    as="div"
                    className="mx-2 my-0.5 rounded-xl"
                    onClick={() => setPreviewChannel(ch)}
                  >
                    <div
                      className="flex items-center gap-3 w-full px-3 py-3 rounded-xl cursor-pointer transition-colors"
                      style={
                        focused
                          ? {
                              background: "linear-gradient(90deg, rgba(255,109,0,0.30) 0%, rgba(255,109,0,0.10) 100%)",
                              borderLeft: "5px solid #FF6D00",
                              boxShadow: "inset 0 0 30px rgba(255,109,0,0.12), 0 0 20px rgba(255,109,0,0.12)",
                            }
                          : isPlaying
                            ? {
                                background: "linear-gradient(90deg, rgba(52,199,89,0.15) 0%, rgba(52,199,89,0.04) 100%)",
                                borderLeft: "5px solid #34C759",
                              }
                            : isSelected
                              ? {
                                  background: "linear-gradient(90deg, rgba(255,109,0,0.10) 0%, transparent 100%)",
                                  borderLeft: "5px solid rgba(255,109,0,0.6)",
                                }
                              : { borderLeft: "5px solid transparent" }
                      }
                    >
                      {/* Channel number */}
                      <span className="text-[10px] font-mono w-6 text-right tabular-nums shrink-0" style={{ color: focused ? "#FF6D00" : "#3A3A4A" }}>
                        {i + 1}
                      </span>
                      {/* Logo */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden" style={{
                        background: focused ? "rgba(255,109,0,0.15)" : "#1E1E38",
                        border: focused ? "1px solid rgba(255,109,0,0.3)" : "1px solid rgba(255,255,255,0.04)"
                      }}>
                        {ch.logo ? (
                          <img src={ch.logo} className="h-7 w-7 object-contain" alt="" />
                        ) : (
                          <span className="text-[10px] font-bold" style={{ color: focused ? "#FF6D00" : "#86868B" }}>
                            {ch.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate" style={{
                          color: focused ? "#FFFFFF" : isPlaying ? "#34C759" : isSelected ? "#F5F5F7" : "#B0B0B5",
                          textShadow: focused ? "0 0 12px rgba(255,109,0,0.4)" : "none",
                          fontSize: focused ? "14px" : "13px",
                          fontWeight: focused ? 700 : 600,
                        }}>
                          {ch.name}
                        </p>
                        <MiniEpg channelName={ch.name} />
                      </div>
                      {/* Status badges */}
                      {isPlaying && (
                        <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full" style={{ background: "rgba(52,199,89,0.12)" }}>
                          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#34C759" }} />
                          <span className="text-[8px] font-bold" style={{ color: "#34C759" }}>LIVE</span>
                        </div>
                      )}
                      {isSelected && !isPlaying && (
                        <div className="shrink-0 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,109,0,0.1)" }}>
                          <span className="text-[8px] font-bold" style={{ color: "#FF6D00" }}>PREVIEW</span>
                        </div>
                      )}
                      {isFav && !isPlaying && !isSelected && <span className="text-[11px] shrink-0" style={{ color: "#FF3B30" }}>♥</span>}
                    </div>
                  </TvFocusable>
                );
              })}
            </div>
          </div>

          {/* ═══ Column 3: Preview / Program / Actions ═══ */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #161630 0%, #1A1A36 100%)" }}>
            {previewChannel ? (() => {
              const prog = getCurrentProgram(previewChannel.name);
              const isFav = favorites.includes(previewChannel.id);
              return (
                <div className="flex flex-col h-full">
                  {/* Preview header area */}
                  <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(255,109,0,0.05) 0%, transparent 70%)" }} />
                    <div className="relative z-10 text-center px-6">
                      {/* Channel logo */}
                      {previewChannel.logo ? (
                        <div className="mx-auto mb-6 h-32 w-32 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
                          <img src={previewChannel.logo} className="h-24 w-24 object-contain" alt="" />
                        </div>
                      ) : (
                        <div className="mx-auto mb-6 h-32 w-32 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <span className="text-4xl font-bold" style={{ color: "#86868B" }}>{previewChannel.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
                        </div>
                      )}
                      {/* Channel name */}
                      <h3 className="text-2xl font-bold mb-1.5" style={{ color: "#F5F5F7" }}>{previewChannel.name}</h3>
                      <p className="text-sm mb-3" style={{ color: "#86868B" }}>{previewChannel.category}</p>
                      {isFav && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full" style={{ background: "rgba(255,59,48,0.1)", color: "#FF6D6D" }}>
                          <Heart size={10} className="fill-current" /> Favori
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Program info */}
                  <div className="px-6 py-4" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#34C759" }} />
                      <p className="text-[13px] font-bold" style={{ color: "#F5F5F7" }}>En cours</p>
                    </div>
                    {prog ? (
                      <>
                        <p className="text-[14px] font-semibold mb-1" style={{ color: "#E0E0E5" }}>{prog.title}</p>
                        <div className="h-[3px] rounded-full overflow-hidden mb-2" style={{ background: "#242440" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${prog.progress}%`, background: "linear-gradient(90deg, #FF6D00, #FFB347)" }} />
                        </div>
                        {prog.nextTitle && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "#86868B" }}>
                              {prog.nextStart}
                            </span>
                            <span className="text-[11px]" style={{ color: "#5A5A6A" }}>→ {prog.nextTitle}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-[12px]" style={{ color: "#48484A" }}>Aucune information disponible</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-center gap-3 px-6 py-4" style={{ background: "rgba(0,0,0,0.15)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <TvFocusable section="preview" index={0} focused={isFocused("preview", 0)} as="div" className="rounded-2xl">
                      <button
                        onClick={() => previewChannel && handlePlay(previewChannel)}
                        className="flex items-center gap-2.5 rounded-xl px-7 py-3.5 transition-all hover:scale-105 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #FF6D00, #FF8C38)", color: "#fff", boxShadow: "0 4px 20px rgba(255,109,0,0.3)" }}
                      >
                        <Play size={20} fill="currentColor" />
                        <span className="text-[14px] font-bold">Regarder</span>
                      </button>
                    </TvFocusable>
                    <TvFocusable section="preview" index={1} focused={isFocused("preview", 1)} as="div" className="rounded-2xl">
                      <button
                        onClick={() => previewChannel && handleToggleFavorite(previewChannel.id)}
                        className="flex items-center gap-2 rounded-xl px-5 py-3 transition-all hover:scale-105 active:scale-95"
                        style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)" }}
                      >
                        <Heart size={15} className={isFav ? "fill-[#FF3B30]" : ""} style={{ color: "#FF3B30" }} />
                        <span className="text-[12px] font-semibold" style={{ color: "#FF3B30" }}>Favoris</span>
                      </button>
                    </TvFocusable>
                    <TvFocusable section="preview" index={2} focused={isFocused("preview", 2)} as="div" className="rounded-2xl">
                      <button
                        onClick={() => { if (previewChannel) { handlePlay(previewChannel); setTimeout(() => setShowEpg(true), 300); } }}
                        className="flex items-center gap-2 rounded-xl px-5 py-3 transition-all hover:scale-105 active:scale-95"
                        style={{ background: "rgba(52,199,89,0.1)", border: "1px solid rgba(52,199,89,0.2)" }}
                      >
                        <div className="h-3 w-3 rounded-full" style={{ background: "#34C759" }} />
                        <span className="text-[12px] font-semibold" style={{ color: "#34C759" }}>EPG</span>
                      </button>
                    </TvFocusable>
                    <TvFocusable section="preview" index={3} focused={isFocused("preview", 3)} as="div" className="rounded-2xl">
                      <button
                        className="flex items-center gap-2 rounded-xl px-5 py-3 transition-all hover:scale-105 active:scale-95"
                        style={{ background: "rgba(255,214,10,0.08)", border: "1px solid rgba(255,214,10,0.2)" }}
                      >
                        <div className="h-3 w-3 rounded-full" style={{ background: "#FFD60A" }} />
                        <span className="text-[12px] font-semibold" style={{ color: "#FFD60A" }}>Options</span>
                      </button>
                    </TvFocusable>
                  </div>
                </div>
              );
            })() : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-20 w-20 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Filter size={28} style={{ color: "#2C2C3C" }} />
                  </div>
                  <p className="text-[15px] font-semibold mb-1" style={{ color: "#48484A" }}>Sélectionnez une chaîne</p>
                  <p className="text-[12px]" style={{ color: "#2C2C3C" }}>Appuyez OK pour prévisualiser</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Non-live tabs
    if (activeTab !== "live") {
      return (
        <ChannelGrid
          channels={filteredChannels}
          favorites={favorites}
          activeChannelId={activeChannel?.id}
          onPlay={handlePlay}
          onToggleFavorite={handleToggleFavorite}
          viewMode={viewMode}
        />
      );
    }

    return null;
  };

  return (
    <>
      <SplashScreen show={splash} />

      {/* Onboarding: Terms */}
      {!splash && onboardingStep === "terms" && (
        <TermsScreen onAccept={() => setOnboardingStep("permissions")} />
      )}

      {/* Onboarding: Permissions */}
      {!splash && onboardingStep === "permissions" && (
        <PermissionsScreen onContinue={() => {
          if (hasCompletedSetup() && getPlaylists().length > 0) {
            setOnboardingStep("app");
          } else {
            setOnboardingStep("welcome");
          }
        }} />
      )}

      {/* Welcome / Setup screen */}
      {!splash && onboardingStep === "welcome" && (
        <div className="flex h-screen w-full overflow-hidden" style={{ background: "#151524" }}>
          <WelcomeScreen
            onAddPlaylist={() => setPlaylistModalOpen(true)}
            onSkipTrial={() => {
              handleLoadDemo();
              setOnboardingStep("app");
            }}
          />
        </div>
      )}

      {/* Main App */}
      {!splash && onboardingStep === "app" && (
        <div className="flex h-screen w-full overflow-hidden" style={{ background: "#151524" }}>
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            {!activeChannel && hasContent && (
              <>
                {isMobile ? (
                  <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid #252538", background: "rgba(18,18,30,0.85)" }}>
                    {view === "content" && (
                      <button onClick={handleBackToDashboard} className="rounded-lg p-2" style={{ background: "#1C1C30", color: "#FF6D00" }}>
                        <ArrowLeft size={18} />
                      </button>
                    )}
                    <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} viewMode={viewMode} onViewModeChange={setViewMode}
                      activeTab={activeTab} onTabSelect={handleTabSelect} compact
                      allChannels={allChannels} allVod={allVod} allSeries={allSeries} onPlay={handlePlay} />
                  </div>
                ) : (
                  <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} viewMode={viewMode} onViewModeChange={setViewMode}
                    activeTab={activeTab} onTabSelect={handleTabSelect}
                    allChannels={allChannels} allVod={allVod} allSeries={allSeries} onPlay={handlePlay}
                    onBackToDashboard={view === "content" ? handleBackToDashboard : undefined}
                    onOpenSettings={() => { window.location.href = "/settings"; }}
                    tvHeaderFocus={view === "dashboard" ? headerTvFocus : null} />
                )}
              </>
            )}

            <div className="flex flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout">
                {activeChannel ? (
                  <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1">
                    {/* Split view channel list */}
                    <div className="hidden w-[360px] flex-col border-r lg:flex overflow-y-auto scrollbar-thin" style={{ background: "#1C1C2E", borderColor: "#2A2A3E" }}>
                      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #252538" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#48484A" }}>Chaînes ({filteredChannels.length})</p>
                        <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: "#22223A" }}>
                          <input placeholder="Filtrer..." className="bg-transparent text-[10px] w-20 outline-none placeholder:text-[#48484A]" style={{ color: "#F5F5F7" }} />
                        </div>
                      </div>
                      {filteredChannels.map((ch, i) => (
                        <button key={ch.id} onClick={() => handlePlay(ch)}
                          className="flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-[#1C1C24] group"
                          style={activeChannel?.id === ch.id ? { background: "rgba(255,109,0,0.08)", borderLeft: "3px solid #FF6D00" } : { borderLeft: "3px solid transparent" }}>
                          <span className="text-[10px] font-mono w-5 text-right tabular-nums" style={{ color: "#48484A" }}>{i + 1}</span>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden" style={{ background: "#22223A" }}>
                            {ch.logo ? (
                              <img src={ch.logo} loading="lazy" className="h-6 w-6 rounded object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <span className="text-[10px] font-bold" style={{ color: "#86868B" }}>{ch.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-medium truncate" style={{ color: activeChannel?.id === ch.id ? "#F5F5F7" : "#B0B0B5" }}>{ch.name}</p>
                            <MiniEpg channelName={ch.name} />
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
                            colorFlash={colorFlash}
                            channelIndex={filteredChannels.findIndex(c => c.id === activeChannel.id)}
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
                      <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "#181830", borderTop: "1px solid #252538" }}>
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
                      onAddPlaylist={() => { navigate("/playlists"); }}
                      onOpenSettings={() => { navigate("/settings"); }}
                      onHeaderFocusChange={setHeaderTvFocus}
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
        onClose={() => {
          setPlaylistModalOpen(false);
          // After adding a playlist from welcome screen, go to app
          if (onboardingStep === "welcome" && getPlaylists().length > 0) {
            setPlaylists(getPlaylists());
            setOnboardingStep("app");
          }
        }}
        onPlaylistLoaded={(name, channels, xtreamData) => {
          handlePlaylistLoaded(name, channels, xtreamData);
          // Transition to app after playlist added
          setTimeout(() => {
            setOnboardingStep("app");
          }, 500);
        }}
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
