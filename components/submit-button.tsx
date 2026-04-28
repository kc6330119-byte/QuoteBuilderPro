"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/button";

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
  className,
  variant = "primary",
  size = "md",
  disabled = false
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} className={className} variant={variant} size={size}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
