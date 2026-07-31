import { NextResponse } from "next/server";
import { expenseRepo } from "@/lib/server/expense-repo";

export async function GET() {
  const expenses = await expenseRepo.getExpenses();
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const input = await request.json();
  const expense = await expenseRepo.addExpense(input);
  return NextResponse.json(expense);
}
