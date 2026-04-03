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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Ambient glow */}
          <div className="absolute w-[400px] h-[400px] rounded-full" style={{
            background: "radial-gradient(circle, hsl(24 100% 50% / 0.06), transparent 70%)"
          }} />

          {/* TV Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-8"
          >
            <TvIcon size={160} animated showPlayButton showStand showLetters />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl tracking-tight leading-none">
              <span className="font-bold text-foreground">CHOUF</span>{" "}
              <span className="font-light text-primary">Play</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-3"
          >
            <p className="text-xs tracking-[4px] uppercase font-medium text-accent">
              Léger · Rapide · 4K
            </p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ delay: 0.6, duration: 1.8, ease: "easeInOut" }}
            className="mt-8 h-0.5 rounded-full bg-gradient-orange"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
