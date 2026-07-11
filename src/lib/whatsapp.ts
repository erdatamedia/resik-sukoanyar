import { prisma } from "@/lib/prisma"

const SERVICE_URL = process.env.WHATSAPP_SERVICE_URL ?? "http://localhost:4001"
const SERVICE_TOKEN = process.env.WHATSAPP_SERVICE_TOKEN

export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "")
  if (digits.startsWith("0")) return `62${digits.slice(1)}`
  return digits
}

export async function sendWhatsAppMessage({
  pelangganId,
  to,
  message,
  jenis,
}: {
  pelangganId: string
  to: string
  message: string
  jenis: "REMINDER_TAGIHAN" | "KONFIRMASI_PEMBAYARAN"
}): Promise<{ success: boolean; error?: string }> {
  const log = await prisma.notifikasiLog.create({
    data: { pelangganId, jenis, pesan: message, statusTerkirim: "PENDING" },
  })

  if (!SERVICE_TOKEN) {
    await prisma.notifikasiLog.update({
      where: { id: log.id },
      data: { statusTerkirim: "GAGAL" },
    })
    return { success: false, error: "WHATSAPP_SERVICE_TOKEN belum dikonfigurasi" }
  }

  try {
    const res = await fetch(`${SERVICE_URL}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_TOKEN}`,
      },
      body: JSON.stringify({ to: normalizePhoneNumber(to), message }),
      signal: AbortSignal.timeout(15000),
    })

    const data = (await res.json()) as { success: boolean; error?: string }

    await prisma.notifikasiLog.update({
      where: { id: log.id },
      data: { statusTerkirim: data.success ? "TERKIRIM" : "GAGAL" },
    })

    return data
  } catch (err) {
    await prisma.notifikasiLog.update({
      where: { id: log.id },
      data: { statusTerkirim: "GAGAL" },
    })
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengirim" }
  }
}
