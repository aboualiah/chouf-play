import { X, Clock } from "lucide-react";
import { Channel } from "@/lib/channels";

interface EpgPanelProps {
  channel: Channel;
  onClose: () => void;
}

// Simulated EPG data for demo channels
function generateEpgData(channelName: string) {
  const now = new Date();
  const programs = [];
  const templates: Record<string, string[]> = {
    default: ["Journal", "Documentaire", "Magazine", "Débat", "Reportage", "Film", "Série", "Musique", "Jeunesse", "Sport"],
    Religion: ["Récitation du Coran", "Prière en direct", "Conférence islamique", "Hadith du jour", "Histoire des prophètes"],
    Sport: ["Football Live", "Basketball", "Tennis", "Résumé des matchs", "Magazine sportif", "Analyse tactique"],
  };

  const category = channelName.includes("Quran") || channelName.includes("Makkah") || channelName.includes("Sunnah")
    ? "Religion"
    : channelName.includes("Red Bull") ? "Sport" : "default";

  const list = templates[category];

  for (let i = -2; i < 8; i++) {
    const start = new Date(now);
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + i);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    const isCurrent = now >= start && now < end;
    const progress = isCurrent ? ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100 : 0;

    programs.push({
      title: list[Math.abs(i + 2) % list.length],
      start,
      end,
      isCurrent,
      progress,
    });
  }
  return programs;
}

export function EpgPanel({ channel, onClose }: EpgPanelProps) {
  const programs = generateEpgData(channel.name);

  return (
    <div className="flex flex-col h-full" style={{ background: "#131318" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1C1C24" }}>
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: "#34C759" }} />
          <span className="text-[12px] font-semibold" style={{ color: "#F5F5F7" }}>Guide des programmes</span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#1C1C24] transition-colors">
          <X size={14} style={{ color: "#86868B" }} />
        </button>
      </div>
      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: "1px solid #1C1C24" }}>
        {channel.logo && <img src={channel.logo} className="h-5 w-5 rounded object-contain" alt="" />}
        <span className="text-[11px] font-medium" style={{ color: "#FF6D00" }}>{channel.name}</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {programs.map((p, i) => (
          <div
            key={i}
            className="relative px-4 py-3 transition-colors"
            style={{
              borderBottom: "1px solid #1C1C24",
              background: p.isCurrent ? "rgba(255, 109, 0, 0.04)" : "transparent",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tabular-nums w-12 shrink-0" style={{ color: p.isCurrent ? "#FF6D00" : "#48484A" }}>
                {p.start.toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate" style={{ color: p.isCurrent ? "#F5F5F7" : "#86868B" }}>
                  {p.title}
                </p>
                {p.isCurrent && (
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "#1C1C24" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: "linear-gradient(90deg, #FF6D00, #C9A84C)" }} />
                  </div>
                )}
              </div>
              {p.isCurrent && (
                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: "rgba(52,199,89,0.15)", color: "#34C759" }}>
                  EN COURS
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
