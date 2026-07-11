import { NextRequest, NextResponse } from "next/server"
import { getPelangganBelumBayarBulanIni } from "@/lib/queries/pembayaran"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { formatRupiah } from "@/lib/format"

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const belumBayar = await getPelangganBelumBayarBulanIni()

  let sent = 0
  let failed = 0
  let skipped = 0

  const bulanIni = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })

  for (const p of belumBayar) {
    if (!p.noHp) {
      skipped += 1
      continue
    }

    const message = `Halo ${p.nama}, ini pengingat iuran sampah bulan ${bulanIni} sebesar ${formatRupiah(
      p.iuran
    )} masih belum dibayar. Mohon segera diselesaikan sebelum akhir bulan. Terima kasih - RESIK`

    const result = await sendWhatsAppMessage({
      pelangganId: p.id,
      to: p.noHp,
      message,
      jenis: "REMINDER_TAGIHAN",
    })

    if (result.success) sent += 1
    else failed += 1
  }

  return NextResponse.json({ total: belumBayar.length, sent, failed, skipped })
}
