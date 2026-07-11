import { auth } from "@/auth"
import { AppShell } from "@/components/layout/app-shell"
import { ROLE_LABEL } from "@/lib/roles"

export default async function PetugasPenarikLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <AppShell
      role="PETUGAS_PENARIK"
      roleLabel={ROLE_LABEL.PETUGAS_PENARIK}
      userName={session?.user?.name ?? ""}
    >
      {children}
    </AppShell>
  )
}
