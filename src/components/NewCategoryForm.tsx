"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useData } from "@/lib/data-context";
import { CATEGORY_COLORS, ICON_OPTIONS, getIcon } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-3 rounded-xl border border-border bg-secondary/30 p-3">
      <input
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none transition-colors duration-150 focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_COLORS.map((c) => (
          <motion.button
            key={c}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setColor(c)}
            className="h-6 w-6 cursor-pointer rounded-full"
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
            <motion.button
              key={iconName}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setIcon(iconName)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors duration-150 ${
                icon === iconName
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
            </motion.button>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" size="sm" disabled={saving} onClick={handleCreate}>
          {saving ? "Saving..." : "Save category"}
        </Button>
      </div>
    </div>
  );
}
