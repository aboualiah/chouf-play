import { useMemo, useState } from "react";
import { Tv, Film, Clapperboard, BookOpen, Rewind, Circle, Radio, ArrowRight, Crown } from "lucide-react";
import { Playlist, getRecent } from "@/lib/storage";
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
    countSuffix: " Chaînes",
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
    countSuffix: " Films",
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
    countSuffix: " Séries",
    bgImage: "radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.08) 0%, transparent 60%)",
  },
];

const QUICK_BUTTONS = [
  { label: "Guide EPG", icon: BookOpen, action: "epg" },
  { label: "Rattrapage", icon: Rewind, action: "catchup" },
  { label: "Enregistrements", icon: Circle, action: "recordings" },
  { label: "Radio", icon: Radio, action: "radio" },
];

export function DashboardCards({
  playlists, allChannels, allVod, allSeries,
  onTabSelect, onPlay, activePlaylistId, onPlaylistSelect,
  onShowEpg, onShowRecordings,
}: DashboardCardsProps) {
  const counts = useMemo(() => ({
    live: allChannels.length,
    films: allVod.length,
    series: allSeries.length,
  }), [allChannels.length, allVod.length, allSeries.length]);

  return (
    <div className="space-y-5 px-5 py-4">
      {/* 3 Stat cards — premium playbox style */}
      <div className="grid grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            onClick={() => onTabSelect(card.id)}
            className="group relative rounded-2xl p-5 text-left overflow-hidden transition-all backdrop-blur-md"
            style={{
              background: card.gradient,
              border: `1px solid ${card.border}`,
              boxShadow: card.accentGlow,
              minHeight: 170,
            }}
            whileHover={{ scale: 1.03 }}
          >
            {/* Premium background texture */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: card.bgImage }} />
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{ background: `linear-gradient(180deg, transparent 0%, ${card.iconColor}08 100%)` }} />

            {/* Title */}
            <h3 className="text-[15px] font-bold mb-2" style={{ color: "#F5F5F7" }}>{card.label}</h3>

            {/* Large icon center */}
            <div className="flex justify-center my-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl opacity-20" style={{ background: card.iconColor }} />
                <card.icon size={44} strokeWidth={1.5}
                  style={{ color: card.iconColor, filter: `drop-shadow(0 0 14px ${card.iconColor}50)` }} />
              </div>
            </div>

            {/* Count */}
            <p className="text-[22px] font-black" style={{ color: "#F5F5F7" }}>
              {counts[card.id as keyof typeof counts].toLocaleString()}
            </p>
            <p className="text-[11px] font-medium -mt-0.5" style={{ color: "#86868B" }}>
              {card.countSuffix}
            </p>

            <ArrowRight size={16} className="absolute bottom-4 right-4 transition-colors opacity-20 group-hover:opacity-60"
              style={{ color: card.iconColor }} />
          </motion.button>
        ))}
      </div>

      {/* Quick buttons */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_BUTTONS.map(btn => (
          <button
            key={btn.label}
            onClick={() => {
              if (btn.action === "radio") onTabSelect("radio");
              else if (btn.action === "epg") onShowEpg?.();
              else if (btn.action === "recordings") onShowRecordings?.();
            }}
            className="flex flex-col items-center gap-2 rounded-xl py-3 px-2 transition-all hover:bg-white/5 backdrop-blur-sm"
            style={{ background: "rgba(19,19,24,0.5)", border: "1px solid rgba(28,28,36,0.5)" }}
          >
            <btn.icon size={18} style={{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.3))" }} />
            <span className="text-[10px] font-medium" style={{ color: "#86868B" }}>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Premium Banner — click opens QR for payment */}
      <PremiumBanner />
    </div>
  );
}

function PremiumBanner() {
  const [qrOpen, setQrOpen] = useState(false);
  const paymentUrl = "https://choufplay.app/premium";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => setQrOpen(true)}
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
            <p className="text-[12px] font-bold mt-1" style={{ color: "#C9A84C" }}>9,99 EUR/an</p>
          </div>
          <ArrowRight size={18} style={{ color: "#C9A84C40" }} />
        </div>
      </motion.div>

      {/* QR Code modal for payment */}
      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setQrOpen(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl p-6 text-center max-w-sm mx-4"
            style={{ background: "#131318", border: "1px solid #1C1C24" }}
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
