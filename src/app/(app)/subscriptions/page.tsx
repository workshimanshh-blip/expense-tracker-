"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { useData } from "@/lib/data-context";
import { CategoryIcon } from "@/components/CategoryIcon";
import { daysUntil, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function SubscriptionsPage() {
  const { expenses, categories, loading } = useData();

  const recurring = useMemo(() => {
    const seen = new Set<string>();
    return expenses
      .filter((e) => e.is_recurring && e.next_due_date)
      .filter((e) => {
        // one row per category+amount combo (latest occurrence)
        const key = `${e.category_id}-${e.amount}-${e.recurrence_frequency}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.next_due_date!).getTime() -
          new Date(b.next_due_date!).getTime(),
      );
  }, [expenses]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        Loading...
      </p>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Recurring bills aur subscriptions, renewal date ke hisaab se.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-4">
        {recurring.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Koi recurring expense nahi hai. Expense add karte waqt
            &quot;recurring&quot; toggle on karo.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {recurring.map((e, i) => {
              const category = categoryMap.get(e.category_id);
              const daysLeft = daysUntil(e.next_due_date!);
              const soon = daysLeft >= 0 && daysLeft <= 7;
              return (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                  className="flex items-center gap-3 py-3"
                >
                  <CategoryIcon
                    icon={category?.icon ?? "repeat"}
                    color={category?.color ?? "#8b5cf6"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {e.note || category?.name || "Subscription"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.recurrence_frequency === "monthly" ? "Monthly" : "Yearly"}{" "}
                      · Next due {format(new Date(e.next_due_date!), "d MMM yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-tabular text-sm font-semibold text-foreground">
                      {formatCurrency(e.amount)}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        soon ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {daysLeft < 0
                        ? "Overdue"
                        : daysLeft === 0
                          ? "Due today"
                          : `${daysLeft}d left`}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}
