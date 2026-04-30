import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentWorkspace } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentWorkspace();

  return (
    <DashboardShell user={user} isAdmin={isAdminEmail(user.email)}>
      {children}
    </DashboardShell>
  );
}
