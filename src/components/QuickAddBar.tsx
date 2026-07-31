"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useData } from "@/lib/data-context";
import { CategoryIcon } from "./CategoryIcon";
import { Button } from "@/components/ui/button";
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
    <div className="glass rounded-2xl p-4">
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        Quick add
      </p>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <motion.button
            key={c.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedId(c.id)}
            className={`flex shrink-0 cursor-pointer flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors duration-150 ${
              selectedId === c.id
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/40 hover:border-primary/40"
            }`}
          >
            <CategoryIcon icon={c.icon} color={c.color} size={16} />
            <span className="text-foreground">{c.name}</span>
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onOpenDetailed}
          className="flex shrink-0 cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:text-foreground"
        >
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-secondary">
            <Plus size={16} />
          </span>
          Detailed
        </motion.button>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="font-tabular w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-150 focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <Button
          onClick={submit}
          disabled={!selectedId || !amount || saving}
          className="shrink-0"
        >
          Add
        </Button>
      </div>
      {!selectedId && (
        <p className="mt-2 text-xs text-muted-foreground">
          Pehle ek category chuno, phir amount daal ke Add karo.
        </p>
      )}
    </div>
  );
}
