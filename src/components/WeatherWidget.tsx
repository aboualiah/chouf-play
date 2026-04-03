import { Cloud, Sun, CloudRain } from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  icon: "sun" | "cloud" | "rain";
  city: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({ temp: 18, icon: "cloud", city: "—" });

  useEffect(() => {
    // Try to get real weather from wttr.in (no API key needed)
    fetch("https://wttr.in/?format=j1")
      .then(r => r.json())
      .then(data => {
        const current = data?.current_condition?.[0];
        const area = data?.nearest_area?.[0];
        if (current) {
          const temp = parseInt(current.temp_C, 10);
          const code = parseInt(current.weatherCode, 10);
          const icon: WeatherData["icon"] = code <= 113 ? "sun" : code >= 300 ? "rain" : "cloud";
          const city = area?.areaName?.[0]?.value || "—";
          setWeather({ temp, icon, city });
        }
      })
      .catch(() => {
        // Fallback demo data
        setWeather({ temp: 19, icon: "sun", city: "Paris" });
      });
  }, []);

  const Icon = weather.icon === "sun" ? Sun : weather.icon === "rain" ? CloudRain : Cloud;

  return (
    <div className="flex items-center gap-1.5">
      <Icon size={14} style={{ color: weather.icon === "sun" ? "#FFD60A" : "#86868B" }} />
      <span className="text-[12px] font-medium tabular-nums" style={{ color: "#F5F5F7", fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        {weather.temp}°
      </span>
    </div>
  );
}
