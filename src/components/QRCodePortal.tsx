import { useState } from "react";
import { QrCode, ExternalLink, Copy, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PORTAL_URL = "https://chouf-play.lovable.app";
const DEVICE_CODE_KEY = "chouf_device_code";

function generateDeviceCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
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

interface QRCodePortalProps {
  open: boolean;
  onClose: () => void;
}

export function QRCodePortal({ open, onClose }: QRCodePortalProps) {
  const [copied, setCopied] = useState(false);
  const deviceCode = getDeviceCode();
  const portalUrl = `${PORTAL_URL}?device=${deviceCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="qr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 99998 }}
            onClick={onClose}
          />
          <motion.div
            key="qr-dialog"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '85vw',
              maxWidth: '360px',
              maxHeight: '70vh',
              overflowY: 'auto' as const,
              zIndex: 99999,
              background: '#1A1A24',
              borderRadius: '16px',
              border: '1px solid #252530',
            }}
          >
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #252530" }}>
              <div className="flex items-center gap-2">
                <QrCode size={18} style={{ color: "#FF6D00" }} />
                <span className="text-[14px] font-semibold" style={{ color: "#F5F5F7" }}>Ajouter à distance</span>
              </div>
              <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:bg-[#252530]">
                <X size={16} style={{ color: "#86868B" }} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 px-5 py-4">
              <p className="text-center text-[11px] leading-relaxed" style={{ color: "#86868B" }}>
                Scannez ce QR code depuis votre mobile pour gérer les playlists.
              </p>

              <div className="flex items-center justify-center overflow-hidden rounded-2xl p-3" style={{ background: "#F5F5F7" }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(portalUrl)}&bgcolor=F5F5F7&color=0A0A0F&margin=1`}
                  alt="QR code portail CHOUF Play"
                  style={{ display: "block", maxWidth: 160, width: "100%", height: "auto", imageRendering: "pixelated" }}
                  className="rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl px-4 py-2" style={{ background: "#12121A", border: "1px solid #252530" }}>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "#48484A" }}>Code</span>
                <span className="text-[16px] font-mono font-bold tracking-[4px]" style={{ color: "#FF6D00" }}>{deviceCode}</span>
              </div>

              <div className="flex w-full items-center gap-2">
                <div className="flex-1 truncate rounded-lg px-3 py-2 text-[10px] font-mono" style={{ background: "#12121A", color: "#86868B", border: "1px solid #252530" }}>
                  {portalUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium transition-all hover:opacity-80"
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
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
