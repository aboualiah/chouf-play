import { Search, LayoutGrid, List, Cloud, Sun, CloudRain } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (m: "grid" | "list") => void;
}

function useWeather() {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=50.85&longitude=4.35&current_weather=true")
      .then(r => r.json())
      .then(d => setWeather({ temp: Math.round(d.current_weather.temperature), code: d.current_weather.weathercode }))
      .catch(() => {});
  }, []);
  return weather;
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function HeaderBar({ searchQuery, onSearchChange, viewMode, onViewModeChange }: HeaderBarProps) {
  const weather = useWeather();
  const now = useClock();

  const time = now.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="flex items-center gap-4 border-b border-border bg-card/50 px-5 py-3 backdrop-blur-sm">
      {/* Search */}
      <div className="flex flex-1 items-center gap-2 rounded-lg bg-secondary px-3 py-2">
        <Search size={16} className="text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Rechercher une chaîne..."
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* View toggle */}
      <div className="flex rounded-lg bg-secondary p-0.5">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`rounded-md p-1.5 transition-colors ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`rounded-md p-1.5 transition-colors ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        >
          <List size={16} />
        </button>
      </div>

      {/* Weather */}
      {weather && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {weather.code <= 3 ? <Sun size={16} className="text-warning" /> : <CloudRain size={16} className="text-info" />}
          <span>{weather.temp}°C</span>
          <span className="text-[10px]">Bruxelles</span>
        </div>
      )}

      {/* Clock */}
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums text-foreground">{time}</p>
        <p className="text-[10px] capitalize text-muted-foreground">{date}</p>
      </div>
    </header>
  );
}
