"use client";

import { Trash2, Repeat } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
      <p className="py-10 text-center text-sm text-muted-foreground">
        Abhi tak koi expense nahi hai. Upar se ek add karo.
      </p>
    );
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <ul className="divide-y divide-border/60">
      <AnimatePresence initial={false}>
        {expenses.map((expense, i) => {
          const category = categoryMap.get(expense.category_id);
          return (
            <motion.li
              key={expense.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.03 } }}
              exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }}
              className="flex items-center gap-3 py-3"
            >
              <CategoryIcon
                icon={category?.icon ?? "more-horizontal"}
                color={category?.color ?? "#6b7280"}
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                  {category?.name ?? "Other"}
                  {expense.is_recurring && (
                    <Repeat size={12} className="shrink-0 text-muted-foreground" />
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {expense.note || format(new Date(expense.spent_on), "d MMM yyyy")}
                </p>
              </div>
              <span className="font-tabular shrink-0 text-sm font-semibold text-foreground">
                {formatCurrency(expense.amount)}
              </span>
              <button
                onClick={() => onDelete(expense.id)}
                className="shrink-0 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete expense"
              >
                <Trash2 size={14} />
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
