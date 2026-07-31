import { NextResponse } from "next/server";
import { expenseRepo } from "@/lib/server/expense-repo";
import { parseExpenseMessage } from "@/lib/expense-parser";
import { sendTelegramMessage } from "@/lib/telegram";
import { timingSafeStringEqual } from "@/lib/session";
import { todayIST } from "@/lib/utils";

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || !headerSecret || !timingSafeStringEqual(headerSecret, secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await request.json().catch(() => null);
  const message = update?.message;
  const chatId: number | undefined = message?.chat?.id;
  const text: string | undefined = message?.text;

  const allowedChatId = process.env.TELEGRAM_ALLOWED_CHAT_ID;
  if (!chatId || String(chatId) !== allowedChatId) {
    // Not our chat — acknowledge without revealing anything or processing it.
    return NextResponse.json({ ok: true });
  }

  if (!text) {
    await sendTelegramMessage(
      chatId,
      "Sirf text bhejo, jaise: '200 food, 500 travel'",
    );
    return NextResponse.json({ ok: true });
  }

  try {
    const categories = await expenseRepo.getCategories();
    const parsed = await parseExpenseMessage(text, categories, {
      source: "telegram",
    });

    if (parsed.length === 0) {
      await sendTelegramMessage(
        chatId,
        "Samajh nahi aaya. Try: 'aaj 500 grocery'",
      );
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

    await sendTelegramMessage(
      chatId,
      `✅ Logged ${parsed.length} expense${parsed.length > 1 ? "s" : ""}:\n${lines.join("\n")}`,
    );
  } catch (err) {
    console.error("telegram webhook error", err);
    await sendTelegramMessage(chatId, "Kuch gadbad ho gayi, dobara try karo.");
  }

  return NextResponse.json({ ok: true });
}
