"use client";

import { motion, useReducedMotion } from "motion/react";

export function AuroraGlow() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      aria-hidden="true"
    >
      <motion.div
        className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
        animate={
          reduceMotion ? undefined : { x: [0, 36, -16, 0], y: [0, -24, 18, 0] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-6 -right-14 h-56 w-56 rounded-full bg-accent/25 blur-3xl"
        animate={
          reduceMotion ? undefined : { x: [0, -28, 18, 0], y: [0, 18, -24, 0] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-gold-light/25 blur-3xl"
        animate={
          reduceMotion ? undefined : { x: [0, 18, -18, 0], y: [0, -14, 14, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
