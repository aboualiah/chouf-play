import { motion, AnimatePresence } from "framer-motion";
import { TvIcon } from "./TvIcon";

interface SplashScreenProps {
  show: boolean;
}

export function SplashScreen({ show }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "#0A0A0F" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Ambient glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              background: "radial-gradient(circle, hsl(24 100% 50% / 0.08), transparent 70%)",
            }}
          />

          {/* Logo square with 3D rotation */}
          <motion.div
            initial={{ scale: 0, rotateY: -90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-6"
            style={{ perspective: 600 }}
          >
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl glow-orange"
              style={{ background: "linear-gradient(135deg, #FF6D00, #C9A84C)" }}
            >
              <span className="text-2xl font-black tracking-tight text-white">CP</span>
            </div>
          </motion.div>

          {/* App name */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-[40px] leading-none tracking-tight">
              <span className="font-black" style={{ color: "#F5F5F7" }}>CHOUF</span>
              <span className="font-light" style={{ color: "#FF6D00" }}>Play</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="mt-2 text-[11px] font-medium uppercase"
            style={{ color: "#C9A84C", letterSpacing: "4px" }}
          >
            IPTV PLAYER
          </motion.p>

          {/* Gold line */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 100, opacity: 1 }}
            transition={{ delay: 2.2, duration: 1.5, ease: "easeInOut" }}
            className="mt-8 h-[1.5px] rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
          />

          {/* Dev credit */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 3, duration: 0.5 }}
            className="absolute bottom-8 text-[10px]"
            style={{ color: "#86868B" }}
          >
            par I-Success
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
