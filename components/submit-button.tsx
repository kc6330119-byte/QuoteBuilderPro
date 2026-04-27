"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/button";

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
  className,
  variant = "primary"
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={className} variant={variant}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
