import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon,
  className
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-[#dbe5f4] bg-white p-5 shadow-crisp", className)}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-teal-400" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-coal/70">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className="rounded-md border border-[#dbe5f4] bg-[#eff6ff] p-2 text-blue-700">{icon}</div>
      </div>
      <p className="mt-4 text-sm text-coal/70">{detail}</p>
    </div>
  );
}
