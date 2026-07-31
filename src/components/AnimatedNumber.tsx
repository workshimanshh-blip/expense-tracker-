"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useReducedMotion } from "motion/react";

export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(0, { damping: 22, stiffness: 90 });
  const display = useTransform(spring, (v) => format(Math.round(v)));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduceMotion) return;
    spring.set(value);
  }, [value, spring, reduceMotion]);

  useEffect(() => {
    return display.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
  }, [display]);

  return (
    <motion.span ref={ref} className={className}>
      {format(reduceMotion ? value : 0)}
    </motion.span>
  );
}
