"use client";

import { useMemo } from "react";
import { useData } from "@/lib/data-context";
import { CategoryIcon } from "@/components/CategoryIcon";
import { daysUntil, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

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
    return <p className="py-20 text-center text-sm text-neutral-400">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          Subscriptions
        </h1>
        <p className="text-sm text-neutral-500">
          Recurring bills aur subscriptions, renewal date ke hisaab se.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        {recurring.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-400">
            Koi recurring expense nahi hai. Expense add karte waqt
            &quot;recurring&quot; toggle on karo.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recurring.map((e) => {
              const category = categoryMap.get(e.category_id);
              const daysLeft = daysUntil(e.next_due_date!);
              const soon = daysLeft >= 0 && daysLeft <= 7;
              return (
                <li key={e.id} className="flex items-center gap-3 py-3">
                  <CategoryIcon
                    icon={category?.icon ?? "repeat"}
                    color={category?.color ?? "#8b5cf6"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {e.note || category?.name || "Subscription"}
                    </p>
                    <p className="truncate text-xs text-neutral-400">
                      {e.recurrence_frequency === "monthly" ? "Monthly" : "Yearly"}{" "}
                      · Next due {format(new Date(e.next_due_date!), "d MMM yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                      {formatCurrency(e.amount)}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        soon ? "text-amber-600 dark:text-amber-400" : "text-neutral-400"
                      }`}
                    >
                      {daysLeft < 0
                        ? "Overdue"
                        : daysLeft === 0
                          ? "Due today"
                          : `${daysLeft}d left`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
