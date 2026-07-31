import { NextResponse } from "next/server";
import { expenseRepo } from "@/lib/server/expense-repo";

export async function GET() {
  const budgets = await expenseRepo.getBudgets();
  return NextResponse.json(budgets);
}

export async function POST(request: Request) {
  const input = await request.json();
  const budget = await expenseRepo.upsertBudget(input);
  return NextResponse.json(budget);
}
