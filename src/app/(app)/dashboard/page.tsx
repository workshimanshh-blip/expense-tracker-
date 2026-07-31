"use client";

import { useMemo, useState } from "react";
import { PiggyBank, Bell } from "lucide-react";
import { motion } from "motion/react";
import { useData } from "@/lib/data-context";
import { SummaryCard } from "@/components/SummaryCard";
import { CategoryPieChart, type CategorySlice } from "@/components/CategoryPieChart";
import { TrendChart } from "@/components/TrendChart";
import { BudgetProgressBar } from "@/components/BudgetProgressBar";
import { AuroraGlow } from "@/components/AuroraGlow";
import { AnimatedNumber } from "@/components/AnimatedNumber";
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

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
      className="mx-auto max-w-3xl space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Is mahine ka overview — kitna kharcha, kahan kharcha.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="glass relative overflow-hidden rounded-2xl p-6"
      >
        <AuroraGlow />
        <p className="relative text-sm font-medium text-muted-foreground">
          Total spent this month
        </p>
        <AnimatedNumber
          value={totalThisMonth}
          format={formatCurrency}
          className="font-display font-tabular relative mt-1 block text-4xl text-foreground sm:text-5xl"
        />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SummaryCard
          label="Remaining budget"
          value={remaining === null ? "Not set" : formatCurrency(remaining)}
          icon={PiggyBank}
          tone={remaining !== null && remaining < 0 ? "danger" : "positive"}
        />
        <SummaryCard
          label="Upcoming renewals"
          value={`${upcomingRenewals.length} in 7 days`}
          icon={Bell}
          tone={upcomingRenewals.length > 0 ? "warning" : "neutral"}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-4">
        <h2 className="mb-4 text-sm font-medium text-foreground">
          Category-wise spend
        </h2>
        <CategoryPieChart data={pieData} />
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Spending trend</h2>
          <div className="flex rounded-lg bg-secondary p-0.5 text-xs">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`cursor-pointer rounded-md px-2.5 py-1 font-medium transition-colors duration-200 ${
                  period === p.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <TrendChart data={trend} />
      </motion.div>

      {budgetedCategories.length > 0 && (
        <motion.div variants={fadeUp} className="glass space-y-4 rounded-2xl p-4">
          <h2 className="text-sm font-medium text-foreground">Budget usage</h2>
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
        </motion.div>
      )}
    </motion.div>
  );
}
