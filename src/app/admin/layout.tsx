import { auth } from "@/auth"
import { AppShell } from "@/components/layout/app-shell"
import { ROLE_LABEL } from "@/lib/roles"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <AppShell role="ADMIN" roleLabel={ROLE_LABEL.ADMIN} userName={session?.user?.name ?? ""}>
      {children}
    </AppShell>
  )
}
