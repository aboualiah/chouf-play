import React, { useMemo } from "react";

/**
 * Generates a simulated current program for a channel based on its name (deterministic seed).
 * Returns { title, progress (0-100) } or null.
 */
export function getCurrentProgram(channelName: string): { title: string; progress: number; nextTitle?: string; nextStart?: string } | null {
  const PROGRAMS: Record<string, string[]> = {
    default: ["Journal", "Documentaire", "Magazine", "Débat", "Reportage", "Film", "Série", "Musique", "Sport", "Culture"],
    news: ["Flash info", "Journal", "Débat politique", "Édition spéciale", "Reportage"],
    music: ["Top Hits", "Playlist du jour", "Live Session", "Découvertes", "Classiques"],
  };

  const cat = channelName.toLowerCase();
  const templates = cat.includes("news") || cat.includes("info") || cat.includes("france 24") || cat.includes("euronews") || cat.includes("jazeera") || cat.includes("dw")
    ? PROGRAMS.news
    : cat.includes("music") || cat.includes("nrj") || cat.includes("trace")
    ? PROGRAMS.music
    : PROGRAMS.default;

  let seed = 0;
  for (let i = 0; i < channelName.length; i++) seed = (seed * 31 + channelName.charCodeAt(i)) | 0;

  const now = new Date();
  const dayMinutes = now.getHours() * 60 + now.getMinutes();
  const durations = [30, 45, 60, 90];

  // Walk through the day to find current program
  let elapsed = 0;
  let idx = Math.abs(seed) % templates.length;
  while (elapsed < 1440) {
    const dur = durations[Math.abs(seed + idx) % durations.length];
    if (elapsed + dur > dayMinutes) {
      const progress = ((dayMinutes - elapsed) / dur) * 100;
      const nextIdx = (idx + 1) % templates.length;
      const nextStart = new Date(now);
      nextStart.setHours(0, 0, 0, 0);
      nextStart.setMinutes(elapsed + dur);
      return {
        title: templates[idx % templates.length],
        progress,
        nextTitle: templates[nextIdx],
        nextStart: nextStart.toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
      };
    }
    elapsed += dur;
    idx++;
  }
  return null;
}

/** Mini EPG bar: shows current program name + thin progress bar */
export const MiniEpg = React.memo(({ channelName }: { channelName: string }) => {
  const prog = useMemo(() => getCurrentProgram(channelName), [channelName]);
  if (!prog) return null;

  return (
    <div className="mt-0.5">
      <p className="text-[9px] truncate" style={{ color: "#48484A" }}>{prog.title}</p>
      <div className="mt-0.5 h-[2px] rounded-full overflow-hidden" style={{ background: "#242430" }}>
        <div className="h-full rounded-full" style={{ width: `${prog.progress}%`, background: "#FF6D00" }} />
      </div>
    </div>
  );
});
MiniEpg.displayName = "MiniEpg";
