import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentWorkspace } from "@/lib/auth";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentWorkspace();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
