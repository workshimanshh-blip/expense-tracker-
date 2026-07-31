import { NextResponse } from "next/server";
import { expenseRepo } from "@/lib/server/expense-repo";
import { parseExpenseMessage } from "@/lib/expense-parser";
import { sendTelegramMessage } from "@/lib/telegram";
import { timingSafeStringEqual } from "@/lib/session";
import { todayIST } from "@/lib/utils";

export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  const headerSecret = request.headers.get("x-payment-webhook-secret");
  if (!secret || !headerSecret || !timingSafeStringEqual(headerSecret, secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const text: string | undefined = body?.text;
  const notifyChatId = process.env.TELEGRAM_ALLOWED_CHAT_ID;

  if (!text) {
    return NextResponse.json({ ok: true });
  }

  try {
    const categories = await expenseRepo.getCategories();
    const parsed = await parseExpenseMessage(text, categories, {
      source: "payment_sms",
    });

    if (parsed.length === 0) {
      if (notifyChatId) {
        await sendTelegramMessage(
          notifyChatId,
          `⚠️ Payment notification samajh nahi aayi, manually add karni padegi:\n"${text}"`,
        );
      }
      return NextResponse.json({ ok: true });
    }

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const spentOn = todayIST();
    const lines: string[] = [];

    for (const item of parsed) {
      await expenseRepo.addExpense({
        category_id: item.category_id,
        amount: item.amount,
        note: item.note,
        spent_on: spentOn,
        is_recurring: false,
        recurrence_frequency: null,
        next_due_date: null,
      });
      const categoryName = categoryMap.get(item.category_id)?.name ?? "Other";
      lines.push(`• ${item.note} — ₹${item.amount} (${categoryName})`);
    }

    if (notifyChatId) {
      await sendTelegramMessage(
        notifyChatId,
        `💳 Auto-captured from PhonePe:\n${lines.join("\n")}`,
      );
    }
  } catch (err) {
    console.error("payment-sms webhook error", err);
  }

  return NextResponse.json({ ok: true });
}
