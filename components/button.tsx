import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white shadow-crisp hover:bg-coal",
  secondary: "bg-teal-700 text-white shadow-crisp hover:bg-teal-900",
  ghost: "bg-transparent text-coal hover:bg-mist",
  outline: "border border-line bg-white text-coal hover:border-teal-600 hover:text-teal-700"
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base"
};

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
