import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Channel } from "@/lib/channels";
import { ChevronLeft, ChevronRight, Play, Clock, Tv } from "lucide-react";
import { colors, effects } from "@/lib/theme";

interface EpgGridProps {
  channels: Channel[];
  onPlay: (ch: Channel) => void;
}

interface EpgProgram {
  title: string;
  start: Date;
  end: Date;
  isCurrent: boolean;
  progress: number;
  description?: string;
}

const HOUR_WIDTH = 200;
const CHANNEL_ROW_HEIGHT = 56;
const CHANNEL_LABEL_WIDTH = 180;

const PROGRAM_TITLES: Record<string, string[]> = {
  default: ["Journal", "Documentaire", "Magazine", "Débat", "Reportage", "Film", "Série", "Musique", "Jeunesse", "Sport", "Météo", "Culture"],
  Religion: ["Récitation du Coran", "Prière en direct", "Conférence", "Hadith du jour", "Histoire des prophètes", "Douaa"],
  Sport: ["Football Live", "Basketball", "Tennis", "Résumé matchs", "Magazine sportif", "Analyse tactique", "Cyclisme"],
  Info: ["Flash info", "Journal", "Débat politique", "Édition spéciale", "Reportage terrain", "Interview exclusive"],
};

function generateChannelEpg(channel: Channel, baseHour: number): EpgProgram[] {
  const now = new Date();
  const programs: EpgProgram[] = [];
  const cat = channel.category?.toLowerCase() || "";
  const templates = cat.includes("religion") ? PROGRAM_TITLES.Religion
    : cat.includes("sport") ? PROGRAM_TITLES.Sport
    : cat.includes("info") || cat.includes("news") ? PROGRAM_TITLES.Info
    : PROGRAM_TITLES.default;

  let seed = 0;
  for (let i = 0; i < channel.name.length; i++) seed = (seed * 31 + channel.name.charCodeAt(i)) | 0;

  const start = new Date(now);
  start.setHours(baseHour, 0, 0, 0);

  let currentTime = start.getTime();
  const endTime = start.getTime() + 6 * 3600000;

  let idx = Math.abs(seed) % templates.length;
  while (currentTime < endTime) {
    const duration = [30, 45, 60, 90, 120][Math.abs(seed + idx) % 5] * 60000;
    const pStart = new Date(currentTime);
    const pEnd = new Date(Math.min(currentTime + duration, endTime));
    const isCurrent = now >= pStart && now < pEnd;
    const progress = isCurrent ? ((now.getTime() - pStart.getTime()) / (pEnd.getTime() - pStart.getTime())) * 100 : 0;

    programs.push({
      title: templates[idx % templates.length],
      start: pStart, end: pEnd, isCurrent, progress,
      description: `${templates[idx % templates.length]} - ${channel.name}`,
    });

    currentTime += duration;
    idx++;
  }

  return programs;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" });
}

export { generateChannelEpg, type EpgProgram };

export function EpgGrid({ channels, onPlay }: EpgGridProps) {
  const now = new Date();
  const [baseHour, setBaseHour] = useState(Math.max(0, now.getHours() - 1));
  const scrollRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; program: EpgProgram } | null>(null);

  const visibleChannels = useMemo(() => channels.slice(0, 80), [channels]);

  const epgData = useMemo(() =>
    visibleChannels.map(ch => ({ channel: ch, programs: generateChannelEpg(ch, baseHour) })),
    [visibleChannels, baseHour]
  );

  // Scroll to "now" on mount
  useEffect(() => {
    if (scrollRef.current) {
      const nowOffset = (now.getHours() - baseHour + now.getMinutes() / 60) * HOUR_WIDTH;
      scrollRef.current.scrollLeft = Math.max(0, nowOffset - 200);
    }
  }, [baseHour]);

  // Sync vertical scroll between labels and timeline
  const syncingRef = useRef(false);
  const handleLabelScroll = useCallback(() => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (scrollRef.current && labelRef.current) {
      scrollRef.current.scrollTop = labelRef.current.scrollTop;
    }
    syncingRef.current = false;
  }, []);
  const handleTimelineScroll = useCallback(() => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (labelRef.current && scrollRef.current) {
      labelRef.current.scrollTop = scrollRef.current.scrollTop;
    }
    syncingRef.current = false;
  }, []);

  const nowLineOffset = useMemo(() => {
    return (now.getHours() - baseHour + now.getMinutes() / 60) * HOUR_WIDTH;
  }, [baseHour, now]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = baseHour; h < baseHour + 6; h++) {
      slots.push(`${(h % 24).toString().padStart(2, "0")}:00`);
    }
    return slots;
  }, [baseHour]);

  const totalWidth = 6 * HOUR_WIDTH;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 shrink-0" style={{ borderBottom: "1px solid #1C1C24" }}>
        <Clock size={16} style={{ color: colors.orange }} />
        <span className="text-[14px] font-bold" style={{ color: colors.text }}>Guide des programmes</span>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setBaseHour(h => Math.max(0, h - 2))} tabIndex={0}
            className="rounded-lg p-1.5 transition-colors hover:bg-[#1C1C24]" style={{ color: colors.textMuted }}>
            <ChevronLeft size={16} />
          </button>
          <span className="text-[12px] font-medium min-w-[90px] text-center" style={{ color: colors.text }}>
            {timeSlots[0]} — {timeSlots[timeSlots.length - 1]}
          </span>
          <button onClick={() => setBaseHour(h => Math.min(22, h + 2))} tabIndex={0}
            className="rounded-lg p-1.5 transition-colors hover:bg-[#1C1C24]" style={{ color: colors.textMuted }}>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => { const n = new Date(); setBaseHour(Math.max(0, n.getHours() - 1)); }} tabIndex={0}
            className="rounded-full px-3 py-1 text-[10px] font-medium ml-2"
            style={{ background: "rgba(255,109,0,0.15)", color: colors.orange }}>
            Maintenant
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Channel labels */}
        <div ref={labelRef} onScroll={handleLabelScroll}
          className="shrink-0 overflow-y-auto scrollbar-none" style={{ width: CHANNEL_LABEL_WIDTH, borderRight: "1px solid #1C1C24" }}>
          <div className="h-8 shrink-0" style={{ borderBottom: "1px solid #1C1C24" }} />
          {epgData.map(({ channel }) => (
            <div key={channel.id} tabIndex={0}
              className="flex items-center gap-2 px-3 cursor-pointer hover:bg-[#1C1C24] transition-colors"
              style={{ height: CHANNEL_ROW_HEIGHT, borderBottom: "1px solid #0F0F14" }}
              onClick={() => onPlay(channel)}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden" style={{ background: colors.surfaceSolid2 }}>
                {channel.logo ? (
                  <img src={channel.logo} className="h-5 w-5 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <Tv size={12} style={{ color: colors.textDim }} />
                )}
              </div>
              <span className="text-[11px] font-medium truncate" style={{ color: colors.textMuted }}>{channel.name}</span>
            </div>
          ))}
        </div>

        {/* Timeline + programs */}
        <div ref={scrollRef} onScroll={handleTimelineScroll} className="flex-1 overflow-auto scrollbar-thin">
          <div className="sticky top-0 z-10 flex h-8 shrink-0" style={{ width: totalWidth, background: colors.background, borderBottom: "1px solid #1C1C24" }}>
            {timeSlots.map((slot, i) => (
              <div key={i} className="text-[10px] font-mono px-2 flex items-center"
                style={{ width: HOUR_WIDTH, color: colors.textDim, borderLeft: "1px solid #1C1C24" }}>
                {slot}
              </div>
            ))}
          </div>

          <div style={{ position: "relative", width: totalWidth }}>
            {nowLineOffset >= 0 && nowLineOffset <= totalWidth && (
              <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: nowLineOffset, width: 2, background: colors.red }}>
                <div className="absolute -top-1 -left-1 w-[6px] h-[6px] rounded-full" style={{ background: colors.red }} />
              </div>
            )}

            {epgData.map(({ channel, programs }) => (
              <div key={channel.id} className="relative flex" style={{ height: CHANNEL_ROW_HEIGHT, borderBottom: "1px solid #0F0F14" }}>
                {programs.map((prog, pi) => {
                  const startOffset = ((prog.start.getHours() - baseHour) + prog.start.getMinutes() / 60) * HOUR_WIDTH;
                  const durationHours = (prog.end.getTime() - prog.start.getTime()) / 3600000;
                  const width = durationHours * HOUR_WIDTH;
                  const isPast = prog.end < new Date();

                  return (
                    <div key={pi} tabIndex={0}
                      className="absolute top-1 bottom-1 rounded-lg px-2 py-1 overflow-hidden cursor-pointer transition-all hover:brightness-125 group"
                      style={{
                        left: Math.max(0, startOffset),
                        width: Math.max(40, width - 2),
                        background: prog.isCurrent ? "rgba(255,109,0,0.15)" : colors.surfaceSolid,
                        border: `1px solid ${prog.isCurrent ? "rgba(255,109,0,0.4)" : colors.surfaceSolid2}`,
                      }}
                      onClick={() => {
                        if (prog.isCurrent) onPlay(channel);
                        else if (isPast) onPlay(channel); // catch-up
                      }}
                      onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, program: prog })}
                      onMouseLeave={() => setTooltip(null)}>
                      <p className="text-[10px] font-medium truncate" style={{ color: prog.isCurrent ? "#FF6D00" : colors.textMuted }}>
                        {prog.title}
                      </p>
                      <p className="text-[8px] truncate" style={{ color: colors.textDim }}>
                        {formatTime(prog.start)} - {formatTime(prog.end)}
                      </p>
                      {prog.isCurrent && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: colors.surfaceSolid2 }}>
                          <div className="h-full" style={{ width: `${prog.progress}%`, background: colors.orange }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed z-50 rounded-xl px-3 py-2 pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 60, background: colors.surfaceSolid2, border: "1px solid #242430", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
          <p className="text-[12px] font-semibold" style={{ color: colors.text }}>{tooltip.program.title}</p>
          <p className="text-[10px]" style={{ color: colors.textDim }}>
            {formatTime(tooltip.program.start)} — {formatTime(tooltip.program.end)}
          </p>
          {tooltip.program.isCurrent && (
            <p className="text-[9px] mt-1" style={{ color: colors.orange }}>▶ Cliquez pour regarder</p>
          )}
        </div>
      )}
    </div>
  );
}
