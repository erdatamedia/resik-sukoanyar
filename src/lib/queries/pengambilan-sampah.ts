import { prisma } from "@/lib/prisma"

function todayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return { start, end }
}

export async function getRumahDilayaniHariIni() {
  const { start, end } = todayRange()

  const [pelanggan, diambilHariIni] = await Promise.all([
    prisma.pelanggan.findMany({
      where: { statusAktif: "AKTIF" },
      include: { desa: true },
      orderBy: { nama: "asc" },
    }),
    prisma.pengambilanSampah.findMany({
      where: { tanggal: { gte: start, lt: end } },
      select: { pelangganId: true },
    }),
  ])

  const diambilSet = new Set(diambilHariIni.map((p) => p.pelangganId))

  return pelanggan.map((p) => ({
    id: p.id,
    nama: p.nama,
    alamat: p.alamat,
    desaNama: p.desa.nama,
    sudahDiambil: diambilSet.has(p.id),
  }))
}

export async function getJumlahRumahDilayaniHariIni(petugasId: string) {
  const { start, end } = todayRange()

  return prisma.pengambilanSampah.count({
    where: { petugasId, tanggal: { gte: start, lt: end } },
  })
}
