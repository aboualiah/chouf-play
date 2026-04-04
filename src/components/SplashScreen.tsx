import { motion, AnimatePresence } from "framer-motion";
import ChoufPlayLogo from "./ChoufPlayLogo";

interface SplashScreenProps {
  show: boolean;
}

export function SplashScreen({ show }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Ambient glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              width: 600,
              height: 600,
              background: "radial-gradient(circle, hsl(var(--cp-orange) / 0.1), transparent 70%)",
            }}
          />

          {/* Logo with 3D entrance */}
          <motion.div
            initial={{ scale: 0, rotateY: -90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-6"
            style={{ perspective: 800 }}
          >
            <ChoufPlayLogo size={140} showCP={true} animate={true} />
          </motion.div>

          {/* App name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-[44px] leading-none tracking-tight">
              <span className="font-black text-foreground">CHOUF</span>
              <span className="font-light text-primary"> Play</span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="mt-3 text-[11px] font-semibold uppercase text-accent"
            style={{ letterSpacing: "4px" }}
          >
            Léger · Rapide · 4K
          </motion.p>

          {/* Gold line */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 120, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6, ease: "easeInOut" }}
            className="mt-6 h-[1.5px] rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--cp-gold)), transparent)" }}
          />

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.3 }}
            className="mt-8 flex gap-1.5"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>

          {/* Dev credit */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 3.5, duration: 0.5 }}
            className="absolute bottom-8 text-[10px] text-muted-foreground"
          >
            par I-Success
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
