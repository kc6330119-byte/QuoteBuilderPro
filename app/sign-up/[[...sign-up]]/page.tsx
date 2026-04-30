import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Create account",
  robots: {
    index: false,
    follow: false
  }
};

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your company account."
      description="Start a private company account where calculators, published quote pages, and submitted leads stay separated from every other customer."
    >
      <SignUp />
    </AuthCard>
  );
}
