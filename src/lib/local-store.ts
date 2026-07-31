import type { Budget, Category, Expense } from "./types";
import { DEFAULT_CATEGORIES } from "./default-categories";

const CATEGORIES_KEY = "expense-tracker:categories";
const EXPENSES_KEY = "expense-tracker:expenses";
const BUDGETS_KEY = "expense-tracker:budgets";
const DEMO_USER_ID = "demo-user";

function uid() {
  return crypto.randomUUID();
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

function write<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeeded() {
  const existing = read<Category>(CATEGORIES_KEY);
  if (existing.length > 0) return;
  const seeded: Category[] = DEFAULT_CATEGORIES.map((c) => ({
    id: uid(),
    user_id: DEMO_USER_ID,
    name: c.name,
    color: c.color,
    icon: c.icon,
    is_default: true,
  }));
  write(CATEGORIES_KEY, seeded);
}

export const localStore = {
  async getCategories(): Promise<Category[]> {
    ensureSeeded();
    return read<Category>(CATEGORIES_KEY);
  },

  async addCategory(input: {
    name: string;
    color: string;
    icon: string;
  }): Promise<Category> {
    ensureSeeded();
    const categories = read<Category>(CATEGORIES_KEY);
    const category: Category = {
      id: uid(),
      user_id: DEMO_USER_ID,
      name: input.name,
      color: input.color,
      icon: input.icon,
      is_default: false,
    };
    write(CATEGORIES_KEY, [...categories, category]);
    return category;
  },

  async getExpenses(): Promise<Expense[]> {
    return read<Expense>(EXPENSES_KEY).sort((a, b) =>
      b.spent_on.localeCompare(a.spent_on),
    );
  },

  async addExpense(input: {
    category_id: string;
    amount: number;
    note: string | null;
    spent_on: string;
    is_recurring: boolean;
    recurrence_frequency: Expense["recurrence_frequency"];
    next_due_date: string | null;
  }): Promise<Expense> {
    const expenses = read<Expense>(EXPENSES_KEY);
    const expense: Expense = {
      id: uid(),
      user_id: DEMO_USER_ID,
      created_at: new Date().toISOString(),
      ...input,
    };
    write(EXPENSES_KEY, [...expenses, expense]);
    return expense;
  },

  async deleteExpense(id: string): Promise<void> {
    const expenses = read<Expense>(EXPENSES_KEY);
    write(
      EXPENSES_KEY,
      expenses.filter((e) => e.id !== id),
    );
  },

  async getBudgets(): Promise<Budget[]> {
    return read<Budget>(BUDGETS_KEY);
  },

  async upsertBudget(input: {
    category_id: string | null;
    monthly_limit: number;
    month: string;
  }): Promise<Budget> {
    const budgets = read<Budget>(BUDGETS_KEY);
    const existingIndex = budgets.findIndex(
      (b) => b.category_id === input.category_id && b.month === input.month,
    );
    if (existingIndex >= 0) {
      const updated: Budget = {
        ...budgets[existingIndex],
        monthly_limit: input.monthly_limit,
      };
      const next = [...budgets];
      next[existingIndex] = updated;
      write(BUDGETS_KEY, next);
      return updated;
    }
    const budget: Budget = {
      id: uid(),
      user_id: DEMO_USER_ID,
      ...input,
    };
    write(BUDGETS_KEY, [...budgets, budget]);
    return budget;
  },
};
