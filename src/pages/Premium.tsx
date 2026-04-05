import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Crown, Users, MonitorOff, Headphones, Check } from "lucide-react";

const PLANS = [
  { id: "lifetime", price: "24,99 €", period: "À vie", badge: "Meilleure offre" },
  { id: "yearly", price: "8,99 €", period: "/an", badge: null },
];

const FEATURES = [
  { icon: Users, label: "Profils illimités" },
  { icon: MonitorOff, label: "Sans publicité" },
  { icon: Headphones, label: "Support prioritaire" },
];

export default function Premium() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("lifetime");
  const paymentUrl = "https://choufplay.app/premium";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4 py-10" style={{ background: "#0A0A0F" }}>
      {/* Close */}
      <button
        onClick={() => navigate("/", { replace: true })}
        className="absolute top-5 right-5 rounded-full p-2 transition-colors hover:bg-white/5 z-20"
        style={{ background: "#131318", border: "1px solid #1C1C24" }}
      >
        <X size={18} style={{ color: "#86868B" }} />
      </button>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: 600, height: 400, background: "radial-gradient(ellipse, rgba(124,58,237,0.08), transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl text-center"
      >
        {/* Crown */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.1))", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <Crown size={32} style={{ color: "#A78BFA", filter: "drop-shadow(0 0 10px rgba(167,139,250,0.5))" }} />
        </motion.div>

        <h1 className="text-[22px] font-bold mb-2" style={{ color: "#F5F5F7" }}>
          Débloquer les fonctionnalités <span style={{ color: "#A78BFA" }}>Premium</span>
        </h1>

        {/* Features */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <f.icon size={16} style={{ color: "#A78BFA" }} />
              <span className="text-[12px] font-medium" style={{ color: "#86868B" }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
          {PLANS.map((plan, i) => {
            const isActive = selected === plan.id;
            const isLifetime = plan.id === "lifetime";
            return (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                onClick={() => setSelected(plan.id)}
                className="relative rounded-2xl p-5 text-center transition-all"
                style={{
                  background: isLifetime
                    ? "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.08))"
                    : "#131318",
                  border: isActive
                    ? isLifetime ? "2px solid #A78BFA" : "2px solid #FF6D00"
                    : "1px solid #1C1C24",
                  boxShadow: isActive && isLifetime ? "0 0 30px rgba(124,58,237,0.15)" : "none",
                }}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ background: "#34C759", color: "#fff" }}>
                    {plan.badge}
                  </span>
                )}
                <p className="text-[20px] font-black mb-1" style={{ color: "#F5F5F7" }}>{plan.price}</p>
                <p className="text-[12px] font-medium" style={{ color: "#86868B" }}>{plan.period}</p>
                {isActive && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full flex items-center justify-center"
                    style={{ background: isLifetime ? "#A78BFA" : "#FF6D00" }}>
                    <Check size={12} style={{ color: "#fff" }} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          className="w-full max-w-sm mx-auto rounded-2xl py-3.5 text-[14px] font-bold transition-all hover:opacity-90 block mb-6"
          style={{
            background: "linear-gradient(135deg, #FF6D00, #FF8C38)",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(255,109,0,0.3)",
          }}
        >
          Continuer
        </button>

        {/* QR Code */}
        <div className="mx-auto rounded-xl p-3 inline-block mb-3" style={{ background: "#fff" }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(paymentUrl)}`}
            alt="QR Code Premium" width={160} height={160}
          />
        </div>
        <p className="text-[11px]" style={{ color: "#48484A" }}>
          Scannez pour accéder au paiement
        </p>
      </motion.div>
    </div>
  );
}
