import { DashboardShell } from "@/components/dashboard-shell";
import { getMockUser } from "@/lib/auth";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = getMockUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
