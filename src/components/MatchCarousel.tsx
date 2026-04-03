import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Bell, BellOff, Play } from "lucide-react";

interface Match {
  id: string;
  sport: string;
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
  { id: "m1", sport: "Football", sportIcon: "⚽", league: "Ligue 1", team1: "OL Lyon", team2: "AS Monaco", status: "live", timeLabel: "EN COURS", score: "1-2", channel: "beIN Sports 1" },
  { id: "m2", sport: "Football", sportIcon: "⚽", league: "Ligue 1", team1: "PSG", team2: "OM", status: "upcoming", timeLabel: "dans 3h", channel: "beIN Sports 1" },
  { id: "m3", sport: "Football", sportIcon: "⚽", league: "Champions League", team1: "Real Madrid", team2: "Man City", status: "upcoming", timeLabel: "demain", channel: "RMC Sport 1" },
  { id: "m4", sport: "Football", sportIcon: "⚽", league: "Premier League", team1: "Arsenal", team2: "Liverpool", status: "upcoming", timeLabel: "2 jours", channel: "beIN Sports 2" },
  { id: "m5", sport: "Football", sportIcon: "⚽", league: "La Liga", team1: "Barcelona", team2: "Atletico", status: "upcoming", timeLabel: "2 jours", channel: "beIN Sports 3" },
  { id: "m6", sport: "Football", sportIcon: "⚽", league: "Serie A", team1: "Inter", team2: "AC Milan", status: "upcoming", timeLabel: "3 jours" },
  { id: "m7", sport: "Football", sportIcon: "⚽", league: "Bundesliga", team1: "Bayern", team2: "Dortmund", status: "upcoming", timeLabel: "4 jours" },
  { id: "m8", sport: "Football", sportIcon: "⚽", league: "Botola Pro", team1: "Wydad", team2: "Raja", status: "upcoming", timeLabel: "demain" },
  { id: "m9", sport: "Basketball", sportIcon: "🏀", league: "NBA", team1: "Lakers", team2: "Celtics", status: "upcoming", timeLabel: "8h", channel: "beIN Sports 4" },
  { id: "m10", sport: "Tennis", sportIcon: "🎾", league: "Roland Garros", team1: "Djokovic", team2: "Alcaraz", status: "upcoming", timeLabel: "5 jours" },
  { id: "m11", sport: "MMA", sportIcon: "🥊", league: "UFC", team1: "Makhachev", team2: "Oliveira", status: "upcoming", timeLabel: "7 jours" },
  { id: "m12", sport: "Rugby", sportIcon: "🏉", league: "Six Nations", team1: "France", team2: "England", status: "upcoming", timeLabel: "6 jours" },
];

const REMINDERS_KEY = "chouf_match_reminders";

function getReminders(): string[] {
  return JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]");
}

function toggleReminder(matchId: string): string[] {
  const r = getReminders();
  const idx = r.indexOf(matchId);
  if (idx >= 0) r.splice(idx, 1);
  else r.push(matchId);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(r));
  return r;
}

export function MatchCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reminders, setReminders] = useState<string[]>(getReminders());

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className="relative px-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-base">⚽</span> Matchs à venir
        </h3>
        <div className="flex gap-1">
          <button onClick={() => scroll(-1)} className="rounded-lg bg-secondary p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => scroll(1)} className="rounded-lg bg-secondary p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-thin pb-2" style={{ scrollSnapType: "x mandatory" }}>
        {DEMO_MATCHES.map(match => (
          <div
            key={match.id}
            className={`flex-shrink-0 w-[260px] rounded-xl border bg-card p-4 transition-all ${
              match.status === "live"
                ? "border-primary/60 shadow-[0_0_20px_hsl(24_100%_50%/0.15)]"
                : "border-border hover:border-border/80"
            }`}
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {match.sportIcon} {match.league}
              </span>
              {match.status === "live" && (
                <span className="flex items-center gap-1 rounded-full bg-destructive/20 px-2 py-0.5 text-[10px] font-bold text-destructive">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                  LIVE
                </span>
              )}
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{match.team1}</p>
              </div>
              {match.score ? (
                <span className="mx-3 rounded-lg bg-primary/15 px-3 py-1 text-sm font-bold text-primary tabular-nums">
                  {match.score}
                </span>
              ) : (
                <span className="mx-3 text-xs text-muted-foreground">vs</span>
              )}
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-semibold text-foreground truncate">{match.team2}</p>
              </div>
            </div>

            {/* Time + Channel */}
            <div className="flex items-center justify-between text-[11px]">
              <span className={`font-medium ${match.status === "live" ? "text-primary" : "text-muted-foreground"}`}>
                {match.timeLabel}
              </span>
              {match.channel && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  📺 {match.channel}
                </span>
              )}
            </div>

            {/* Action button */}
            <div className="mt-3">
              {match.status === "live" ? (
                <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  <Play size={12} fill="currentColor" />
                  Regarder
                </button>
              ) : (
                <button
                  onClick={() => setReminders(toggleReminder(match.id))}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
                    reminders.includes(match.id)
                      ? "bg-primary/15 text-primary"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {reminders.includes(match.id) ? <BellOff size={12} /> : <Bell size={12} />}
                  {reminders.includes(match.id) ? "Rappel activé" : "Rappel"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
