export type RecurrenceFrequency = "monthly" | "yearly";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  note: string | null;
  spent_on: string; // ISO date
  is_recurring: boolean;
  recurrence_frequency: RecurrenceFrequency | null;
  next_due_date: string | null; // ISO date
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null; // null = overall budget
  monthly_limit: number;
  month: string; // "YYYY-MM"
}

export type Period = "daily" | "weekly" | "monthly";
