"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wallet } from "lucide-react";

function PinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } else {
      setError("Galat PIN, dobara try karo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <Wallet size={24} />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Kharcha Tracker
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            PIN daal ke aage badho.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-center text-lg tracking-widest outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800"
          />
          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Unlock"}
          </button>
          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}
        </form>
      </div>
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
