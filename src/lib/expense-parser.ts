import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type { Category } from "./types";

export interface ParsedExpense {
  amount: number;
  note: string;
  category_id: string;
}

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

function buildSchema(categories: Category[]): Schema {
  return {
    type: Type.OBJECT,
    properties: {
      expenses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            amount: {
              type: Type.NUMBER,
              description: "Amount in INR, as a plain number (e.g. '2k' -> 2000)",
            },
            note: {
              type: Type.STRING,
              description: "Short human-readable label for the expense",
            },
            category_id: {
              type: Type.STRING,
              format: "enum",
              enum: categories.map((c) => c.id),
            },
          },
          required: ["amount", "note", "category_id"],
        },
      },
    },
    required: ["expenses"],
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
- Ignore anything that isn't a money amount (greetings, unrelated chat). If there is nothing to log, return an empty "expenses" array.`;

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

  const response = await getClient().models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    contents: text,
    config: {
      systemInstruction: systemPrompt(opts.source, categories),
      responseMimeType: "application/json",
      responseSchema: buildSchema(categories),
    },
  });

  let parsed: { expenses?: ParsedExpense[] };
  try {
    parsed = JSON.parse(response.text ?? "{}");
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
