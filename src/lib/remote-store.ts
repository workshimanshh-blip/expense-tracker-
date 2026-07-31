import type { Budget, Category, Expense } from "./types";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export const remoteStore = {
  async getCategories(): Promise<Category[]> {
    return api<Category[]>("/api/categories");
  },

  async addCategory(input: {
    name: string;
    color: string;
    icon: string;
  }): Promise<Category> {
    return api<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async getExpenses(): Promise<Expense[]> {
    return api<Expense[]>("/api/expenses");
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
    return api<Expense>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async deleteExpense(id: string): Promise<void> {
    await api(`/api/expenses/${id}`, { method: "DELETE" });
  },

  async getBudgets(): Promise<Budget[]> {
    return api<Budget[]>("/api/budgets");
  },

  async upsertBudget(input: {
    category_id: string | null;
    monthly_limit: number;
    month: string;
  }): Promise<Budget> {
    return api<Budget>("/api/budgets", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
