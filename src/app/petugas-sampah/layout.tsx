import { auth } from "@/auth"
import { AppShell } from "@/components/layout/app-shell"
import { ROLE_LABEL } from "@/lib/roles"

export default async function PetugasSampahLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <AppShell
      role="PETUGAS_SAMPAH"
      roleLabel={ROLE_LABEL.PETUGAS_SAMPAH}
      userName={session?.user?.name ?? ""}
    >
      {children}
    </AppShell>
  )
}
