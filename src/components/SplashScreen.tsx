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
          transition={{ duration: 0.4 }}
        >
          {/* Logo simple fade-in */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative mb-6"
          >
            <ChoufPlayLogo size={120} showCP={true} animate={false} />
          </motion.div>

          {/* App name */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-center"
          >
            <h1 className="text-[40px] leading-none tracking-tight">
              <span className="font-black text-foreground">CHOUF</span>
              <span className="font-light text-primary"> Play</span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-3 text-[11px] font-semibold uppercase text-accent"
            style={{ letterSpacing: "4px" }}
          >
            Léger · Rapide · 4K
          </motion.p>

          {/* Dev credit */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="absolute bottom-8 text-[10px] text-muted-foreground"
          >
            par I-Success
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
