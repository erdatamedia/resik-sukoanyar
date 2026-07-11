import { prisma } from "@/lib/prisma"
import { PelangganClient } from "./pelanggan-client"

export default async function PelangganPage() {
  const [pelanggan, desaList] = await Promise.all([
    prisma.pelanggan.findMany({
      include: { desa: true },
      orderBy: { nama: "asc" },
    }),
    prisma.desa.findMany({ orderBy: { nama: "asc" } }),
  ])

  const rows = pelanggan.map((p) => ({
    id: p.id,
    nama: p.nama,
    alamat: p.alamat,
    noHp: p.noHp,
    desaId: p.desaId,
    desaNama: p.desa.nama,
    statusAktif: p.statusAktif,
    iuran: Number(p.iuran),
  }))

  return <PelangganClient pelanggan={rows} desaList={desaList} />
}
