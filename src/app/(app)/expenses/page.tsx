"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useData } from "@/lib/data-context";
import { QuickAddBar } from "@/components/QuickAddBar";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";

export default function ExpensesPage() {
  const { expenses, categories, deleteExpense, loading } = useData();
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return expenses;
    return expenses.filter((e) => e.category_id === categoryFilter);
  }, [expenses, categoryFilter]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
        <h1 className="font-display text-2xl text-foreground">Expenses</h1>
        <p className="text-sm text-muted-foreground">Har kharcha yahan track karo.</p>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
        <QuickAddBar onOpenDetailed={() => setShowForm(true)} />
      </motion.div>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        className="glass rounded-2xl p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">History</h2>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="cursor-pointer rounded-lg border border-input bg-secondary/50 px-2 py-1 text-xs text-foreground outline-none transition-colors duration-150 focus:border-ring"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading...</p>
        ) : (
          <ExpenseList
            expenses={filtered}
            categories={categories}
            onDelete={deleteExpense}
          />
        )}
      </motion.div>

      {showForm && <ExpenseForm onClose={() => setShowForm(false)} />}
    </motion.div>
  );
}
