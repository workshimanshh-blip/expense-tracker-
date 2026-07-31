import { NextResponse } from "next/server";
import { expenseRepo } from "@/lib/server/expense-repo";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await expenseRepo.deleteExpense(id);
  return NextResponse.json({ ok: true });
}
