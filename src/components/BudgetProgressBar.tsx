"use client";

import { motion } from "motion/react";
import { formatCurrency } from "@/lib/utils";

export function BudgetProgressBar({
  label,
  spent,
  limit,
  color = "#f59e0b",
}: {
  label: string;
  spent: number;
  limit: number;
  color?: string;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const overBudget = limit > 0 && spent > limit;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span
          className={`font-tabular ${
            overBudget ? "font-medium text-destructive" : "text-muted-foreground"
          }`}
        >
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          style={{
            backgroundColor: overBudget ? "var(--destructive)" : color,
          }}
        />
      </div>
    </div>
  );
}
