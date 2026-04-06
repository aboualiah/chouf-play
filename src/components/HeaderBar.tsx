import { ArrowLeft, RefreshCw, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Channel } from "@/lib/channels";
import ChoufPlayLogo from "./ChoufPlayLogo";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HeaderBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (m: "grid" | "list") => void;
  activeTab: string;
  onTabSelect: (tab: string) => void;
  compact?: boolean;
  allChannels?: Channel[];
  allVod?: Channel[];
  allSeries?: Channel[];
  onPlay?: (ch: Channel) => void;
  onBackToDashboard?: () => void;
  onOpenSettings?: () => void;
  /** TV focus index for header buttons: -3=settings, -2=refresh, -1=quit */
  tvHeaderFocus?: number | null;
}

const CLOCK_FONT = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function HeaderBar({ searchQuery, onSearchChange, viewMode, onViewModeChange, activeTab, onTabSelect, compact, allChannels = [], allVod = [], allSeries = [], onPlay, onBackToDashboard, onOpenSettings, tvHeaderFocus }: HeaderBarProps) {
  const now = useClock();
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const headerFocusStyle = (idx: number) =>
    tvHeaderFocus === idx
      ? { boxShadow: "0 0 0 3px #FF6D00, 0 0 25px rgba(255,109,0,0.35)", transform: "scale(1.2)", transition: "all 200ms ease" }
      : {};
  const time = now.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-1 justify-between">
        <div className="flex items-center gap-2">
          <ChoufPlayLogo size={22} showCP={false} />
          <span className="text-[12px] font-bold" style={{ color: "#F5F5F7" }}>CHOUF</span>
          <span className="text-[12px] font-light" style={{ color: "#FF6D00" }}>Play</span>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-light tabular-nums" style={{ color: "#F5F5F7", fontFamily: CLOCK_FONT }}>{time}</p>
        </div>
      </div>
    );
  }

  return (
    <header
      className="flex items-center gap-4 px-5 py-2.5"
      style={{
        background: "rgba(18, 18, 30, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Back button (content view) */}
      {onBackToDashboard && (
        <button onClick={onBackToDashboard} className="rounded-lg p-2 transition-colors hover:bg-white/5" style={{ color: "#FF6D00" }}>
          <ArrowLeft size={18} />
        </button>
      )}

      {/* Logo + Brand */}
      {!onBackToDashboard && (
        <div className="flex items-center gap-2 shrink-0">
          <ChoufPlayLogo size={28} showCP={false} />
          <div className="leading-none">
            <span className="text-[14px] font-black" style={{ color: "#F5F5F7" }}>CHOUF</span>
            <span className="text-[14px] font-light" style={{ color: "#FF6D00" }}>Play</span>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Clock + Date + Action icons */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-[22px] font-light tabular-nums" style={{ color: "#F5F5F7", fontFamily: CLOCK_FONT, letterSpacing: "0.04em", lineHeight: 1 }}>{time}</p>
          <p className="text-[10px] capitalize" style={{ color: "#48484A", fontFamily: CLOCK_FONT }}>{date}</p>
        </div>

        {/* Dashboard */}
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="rounded-lg p-2 transition-all hover:bg-white/5 hover:scale-110"
            title="Dashboard"
          >
            <LayoutDashboard size={16} style={{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.3))" }} />
          </button>
        )}

        {/* Settings */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="rounded-lg p-2 transition-all hover:bg-white/5 hover:scale-110"
            title="Paramètres"
            style={{ ...{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.3))" }, ...headerFocusStyle(-3) }}
          >
            <Settings size={16} />
          </button>
        )}

        {/* Refresh */}
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg p-2 transition-all hover:bg-white/5 hover:scale-110"
          title="Rafraîchir"
          style={{ ...{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.3))" }, ...headerFocusStyle(-2) }}
        >
          <RefreshCw size={16} />
        </button>

        {/* Quit */}
        <button
          onClick={() => setShowQuitDialog(true)}
          className="rounded-lg p-2 transition-all hover:bg-white/5 hover:scale-110"
          title="Quitter"
          style={{ ...{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.3))" }, ...headerFocusStyle(-1) }}
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Quit confirmation dialog */}
      <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <AlertDialogContent style={{ background: "#1A1A2E", border: "1px solid #22223A" }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#F5F5F7" }}>Quitter CHOUF Play ?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: "#86868B" }}>
              Vous allez être déconnecté et redirigé vers la page d'accueil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-[#22223A] hover:bg-[#22223A]"
              style={{ background: "transparent", color: "#86868B" }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { localStorage.removeItem("chouf_has_setup"); window.location.href = "/"; }}
              style={{ background: "#FF6D00", color: "#fff" }}
              className="hover:opacity-90"
            >
              Quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
