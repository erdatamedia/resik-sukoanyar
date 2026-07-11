import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PenggunaClient } from "./pengguna-client"

export default async function PenggunaPage() {
  const session = await auth()

  const [users, desaList] = await Promise.all([
    prisma.user.findMany({
      include: { desa: true },
      orderBy: { nama: "asc" },
    }),
    prisma.desa.findMany({ orderBy: { nama: "asc" } }),
  ])

  const rows = users.map((u) => ({
    id: u.id,
    nama: u.nama,
    email: u.email,
    role: u.role,
    desaId: u.desaId,
    desaNama: u.desa?.nama ?? null,
    isActive: u.isActive,
  }))

  return (
    <PenggunaClient users={rows} desaList={desaList} currentUserId={session!.user.id} />
  )
}
