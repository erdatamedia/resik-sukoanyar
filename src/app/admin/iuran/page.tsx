import { prisma } from "@/lib/prisma"
import { getRekapPembayaran } from "@/lib/queries/pembayaran"
import { IuranRekapClient } from "./iuran-rekap-client"

function parseMonth(param: string | undefined) {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [year, month] = param.split("-").map(Number)
    return { year, month }
  }
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export default async function AdminIuranPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month: monthParam } = await searchParams
  const { year, month } = parseMonth(monthParam)

  const [rows, desaList, pelangganAktifCount] = await Promise.all([
    getRekapPembayaran(year, month),
    prisma.desa.findMany({ orderBy: { nama: "asc" } }),
    prisma.pelanggan.count({ where: { statusAktif: "AKTIF" } }),
  ])

  const monthValue = `${year}-${String(month).padStart(2, "0")}`

  return (
    <IuranRekapClient
      rows={rows}
      desaList={desaList}
      monthValue={monthValue}
      pelangganAktifCount={pelangganAktifCount}
    />
  )
}
