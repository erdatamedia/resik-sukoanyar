import { prisma } from "@/lib/prisma"
import { AbsensiRekapClient } from "./absensi-rekap-client"

function parseMonth(param: string | undefined) {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [year, month] = param.split("-").map(Number)
    return { year, month }
  }
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export default async function AdminAbsensiPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month: monthParam } = await searchParams
  const { year, month } = parseMonth(monthParam)

  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)

  const [absensi, petugasList] = await Promise.all([
    prisma.absensi.findMany({
      where: { checkIn: { gte: start, lt: end } },
      include: { user: { select: { id: true, nama: true, role: true } } },
      orderBy: { checkIn: "desc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["PETUGAS_PENARIK", "PETUGAS_SAMPAH"] } },
      select: { id: true, nama: true, role: true },
      orderBy: { nama: "asc" },
    }),
  ])

  const rows = absensi.map((a) => ({
    id: a.id,
    userId: a.userId,
    userNama: a.user.nama,
    userRole: a.user.role,
    checkIn: a.checkIn,
    checkOut: a.checkOut,
    verifikasiStatus: a.verifikasiStatus,
  }))

  const monthValue = `${year}-${String(month).padStart(2, "0")}`

  return (
    <AbsensiRekapClient rows={rows} petugasList={petugasList} monthValue={monthValue} />
  )
}
