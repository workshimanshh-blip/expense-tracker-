"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useData } from "@/lib/data-context";
import { CategoryIcon } from "./CategoryIcon";
import { format } from "date-fns";

export function QuickAddBar({ onOpenDetailed }: { onOpenDetailed: () => void }) {
  const { categories, addExpense } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    const value = Number(amount);
    if (!selectedId || !value || value <= 0) return;
    setSaving(true);
    await addExpense({
      category_id: selectedId,
      amount: value,
      note: null,
      spent_on: format(new Date(), "yyyy-MM-dd"),
      is_recurring: false,
      recurrence_frequency: null,
      next_due_date: null,
    });
    setAmount("");
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
        Quick add
      </p>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition ${
              selectedId === c.id
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
            }`}
          >
            <CategoryIcon icon={c.icon} color={c.color} size={16} />
            <span className="text-neutral-700 dark:text-neutral-200">
              {c.name}
            </span>
          </button>
        ))}
        <button
          onClick={onOpenDetailed}
          className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-dashed border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-500 dark:border-neutral-700"
        >
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Plus size={16} />
          </span>
          Detailed
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <button
          onClick={submit}
          disabled={!selectedId || !amount || saving}
          className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {!selectedId && (
        <p className="mt-2 text-xs text-neutral-400">
          Pehle ek category chuno, phir amount daal ke Add karo.
        </p>
      )}
    </div>
  );
}
