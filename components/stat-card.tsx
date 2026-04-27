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
    <div className={cn("rounded-lg border border-line bg-white p-5 shadow-crisp", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-coal/70">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className="rounded-md border border-line bg-paper p-2 text-teal-700">{icon}</div>
      </div>
      <p className="mt-4 text-sm text-coal/70">{detail}</p>
    </div>
  );
}
