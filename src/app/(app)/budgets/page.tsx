"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useData } from "@/lib/data-context";
import { BudgetProgressBar } from "@/components/BudgetProgressBar";
import { Button } from "@/components/ui/button";
import { currentMonthKey, isInMonth } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

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
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl text-foreground">Budgets</h1>
        <p className="text-sm text-muted-foreground">
          Is mahine ({month}) ke liye limits set karo.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass space-y-4 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Overall budget</h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={overallBudget ? String(overallBudget.monthly_limit) : "Set limit"}
              value={drafts["overall"] ?? ""}
              onChange={(e) =>
                setDrafts((d) => ({ ...d, overall: e.target.value }))
              }
              className="font-tabular w-28 rounded-lg border border-input bg-secondary/50 px-2 py-1 text-sm text-foreground outline-none transition-colors duration-150 focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <Button size="sm" onClick={() => saveBudget(null, "overall")}>
              Save
            </Button>
          </div>
        </div>
        <BudgetProgressBar
          label="This month"
          spent={totalSpend}
          limit={overallBudget?.monthly_limit ?? 0}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="glass space-y-5 rounded-2xl p-4">
        <h2 className="text-sm font-medium text-foreground">
          Per-category budgets
        </h2>
        {categories.map((c) => {
          const budget = budgetFor(c.id);
          const spent = spendByCategory.get(c.id) ?? 0;
          return (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
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
                    className="font-tabular w-24 rounded-lg border border-input bg-secondary/50 px-2 py-1 text-xs text-foreground outline-none transition-colors duration-150 focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                  <Button size="sm" onClick={() => saveBudget(c.id, c.id)}>
                    Save
                  </Button>
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
      </motion.div>
    </motion.div>
  );
}
