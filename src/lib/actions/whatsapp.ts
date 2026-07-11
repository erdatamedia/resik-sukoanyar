"use server"

import QRCode from "qrcode"
import { auth } from "@/auth"
import { getWhatsAppStatus } from "@/lib/whatsapp"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Tidak diizinkan")
  }
}

export async function fetchWhatsAppStatus() {
  await requireAdmin()

  const status = await getWhatsAppStatus()
  const qrImage = status.qr ? await QRCode.toDataURL(status.qr, { margin: 1, width: 280 }) : null

  return { reachable: status.reachable, ready: status.ready, qrImage }
}
