import type { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { getAdminDb } from "../firebase/admin";
import { DEFAULT_CATEGORIES } from "../default-categories";
import type { Budget, Category, Expense } from "../types";

const OWNER_ID = "me";

function withId<T>(snap: QueryDocumentSnapshot<DocumentData>): T {
  return { id: snap.id, ...snap.data() } as T;
}

function collections() {
  const db = getAdminDb();
  const root = db.collection("personal").doc(OWNER_ID);
  return {
    categories: root.collection("categories"),
    expenses: root.collection("expenses"),
    budgets: root.collection("budgets"),
  };
}

async function seedDefaultCategories(): Promise<void> {
  const { categories } = collections();
  const batch = getAdminDb().batch();
  for (const c of DEFAULT_CATEGORIES) {
    const ref = categories.doc();
    batch.set(ref, {
      user_id: OWNER_ID,
      name: c.name,
      color: c.color,
      icon: c.icon,
      is_default: true,
    });
  }
  await batch.commit();
}

export const expenseRepo = {
  async getCategories(): Promise<Category[]> {
    const { categories } = collections();
    let snap = await categories.orderBy("name").get();
    if (snap.empty) {
      await seedDefaultCategories();
      snap = await categories.orderBy("name").get();
    }
    return snap.docs.map((d) => withId<Category>(d));
  },

  async addCategory(input: {
    name: string;
    color: string;
    icon: string;
  }): Promise<Category> {
    const { categories } = collections();
    const ref = await categories.add({
      user_id: OWNER_ID,
      is_default: false,
      ...input,
    });
    return { id: ref.id, user_id: OWNER_ID, is_default: false, ...input };
  },

  async getExpenses(): Promise<Expense[]> {
    const { expenses } = collections();
    const snap = await expenses.orderBy("spent_on", "desc").get();
    return snap.docs.map((d) => withId<Expense>(d));
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
    const { expenses } = collections();
    const created_at = new Date().toISOString();
    const ref = await expenses.add({ user_id: OWNER_ID, created_at, ...input });
    return { id: ref.id, user_id: OWNER_ID, created_at, ...input };
  },

  async deleteExpense(id: string): Promise<void> {
    const { expenses } = collections();
    await expenses.doc(id).delete();
  },

  async getBudgets(): Promise<Budget[]> {
    const { budgets } = collections();
    const snap = await budgets.get();
    return snap.docs.map((d) => withId<Budget>(d));
  },

  async upsertBudget(input: {
    category_id: string | null;
    monthly_limit: number;
    month: string;
  }): Promise<Budget> {
    const { budgets } = collections();
    const existing = await budgets
      .where("category_id", "==", input.category_id)
      .where("month", "==", input.month)
      .limit(1)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      await doc.ref.update({ monthly_limit: input.monthly_limit });
      return { id: doc.id, user_id: OWNER_ID, ...input };
    }

    const ref = await budgets.add({ user_id: OWNER_ID, ...input });
    return { id: ref.id, user_id: OWNER_ID, ...input };
  },
};
