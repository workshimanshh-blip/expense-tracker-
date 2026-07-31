# Kharcha — Expense Tracker

A personal expense tracker with almost no manual data entry: text a
Telegram bot in plain Hinglish ("2k laptop repair, 200 rapido") and it logs
correctly-categorized expenses automatically. Online/UPI payments made via
PhonePe can also be auto-captured from your phone's notifications. No login
— a single PIN protects the dashboard since it's for one person.

## Running locally (demo mode)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without any setup the
app runs in **demo mode**: no PIN, data is saved to your browser's
`localStorage` only. This is only for trying the UI — the Telegram bot and
PhonePe auto-capture need the real cloud-synced backend below, since a
webhook has no browser to save to.

## Setting up the real (deployed) version

This has several moving pieces because it wires together four separate
services: Firebase (storage), Google Gemini (message parsing), Telegram
(chat capture), and your phone (PhonePe auto-capture). All of them have a
free tier that's plenty for personal use — this setup costs nothing to run.
Do them in this order.

### 1. Firebase Admin credentials

1. In the [Firebase console](https://console.firebase.google.com), open
   your project (or create one) → **Firestore Database** → Create database
   (any region, doesn't matter — the app only ever accesses it through the
   Admin SDK, never directly from the browser).
2. Deploy the security rules: Firestore Database → Rules → paste the
   contents of [`firestore.rules`](firestore.rules) (deny-all — the Admin
   SDK bypasses rules entirely, this is just a backstop) → Publish.
3. Project Settings (gear icon) → Service Accounts → **Generate new private
   key**. This downloads a JSON file with `project_id`, `client_email`, and
   `private_key` — you'll use those three values as
   `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and
   `FIREBASE_ADMIN_PRIVATE_KEY`. Keep this file secret; never commit it.

### 2. Google Gemini API key (message parsing, free)

Create a free key at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey) (sign in
with the same Google account as your Firebase project if you like) →
`GEMINI_API_KEY`. The free tier's daily limits are far above realistic
personal-use volume (a handful of messages a day), so this costs $0.

### 3. Telegram bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram → `/newbot` →
   follow the prompts → copy the token it gives you as `TELEGRAM_BOT_TOKEN`.
2. Message [@userinfobot](https://t.me/userinfobot) to get your own numeric
   Telegram ID → `TELEGRAM_ALLOWED_CHAT_ID`. The bot only ever acts on
   messages from this exact chat, so no one else who finds the bot can log
   fake expenses into your tracker.
3. Make up a random string for `TELEGRAM_WEBHOOK_SECRET` (e.g.
   `openssl rand -hex 20`) — you'll register it with Telegram after
   deploying (step 6).

### 4. PIN + secrets

- `APP_PIN`: whatever you want to type to unlock the dashboard. Prefer
  something longer than a 4-digit PIN since the app will be on a public
  URL with no other protection — a short passphrase is safer.
- `SESSION_SECRET`: a long random string (`openssl rand -hex 32`), signs
  the login cookie.
- `PAYMENT_WEBHOOK_SECRET`: another random string (`openssl rand -hex 20`),
  shared with the phone automation app in step 7.

### 5. Deploy to Vercel

Push this repo to GitHub, then [import it on Vercel](https://vercel.com/new).
In the project's Settings → Environment Variables, add every variable from
`.env.local.example` with the real values from steps 1-4, plus
`NEXT_PUBLIC_CLOUD_SYNC=true`. Deploy.

### 6. Register the Telegram webhook

Once deployed, run this once (replace the placeholders):

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<your-vercel-domain>/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Then message your bot: "aaj 2k laptop repair, 200 rapido" — it should
reply confirming two logged expenses, and they'll show up in `/expenses`.

### 7. PhonePe auto-capture (optional)

There's no official PhonePe API for personal accounts, so this works by
having your phone forward PhonePe's payment notifications to the app's
webhook using a free Android automation app.

1. Install [MacroDroid](https://play.google.com/store/apps/details?id=com.arlosoft.macrodroid)
   (or Tasker) on your phone.
2. Create a macro:
   - **Trigger**: Notification Received, app = PhonePe
     (package `com.phonepe.app`).
   - **Action**: HTTP Request →
     - Method: `POST`
     - URL: `https://<your-vercel-domain>/api/webhooks/payment-sms`
     - Headers: `Content-Type: application/json`,
       `X-Payment-Webhook-Secret: <PAYMENT_WEBHOOK_SECRET>`
     - Body: `{"text": "[Notification Text]"}` (use MacroDroid's
       notification-text variable)
3. Make a PhonePe payment and confirm you get a Telegram confirmation
   message and the expense shows up.

Forward either the notification *or* an SMS for a payment, not both, or
it'll get logged twice.

## What v1 does and doesn't do

- Every bot/webhook-logged expense is one-time (`is_recurring: false`).
  Mark something recurring manually in `/expenses` after the fact.
- Dates are always "today" — there's no "kal"/explicit-date parsing yet.
- No editing or deleting an expense from within Telegram — fix mistakes in
  the web UI. The bot's confirmation reply is meant to catch mis-parses
  immediately so this is rarely needed.
- No budget-threshold alerts pushed to Telegram (yet).

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Firestore (via Firebase Admin SDK, server-side only) for storage, with a
  localStorage-backed demo mode when cloud sync isn't enabled
- A PIN-gated session cookie (`src/proxy.ts`) instead of full auth —
  appropriate for a single-user personal tool
- Google Gemini (free tier, structured JSON output constrained to your real
  category IDs) to parse free-form Hinglish expense messages
- Recharts for the category pie chart and spending trend chart
