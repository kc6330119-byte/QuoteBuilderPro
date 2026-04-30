"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { CircleHelp, ClipboardList, FilePlus2, LayoutDashboard, Layers3, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Calculators", href: "/dashboard/calculators", icon: ClipboardList },
  { name: "Create", href: "/dashboard/calculators/new", icon: FilePlus2 },
  { name: "Templates", href: "/dashboard/templates", icon: Layers3 },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Guide", href: "/dashboard/how-to-use", icon: CircleHelp }
];

export function DashboardShell({
  children,
  user,
  isAdmin = false
}: {
  children: React.ReactNode;
  user: { name: string; email: string; initials: string; companyName: string };
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const visibleNavigation = isAdmin ? [...navigation, { name: "Admin", href: "/admin", icon: ShieldCheck }] : navigation;

  return (
    <div className="min-h-screen bg-[#f7faff] text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#dbe5f4] bg-white/[0.94] px-5 py-6 shadow-[8px_0_30px_rgba(15,23,42,0.04)] backdrop-blur lg:block">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white shadow-crisp">
            QB
          </span>
          <span>
            <span className="block font-display text-lg font-bold">QuoteBuilder Pro</span>
            <span className="text-xs font-medium text-coal/60">{user.companyName}</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition",
                  active ? "bg-blue-50 text-blue-700 shadow-sm" : "text-coal/70 hover:bg-[#eef4ff] hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-5 right-5 rounded-lg border border-[#dbe5f4] bg-[#f8fbff] p-4">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{user.name}</p>
              <p className="truncate text-xs text-coal/60">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 border-t border-[#dbe5f4] pt-3 text-xs font-semibold text-coal/55">
            <Link href="/terms" className="transition hover:text-blue-700">
              Terms
            </Link>
            <Link href="/privacy" className="transition hover:text-blue-700">
              Privacy
            </Link>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#dbe5f4] bg-[#f7faff]/[0.92] px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-display text-lg font-bold">
              QuoteBuilder Pro
            </Link>
            <div className="flex items-center gap-1">
              {visibleNavigation.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.name}
                    className={cn(
                      "rounded-md p-2 transition",
                      active ? "bg-blue-50 text-blue-700" : "text-coal/70 hover:bg-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
              <div className="pl-1">
                <UserButton />
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
