import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, QrCode, Globe, Zap, Shield, Crown, Gift, ArrowRight, Fingerprint } from "lucide-react";
import ChoufPlayLogo from "./ChoufPlayLogo";
import { QRCodePortal } from "./QRCodePortal";

interface WelcomeScreenProps {
  onAddPlaylist: () => void;
  onSkipTrial: () => void;
}

function getDeviceId(): string {
  let id = localStorage.getItem("chouf_device_id");
  if (!id) {
    const hex = () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, "0");
    id = Array.from({ length: 6 }, hex).join(":");
    localStorage.setItem("chouf_device_id", id);
  }
  return id;
}

export function WelcomeScreen({ onAddPlaylist, onSkipTrial }: WelcomeScreenProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const [deviceId] = useState(getDeviceId);

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto relative" style={{ background: "#0A0A0F" }}>
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(255,109,0,0.06), transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center px-6 py-10 max-w-lg w-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChoufPlayLogo size={100} showCP animate />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-4"
        >
          <h1 className="text-3xl leading-none tracking-tight">
            <span className="font-black" style={{ color: "#F5F5F7" }}>CHOUF</span>
            <span className="font-light" style={{ color: "#FF6D00" }}> Play</span>
          </h1>
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[4px]" style={{ color: "#C9A84C" }}>
            Léger · Rapide · 4K
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2.5 mt-6 flex-wrap justify-center"
        >
          {[
            { icon: Zap, label: "Ultra-rapide", color: "#FF6D00" },
            { icon: Shield, label: "Zéro pub", color: "#34C759" },
            { icon: Crown, label: "Jusqu'à 4K", color: "#C9A84C" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.1 }}
              className="flex items-center gap-2 rounded-full px-3.5 py-2"
              style={{ background: "rgba(19,19,24,0.8)", border: "1px solid rgba(28,28,36,0.6)" }}
            >
              <f.icon size={13} style={{ color: f.color }} />
              <span className="text-[11px] font-semibold" style={{ color: "#F5F5F7" }}>{f.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Gold divider */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="h-[1px] mt-7 mb-7 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
        />

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex flex-col items-center gap-3 w-full"
        >
          {/* Primary: Add playlist */}
          <button
            onClick={onAddPlaylist}
            className="flex items-center justify-center gap-2.5 rounded-2xl px-8 py-3.5 text-sm font-bold w-full max-w-xs transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #FF6D00, #FF8C38)",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(255,109,0,0.3)",
            }}
          >
            <Plus size={18} />
            Ajouter une playlist
          </button>

          {/* Secondary row: QR + Website */}
          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={() => setQrOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08))",
                border: "1px solid rgba(201,168,76,0.25)",
                color: "#C9A84C",
              }}
            >
              <QrCode size={16} />
              À distance
            </button>
            <a
              href="https://choufplay.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "rgba(19,19,24,0.8)",
                border: "1px solid rgba(28,28,36,0.6)",
                color: "#86868B",
              }}
            >
              <Globe size={16} />
              Site web
            </a>
          </div>

          <p className="text-[11px] mt-1" style={{ color: "#48484A" }}>
            M3U, URL ou Xtream Codes
          </p>
        </motion.div>

        {/* Free trial banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-7 w-full max-w-xs"
        >
          <button
            onClick={onSkipTrial}
            className="group w-full flex items-center gap-3 rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(52,199,89,0.1), rgba(52,199,89,0.03))",
              border: "1px solid rgba(52,199,89,0.15)",
            }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(52,199,89,0.15)" }}>
              <Gift size={20} style={{ color: "#34C759" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[13px] font-bold" style={{ color: "#34C759" }}>Accès gratuit 10 jours</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#48484A" }}>
                Essayez avec les chaînes démo
              </p>
            </div>
            <ArrowRight size={16} style={{ color: "#34C759" }} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Footer — Device ID + Version + Privacy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-10 flex flex-col items-center gap-2"
        >
          {/* Device ID */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{ background: "rgba(19,19,24,0.6)", border: "1px solid rgba(28,28,36,0.4)" }}>
            <Fingerprint size={12} style={{ color: "#C9A84C" }} />
            <span className="text-[10px]" style={{ color: "#48484A", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "1.5px" }}>
              MAC : {deviceId}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{ background: "rgba(19,19,24,0.6)", border: "1px solid rgba(28,28,36,0.4)" }}>
            <span className="text-[10px]" style={{ color: "#C9A84C" }}>🔑</span>
            <span className="text-[10px]" style={{ color: "#48484A", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "1.5px" }}>
              KEY : {deviceId.replace(/:/g, "").slice(0, 8)}
            </span>
          </div>

          {/* Version + Privacy */}
          <div className="flex items-center gap-3">
            <span className="text-[10px]" style={{ color: "#3A3A3C" }}>v2.0.0</span>
            <span style={{ color: "#3A3A3C" }}>·</span>
            <a href="/privacy" className="text-[10px] hover:underline" style={{ color: "#3A3A3C" }}>
              Politique de confidentialité
            </a>
          </div>

          <p className="text-[9px] mt-1" style={{ color: "#2C2C2E" }}>
            par I-Success
          </p>
        </motion.div>
      </div>

      <QRCodePortal open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}