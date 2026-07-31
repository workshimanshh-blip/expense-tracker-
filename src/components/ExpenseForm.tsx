"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useData } from "@/lib/data-context";
import { Modal } from "./Modal";
import { NewCategoryForm } from "./NewCategoryForm";
import { nextDueDate } from "@/lib/utils";
import type { RecurrenceFrequency } from "@/lib/types";

export function ExpenseForm({ onClose }: { onClose: () => void }) {
  const { categories, addExpense } = useData();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [spentOn, setSpentOn] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("monthly");
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!categoryId || !value || value <= 0) return;
    setSaving(true);
    await addExpense({
      category_id: categoryId,
      amount: value,
      note: note.trim() || null,
      spent_on: spentOn,
      is_recurring: isRecurring,
      recurrence_frequency: isRecurring ? frequency : null,
      next_due_date: isRecurring ? nextDueDate(spentOn, frequency) : null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <Modal title="Add expense" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Amount (₹)
          </label>
          <input
            type="number"
            inputMode="decimal"
            required
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800"
            placeholder="0"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Category
          </label>
          {!creatingCategory ? (
            <div className="flex gap-2">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCreatingCategory(true)}
                className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
              >
                + New
              </button>
            </div>
          ) : (
            <NewCategoryForm
              onCreated={(category) => {
                setCategoryId(category.id);
                setCreatingCategory(false);
              }}
              onCancel={() => setCreatingCategory(false)}
            />
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Netflix, dinner with friends"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Date
          </label>
          <input
            type="date"
            value={spentOn}
            onChange={(e) => setSpentOn(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 rounded accent-emerald-500"
          />
          Yeh recurring hai (subscription/bill)
        </label>

        {isRecurring && (
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Repeats
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <option value="monthly">Every month</option>
              <option value="yearly">Every year</option>
            </select>
            <p className="mt-1 text-xs text-neutral-400">
              Next due: {nextDueDate(spentOn, frequency)}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add expense"}
        </button>
      </form>
    </Modal>
  );
}
