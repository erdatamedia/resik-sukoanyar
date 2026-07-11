import { prisma } from "@/lib/prisma"
import { PelangganClient } from "./pelanggan-client"

function startOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function startOfNextMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1)
}

export default async function PelangganPage() {
  const [pelanggan, desaList, pembayaranBulanIni] = await Promise.all([
    prisma.pelanggan.findMany({
      include: { desa: true },
      orderBy: { nama: "asc" },
    }),
    prisma.desa.findMany({ orderBy: { nama: "asc" } }),
    prisma.pembayaran.findMany({
      where: {
        tanggal: { gte: startOfMonth(), lt: startOfNextMonth() },
        status: "LUNAS",
      },
      select: { pelangganId: true },
    }),
  ])

  const lunasSet = new Set(pembayaranBulanIni.map((p) => p.pelangganId))

  const rows = pelanggan.map((p) => ({
    id: p.id,
    nama: p.nama,
    alamat: p.alamat,
    noHp: p.noHp,
    desaId: p.desaId,
    desaNama: p.desa.nama,
    statusAktif: p.statusAktif,
    iuran: Number(p.iuran),
    sudahLunasBulanIni: lunasSet.has(p.id),
  }))

  return <PelangganClient pelanggan={rows} desaList={desaList} />
}
