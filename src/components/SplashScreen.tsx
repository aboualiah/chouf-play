import { motion, AnimatePresence } from "framer-motion";

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
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-orange glow-orange"
          >
            <span className="text-4xl font-extrabold tracking-tight text-primary-foreground">CP</span>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-foreground">
              CHOUF<span className="font-light text-primary">Play</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-2 text-sm font-medium tracking-[0.3em] text-accent"
            >
              IPTV PLAYER
            </motion.p>
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
