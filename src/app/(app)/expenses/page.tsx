"use client";

import { useMemo, useState } from "react";
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          Expenses
        </h1>
        <p className="text-sm text-neutral-500">Har kharcha yahan track karo.</p>
      </div>

      <QuickAddBar onOpenDetailed={() => setShowForm(true)} />

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            History
          </h2>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-800"
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
          <p className="py-10 text-center text-sm text-neutral-400">Loading...</p>
        ) : (
          <ExpenseList
            expenses={filtered}
            categories={categories}
            onDelete={deleteExpense}
          />
        )}
      </div>

      {showForm && <ExpenseForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
