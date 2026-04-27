"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/button";

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
  className,
  variant = "primary",
  size = "md"
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={className} variant={variant} size={size}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
