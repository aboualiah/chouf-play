import { useRef, useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Bell, BellOff, Play, RefreshCw } from "lucide-react";
import React from "react";
import { getReminders, toggleReminder as toggleReminderStorage } from "@/lib/storage";
import { getMatchSettings } from "@/pages/Settings";

interface Match {
  id: string;
  sportIcon: string;
  league: string;
  leagueLogo?: string;
  team1: string;
  team1Logo?: string;
  team2: string;
  team2Logo?: string;
  status: "live" | "upcoming";
  timeLabel: string;
  score?: string;
  channel?: string;
}

const LOGOS: Record<string, string> = {
  ucl: "https://img.icons8.com/color/48/uefa-champions-league.png",
  ligue1: "https://img.icons8.com/color/48/ligue-1.png",
  pl: "https://img.icons8.com/color/48/premier-league.png",
  laliga: "https://img.icons8.com/color/48/la-liga.png",
  seriea: "https://img.icons8.com/color/48/serie-a.png",
  bundesliga: "https://img.icons8.com/color/48/bundesliga.png",
  nba: "https://img.icons8.com/color/48/nba.png",
  ufc: "https://img.icons8.com/color/48/ufc.png",
  psg: "https://img.icons8.com/color/48/paris-saint-germain.png",
  om: "https://img.icons8.com/color/48/olympique-de-marseille.png",
  real: "https://img.icons8.com/color/48/real-madrid.png",
  mancity: "https://img.icons8.com/color/48/manchester-city.png",
  arsenal: "https://img.icons8.com/color/48/arsenal-fc.png",
  liverpool: "https://img.icons8.com/color/48/liverpool-fc.png",
  barca: "https://img.icons8.com/color/48/fc-barcelona.png",
  atletico: "https://img.icons8.com/color/48/atletico-madrid.png",
  inter: "https://img.icons8.com/color/48/inter-milan.png",
  acmilan: "https://img.icons8.com/color/48/ac-milan.png",
  bayern: "https://img.icons8.com/color/48/bayern-munich.png",
  bvb: "https://img.icons8.com/color/48/borussia-dortmund.png",
  wydad: "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Wydad_AC_%28logo%29.svg/80px-Wydad_AC_%28logo%29.svg.png",
  raja: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Raja_Club_Athletic_logo.svg/80px-Raja_Club_Athletic_logo.svg.png",
  lakers: "https://img.icons8.com/color/48/los-angeles-lakers.png",
  celtics: "https://img.icons8.com/color/48/boston-celtics.png",
  lyon: "https://img.icons8.com/color/48/olympique-lyonnais.png",
  monaco: "https://img.icons8.com/color/48/as-monaco-fc.png",
};

// League ID mapping for football-data.org free tier
const LEAGUE_IDS: Record<string, number> = {
  "Champions League": 2001,
  "Ligue 1": 2015,
  "Premier League": 2021,
  "La Liga": 2014,
  "Serie A": 2019,
  "Bundesliga": 2002,
};

const LEAGUE_LOGO_MAP: Record<string, string> = {
  "Champions League": LOGOS.ucl,
  "Ligue 1": LOGOS.ligue1,
  "Premier League": LOGOS.pl,
  "La Liga": LOGOS.laliga,
  "Serie A": LOGOS.seriea,
  "Bundesliga": LOGOS.bundesliga,
};

const FALLBACK_MATCHES: Match[] = [
  { id: "m1", sportIcon: "⚽", league: "Ligue 1", leagueLogo: LOGOS.ligue1, team1: "OL Lyon", team1Logo: LOGOS.lyon, team2: "AS Monaco", team2Logo: LOGOS.monaco, status: "live", timeLabel: "67'", score: "1-2", channel: "beIN Sports 1" },
  { id: "m2", sportIcon: "⚽", league: "Ligue 1", leagueLogo: LOGOS.ligue1, team1: "PSG", team1Logo: LOGOS.psg, team2: "OM", team2Logo: LOGOS.om, status: "upcoming", timeLabel: "dans 3h", channel: "beIN Sports 1" },
  { id: "m3", sportIcon: "⚽", league: "Champions League", leagueLogo: LOGOS.ucl, team1: "Real Madrid", team1Logo: LOGOS.real, team2: "Man City", team2Logo: LOGOS.mancity, status: "upcoming", timeLabel: "demain", channel: "RMC Sport 1" },
  { id: "m4", sportIcon: "⚽", league: "Premier League", leagueLogo: LOGOS.pl, team1: "Arsenal", team1Logo: LOGOS.arsenal, team2: "Liverpool", team2Logo: LOGOS.liverpool, status: "upcoming", timeLabel: "2 jours", channel: "beIN Sports 2" },
  { id: "m5", sportIcon: "⚽", league: "La Liga", leagueLogo: LOGOS.laliga, team1: "Barcelona", team1Logo: LOGOS.barca, team2: "Atletico", team2Logo: LOGOS.atletico, status: "upcoming", timeLabel: "2 jours", channel: "beIN Sports 3" },
  { id: "m6", sportIcon: "⚽", league: "Serie A", leagueLogo: LOGOS.seriea, team1: "Inter", team1Logo: LOGOS.inter, team2: "AC Milan", team2Logo: LOGOS.acmilan, status: "upcoming", timeLabel: "3 jours" },
  { id: "m7", sportIcon: "⚽", league: "Bundesliga", leagueLogo: LOGOS.bundesliga, team1: "Bayern", team1Logo: LOGOS.bayern, team2: "Dortmund", team2Logo: LOGOS.bvb, status: "upcoming", timeLabel: "4 jours" },
  { id: "m8", sportIcon: "⚽", league: "Botola Pro", team1: "Wydad", team1Logo: LOGOS.wydad, team2: "Raja", team2Logo: LOGOS.raja, status: "upcoming", timeLabel: "demain" },
  { id: "m9", sportIcon: "🏀", league: "NBA", leagueLogo: LOGOS.nba, team1: "Lakers", team1Logo: LOGOS.lakers, team2: "Celtics", team2Logo: LOGOS.celtics, status: "upcoming", timeLabel: "8h", channel: "beIN Sports 4" },
  { id: "m10", sportIcon: "🎾", league: "Roland Garros", team1: "Djokovic", team2: "Alcaraz", status: "upcoming", timeLabel: "5 jours" },
  { id: "m11", sportIcon: "🥊", league: "UFC", leagueLogo: LOGOS.ufc, team1: "Makhachev", team2: "Oliveira", status: "upcoming", timeLabel: "7 jours" },
];

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = d.getTime() - now.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffH < 0) return "maintenant";
  if (diffH < 1) return `dans ${Math.max(1, Math.floor(diffMs / 60000))} min`;
  if (diffH < 24) return `dans ${diffH}h`;
  if (diffD === 1) return "demain";
  return `${diffD} jours`;
}

const MATCHES_CACHE_KEY = "chouf_matches_cache";
const MATCHES_CACHE_TTL = 30 * 60 * 1000; // 30 min

function getCachedMatches(): Match[] | null {
  try {
    const raw = localStorage.getItem(MATCHES_CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > MATCHES_CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCachedMatches(matches: Match[]) {
  try {
    localStorage.setItem(MATCHES_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: matches }));
  } catch {}
}

/** Fetch upcoming matches from free API */
async function fetchLiveMatches(): Promise<Match[]> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    
    // Use thesportsdb.com free API (no key required for basic endpoints)
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=4328&r=38&s=2025-2026`
    );
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    
    if (!data?.events?.length) return [];

    const matches: Match[] = data.events
      .filter((e: any) => {
        const eventDate = e.dateEvent;
        return eventDate >= today && eventDate <= nextWeek;
      })
      .slice(0, 12)
      .map((e: any, i: number) => ({
        id: `api_${e.idEvent || i}`,
        sportIcon: "⚽",
        league: e.strLeague || "Football",
        leagueLogo: LEAGUE_LOGO_MAP[e.strLeague] || undefined,
        team1: e.strHomeTeam || "Home",
        team1Logo: e.strHomeTeamBadge || undefined,
        team2: e.strAwayTeam || "Away",
        team2Logo: e.strAwayTeamBadge || undefined,
        status: e.strStatus === "Match Finished" ? "upcoming" as const : 
               e.strStatus?.includes("Live") ? "live" as const : "upcoming" as const,
        timeLabel: e.strStatus === "Match Finished" 
          ? `${e.intHomeScore}-${e.intAwayScore}` 
          : getRelativeTime(`${e.dateEvent}T${e.strTime || "20:00:00"}`),
        score: e.strStatus === "Match Finished" ? `${e.intHomeScore}-${e.intAwayScore}` : undefined,
      }));

    return matches;
  } catch (err) {
    console.warn("Match API fetch failed, using fallback:", err);
    return [];
  }
}

function TeamLogo({ src, name }: { src?: string; name: string }) {
  return src ? (
    <img src={src} alt={name} className="h-8 w-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
  ) : (
    <span className="text-[11px] font-bold" style={{ color: "#86868B" }}>{name.slice(0, 3).toUpperCase()}</span>
  );
}

const MatchCard = React.memo(({ match, hasReminder, onToggleReminder }: {
  match: Match; hasReminder: boolean; onToggleReminder: () => void;
}) => (
  <div
    className="flex-shrink-0 w-[270px] rounded-2xl p-4 transition-all"
    style={{
      background: "linear-gradient(135deg, #1C1C24, #131318)",
      border: match.status === "live" ? "1.5px solid rgba(255, 109, 0, 0.6)" : "1px solid rgba(56, 56, 68, 0.5)",
      boxShadow: match.status === "live" ? "0 0 30px rgba(255, 109, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.03)" : "inset 0 1px 0 rgba(255,255,255,0.03)",
      scrollSnapAlign: "start",
    }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        {match.leagueLogo && <img src={match.leagueLogo} alt="" className="h-4 w-4 object-contain" />}
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#86868B" }}>{match.league}</span>
      </div>
      {match.status === "live" && (
        <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: "rgba(255, 59, 48, 0.15)", color: "#FF3B30" }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#FF3B30" }} />
          LIVE
        </span>
      )}
    </div>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <TeamLogo src={match.team1Logo} name={match.team1} />
        <p className="text-[13px] font-bold truncate" style={{ color: "#F5F5F7" }}>{match.team1}</p>
      </div>
      {match.score ? (
        <span className="mx-2 rounded-lg px-3 py-1.5 text-sm font-black tabular-nums shrink-0" style={{ background: "rgba(255, 109, 0, 0.15)", color: "#FF6D00", border: "1px solid rgba(255,109,0,0.2)" }}>{match.score}</span>
      ) : (
        <span className="mx-2 text-xs shrink-0" style={{ color: "#86868B" }}>vs</span>
      )}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <p className="text-[13px] font-bold truncate text-right" style={{ color: "#F5F5F7" }}>{match.team2}</p>
        <TeamLogo src={match.team2Logo} name={match.team2} />
      </div>
    </div>
    <div className="flex items-center justify-between text-[11px] mb-3">
      <span className="font-semibold" style={{ color: match.status === "live" ? "#FF6D00" : "#B0B0B5" }}>{match.timeLabel}</span>
      {match.channel && <span className="font-medium" style={{ color: "#86868B" }}>📺 {match.channel}</span>}
    </div>
    {match.status === "live" ? (
      <button className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold text-white bg-gradient-orange active:scale-[0.97] transition-transform">
        <Play size={12} fill="currentColor" /> Regarder
      </button>
    ) : (
      <button
        onClick={onToggleReminder}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-medium transition-colors active:scale-[0.97]"
        style={hasReminder ? { background: "rgba(255, 109, 0, 0.1)", color: "#FF6D00" } : { background: "#1C1C24", color: "#86868B" }}
      >
        {hasReminder ? <BellOff size={12} /> : <Bell size={12} />}
        {hasReminder ? "Rappel activé" : "Rappel"}
      </button>
    )}
  </div>
));
MatchCard.displayName = "MatchCard";

export function MatchCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reminders, setReminders] = useState<string[]>(getReminders());
  const [liveMatches, setLiveMatches] = useState<Match[]>(() => getCachedMatches() || FALLBACK_MATCHES);
  const [syncing, setSyncing] = useState(false);

  const settings = getMatchSettings();

  // Auto-sync matches on mount and every 30 min
  useEffect(() => {
    const sync = async () => {
      setSyncing(true);
      const fetched = await fetchLiveMatches();
      if (fetched.length > 0) {
        // Merge API matches with fallback non-football matches
        const nonFootball = FALLBACK_MATCHES.filter(m => m.sportIcon !== "⚽");
        const merged = [...fetched, ...nonFootball];
        setLiveMatches(merged);
        setCachedMatches(merged);
      }
      setSyncing(false);
    };

    // Only sync if cache is stale
    if (!getCachedMatches()) sync();

    const interval = setInterval(sync, MATCHES_CACHE_TTL);
    return () => clearInterval(interval);
  }, []);

  const visibleMatches = useMemo(() => {
    if (!settings.showBanner) return [];
    return liveMatches.filter(m => settings.competitions[m.league] !== false);
  }, [settings.showBanner, settings.competitions, liveMatches]);

  if (visibleMatches.length === 0) return null;

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  const handleManualSync = async () => {
    setSyncing(true);
    localStorage.removeItem(MATCHES_CACHE_KEY);
    const fetched = await fetchLiveMatches();
    if (fetched.length > 0) {
      const nonFootball = FALLBACK_MATCHES.filter(m => m.sportIcon !== "⚽");
      const merged = [...fetched, ...nonFootball];
      setLiveMatches(merged);
      setCachedMatches(merged);
    }
    setSyncing(false);
  };

  return (
    <div className="px-3 pt-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-semibold flex items-center gap-2" style={{ color: "#F5F5F7" }}>
          ⚽ Matchs
          {syncing && <RefreshCw size={11} className="animate-spin" style={{ color: "#FF6D00" }} />}
        </h3>
        <div className="flex gap-1">
          <button onClick={handleManualSync} className="rounded-lg p-1.5 transition-colors hover:bg-[#1C1C24]" style={{ background: "#131318" }} title="Synchroniser">
            <RefreshCw size={12} style={{ color: "#86868B" }} />
          </button>
          <button onClick={() => scroll(-1)} className="rounded-lg p-1.5 transition-colors hover:bg-[#1C1C24]" style={{ background: "#131318" }}>
            <ChevronLeft size={14} style={{ color: "#86868B" }} />
          </button>
          <button onClick={() => scroll(1)} className="rounded-lg p-1.5 transition-colors hover:bg-[#1C1C24]" style={{ background: "#131318" }}>
            <ChevronRight size={14} style={{ color: "#86868B" }} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2" style={{ scrollSnapType: "x mandatory" }}>
        {visibleMatches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            hasReminder={reminders.includes(match.id)}
            onToggleReminder={() => setReminders(toggleReminderStorage(match.id))}
          />
        ))}
      </div>
    </div>
  );
}
