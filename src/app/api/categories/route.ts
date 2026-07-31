import { NextResponse } from "next/server";
import { expenseRepo } from "@/lib/server/expense-repo";

export async function GET() {
  const categories = await expenseRepo.getCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const input = await request.json();
  const category = await expenseRepo.addCategory(input);
  return NextResponse.json(category);
}
