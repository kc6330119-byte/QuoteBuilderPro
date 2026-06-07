import type { CalculatorBranding } from "@/lib/calculator-data";
import { cn, getInitials } from "@/lib/utils";

export function QuoteBrandMark({
  branding,
  size = "md",
  className
}: {
  branding: CalculatorBranding;
  size?: "sm" | "md";
  className?: string;
}) {
  const markSize = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      {branding.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Customer logo URLs are user-provided and cannot be preconfigured for next/image.
        <img
          src={branding.logoUrl}
          alt={`${branding.displayName} logo`}
          className={cn(markSize, "shrink-0 rounded-xl border border-line bg-white object-contain p-1 shadow-crisp")}
        />
      ) : (
        <div
          className={cn(markSize, "flex shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow-crisp")}
          style={{ backgroundColor: branding.primaryColor }}
        >
          {getInitials(branding.displayName, "Q")}
        </div>
      )}
      <div className="min-w-0">
        <p className={cn("truncate font-display font-black text-ink", textSize)}>{branding.displayName}</p>
        <p className="text-xs font-semibold text-coal/50">Estimate calculator</p>
      </div>
    </div>
  );
}
