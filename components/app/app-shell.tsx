"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  Activity,
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  Utensils,
  Moon,
  Target,
  Flame,
  Bot,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/program", label: "45-Day Program", icon: CalendarDays },
  { href: "/fitness", label: "Fitness", icon: Dumbbell },
  { href: "/nutrition", label: "Nutrition", icon: Utensils },
  { href: "/sleep", label: "Sleep", icon: Moon },
  { href: "/productivity", label: "Productivity", icon: Target },
  { href: "/habits", label: "Habits", icon: Flame },
  { href: "/coach", label: "AI Coach", icon: Bot },
];

function NavLinks({
  pathname,
  onClick,
}: {
  pathname: string;
  onClick?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-muted-surface hover:text-foreground",
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  name,
  day,
}: {
  children: React.ReactNode;
  name: string;
  day: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface p-4 lg:flex">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </span>
          Ascend
        </Link>
        <div className="mb-4 rounded-xl bg-primary/10 px-3 py-2.5">
          <p className="text-xs text-muted">Transformation</p>
          <p className="font-display text-sm font-bold text-primary">Day {day} of 45</p>
        </div>
        <NavLinks pathname={pathname} />
        <div className="mt-auto space-y-1 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-muted-surface px-3 py-2">
            <span className="truncate text-sm font-medium">{name}</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-muted-surface hover:text-danger"
          >
            <LogOut className="h-4.5 w-4.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" />
            </span>
            Ascend
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Day {day}</span>
            <button onClick={() => setOpen(true)} aria-label="Menu" className="grid h-9 w-9 place-items-center rounded-lg border border-border">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-surface p-4">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display font-bold">Menu</span>
                <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg border border-border">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavLinks pathname={pathname} onClick={() => setOpen(false)} />
              <div className="mt-6 space-y-1">
                <div className="flex items-center justify-between rounded-xl bg-muted-surface px-3 py-2">
                  <span className="truncate text-sm font-medium">{name}</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:text-danger"
                >
                  <LogOut className="h-4.5 w-4.5" /> Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
