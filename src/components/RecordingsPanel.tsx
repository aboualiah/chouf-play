import { Circle, Trash2, Play, Tv } from "lucide-react";

interface Recording {
  id: string;
  channelName: string;
  programTitle: string;
  date: string;
  duration: string;
}

// Mock recordings for V1
const MOCK_RECORDINGS: Recording[] = [];

export function RecordingsPanel() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="flex items-center gap-2 px-5 py-3">
        <Circle size={16} className="fill-[#FF3B30]" style={{ color: "#FF3B30" }} />
        <span className="text-[14px] font-bold" style={{ color: "#F5F5F7" }}>Mes Enregistrements</span>
      </div>

      {MOCK_RECORDINGS.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#1C1C24" }}>
            <Tv size={28} style={{ color: "#48484A" }} />
          </div>
          <p className="text-[13px] font-medium" style={{ color: "#86868B" }}>Aucun enregistrement</p>
          <div className="rounded-xl px-4 py-3 text-center max-w-sm"
            style={{ background: "rgba(255,109,0,0.08)", border: "1px solid rgba(255,109,0,0.2)" }}>
            <p className="text-[12px] font-medium mb-1" style={{ color: "#FF6D00" }}>📱 Bientôt disponible</p>
            <p className="text-[11px]" style={{ color: "#86868B" }}>
              La fonctionnalité d'enregistrement sera disponible dans la version Android native de CHOUF Play.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-1 px-3">
          {MOCK_RECORDINGS.map(rec => (
            <div key={rec.id} className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "#1C1C24" }}>
                <Circle size={14} className="fill-[#FF3B30]" style={{ color: "#FF3B30" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: "#F5F5F7" }}>{rec.channelName}</p>
                <p className="text-[11px] truncate" style={{ color: "#86868B" }}>{rec.programTitle}</p>
                <p className="text-[10px]" style={{ color: "#48484A" }}>{rec.date} • {rec.duration}</p>
              </div>
              <div className="flex gap-1">
                <button className="rounded-lg p-2 hover:bg-[#1C1C24] transition-colors">
                  <Play size={14} style={{ color: "#FF6D00" }} />
                </button>
                <button className="rounded-lg p-2 hover:bg-[#1C1C24] transition-colors">
                  <Trash2 size={14} style={{ color: "#FF3B30" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
