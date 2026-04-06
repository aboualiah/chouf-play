import { useRef, useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Bell, BellOff, Play, RefreshCw } from "lucide-react";
import React from "react";
import { getReminders, toggleReminder as toggleReminderStorage } from "@/lib/storage";
import { getMatchSettings } from "@/pages/Settings";
import { colors, effects } from "@/lib/theme";

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
  // Competition logos (Wikipedia SVG thumbnails - reliable)
  ucl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo_2024.svg/60px-UEFA_Champions_League_logo_2024.svg.png",
  ligue1: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ligue1_Uber_Eats_logo.svg/60px-Ligue1_Uber_Eats_logo.svg.png",
  pl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/60px-Premier_League_Logo.svg.png",
  laliga: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/LaLiga.svg/60px-LaLiga.svg.png",
  seriea: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Serie_A_logo_2022.svg/60px-Serie_A_logo_2022.svg.png",
  bundesliga: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/60px-Bundesliga_logo_%282017%29.svg.png",
  botola: "https://upload.wikimedia.org/wikipedia/fr/thumb/5/5d/Botola_Pro_1.svg/60px-Botola_Pro_1.svg.png",
  nba: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/40px-National_Basketball_Association_logo.svg.png",
  ufc: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/UFC_logo.svg/60px-UFC_logo.svg.png",
  // Team logos (Wikipedia - reliable)
  psg: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/60px-Paris_Saint-Germain_F.C..svg.png",
  om: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/60px-Olympique_Marseille_logo.svg.png",
  real: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/60px-Real_Madrid_CF.svg.png",
  mancity: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/60px-Manchester_City_FC_badge.svg.png",
  arsenal: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/60px-Arsenal_FC.svg.png",
  liverpool: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/60px-Liverpool_FC.svg.png",
  barca: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/60px-FC_Barcelona_%28crest%29.svg.png",
  atletico: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/60px-Atletico_Madrid_2017_logo.svg.png",
  inter: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/60px-FC_Internazionale_Milano_2021.svg.png",
  acmilan: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/60px-Logo_of_AC_Milan.svg.png",
  bayern: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/60px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
  bvb: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/60px-Borussia_Dortmund_logo.svg.png",
  wydad: "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Wydad_AC_%28logo%29.svg/60px-Wydad_AC_%28logo%29.svg.png",
  raja: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Raja_Club_Athletic_logo.svg/60px-Raja_Club_Athletic_logo.svg.png",
  lakers: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/60px-Los_Angeles_Lakers_logo.svg.png",
  celtics: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/60px-Boston_Celtics.svg.png",
  lyon: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Olympique_Lyonnais.svg/60px-Olympique_Lyonnais.svg.png",
  monaco: "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/AS_Monaco_FC.svg/60px-AS_Monaco_FC.svg.png",
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
  "UEFA Champions League": LOGOS.ucl,
  "Ligue 1": LOGOS.ligue1,
  "French Ligue 1": LOGOS.ligue1,
  "Premier League": LOGOS.pl,
  "English Premier League": LOGOS.pl,
  "La Liga": LOGOS.laliga,
  "Spanish La Liga": LOGOS.laliga,
  "Serie A": LOGOS.seriea,
  "Italian Serie A": LOGOS.seriea,
  "Bundesliga": LOGOS.bundesliga,
  "German Bundesliga": LOGOS.bundesliga,
  "Botola Pro": LOGOS.botola,
  "NBA": LOGOS.nba,
  "UFC": LOGOS.ufc,
};

const FALLBACK_MATCHES: Match[] = [
  { id: "m1", sportIcon: "⚽", league: "Ligue 1", leagueLogo: LOGOS.ligue1, team1: "OL Lyon", team1Logo: LOGOS.lyon, team2: "AS Monaco", team2Logo: LOGOS.monaco, status: "live", timeLabel: "67'", score: "1-2", channel: "beIN Sports 1" },
  { id: "m2", sportIcon: "⚽", league: "Ligue 1", leagueLogo: LOGOS.ligue1, team1: "PSG", team1Logo: LOGOS.psg, team2: "OM", team2Logo: LOGOS.om, status: "upcoming", timeLabel: "dans 3h", channel: "beIN Sports 1" },
  { id: "m3", sportIcon: "⚽", league: "Champions League", leagueLogo: LOGOS.ucl, team1: "Real Madrid", team1Logo: LOGOS.real, team2: "Man City", team2Logo: LOGOS.mancity, status: "upcoming", timeLabel: "demain", channel: "RMC Sport 1" },
  { id: "m4", sportIcon: "⚽", league: "Premier League", leagueLogo: LOGOS.pl, team1: "Arsenal", team1Logo: LOGOS.arsenal, team2: "Liverpool", team2Logo: LOGOS.liverpool, status: "upcoming", timeLabel: "2 jours", channel: "beIN Sports 2" },
  { id: "m5", sportIcon: "⚽", league: "La Liga", leagueLogo: LOGOS.laliga, team1: "Barcelona", team1Logo: LOGOS.barca, team2: "Atletico", team2Logo: LOGOS.atletico, status: "upcoming", timeLabel: "2 jours", channel: "beIN Sports 3" },
  { id: "m6", sportIcon: "⚽", league: "Serie A", leagueLogo: LOGOS.seriea, team1: "Inter", team1Logo: LOGOS.inter, team2: "AC Milan", team2Logo: LOGOS.acmilan, status: "upcoming", timeLabel: "3 jours" },
  { id: "m7", sportIcon: "⚽", league: "Bundesliga", leagueLogo: LOGOS.bundesliga, team1: "Bayern", team1Logo: LOGOS.bayern, team2: "Dortmund", team2Logo: LOGOS.bvb, status: "upcoming", timeLabel: "4 jours" },
  { id: "m8", sportIcon: "⚽", league: "Botola Pro", leagueLogo: LOGOS.botola, team1: "Wydad", team1Logo: LOGOS.wydad, team2: "Raja", team2Logo: LOGOS.raja, status: "upcoming", timeLabel: "demain" },
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
    <span className="text-[11px] font-bold" style={{ color: colors.textMuted }}>{name.slice(0, 3).toUpperCase()}</span>
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
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>{match.league}</span>
      </div>
      {match.status === "live" && (
        <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: "rgba(255, 59, 48, 0.15)", color: colors.red }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: colors.red }} />
          LIVE
        </span>
      )}
    </div>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <TeamLogo src={match.team1Logo} name={match.team1} />
        <p className="text-[13px] font-bold truncate" style={{ color: colors.text }}>{match.team1}</p>
      </div>
      {match.score ? (
        <span className="mx-2 rounded-lg px-3 py-1.5 text-sm font-black tabular-nums shrink-0" style={{ background: "rgba(255, 109, 0, 0.15)", color: colors.orange, border: "1px solid rgba(255,109,0,0.2)" }}>{match.score}</span>
      ) : (
        <span className="mx-2 text-xs shrink-0" style={{ color: colors.textMuted }}>vs</span>
      )}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <p className="text-[13px] font-bold truncate text-right" style={{ color: colors.text }}>{match.team2}</p>
        <TeamLogo src={match.team2Logo} name={match.team2} />
      </div>
    </div>
    <div className="flex items-center justify-between text-[11px] mb-3">
      <span className="font-semibold" style={{ color: match.status === "live" ? "#FF6D00" : colors.textMuted }}>{match.timeLabel}</span>
      {match.channel && <span className="font-medium" style={{ color: colors.textMuted }}>📺 {match.channel}</span>}
    </div>
    {match.status === "live" ? (
      <button className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold text-white bg-gradient-orange active:scale-[0.97] transition-transform">
        <Play size={12} fill="currentColor" /> Regarder
      </button>
    ) : (
      <button
        onClick={onToggleReminder}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-medium transition-colors active:scale-[0.97]"
        style={hasReminder ? { background: "rgba(255, 109, 0, 0.1)", color: colors.orange } : { background: colors.surfaceSolid2, color: colors.textMuted }}
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
        <h3 className="text-[13px] font-semibold flex items-center gap-2" style={{ color: colors.text }}>
          ⚽ Matchs
          {syncing && <RefreshCw size={11} className="animate-spin" style={{ color: colors.orange }} />}
        </h3>
        <div className="flex gap-1">
          <button onClick={handleManualSync} className="rounded-lg p-1.5 transition-colors hover:bg-[#1C1C24]" style={{ background: colors.surfaceSolid }} title="Synchroniser">
            <RefreshCw size={12} style={{ color: colors.textMuted }} />
          </button>
          <button onClick={() => scroll(-1)} className="rounded-lg p-1.5 transition-colors hover:bg-[#1C1C24]" style={{ background: colors.surfaceSolid }}>
            <ChevronLeft size={14} style={{ color: colors.textMuted }} />
          </button>
          <button onClick={() => scroll(1)} className="rounded-lg p-1.5 transition-colors hover:bg-[#1C1C24]" style={{ background: colors.surfaceSolid }}>
            <ChevronRight size={14} style={{ color: colors.textMuted }} />
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
