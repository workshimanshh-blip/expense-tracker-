"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { CATEGORY_COLORS, ICON_OPTIONS, getIcon } from "@/lib/icon-map";
import type { Category } from "@/lib/types";

export function NewCategoryForm({
  onCreated,
  onCancel,
}: {
  onCreated: (category: Category) => void;
  onCancel?: () => void;
}) {
  const { addCategory } = useData();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState<(typeof ICON_OPTIONS)[number]>(
    ICON_OPTIONS[0],
  );
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    const category = await addCategory({ name: name.trim(), color, icon });
    setSaving(false);
    setName("");
    onCreated(category);
  }

  return (
    <div className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
      <input
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800"
      />
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className="h-6 w-6 rounded-full"
            style={{
              backgroundColor: c,
              outline: color === c ? `2px solid ${c}` : "none",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ICON_OPTIONS.map((iconName) => {
          const Icon = getIcon(iconName);
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => setIcon(iconName)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                icon === iconName
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                  : "border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={handleCreate}
          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save category"}
        </button>
      </div>
    </div>
  );
}
