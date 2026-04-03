import { useState, useEffect } from "react";
import { QrCode, ExternalLink, Copy, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PORTAL_URL = "https://chouf-play.lovable.app";
const DEVICE_CODE_KEY = "chouf_device_code";

function generateDeviceCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getDeviceCode(): string {
  let code = localStorage.getItem(DEVICE_CODE_KEY);
  if (!code) {
    code = generateDeviceCode();
    localStorage.setItem(DEVICE_CODE_KEY, code);
  }
  return code;
}

// Simple QR code generator using SVG (no external dependency)
function QRCodeSVG({ value, size = 140 }: { value: string; size?: number }) {
  // Use a simple visual representation - encode URL as a QR-like grid
  // For production, use a real QR lib. Here we create a styled placeholder.
  const portalLink = value;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: "#F5F5F7",
          padding: 8,
        }}
      >
        {/* QR code image from API */}
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(portalLink)}&bgcolor=F5F5F7&color=0A0A0F&margin=1`}
          alt="QR Code"
          width={size - 16}
          height={size - 16}
          className="rounded"
          style={{ imageRendering: "pixelated" }}
        />
        {/* Center logo overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "#FF6D00" }}>
            <span className="text-[8px] font-black text-white">CP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QRCodePortalProps {
  open: boolean;
  onClose: () => void;
}

export function QRCodePortal({ open, onClose }: QRCodePortalProps) {
  const [copied, setCopied] = useState(false);
  const deviceCode = getDeviceCode();
  const portalUrl = `${PORTAL_URL}?device=${deviceCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[360px] max-w-[90vw] rounded-2xl overflow-hidden"
            style={{ background: "#131318", border: "1px solid #1C1C24" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1C1C24" }}>
              <div className="flex items-center gap-2">
                <QrCode size={18} style={{ color: "#FF6D00" }} />
                <span className="text-[14px] font-semibold" style={{ color: "#F5F5F7" }}>
                  Ajouter à distance
                </span>
              </div>
              <button onClick={onClose} className="rounded-lg p-1 hover:bg-[#1C1C24] transition-colors">
                <X size={16} style={{ color: "#86868B" }} />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-5 flex flex-col items-center gap-4">
              <p className="text-[12px] text-center leading-relaxed" style={{ color: "#86868B" }}>
                Scannez ce QR code depuis votre mobile pour ajouter et gérer vos playlists à distance
              </p>

              <QRCodeSVG value={portalUrl} size={160} />

              {/* Device code */}
              <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "#0A0A0F", border: "1px solid #1C1C24" }}>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "#48484A" }}>Code appareil</span>
                <span className="text-[16px] font-mono font-bold tracking-[4px]" style={{ color: "#FF6D00" }}>
                  {deviceCode}
                </span>
              </div>

              {/* URL + copy */}
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 rounded-lg px-3 py-2 truncate text-[10px] font-mono" style={{ background: "#0A0A0F", color: "#86868B", border: "1px solid #1C1C24" }}>
                  {portalUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg px-3 py-2 flex items-center gap-1.5 text-[11px] font-medium transition-all hover:opacity-80"
                  style={{ background: "#FF6D00", color: "#F5F5F7" }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>

              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-medium transition-colors hover:opacity-80"
                style={{ color: "#FF6D00" }}
              >
                <ExternalLink size={12} />
                Ouvrir le portail
              </a>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid #1C1C24" }}>
              <p className="text-[9px]" style={{ color: "#48484A" }}>
                Le client scanne → entre l'URL playlist → synchronisation automatique
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
