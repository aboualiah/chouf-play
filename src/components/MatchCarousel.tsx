import { useRef, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Bell, BellOff, Play } from "lucide-react";
import React from "react";
import { getReminders, toggleReminder as toggleReminderStorage } from "@/lib/storage";
import { getMatchSettings } from "@/pages/Settings";

interface Match {
  id: string;
  sportIcon: string;
  league: string;
  team1: string;
  team2: string;
  status: "live" | "upcoming";
  timeLabel: string;
  score?: string;
  channel?: string;
}

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

// Team & league logos (Wikipedia commons)
const LOGOS = {
  // Leagues
  ucl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo_2024.svg/120px-UEFA_Champions_League_logo_2024.svg.png",
  ligue1: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ligue1_Uber_Eats_%282024%29.svg/120px-Ligue1_Uber_Eats_%282024%29.svg.png",
  pl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/120px-Premier_League_Logo.svg.png",
  laliga: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/LaLiga.svg/120px-LaLiga.svg.png",
  seriea: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Serie_A_logo_2022.svg/120px-Serie_A_logo_2022.svg.png",
  nba: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/120px-National_Basketball_Association_logo.svg.png",
  ufc: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/120px-UFC_Logo.svg.png",
  // Teams
  psg: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/80px-Paris_Saint-Germain_F.C..svg.png",
  om: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/80px-Olympique_Marseille_logo.svg.png",
  real: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/80px-Real_Madrid_CF.svg.png",
  mancity: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/80px-Manchester_City_FC_badge.svg.png",
  arsenal: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/80px-Arsenal_FC.svg.png",
  liverpool: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/80px-Liverpool_FC.svg.png",
  barca: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/80px-FC_Barcelona_%28crest%29.svg.png",
  atletico: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Atletico_Madrid_Logo_2024.svg/80px-Atletico_Madrid_Logo_2024.svg.png",
  inter: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/80px-FC_Internazionale_Milano_2021.svg.png",
  acmilan: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/80px-Logo_of_AC_Milan.svg.png",
  bayern: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/80px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
  bvb: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/80px-Borussia_Dortmund_logo.svg.png",
  wydad: "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Wydad_AC_%28logo%29.svg/80px-Wydad_AC_%28logo%29.svg.png",
  raja: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Raja_Club_Athletic_logo.svg/80px-Raja_Club_Athletic_logo.svg.png",
  lakers: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/80px-Los_Angeles_Lakers_logo.svg.png",
  celtics: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/80px-Boston_Celtics.svg.png",
  lyon: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e2/Olympique_Lyonnais_%28logo%29.svg/80px-Olympique_Lyonnais_%28logo%29.svg.png",
  monaco: "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/AS_Monaco_FC.svg/80px-AS_Monaco_FC.svg.png",
};

const DEMO_MATCHES: Match[] = [
  { id: "m1", sportIcon: "⚽", league: "Ligue 1", leagueLogo: LOGOS.ligue1, team1: "OL Lyon", team1Logo: LOGOS.lyon, team2: "AS Monaco", team2Logo: LOGOS.monaco, status: "live", timeLabel: "67'", score: "1-2", channel: "beIN Sports 1" },
  { id: "m2", sportIcon: "⚽", league: "Ligue 1", leagueLogo: LOGOS.ligue1, team1: "PSG", team1Logo: LOGOS.psg, team2: "OM", team2Logo: LOGOS.om, status: "upcoming", timeLabel: "dans 3h", channel: "beIN Sports 1" },
  { id: "m3", sportIcon: "⚽", league: "Champions League", leagueLogo: LOGOS.ucl, team1: "Real Madrid", team1Logo: LOGOS.real, team2: "Man City", team2Logo: LOGOS.mancity, status: "upcoming", timeLabel: "demain", channel: "RMC Sport 1" },
  { id: "m4", sportIcon: "⚽", league: "Premier League", leagueLogo: LOGOS.pl, team1: "Arsenal", team1Logo: LOGOS.arsenal, team2: "Liverpool", team2Logo: LOGOS.liverpool, status: "upcoming", timeLabel: "2 jours", channel: "beIN Sports 2" },
  { id: "m5", sportIcon: "⚽", league: "La Liga", leagueLogo: LOGOS.laliga, team1: "Barcelona", team1Logo: LOGOS.barca, team2: "Atletico", team2Logo: LOGOS.atletico, status: "upcoming", timeLabel: "2 jours", channel: "beIN Sports 3" },
  { id: "m6", sportIcon: "⚽", league: "Serie A", leagueLogo: LOGOS.seriea, team1: "Inter", team1Logo: LOGOS.inter, team2: "AC Milan", team2Logo: LOGOS.acmilan, status: "upcoming", timeLabel: "3 jours" },
  { id: "m7", sportIcon: "⚽", league: "Bundesliga", team1: "Bayern", team1Logo: LOGOS.bayern, team2: "Dortmund", team2Logo: LOGOS.bvb, status: "upcoming", timeLabel: "4 jours" },
  { id: "m8", sportIcon: "⚽", league: "Botola Pro", team1: "Wydad", team1Logo: LOGOS.wydad, team2: "Raja", team2Logo: LOGOS.raja, status: "upcoming", timeLabel: "demain" },
  { id: "m9", sportIcon: "🏀", league: "NBA", leagueLogo: LOGOS.nba, team1: "Lakers", team1Logo: LOGOS.lakers, team2: "Celtics", team2Logo: LOGOS.celtics, status: "upcoming", timeLabel: "8h", channel: "beIN Sports 4" },
  { id: "m10", sportIcon: "🎾", league: "Roland Garros", team1: "Djokovic", team2: "Alcaraz", status: "upcoming", timeLabel: "5 jours" },
  { id: "m11", sportIcon: "🥊", league: "UFC", leagueLogo: LOGOS.ufc, team1: "Makhachev", team2: "Oliveira", status: "upcoming", timeLabel: "7 jours" },
  { id: "m12", sportIcon: "🏉", league: "Six Nations", team1: "France", team2: "England", status: "upcoming", timeLabel: "6 jours" },
];

const MatchCard = React.memo(({ match, hasReminder, onToggleReminder }: {
  match: Match; hasReminder: boolean; onToggleReminder: () => void;
}) => (
    <div
      className="flex-shrink-0 w-[260px] rounded-2xl p-4 transition-all"
      style={{
        background: "linear-gradient(135deg, #1C1C24, #131318)",
        border: match.status === "live" ? "1.5px solid rgba(255, 109, 0, 0.6)" : "1px solid rgba(56, 56, 68, 0.5)",
        boxShadow: match.status === "live" ? "0 0 30px rgba(255, 109, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.03)" : "inset 0 1px 0 rgba(255,255,255,0.03)",
        scrollSnapAlign: "start",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#86868B" }}>
          {match.sportIcon} {match.league}
        </span>
      {match.status === "live" && (
        <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: "rgba(255, 59, 48, 0.15)", color: "#FF3B30" }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#FF3B30" }} />
          LIVE
        </span>
      )}
    </div>
    <div className="flex items-center justify-between mb-3">
      <p className="flex-1 text-[14px] font-bold truncate" style={{ color: "#F5F5F7" }}>{match.team1}</p>
      {match.score ? (
        <span className="mx-3 rounded-lg px-3 py-1.5 text-sm font-black tabular-nums" style={{ background: "rgba(255, 109, 0, 0.15)", color: "#FF6D00", border: "1px solid rgba(255,109,0,0.2)" }}>{match.score}</span>
      ) : (
        <span className="mx-3 text-xs font-medium" style={{ color: "#86868B" }}>vs</span>
      )}
      <p className="flex-1 text-[14px] font-bold truncate text-right" style={{ color: "#F5F5F7" }}>{match.team2}</p>
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

  const settings = getMatchSettings();

  const visibleMatches = useMemo(() => {
    if (!settings.showBanner) return [];
    return DEMO_MATCHES.filter(m => settings.competitions[m.league] !== false);
  }, [settings.showBanner, settings.competitions]);

  if (visibleMatches.length === 0) return null;

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className="px-3 pt-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-semibold flex items-center gap-2" style={{ color: "#F5F5F7" }}>
          ⚽ Matchs à venir
        </h3>
        <div className="flex gap-1">
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
