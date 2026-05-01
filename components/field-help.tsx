import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";

export function FieldHelp({
  title,
  children,
  tone = "light",
  align = "right"
}: {
  title: string;
  children: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "right";
}) {
  const iconClass =
    tone === "dark"
      ? "border-white/15 bg-white/10 text-blue-100 hover:bg-white/20 focus-visible:outline-blue-200"
      : "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:outline-blue-600";
  const panelClass =
    tone === "dark"
      ? "border-white/10 bg-slate-950 text-white shadow-soft"
      : "border-[#dbe5f4] bg-white text-ink shadow-soft";
  const bodyClass = tone === "dark" ? "text-white/70" : "text-coal/70";
  const positionClass = align === "left" ? "left-0" : "right-0";

  return (
    <details className="group/help relative inline-flex">
      <summary
        className={`flex h-6 w-6 cursor-pointer list-none items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden ${iconClass}`}
        aria-label={`Help: ${title}`}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </summary>
      <div
        className={`absolute top-8 z-30 w-72 rounded-xl border p-4 text-left normal-case tracking-normal ${positionClass} ${panelClass}`}
      >
        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">{title}</p>
        <div className={`mt-2 space-y-2 text-xs leading-5 ${bodyClass}`}>{children}</div>
      </div>
    </details>
  );
}
