import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false
  }
};

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back."
      description="Sign in to manage quote calculators, embed codes, and customer leads for your company."
    >
      <SignIn />
    </AuthCard>
  );
}
