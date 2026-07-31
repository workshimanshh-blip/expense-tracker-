import type { LucideIcon } from "lucide-react";

export function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "warning";
}) {
  const toneClasses = {
    neutral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
    positive: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  }[tone];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <p className="truncate text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {value}
        </p>
      </div>
    </div>
  );
}
