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
import { motion } from "motion/react";
import { isCloudSyncEnabled } from "@/lib/config";
import { Sidebar as SidebarShell, DesktopSidebar } from "@/components/ui/sidebar";

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
      <div className="hidden md:block">
        <SidebarShell animate>
          <DesktopSidebar className="justify-between border-r border-border/60">
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="mb-8 flex items-center gap-2 px-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)]">
                  <Wallet size={18} />
                </div>
                <span className="font-display truncate text-lg text-foreground">
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
                      className="group/sidebar relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 rounded-xl bg-primary/12 ring-1 ring-primary/25"
                          transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        />
                      )}
                      <Icon
                        size={18}
                        className={`relative shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span
                        className={`relative ${active ? "text-foreground" : "text-muted-foreground group-hover/sidebar:text-foreground"}`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            {isCloudSyncEnabled && (
              <button
                onClick={lock}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <Lock size={18} className="shrink-0" />
                <span>Lock</span>
              </button>
            )}
          </DesktopSidebar>
        </SidebarShell>
      </div>

      <nav className="glass fixed inset-x-0 bottom-0 z-20 flex md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium"
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-active-dot"
                  className="absolute top-1 h-1 w-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                />
              )}
              <Icon
                size={18}
                className={active ? "text-primary" : "text-muted-foreground"}
              />
              <span className={active ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
