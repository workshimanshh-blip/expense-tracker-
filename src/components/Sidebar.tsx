"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Tags,
  PiggyBank,
  Repeat,
  Wallet,
  Lock,
} from "lucide-react";
import { isCloudSyncEnabled } from "@/lib/config";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/subscriptions", label: "Subscriptions", icon: Repeat },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function lock() {
    await fetch("/api/pin", { method: "DELETE" });
    router.push("/pin");
  }

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-6 md:flex dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <Wallet size={18} />
          </div>
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Kharcha
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {isCloudSyncEnabled && (
          <button
            onClick={lock}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Lock size={18} />
            Lock
          </button>
        )}
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-neutral-200 bg-white md:hidden dark:border-neutral-800 dark:bg-neutral-900">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
