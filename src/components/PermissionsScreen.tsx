import { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Bell, Check, Shield } from "lucide-react";

interface PermissionsScreenProps {
  onContinue: () => void;
}

export function PermissionsScreen({ onContinue }: PermissionsScreenProps) {
  const [filesGranted, setFilesGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);

  const permissions = [
    {
      icon: FolderOpen,
      title: "Accès aux fichiers et médias",
      desc: "Permet de charger des playlists locales",
      granted: filesGranted,
      onGrant: () => setFilesGranted(true),
    },
    {
      icon: Bell,
      title: "Notifications",
      desc: "Rappels matchs et programmes",
      granted: notifGranted !== null,
      optional: true,
      onGrant: () => setNotifGranted(true),
      onSkip: () => setNotifGranted(false),
    },
  ];

  return (
    <div className="flex h-screen w-full items-center justify-center" style={{ background: "#0A0A0F" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg px-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(201,168,76,0.12)" }}>
            <Shield size={20} style={{ color: "#C9A84C" }} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: "#F5F5F7" }}>Autorisations requises</h1>
            <p className="text-[11px] mt-0.5" style={{ color: "#48484A" }}>Ces permissions améliorent votre expérience</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {permissions.map((perm, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="rounded-xl p-4 flex items-center gap-4"
              style={{ background: "#131318", border: "1px solid #1C1C24" }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: perm.granted ? "rgba(52,199,89,0.12)" : "rgba(255,109,0,0.12)" }}>
                {perm.granted ? (
                  <Check size={20} style={{ color: "#34C759" }} />
                ) : (
                  <perm.icon size={20} style={{ color: "#FF6D00" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: "#F5F5F7" }}>{perm.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#48484A" }}>{perm.desc}</p>
              </div>
              {!perm.granted ? (
                <div className="flex gap-2">
                  {perm.optional && (
                    <button
                      onClick={perm.onSkip}
                      className="rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors"
                      style={{ color: "#48484A" }}
                    >
                      Plus tard
                    </button>
                  )}
                  <button
                    onClick={perm.onGrant}
                    className="rounded-lg px-4 py-1.5 text-[11px] font-semibold transition-all hover:opacity-90"
                    style={{ background: "rgba(255,109,0,0.15)", color: "#FF6D00", border: "1px solid rgba(255,109,0,0.2)" }}
                  >
                    Autoriser
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-medium" style={{ color: "#34C759" }}>Accordé</span>
              )}
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => {
            localStorage.setItem("chouf_permissions_done", "true");
            localStorage.setItem("chouf_onboarding_done", "true");
            onContinue();
          }}
          disabled={!filesGranted}
          className="w-full rounded-2xl py-3.5 text-[14px] font-bold transition-all"
          style={{
            background: filesGranted ? "linear-gradient(135deg, #FF6D00, #FF8C38)" : "#1C1C24",
            color: filesGranted ? "#fff" : "#48484A",
            boxShadow: filesGranted ? "0 8px 32px rgba(255,109,0,0.3)" : "none",
            cursor: filesGranted ? "pointer" : "not-allowed",
          }}
        >
          Continuer
        </button>
      </motion.div>
    </div>
  );
}
