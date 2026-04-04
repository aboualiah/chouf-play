import { LayoutGrid, List, ArrowLeft, RefreshCw, LogOut, Tv, Film, Clapperboard, Radio, Monitor, Settings, LayoutDashboard } from "lucide-react";
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
}

const TABS = [
  { id: "live", label: "TV Live", icon: Tv },
  { id: "films", label: "Films", icon: Film },
  { id: "series", label: "Séries", icon: Clapperboard },
  { id: "radio", label: "Radio", icon: Radio },
  { id: "demo", label: "TV Démo", icon: Monitor },
];

const APPLE_FONT = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function HeaderBar({ searchQuery, onSearchChange, viewMode, onViewModeChange, activeTab, onTabSelect, compact, allChannels = [], allVod = [], allSeries = [], onPlay, onBackToDashboard }: HeaderBarProps) {
  const now = useClock();
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const time = now.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "demo") { window.location.href = "/demo"; return; }
              onTabSelect(tab.id);
            }}
            className="px-2 py-1 text-[11px] font-medium transition-colors shrink-0"
            style={{ color: activeTab === tab.id ? "#FF6D00" : "#86868B" }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <header
      className="flex items-center gap-4 px-5 py-2.5"
      style={{
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1C1C24",
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-0.5 flex-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "demo") { window.location.href = "/demo"; return; }
              onTabSelect(tab.id);
            }}
            className="relative flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-colors"
            style={{ color: activeTab === tab.id ? "#FF6D00" : "#86868B" }}
          >
            <tab.icon size={15} style={activeTab === tab.id ? { filter: "drop-shadow(0 0 4px rgba(255,109,0,0.4))" } : {}} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full" style={{ background: "#FF6D00" }} />
            )}
          </button>
        ))}
      </div>

      {/* Clock + Date + Action icons */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-[14px] font-semibold tabular-nums tracking-tight" style={{ color: "#F5F5F7", fontFamily: APPLE_FONT, letterSpacing: "-0.02em" }}>{time}</p>
          <p className="text-[10px] capitalize" style={{ color: "#48484A", fontFamily: APPLE_FONT }}>{date}</p>
        </div>

        {/* Refresh */}
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg p-2 transition-all hover:bg-white/5 hover:scale-110"
          title="Rafraîchir"
        >
          <RefreshCw size={16} style={{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.3))" }} />
        </button>

        {/* Quit */}
        <button
          onClick={() => setShowQuitDialog(true)}
          className="rounded-lg p-2 transition-all hover:bg-white/5 hover:scale-110"
          title="Quitter"
        >
          <LogOut size={16} style={{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.3))" }} />
        </button>
      </div>

      {/* Quit confirmation dialog */}
      <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <AlertDialogContent style={{ background: "#131318", border: "1px solid #1C1C24" }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#F5F5F7" }}>Quitter CHOUF Play ?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: "#86868B" }}>
              Vous allez être déconnecté et redirigé vers la page d'accueil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-[#1C1C24] hover:bg-[#1C1C24]"
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
