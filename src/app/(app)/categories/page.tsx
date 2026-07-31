"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useData } from "@/lib/data-context";
import { CategoryIcon } from "@/components/CategoryIcon";
import { NewCategoryForm } from "@/components/NewCategoryForm";

export default function CategoriesPage() {
  const { categories } = useData();
  const [showForm, setShowForm] = useState(false);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
        <h1 className="font-display text-2xl text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Default categories + apni khud ki banayi hui categories.
        </p>
      </motion.div>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        className="glass rounded-2xl p-4"
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((c, i) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
              whileHover={{ y: -2 }}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/30 p-3"
            >
              <CategoryIcon icon={c.icon} color={c.color} size={16} />
              <span className="truncate text-sm font-medium text-foreground">
                {c.name}
              </span>
            </motion.li>
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
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:text-foreground"
            >
              <Plus size={16} />
              Add category
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
