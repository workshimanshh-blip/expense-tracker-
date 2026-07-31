"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useData } from "@/lib/data-context";
import { Modal } from "./Modal";
import { NewCategoryForm } from "./NewCategoryForm";
import { Button } from "@/components/ui/button";
import { nextDueDate } from "@/lib/utils";
import type { RecurrenceFrequency } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-150 focus:border-ring focus:ring-2 focus:ring-ring/30";

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
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Amount (₹)
          </label>
          <input
            type="number"
            inputMode="decimal"
            required
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`font-tabular ${inputClass}`}
            placeholder="0"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Category
          </label>
          {!creatingCategory ? (
            <div className="flex gap-2">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`cursor-pointer ${inputClass}`}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreatingCategory(true)}
                className="shrink-0"
              >
                + New
              </Button>
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
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Netflix, dinner with friends"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Date
          </label>
          <input
            type="date"
            value={spentOn}
            onChange={(e) => setSpentOn(e.target.value)}
            className={`cursor-pointer ${inputClass}`}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded accent-primary"
          />
          Yeh recurring hai (subscription/bill)
        </label>

        {isRecurring && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Repeats
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
              className={`cursor-pointer ${inputClass}`}
            >
              <option value="monthly">Every month</option>
              <option value="yearly">Every year</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Next due: {nextDueDate(spentOn, frequency)}
            </p>
          </div>
        )}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving..." : "Add expense"}
        </Button>
      </form>
    </Modal>
  );
}
