"use client";

import { useMemo, useState } from "react";
import { Wallet, PiggyBank, Bell } from "lucide-react";
import { useData } from "@/lib/data-context";
import { SummaryCard } from "@/components/SummaryCard";
import { CategoryPieChart, type CategorySlice } from "@/components/CategoryPieChart";
import { TrendChart } from "@/components/TrendChart";
import { BudgetProgressBar } from "@/components/BudgetProgressBar";
import {
  buildTrend,
  currentMonthKey,
  daysUntil,
  formatCurrency,
  isInMonth,
} from "@/lib/utils";
import type { Period } from "@/lib/types";

const PERIODS: { value: Period; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function DashboardPage() {
  const { categories, expenses, budgets, loading } = useData();
  const [period, setPeriod] = useState<Period>("daily");
  const month = currentMonthKey();

  const monthExpenses = useMemo(
    () => expenses.filter((e) => isInMonth(e.spent_on, month)),
    [expenses, month],
  );

  const totalThisMonth = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const overallBudget = budgets.find(
    (b) => b.category_id === null && b.month === month,
  );
  const remaining = overallBudget
    ? overallBudget.monthly_limit - totalThisMonth
    : null;

  const upcomingRenewals = expenses.filter(
    (e) =>
      e.is_recurring &&
      e.next_due_date &&
      daysUntil(e.next_due_date) >= 0 &&
      daysUntil(e.next_due_date) <= 7,
  );

  const pieData: CategorySlice[] = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of monthExpenses) {
      totals.set(e.category_id, (totals.get(e.category_id) ?? 0) + e.amount);
    }
    return categories
      .map((c) => ({ name: c.name, value: totals.get(c.id) ?? 0, color: c.color }))
      .filter((slice) => slice.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [categories, monthExpenses]);

  const trend = useMemo(() => buildTrend(expenses, period), [expenses, period]);

  const budgetedCategories = categories.filter((c) =>
    budgets.some((b) => b.category_id === c.id && b.month === month),
  );

  if (loading) {
    return <p className="py-20 text-center text-sm text-neutral-400">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500">
          Is mahine ka overview — kitna kharcha, kahan kharcha.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total spent this month"
          value={formatCurrency(totalThisMonth)}
          icon={Wallet}
        />
        <SummaryCard
          label="Remaining budget"
          value={remaining === null ? "Not set" : formatCurrency(remaining)}
          icon={PiggyBank}
          tone={remaining !== null && remaining < 0 ? "warning" : "positive"}
        />
        <SummaryCard
          label="Upcoming renewals"
          value={`${upcomingRenewals.length} in 7 days`}
          icon={Bell}
          tone={upcomingRenewals.length > 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Category-wise spend
        </h2>
        <CategoryPieChart data={pieData} />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Spending trend
          </h2>
          <div className="flex rounded-lg bg-neutral-100 p-0.5 text-xs dark:bg-neutral-800">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  period === p.value
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-50"
                    : "text-neutral-500"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <TrendChart data={trend} />
      </div>

      {budgetedCategories.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Budget usage
          </h2>
          {budgetedCategories.map((c) => {
            const budget = budgets.find(
              (b) => b.category_id === c.id && b.month === month,
            )!;
            const spent = monthExpenses
              .filter((e) => e.category_id === c.id)
              .reduce((sum, e) => sum + e.amount, 0);
            return (
              <BudgetProgressBar
                key={c.id}
                label={c.name}
                spent={spent}
                limit={budget.monthly_limit}
                color={c.color}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
