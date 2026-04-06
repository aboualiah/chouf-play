import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Tv, Film, Clapperboard, BookOpen, Rewind, Circle, Layers, ArrowRight, Crown, Fingerprint, Settings, LayoutDashboard, Radio, Monitor } from "lucide-react";
import { Playlist } from "@/lib/storage";
import { Channel } from "@/lib/channels";
import { motion } from "framer-motion";

interface DashboardCardsProps {
  playlists: Playlist[];
  allChannels: Channel[];
  allVod: Channel[];
  allSeries: Channel[];
  onTabSelect: (tab: string) => void;
  onPlay: (channel: Channel) => void;
  activePlaylistId: string | null;
  onPlaylistSelect: (id: string | null) => void;
  onShowEpg?: () => void;
  onShowRecordings?: () => void;
  onAddPlaylist?: () => void;
  onOpenSettings?: () => void;
}

const STAT_CARDS = [
  {
    id: "live",
    label: "Chaînes TV",
    icon: Tv,
    gradient: "linear-gradient(135deg, rgba(255,109,0,0.14), rgba(255,214,10,0.06))",
    border: "rgba(255,109,0,0.18)",
    iconColor: "#FF6D00",
    accentGlow: "0 0 40px rgba(255,109,0,0.06)",
    countSuffix: "Chaînes",
    bgImage: "radial-gradient(ellipse at 80% 20%, rgba(255,109,0,0.08) 0%, transparent 60%)",
  },
  {
    id: "films",
    label: "Films",
    icon: Film,
    gradient: "linear-gradient(135deg, rgba(201,168,76,0.14), rgba(160,130,50,0.06))",
    border: "rgba(201,168,76,0.18)",
    iconColor: "#C9A84C",
    accentGlow: "0 0 40px rgba(201,168,76,0.06)",
    countSuffix: "Films",
    bgImage: "radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.08) 0%, transparent 60%)",
  },
  {
    id: "series",
    label: "Séries",
    icon: Clapperboard,
    gradient: "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(59,130,246,0.06))",
    border: "rgba(124,58,237,0.18)",
    iconColor: "#7C3AED",
    accentGlow: "0 0 40px rgba(124,58,237,0.06)",
    countSuffix: "Séries",
    bgImage: "radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.08) 0%, transparent 60%)",
  },
];

const QUICK_BUTTONS = [
  { label: "Guide EPG", icon: BookOpen, action: "epg" },
  { label: "Rattrapage", icon: Rewind, action: "catchup" },
  { label: "Enregistrements", icon: Circle, action: "recordings" },
  { label: "Playlist", icon: Layers, action: "playlist" },
  { label: "Radio", icon: Radio, action: "radio" },
  { label: "TV Démo", icon: Monitor, action: "demo" },
];

// Header buttons for TV D-pad navigation
const HEADER_BUTTONS = [
  { id: "settings", label: "Paramètres", icon: Settings },
  { id: "refresh", label: "Actualiser", icon: ArrowRight },
  { id: "quit", label: "Quitter", icon: ArrowRight },
];

export function DashboardCards({
  playlists, allChannels, allVod, allSeries,
  onTabSelect, onPlay, activePlaylistId, onPlaylistSelect,
  onShowEpg, onShowRecordings, onAddPlaylist, onOpenSettings,
}: DashboardCardsProps) {
  const counts = useMemo(() => ({
    live: allChannels.length,
    films: allVod.length,
    series: allSeries.length,
  }), [allChannels.length, allVod.length, allSeries.length]);

  // TV D-pad navigation layout:
  // Row -1: header buttons (indices -3, -2, -1) => settings, refresh, quit
  // Row 0: stat cards (0-2)
  // Row 1: quick buttons top (3-5)
  // Row 2: quick buttons bottom (6-8)
  // Row 3: premium (9)
  // We use negative indices for header, mapped as: -3=settings, -2=refresh, -1=quit
  const [tvFocus, setTvFocus] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key;
    if (key === "ArrowUp") {
      e.preventDefault();
      if (tvFocus >= 9) setTvFocus(6); // premium → quick row 2
      else if (tvFocus >= 6) setTvFocus(Math.min(tvFocus - 3, 2)); // quick row2 → stat
      else if (tvFocus >= 3) setTvFocus(Math.min(tvFocus - 3, 2)); // quick row1 → stat
      else if (tvFocus >= 0) setTvFocus(-3 + tvFocus); // stat → header (map 0→-3, 1→-2, 2→-1)
      // already in header, do nothing
    } else if (key === "ArrowDown") {
      e.preventDefault();
      if (tvFocus < -2) setTvFocus(0); // header left → stat left
      else if (tvFocus === -2) setTvFocus(1); // header middle → stat middle
      else if (tvFocus === -1) setTvFocus(2); // header right → stat right
      else if (tvFocus < 3) setTvFocus(Math.min(tvFocus + 3, 8)); // stat → quick row1
      else if (tvFocus < 6) setTvFocus(Math.min(tvFocus + 3, 8)); // quick row1 → quick row2
      else if (tvFocus < 9) setTvFocus(9); // quick row2 → premium
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      if (tvFocus === -2) setTvFocus(-3);
      else if (tvFocus === -1) setTvFocus(-2);
      else if (tvFocus > 0 && tvFocus < 3) setTvFocus(tvFocus - 1);
      else if (tvFocus > 3 && tvFocus < 6) setTvFocus(tvFocus - 1);
      else if (tvFocus > 6 && tvFocus < 9) setTvFocus(tvFocus - 1);
    } else if (key === "ArrowRight") {
      e.preventDefault();
      if (tvFocus === -3) setTvFocus(-2);
      else if (tvFocus === -2) setTvFocus(-1);
      else if (tvFocus < 2) setTvFocus(tvFocus + 1);
      else if (tvFocus >= 3 && tvFocus < 5) setTvFocus(tvFocus + 1);
      else if (tvFocus >= 6 && tvFocus < 8) setTvFocus(tvFocus + 1);
    } else if (key === "Enter") {
      e.preventDefault();
      if (tvFocus === -3) onOpenSettings?.();
      else if (tvFocus === -2) window.location.reload();
      else if (tvFocus === -1) { /* quit handled by header */ }
      else if (tvFocus < 3) {
        onTabSelect(STAT_CARDS[tvFocus].id);
      } else if (tvFocus < 9) {
        const btn = QUICK_BUTTONS[tvFocus - 3];
        if (btn.action === "playlist") onAddPlaylist?.();
        else if (btn.action === "epg") onShowEpg?.();
        else if (btn.action === "recordings") onShowRecordings?.();
        else if (btn.action === "radio") onTabSelect("radio");
        else if (btn.action === "demo") { window.location.href = "/demo"; }
      } else {
        // premium
      }
    }
  }, [tvFocus, onTabSelect, onAddPlaylist, onShowEpg, onShowRecordings, onOpenSettings]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const tvFocusStyle = (i: number) =>
    tvFocus === i
      ? {
          boxShadow: "0 0 0 3px #FF6D00, 0 0 30px rgba(255,109,0,0.25), 0 0 60px rgba(255,109,0,0.1)",
          transform: "scale(1.04)",
          transition: "all 150ms ease",
        }
      : {};

  // Get MAC and expiration from first xtream playlist
  const xtreamPlaylist = playlists.find(p => p.isXtream && p.xtreamAccountInfo);
  const macAddress = xtreamPlaylist?.xtreamMac || localStorage.getItem("chouf_device_mac") || generateMac();
  const expDate = xtreamPlaylist?.xtreamAccountInfo?.exp_date;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center px-8 py-6 max-w-[1400px] mx-auto w-full">
        
        {/* 3 Stat cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {STAT_CARDS.map((card, i) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              onClick={() => onTabSelect(card.id)}
              className="group relative rounded-2xl p-6 text-left overflow-hidden transition-all backdrop-blur-md"
              style={{
                background: card.gradient,
                border: `1px solid ${card.border}`,
                boxShadow: card.accentGlow,
                minHeight: 200,
                ...tvFocusStyle(i),
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: card.bgImage }} />
              <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{ background: `linear-gradient(180deg, transparent 0%, ${card.iconColor}08 100%)` }} />
              <h3 className="text-[17px] font-bold mb-3" style={{ color: "#F5F5F7" }}>{card.label}</h3>
              <div className="flex justify-center my-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl opacity-20" style={{ background: card.iconColor }} />
                  <card.icon size={52} strokeWidth={1.5}
                    style={{ color: card.iconColor, filter: `drop-shadow(0 0 14px ${card.iconColor}50)` }} />
                </div>
              </div>
              <p className="text-[28px] font-black" style={{ color: "#F5F5F7" }}>
                {counts[card.id as keyof typeof counts].toLocaleString()}
              </p>
              <p className="text-[12px] font-medium -mt-0.5" style={{ color: "#86868B" }}>
                {card.countSuffix}
              </p>
              <ArrowRight size={18} className="absolute bottom-5 right-5 transition-colors opacity-20 group-hover:opacity-60"
                style={{ color: card.iconColor }} />
            </motion.button>
          ))}
        </div>

        {/* Quick buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {QUICK_BUTTONS.map((btn, qi) => (
            <button
              key={btn.label}
              onClick={() => {
                if (btn.action === "playlist") onAddPlaylist?.();
                else if (btn.action === "epg") onShowEpg?.();
                else if (btn.action === "recordings") onShowRecordings?.();
                else if (btn.action === "radio") onTabSelect("radio");
                else if (btn.action === "demo") { window.location.href = "/demo"; }
              }}
              className="flex flex-col items-center gap-2.5 rounded-xl py-4 px-3 transition-all hover:bg-white/5 backdrop-blur-sm"
              style={{
                background: "rgba(19,19,24,0.5)",
                border: "1px solid rgba(28,28,36,0.5)",
                ...tvFocusStyle(qi + 3),
              }}
            >
              <btn.icon size={20} style={{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.3))" }} />
              <span className="text-[11px] font-medium" style={{ color: "#86868B" }}>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Premium Banner */}
        <div style={tvFocusStyle(9)}>
          <PremiumBanner />
        </div>
      </div>

      {/* Footer */}
      <DashboardFooter macAddress={macAddress} expDate={expDate} />
    </div>
  );
}

function generateMac(): string {
  const stored = localStorage.getItem("chouf_device_mac");
  if (stored) return stored;
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase();
  const mac = `00:1A:${hex()}:${hex()}:${hex()}:${hex()}`;
  localStorage.setItem("chouf_device_mac", mac);
  return mac;
}

function DashboardFooter({ macAddress, expDate }: { macAddress: string; expDate?: string }) {
  const formatExp = () => {
    if (!expDate) return null;
    try {
      const d = new Date(Number(expDate) * 1000);
      if (isNaN(d.getTime())) return null;
      const now = new Date();
      const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const formatted = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
      return { date: formatted, days: diff };
    } catch { return null; }
  };

  const exp = formatExp();

  return (
    <div className="shrink-0 px-8 py-3 flex items-center justify-between"
      style={{ borderTop: "1px solid rgba(28,28,36,0.5)", background: "rgba(10,10,15,0.6)" }}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Fingerprint size={14} style={{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.4))" }} />
          <span className="text-[11px]" style={{ color: "#48484A" }}>MAC</span>
           <span className="text-[12px] tracking-wider" style={{ 
            color: "#C9A84C", 
            fontFamily: "'Roboto Mono', 'SF Mono', monospace",
            fontWeight: 400,
            letterSpacing: "0.08em"
          }}>{macAddress}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {exp && (
          <div className="flex items-center gap-2">
            <span className="text-[11px]" style={{ color: "#48484A" }}>Expire</span>
            <span className="text-[12px] tracking-wide" style={{
              color: exp.days > 30 ? "#34C759" : exp.days > 7 ? "#FFD60A" : "#FF3B30",
              fontFamily: "'Roboto Mono', 'SF Mono', monospace",
              fontWeight: 400,
            }}>
              {exp.date}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
              background: exp.days > 30 ? "rgba(52,199,89,0.1)" : exp.days > 7 ? "rgba(255,214,10,0.1)" : "rgba(255,59,48,0.1)",
              color: exp.days > 30 ? "#34C759" : exp.days > 7 ? "#FFD60A" : "#FF3B30",
            }}>
              {exp.days}j
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function PremiumBanner() {
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);
  const paymentUrl = "https://choufplay.app/premium";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate("/premium")}
        className="relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
        style={{
          background: "linear-gradient(135deg, rgba(30,25,18,0.95), rgba(20,18,14,0.90))",
          border: "1px solid rgba(201,168,76,0.15)",
        }}
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.07]" style={{
          width: 100, height: 65, borderRadius: 10,
          background: "linear-gradient(135deg, #C9A84C, #FF6D00)",
          transform: "translateY(-50%) rotate(-12deg)",
        }} />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-[0.04]" style={{
          width: 100, height: 65, borderRadius: 10,
          background: "linear-gradient(135deg, #C9A84C, #FF6D00)",
          transform: "translateY(-50%) rotate(-6deg)",
        }} />
        <div className="flex items-center gap-4 px-5 py-4 relative z-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(201,168,76,0.12)" }}>
            <Crown size={22} style={{ color: "#C9A84C", filter: "drop-shadow(0 0 6px rgba(201,168,76,0.5))" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold" style={{ color: "#F5F5F7" }}>
              CHOUF Play <span style={{ color: "#C9A84C" }}>Premium</span>
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "#86868B" }}>
              Multi-playlists, EPG, Xtream, PiP, thèmes personnalisés
            </p>
            <p className="text-[12px] font-bold mt-1" style={{ color: "#C9A84C" }}>8,99 €/an · 24,99 € à vie</p>
          </div>
          <ArrowRight size={18} style={{ color: "#C9A84C40" }} />
        </div>
      </motion.div>

      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setQrOpen(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl p-6 text-center max-w-sm mx-4"
            style={{ background: "#1A1A2E", border: "1px solid #22223A" }}
            onClick={e => e.stopPropagation()}
          >
            <Crown size={32} style={{ color: "#C9A84C", margin: "0 auto 12px", filter: "drop-shadow(0 0 10px rgba(201,168,76,0.5))" }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: "#F5F5F7" }}>Activer Premium</h3>
            <p className="text-[12px] mb-4" style={{ color: "#86868B" }}>Scannez le QR code pour accéder au paiement</p>
            <div className="mx-auto mb-4 rounded-xl p-3 inline-block" style={{ background: "#fff" }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentUrl)}`}
                alt="QR Code Premium" width={200} height={200}
              />
            </div>
            <p className="text-[11px] mb-3" style={{ color: "#48484A" }}>{paymentUrl}</p>
            <button onClick={() => setQrOpen(false)}
              className="rounded-xl px-6 py-2 text-[13px] font-semibold transition-colors hover:opacity-80"
              style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
              Fermer
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
