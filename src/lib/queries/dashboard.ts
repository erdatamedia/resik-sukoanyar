import { prisma } from "@/lib/prisma"

function startOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function startOfNextMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1)
}

export async function getDashboardStats() {
  const start = startOfMonth()
  const end = startOfNextMonth()

  const [pemasukanBulanIni, pengeluaranBulanIni, totalPemasukan, totalPengeluaran, pelangganAktif] =
    await Promise.all([
      prisma.pembayaran.aggregate({
        _sum: { nominal: true },
        where: { status: "LUNAS", tanggal: { gte: start, lt: end } },
      }),
      prisma.pengeluaran.aggregate({
        _sum: { nominal: true },
        where: { tanggal: { gte: start, lt: end } },
      }),
      prisma.pembayaran.aggregate({
        _sum: { nominal: true },
        where: { status: "LUNAS" },
      }),
      prisma.pengeluaran.aggregate({
        _sum: { nominal: true },
      }),
      prisma.pelanggan.count({ where: { statusAktif: "AKTIF" } }),
    ])

  return {
    pemasukanBulanIni: Number(pemasukanBulanIni._sum.nominal ?? 0),
    pengeluaranBulanIni: Number(pengeluaranBulanIni._sum.nominal ?? 0),
    saldo: Number(totalPemasukan._sum.nominal ?? 0) - Number(totalPengeluaran._sum.nominal ?? 0),
    pelangganAktif,
  }
}
