import { prisma } from "@/lib/prisma"
import { getWhatsAppStatus } from "@/lib/whatsapp"
import QRCode from "qrcode"
import { NotifikasiClient } from "./notifikasi-client"
import { WhatsAppStatusCard } from "./whatsapp-status-card"

export default async function NotifikasiPage() {
  const [logs, status] = await Promise.all([
    prisma.notifikasiLog.findMany({
      include: { pelanggan: { select: { nama: true } } },
      orderBy: { timestamp: "desc" },
      take: 100,
    }),
    getWhatsAppStatus(),
  ])

  const rows = logs.map((l) => ({
    id: l.id,
    pelangganNama: l.pelanggan.nama,
    jenis: l.jenis,
    pesan: l.pesan,
    statusTerkirim: l.statusTerkirim,
    timestamp: l.timestamp,
  }))

  const qrImage = status.qr ? await QRCode.toDataURL(status.qr, { margin: 1, width: 280 }) : null

  return (
    <div className="flex flex-col gap-4">
      <WhatsAppStatusCard
        initial={{ reachable: status.reachable, ready: status.ready, qrImage }}
      />
      <NotifikasiClient rows={rows} />
    </div>
  )
}
