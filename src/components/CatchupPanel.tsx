import { useState, useMemo } from "react";
import { Channel } from "@/lib/channels";
import { Play, Rewind, X, Radio as RadioIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, effects } from "@/lib/theme";

interface CatchupPanelProps {
  channel: Channel;
  open: boolean;
  onClose: () => void;
  onPlay: (url: string) => void;
}

interface CatchupProgram {
  title: string;
  start: Date;
  end: Date;
  isCurrent: boolean;
}

function generateCatchupPrograms(channel: Channel): CatchupProgram[] {
  const now = new Date();
  const programs: CatchupProgram[] = [];
  const templates = ["Journal", "Documentaire", "Magazine", "Débat", "Reportage", "Film", "Série", "Musique", "Culture", "Sport", "Météo", "Flash Info"];

  let seed = 0;
  for (let i = 0; i < channel.name.length; i++) seed = (seed * 31 + channel.name.charCodeAt(i)) | 0;

  // Generate 48h of past programs
  const startTime = new Date(now.getTime() - 48 * 3600000);
  let currentTime = startTime.getTime();
  let idx = Math.abs(seed) % templates.length;

  while (currentTime < now.getTime() + 3600000) {
    const duration = [30, 45, 60, 90][Math.abs(seed + idx) % 4] * 60000;
    const pStart = new Date(currentTime);
    const pEnd = new Date(currentTime + duration);
    const isCurrent = now >= pStart && now < pEnd;

    programs.push({
      title: templates[idx % templates.length],
      start: pStart,
      end: pEnd,
      isCurrent,
    });

    currentTime += duration;
    idx++;
  }

  return programs.reverse();
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: Date) {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return "Aujourd'hui";
  if (diff < 172800000) return "Hier";
  return d.toLocaleDateString("fr", { weekday: "short", day: "numeric", month: "short" });
}

export function CatchupPanel({ channel, open, onClose, onPlay }: CatchupPanelProps) {
  const programs = useMemo(() => generateCatchupPrograms(channel), [channel]);

  // Group by day
  const grouped = useMemo(() => {
    const map = new Map<string, CatchupProgram[]>();
    programs.forEach(p => {
      const key = formatDate(p.start);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries());
  }, [programs]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose} />
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 z-50 h-full w-[380px] max-w-[90vw] flex flex-col"
            style={{ background: colors.surfaceSolid, borderLeft: "1px solid #1C1C24" }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #1C1C24" }}>
              <Rewind size={16} style={{ color: colors.orange }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: colors.text }}>Catch-up / Replay</p>
                <p className="text-[10px] truncate" style={{ color: colors.textDim }}>{channel.name}</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#1C1C24]">
                <X size={14} style={{ color: colors.textMuted }} />
              </button>
            </div>

            {/* Programs */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {grouped.map(([day, progs]) => (
                <div key={day}>
                  <div className="sticky top-0 z-10 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: colors.background, color: colors.textDim }}>
                    {day}
                  </div>
                  {progs.map((p, i) => (
                    <div key={i}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#1C1C24] cursor-pointer"
                      style={{ borderBottom: "1px solid #0F0F14" }}
                      onClick={() => {
                        // Build catchup URL
                        const timestamp = Math.floor(p.start.getTime() / 1000);
                        const duration = Math.floor((p.end.getTime() - p.start.getTime()) / 60000);
                        onPlay(`catchup:${channel.id}:${timestamp}:${duration}`);
                      }}>
                      <span className="text-[10px] font-mono w-[85px] shrink-0" style={{ color: p.isCurrent ? "#FF6D00" : colors.textDim }}>
                        {formatTime(p.start)} → {formatTime(p.end)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate" style={{ color: p.isCurrent ? "#F5F5F7" : colors.textMuted }}>
                          {p.title}
                        </p>
                      </div>
                      {p.isCurrent ? (
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,59,48,0.15)", color: colors.red }}>
                          🔴 EN DIRECT
                        </span>
                      ) : (
                        <Play size={12} style={{ color: colors.textDim }} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
