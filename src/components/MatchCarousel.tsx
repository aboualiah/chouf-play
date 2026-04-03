import { useRef, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Bell, BellOff, Play } from "lucide-react";
import React from "react";
import { getReminders, toggleReminder as toggleReminderStorage } from "@/lib/storage";

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

const DEMO_MATCHES: Match[] = [
  { id: "m1", sportIcon: "⚽", league: "Ligue 1", team1: "OL Lyon", team2: "AS Monaco", status: "live", timeLabel: "EN COURS", score: "1-2", channel: "beIN Sports 1" },
  { id: "m2", sportIcon: "⚽", league: "Ligue 1", team1: "PSG", team2: "OM", status: "upcoming", timeLabel: "dans 3h", channel: "beIN Sports 1" },
  { id: "m3", sportIcon: "⚽", league: "Champions League", team1: "Real Madrid", team2: "Man City", status: "upcoming", timeLabel: "demain", channel: "RMC Sport 1" },
  { id: "m4", sportIcon: "⚽", league: "Premier League", team1: "Arsenal", team2: "Liverpool", status: "upcoming", timeLabel: "2 jours", channel: "beIN Sports 2" },
  { id: "m5", sportIcon: "⚽", league: "La Liga", team1: "Barcelona", team2: "Atletico", status: "upcoming", timeLabel: "2 jours", channel: "beIN Sports 3" },
  { id: "m6", sportIcon: "⚽", league: "Serie A", team1: "Inter", team2: "AC Milan", status: "upcoming", timeLabel: "3 jours" },
  { id: "m7", sportIcon: "⚽", league: "Bundesliga", team1: "Bayern", team2: "Dortmund", status: "upcoming", timeLabel: "4 jours" },
  { id: "m8", sportIcon: "⚽", league: "Botola Pro", team1: "Wydad", team2: "Raja", status: "upcoming", timeLabel: "demain" },
  { id: "m9", sportIcon: "🏀", league: "NBA", team1: "Lakers", team2: "Celtics", status: "upcoming", timeLabel: "8h", channel: "beIN Sports 4" },
  { id: "m10", sportIcon: "🎾", league: "Roland Garros", team1: "Djokovic", team2: "Alcaraz", status: "upcoming", timeLabel: "5 jours" },
  { id: "m11", sportIcon: "🥊", league: "UFC", team1: "Makhachev", team2: "Oliveira", status: "upcoming", timeLabel: "7 jours" },
  { id: "m12", sportIcon: "🏉", league: "Six Nations", team1: "France", team2: "England", status: "upcoming", timeLabel: "6 jours" },
];

const MatchCard = React.memo(({ match, hasReminder, onToggleReminder }: {
  match: Match; hasReminder: boolean; onToggleReminder: () => void;
}) => (
  <div
    className="flex-shrink-0 w-[260px] rounded-2xl p-4 transition-all"
    style={{
      background: "#131318",
      border: match.status === "live" ? "1px solid rgba(255, 109, 0, 0.5)" : "1px solid rgba(28, 28, 36, 0.5)",
      boxShadow: match.status === "live" ? "0 0 25px rgba(255, 109, 0, 0.12)" : "none",
      scrollSnapAlign: "start",
    }}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#48484A" }}>
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
      <p className="flex-1 text-[13px] font-semibold truncate" style={{ color: "#F5F5F7" }}>{match.team1}</p>
      {match.score ? (
        <span className="mx-3 rounded-lg px-3 py-1 text-sm font-bold tabular-nums" style={{ background: "rgba(255, 109, 0, 0.12)", color: "#FF6D00" }}>{match.score}</span>
      ) : (
        <span className="mx-3 text-xs" style={{ color: "#48484A" }}>vs</span>
      )}
      <p className="flex-1 text-[13px] font-semibold truncate text-right" style={{ color: "#F5F5F7" }}>{match.team2}</p>
    </div>
    <div className="flex items-center justify-between text-[11px] mb-3">
      <span className="font-medium" style={{ color: match.status === "live" ? "#FF6D00" : "#86868B" }}>{match.timeLabel}</span>
      {match.channel && <span style={{ color: "#48484A" }}>📺 {match.channel}</span>}
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
        {DEMO_MATCHES.map(match => (
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
