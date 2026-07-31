import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

export function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "warning" | "danger";
}) {
  const toneClasses = {
    neutral: "bg-secondary text-muted-foreground",
    positive: "bg-success/12 text-success",
    warning: "bg-primary/12 text-primary",
    danger: "bg-destructive/12 text-destructive",
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="glass flex items-center gap-4 rounded-2xl p-4"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses}`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">
          {label}
        </p>
        <p className="font-tabular truncate text-lg font-semibold text-foreground">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
