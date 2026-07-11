import { prisma } from "@/lib/prisma"
import { NotifikasiClient } from "./notifikasi-client"

export default async function NotifikasiPage() {
  const logs = await prisma.notifikasiLog.findMany({
    include: { pelanggan: { select: { nama: true } } },
    orderBy: { timestamp: "desc" },
    take: 100,
  })

  const rows = logs.map((l) => ({
    id: l.id,
    pelangganNama: l.pelanggan.nama,
    jenis: l.jenis,
    pesan: l.pesan,
    statusTerkirim: l.statusTerkirim,
    timestamp: l.timestamp,
  }))

  return <NotifikasiClient rows={rows} />
}
