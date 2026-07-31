import { formatCurrency } from "@/lib/utils";

export function BudgetProgressBar({
  label,
  spent,
  limit,
  color = "#10b981",
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
        <span className="font-medium text-neutral-700 dark:text-neutral-200">
          {label}
        </span>
        <span
          className={
            overBudget
              ? "font-medium text-red-500"
              : "text-neutral-500 dark:text-neutral-400"
          }
        >
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: overBudget ? "#ef4444" : color,
          }}
        />
      </div>
    </div>
  );
}
