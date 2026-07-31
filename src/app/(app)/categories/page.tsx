"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useData } from "@/lib/data-context";
import { CategoryIcon } from "@/components/CategoryIcon";
import { NewCategoryForm } from "@/components/NewCategoryForm";

export default function CategoriesPage() {
  const { categories } = useData();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          Categories
        </h1>
        <p className="text-sm text-neutral-500">
          Default categories + apni khud ki banayi hui categories.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2 rounded-xl border border-neutral-100 p-3 dark:border-neutral-800"
            >
              <CategoryIcon icon={c.icon} color={c.color} size={16} />
              <span className="truncate text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {c.name}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          {showForm ? (
            <NewCategoryForm
              onCreated={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <Plus size={16} />
              Add category
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
