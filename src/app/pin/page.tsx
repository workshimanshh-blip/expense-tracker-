"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wallet } from "lucide-react";
import { motion } from "motion/react";
import { AuroraGlow } from "@/components/AuroraGlow";
import { Button } from "@/components/ui/button";

function PinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      setUnlocked(true);
      setTimeout(() => {
        router.push(searchParams.get("next") || "/dashboard");
        router.refresh();
      }, 350);
    } else {
      setError("Galat PIN, dobara try karo.");
      setShakeKey((k) => k + 1);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        key={shakeKey}
        initial={unlocked ? { opacity: 1, scale: 1 } : { opacity: 0, y: 16 }}
        animate={
          unlocked
            ? { opacity: 0, scale: 0.96 }
            : error
              ? { x: [0, -10, 10, -8, 8, 0], opacity: 1, y: 0 }
              : { opacity: 1, y: 0 }
        }
        transition={
          error
            ? { duration: 0.4 }
            : { type: "spring", stiffness: 260, damping: 22 }
        }
        className="glass relative w-full max-w-sm overflow-hidden rounded-2xl p-8"
      >
        <AuroraGlow />
        <div className="relative mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)]">
            <Wallet size={24} />
          </div>
          <h1 className="font-display text-xl text-foreground">
            Kharcha Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            PIN daal ke aage badho.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="relative space-y-3">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2.5 text-center text-lg tracking-widest text-foreground outline-none transition-colors duration-150 focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <Button type="submit" disabled={loading || !pin} className="w-full">
            {loading ? "Checking..." : "Unlock"}
          </Button>
          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </form>
      </motion.div>
    </div>
  );
}

export default function PinPage() {
  return (
    <Suspense>
      <PinForm />
    </Suspense>
  );
}
