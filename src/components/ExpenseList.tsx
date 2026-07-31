"use client";

import { Trash2, Repeat } from "lucide-react";
import type { Category, Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "./CategoryIcon";
import { format } from "date-fns";

export function ExpenseList({
  expenses,
  categories,
  onDelete,
}: {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: string) => void;
}) {
  if (expenses.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-neutral-400">
        Abhi tak koi expense nahi hai. Upar se ek add karo.
      </p>
    );
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
      {expenses.map((expense) => {
        const category = categoryMap.get(expense.category_id);
        return (
          <li key={expense.id} className="flex items-center gap-3 py-3">
            <CategoryIcon
              icon={category?.icon ?? "more-horizontal"}
              color={category?.color ?? "#6b7280"}
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                {category?.name ?? "Other"}
                {expense.is_recurring && (
                  <Repeat size={12} className="shrink-0 text-neutral-400" />
                )}
              </p>
              <p className="truncate text-xs text-neutral-400">
                {expense.note || format(new Date(expense.spent_on), "d MMM yyyy")}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              {formatCurrency(expense.amount)}
            </span>
            <button
              onClick={() => onDelete(expense.id)}
              className="shrink-0 rounded-full p-1.5 text-neutral-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
              aria-label="Delete expense"
            >
              <Trash2 size={14} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
