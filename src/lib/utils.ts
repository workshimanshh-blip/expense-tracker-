import {
  addMonths,
  addYears,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  startOfMonth,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import type { Expense, Period, RecurrenceFrequency } from "./types";

export function todayIST(): string {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function currentMonthKey(date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function isInMonth(isoDate: string, monthKey: string): boolean {
  return isoDate.startsWith(monthKey);
}

export function nextDueDate(
  fromDate: string,
  frequency: RecurrenceFrequency,
): string {
  const base = new Date(fromDate);
  const next = frequency === "monthly" ? addMonths(base, 1) : addYears(base, 1);
  return format(next, "yyyy-MM-dd");
}

export function daysUntil(isoDate: string): number {
  return differenceInCalendarDays(new Date(isoDate), new Date());
}

export function monthlyTotal(expenses: Expense[], monthKey: string): number {
  return expenses
    .filter((e) => isInMonth(e.spent_on, monthKey))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function startOfCurrentMonth(): string {
  return format(startOfMonth(new Date()), "yyyy-MM-dd");
}

export interface TrendPoint {
  label: string;
  total: number;
}

export function buildTrend(expenses: Expense[], period: Period): TrendPoint[] {
  const now = new Date();

  if (period === "daily") {
    const days = eachDayOfInterval({ start: subDays(now, 13), end: now });
    return days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const total = expenses
        .filter((e) => e.spent_on === key)
        .reduce((sum, e) => sum + e.amount, 0);
      return { label: format(day, "d MMM"), total };
    });
  }

  if (period === "weekly") {
    return Array.from({ length: 8 }, (_, i) => {
      const start = subWeeks(now, 7 - i);
      const end = i === 7 ? now : subDays(subWeeks(now, 6 - i), 1);
      const total = expenses
        .filter((e) => {
          const d = new Date(e.spent_on);
          return d >= start && d <= end;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      return { label: format(start, "d MMM"), total };
    });
  }

  const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));
  return months.map((month) => {
    const key = format(month, "yyyy-MM");
    const total = monthlyTotal(expenses, key);
    return { label: format(month, "MMM"), total };
  });
}
