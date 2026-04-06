import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, QrCode, Globe, ArrowRight, Fingerprint, Shield, Gift } from "lucide-react";
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
  const [focusIndex, setFocusIndex] = useState(0);

  const items = [
    { label: "Ajouter une playlist", action: onAddPlaylist },
    { label: "À distance", action: () => setQrOpen(true) },
    { label: "Accès gratuit 10 jours", action: onSkipTrial },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (qrOpen) return;
    const key = e.key;
    if (key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex(prev => Math.max(0, prev - 1));
    } else if (key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex(prev => Math.min(items.length - 1, prev + 1));
    } else if (key === "Enter") {
      e.preventDefault();
      items[focusIndex]?.action();
    }
  }, [qrOpen, focusIndex, items]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const focusStyle = (i: number) =>
    focusIndex === i
      ? {
          boxShadow: "0 0 0 3px #FF6D00, 0 0 30px rgba(255,109,0,0.25), 0 0 60px rgba(255,109,0,0.1)",
          transform: "scale(1.04)",
        }
      : {};

  return (
    <div className="flex h-screen w-full overflow-y-auto" style={{ background: "#151524" }}>
      <div className="flex flex-col items-center justify-center w-full min-h-screen px-5 py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center w-full max-w-md"
        >
          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              onClick={onAddPlaylist}
              className="flex items-center justify-center gap-2.5 rounded-2xl px-8 py-3.5 text-sm font-bold w-full max-w-xs transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #FF6D00, #FF8C38)",
                color: "#fff",
                boxShadow: "0 8px 32px rgba(255,109,0,0.3)",
                ...focusStyle(0),
              }}
            >
              <Plus size={18} />
              Ajouter une playlist
            </button>

            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={() => setQrOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08))",
                  border: "1px solid rgba(201,168,76,0.25)",
                  color: "#C9A84C",
                  ...focusStyle(1),
                }}
              >
                <QrCode size={16} />
                À distance
              </button>
              <a
                href="https://choufplay.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "rgba(26,26,36,0.8)",
                  border: "1px solid rgba(37,37,48,0.6)",
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
          </div>

          {/* Free trial */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-5 w-full max-w-xs"
          >
            <button
              onClick={onSkipTrial}
              className="group w-full flex items-center gap-3 rounded-2xl p-3.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, rgba(52,199,89,0.1), rgba(52,199,89,0.03))",
                border: "1px solid rgba(52,199,89,0.15)",
                ...focusStyle(2),
              }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(52,199,89,0.15)" }}>
                <Gift size={18} style={{ color: "#34C759" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[12px] font-bold" style={{ color: "#34C759" }}>Accès gratuit 10 jours</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#48484A" }}>
                  Essayez avec les chaînes démo
                </p>
              </div>
              <ArrowRight size={16} style={{ color: "#34C759" }} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Footer — Device ID + Key */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-col items-center gap-1.5"
          >
            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5"
              style={{ background: "rgba(26,26,36,0.6)", border: "1px solid rgba(37,37,48,0.4)" }}>
              <Fingerprint size={12} style={{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.4))" }} />
              <span className="text-[10px]" style={{ color: "#48484A", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "2px" }}>
                MAC : {deviceId}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5"
              style={{ background: "rgba(26,26,36,0.6)", border: "1px solid rgba(37,37,48,0.4)" }}>
              <Shield size={12} style={{ color: "#C9A84C", filter: "drop-shadow(0 0 4px rgba(201,168,76,0.4))" }} />
              <span className="text-[10px]" style={{ color: "#48484A", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "2px" }}>
                KEY : {deviceId.replace(/:/g, "").slice(0, 8)}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
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
        </motion.div>
      </div>

      <QRCodePortal open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}
