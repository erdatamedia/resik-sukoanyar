import { prisma } from "@/lib/prisma"

function monthRange(year: number, month: number) {
  return { start: new Date(year, month - 1, 1), end: new Date(year, month, 1) }
}

export async function getTagihanBulanIni() {
  const now = new Date()
  const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1)

  const [pelanggan, pembayaranBulanIni] = await Promise.all([
    prisma.pelanggan.findMany({
      where: { statusAktif: "AKTIF" },
      include: { desa: true },
      orderBy: { nama: "asc" },
    }),
    prisma.pembayaran.findMany({
      where: { tanggal: { gte: start, lt: end }, status: "LUNAS" },
      select: { pelangganId: true },
    }),
  ])

  const lunasSet = new Set(pembayaranBulanIni.map((p) => p.pelangganId))

  return pelanggan.map((p) => ({
    id: p.id,
    nama: p.nama,
    alamat: p.alamat,
    desaNama: p.desa.nama,
    iuran: Number(p.iuran),
    sudahLunas: lunasSet.has(p.id),
  }))
}

export async function getPelangganBelumBayarBulanIni() {
  const now = new Date()
  const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1)

  const [pelanggan, pembayaranBulanIni] = await Promise.all([
    prisma.pelanggan.findMany({
      where: { statusAktif: "AKTIF" },
      select: { id: true, nama: true, noHp: true, iuran: true },
    }),
    prisma.pembayaran.findMany({
      where: { tanggal: { gte: start, lt: end }, status: "LUNAS" },
      select: { pelangganId: true },
    }),
  ])

  const lunasSet = new Set(pembayaranBulanIni.map((p) => p.pelangganId))

  return pelanggan
    .filter((p) => !lunasSet.has(p.id))
    .map((p) => ({ id: p.id, nama: p.nama, noHp: p.noHp, iuran: Number(p.iuran) }))
}

export async function getRiwayatPembayaran(petugasId: string, take = 30) {
  const rows = await prisma.pembayaran.findMany({
    where: { petugasId },
    include: { pelanggan: { select: { nama: true } } },
    orderBy: { tanggal: "desc" },
    take,
  })

  return rows.map((r) => ({
    id: r.id,
    pelangganNama: r.pelanggan.nama,
    nominal: Number(r.nominal),
    tanggal: r.tanggal,
    status: r.status,
  }))
}

export async function getRekapPembayaran(year: number, month: number) {
  const { start, end } = monthRange(year, month)

  const rows = await prisma.pembayaran.findMany({
    where: { tanggal: { gte: start, lt: end } },
    include: {
      pelanggan: { select: { nama: true, desa: { select: { nama: true } } } },
      petugas: { select: { nama: true } },
    },
    orderBy: { tanggal: "desc" },
  })

  return rows.map((r) => ({
    id: r.id,
    pelangganNama: r.pelanggan.nama,
    desaNama: r.pelanggan.desa.nama,
    petugasNama: r.petugas.nama,
    nominal: Number(r.nominal),
    tanggal: r.tanggal,
    status: r.status,
  }))
}
