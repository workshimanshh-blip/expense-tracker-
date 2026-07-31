import Groq from "groq-sdk";
import type { Category } from "./types";

export interface ParsedExpense {
  amount: number;
  note: string;
  category_id: string;
}

let client: Groq | null = null;
function getClient(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");
    client = new Groq({ apiKey });
  }
  return client;
}

const TOOL_NAME = "log_expenses";

function buildTool(categories: Category[]): Groq.Chat.Completions.ChatCompletionTool {
  return {
    type: "function",
    function: {
      name: TOOL_NAME,
      description:
        "Log one or more expenses extracted from a message. Every category_id must be one of the real IDs provided.",
      parameters: {
        type: "object",
        properties: {
          expenses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                amount: {
                  type: "number",
                  description: "Amount in INR, as a plain number (e.g. '2k' -> 2000)",
                },
                note: {
                  type: "string",
                  description: "Short human-readable label for the expense",
                },
                category_id: {
                  type: "string",
                  enum: categories.map((c) => c.id),
                },
              },
              required: ["amount", "note", "category_id"],
            },
          },
        },
        required: ["expenses"],
      },
    },
  };
}

function systemPrompt(source: "telegram" | "payment_sms", categories: Category[]) {
  const categoryList = categories.map((c) => `${c.id} = ${c.name}`).join("\n");
  const fallback =
    categories.find((c) => c.name.toLowerCase() === "other")?.id ??
    categories[0]?.id;

  const base = `You extract expense entries from short informal Hinglish/English text for a personal expense tracker. Rules:
- A single message can describe multiple separate expenses (e.g. comma or "and" separated). Return one array entry per expense.
- Understand shorthand amounts: "2k" = 2000, "500rs"/"rs 500"/"₹500" = 500.
- "note" should be a short 2-5 word label for what the expense was (e.g. "Laptop repair", "Rapido ride").
- Always pick the closest matching category_id from this list:\n${categoryList}\nIf nothing fits well, use "${fallback}".
- Ignore anything that isn't a money amount (greetings, unrelated chat). If there is nothing to log, call the tool with an empty "expenses" array.
- Always call the log_expenses tool with your result.`;

  if (source === "payment_sms") {
    return `${base}\nThe input is a forwarded payment app (PhonePe) notification or SMS confirming a completed payment — extract the amount and merchant/payee as the note.`;
  }
  return base;
}

export async function parseExpenseMessage(
  text: string,
  categories: Category[],
  opts: { source: "telegram" | "payment_sms" },
): Promise<ParsedExpense[]> {
  if (categories.length === 0) return [];

  const response = await getClient().chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt(opts.source, categories) },
      { role: "user", content: text },
    ],
    tools: [buildTool(categories)],
    tool_choice: { type: "function", function: { name: TOOL_NAME } },
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== TOOL_NAME) return [];

  let parsed: { expenses?: ParsedExpense[] };
  try {
    parsed = JSON.parse(toolCall.function.arguments);
  } catch {
    return [];
  }

  const validCategoryIds = new Set(categories.map((c) => c.id));
  return (parsed.expenses ?? []).filter(
    (e) =>
      typeof e.amount === "number" &&
      e.amount > 0 &&
      typeof e.note === "string" &&
      validCategoryIds.has(e.category_id),
  );
}
