import { SignUp } from "@clerk/nextjs";
import { AuthCard } from "@/components/auth-card";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your workspace."
      description="Start a company workspace where calculators, published quote pages, and submitted leads stay separated from every other customer."
    >
      <SignUp />
    </AuthCard>
  );
}
