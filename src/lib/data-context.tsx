"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { store } from "./store";
import type { Budget, Category, Expense } from "./types";

interface DataContextValue {
  categories: Category[];
  expenses: Expense[];
  budgets: Budget[];
  loading: boolean;
  refresh: () => Promise<void>;
  addExpense: (input: Parameters<typeof store.addExpense>[0]) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (
    input: Parameters<typeof store.addCategory>[0],
  ) => Promise<Category>;
  upsertBudget: (
    input: Parameters<typeof store.upsertBudget>[0],
  ) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [c, e, b] = await Promise.all([
      store.getCategories(),
      store.getExpenses(),
      store.getBudgets(),
    ]);
    setCategories(c);
    setExpenses(e);
    setBudgets(b);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial load of categories/expenses/budgets for the signed-in (or demo) user.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function addExpense(input: Parameters<typeof store.addExpense>[0]) {
    await store.addExpense(input);
    await refresh();
  }

  async function deleteExpense(id: string) {
    await store.deleteExpense(id);
    await refresh();
  }

  async function addCategory(input: Parameters<typeof store.addCategory>[0]) {
    const category = await store.addCategory(input);
    await refresh();
    return category;
  }

  async function upsertBudget(input: Parameters<typeof store.upsertBudget>[0]) {
    await store.upsertBudget(input);
    await refresh();
  }

  return (
    <DataContext.Provider
      value={{
        categories,
        expenses,
        budgets,
        loading,
        refresh,
        addExpense,
        deleteExpense,
        addCategory,
        upsertBudget,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
