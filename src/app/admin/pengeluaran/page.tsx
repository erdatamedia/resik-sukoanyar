import { prisma } from "@/lib/prisma"
import { PengeluaranClient } from "./pengeluaran-client"

export default async function PengeluaranPage() {
  const pengeluaran = await prisma.pengeluaran.findMany({ orderBy: { tanggal: "desc" } })

  const rows = pengeluaran.map((p) => ({
    id: p.id,
    kategori: p.kategori,
    nominal: Number(p.nominal),
    tanggal: p.tanggal.toISOString().slice(0, 10),
  }))

  return <PengeluaranClient rows={rows} />
}
