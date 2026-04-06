"use client";

import { motion, AnimatePresence } from "motion/react";

export function SpeedUpOverlay({
  visible,
  onSpeedUp,
}: {
  visible: boolean;
  onSpeedUp: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center"
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.80)" }}
          exit={{ backgroundColor: "rgba(0,0,0,0)" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          >
            {/* Small cryptic text */}
            <motion.p
              className="text-sm text-white/40 font-mono tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              Why wait for the future?
            </motion.p>

            {/* The button — minimal, eerie, doesn't belong */}
            <motion.button
              type="button"
              onClick={onSpeedUp}
              className="relative px-8 py-4 text-white/90 font-medium text-lg tracking-wide border border-white/20 rounded-sm backdrop-blur-sm transition-all hover:border-white/50 hover:text-white active:scale-[0.97]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              whileHover={{
                boxShadow: "0 0 30px rgba(255,255,255,0.08)",
              }}
            >
              Speed Up Time
            </motion.button>

            {/* Subtle hint */}
            <motion.p
              className="text-xs text-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0, duration: 1.0 }}
            >
              Let the cosmos decide now
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
