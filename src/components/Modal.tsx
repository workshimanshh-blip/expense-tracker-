"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <DialogPrimitive.Root open onOpenChange={(next) => !next && setOpen(false)}>
      <DialogPrimitive.Portal forceMount>
        <AnimatePresence>
          {open && (
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
            </DialogPrimitive.Overlay>
          )}
        </AnimatePresence>
        <AnimatePresence onExitComplete={onClose}>
          {open && (
            <DialogPrimitive.Content
              asChild
              forceMount
              onEscapeKeyDown={() => setOpen(false)}
            >
              <motion.div
                className="glass fixed inset-x-0 bottom-0 z-30 max-h-[85vh] overflow-y-auto rounded-t-2xl p-5 sm:top-1/2 sm:right-0 sm:left-0 sm:bottom-auto sm:mx-auto sm:w-full sm:max-w-md sm:-translate-y-1/2 sm:rounded-2xl"
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <DialogPrimitive.Title className="font-display text-lg text-foreground">
                    {title}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Close
                    onClick={() => setOpen(false)}
                    className="cursor-pointer rounded-full p-1 text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
                  >
                    <X size={18} />
                  </DialogPrimitive.Close>
                </div>
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
