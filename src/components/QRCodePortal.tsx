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
          <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 99999 }}
          >
            <div className="flex flex-col items-center justify-center rounded-2xl p-6" style={{ background: "#131318", border: "1px solid #252530" }}>
              <button onClick={onClose} className="absolute top-4 right-4 rounded-lg p-1 transition-colors hover:bg-[#252530]">
                <X size={16} style={{ color: "#86868B" }} />
              </button>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(portalUrl)}&bgcolor=F5F5F7&color=0A0A0F&margin=1`}
                alt="QR Code"
                className="w-56 h-56 object-contain rounded-xl"
                style={{ background: "#F5F5F7", padding: 8 }}
              />
              <p className="mt-4 text-[14px] font-medium" style={{ color: "#F5F5F7" }}>
                Scannez pour ajouter votre playlist
              </p>
              <div className="flex items-center gap-2 mt-3 rounded-xl px-4 py-2" style={{ background: "#12121A", border: "1px solid #252530" }}>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "#48484A" }}>Code</span>
                <span className="text-[16px] font-mono font-bold tracking-[4px]" style={{ color: "#FF6D00" }}>{deviceCode}</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
