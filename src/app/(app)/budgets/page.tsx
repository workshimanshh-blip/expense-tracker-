"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { BudgetProgressBar } from "@/components/BudgetProgressBar";
import { currentMonthKey, isInMonth } from "@/lib/utils";

export default function BudgetsPage() {
  const { categories, expenses, budgets, upsertBudget } = useData();
  const month = currentMonthKey();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const monthExpenses = useMemo(
    () => expenses.filter((e) => isInMonth(e.spent_on, month)),
    [expenses, month],
  );

  const spendByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthExpenses) {
      map.set(e.category_id, (map.get(e.category_id) ?? 0) + e.amount);
    }
    return map;
  }, [monthExpenses]);

  const totalSpend = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  function budgetFor(categoryId: string | null) {
    return budgets.find(
      (b) => b.category_id === categoryId && b.month === month,
    );
  }

  async function saveBudget(categoryId: string | null, key: string) {
    const value = Number(drafts[key]);
    if (!value || value <= 0) return;
    await upsertBudget({ category_id: categoryId, monthly_limit: value, month });
    setDrafts((d) => ({ ...d, [key]: "" }));
  }

  const overallBudget = budgetFor(null);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          Budgets
        </h1>
        <p className="text-sm text-neutral-500">
          Is mahine ({month}) ke liye limits set karo.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Overall budget
          </h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={overallBudget ? String(overallBudget.monthly_limit) : "Set limit"}
              value={drafts["overall"] ?? ""}
              onChange={(e) =>
                setDrafts((d) => ({ ...d, overall: e.target.value }))
              }
              className="w-28 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-800"
            />
            <button
              onClick={() => saveBudget(null, "overall")}
              className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-white"
            >
              Save
            </button>
          </div>
        </div>
        <BudgetProgressBar
          label="This month"
          spent={totalSpend}
          limit={overallBudget?.monthly_limit ?? 0}
        />
      </div>

      <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Per-category budgets
        </h2>
        {categories.map((c) => {
          const budget = budgetFor(c.id);
          const spent = spendByCategory.get(c.id) ?? 0;
          return (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  {c.name}
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={budget ? String(budget.monthly_limit) : "Set limit"}
                    value={drafts[c.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [c.id]: e.target.value }))
                    }
                    className="w-24 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <button
                    onClick={() => saveBudget(c.id, c.id)}
                    className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
              {budget && (
                <BudgetProgressBar
                  label=""
                  spent={spent}
                  limit={budget.monthly_limit}
                  color={c.color}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
