"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { pembayaranSchema, type PembayaranFormValues } from "@/lib/validation/pembayaran"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { formatRupiah } from "@/lib/format"

async function requirePenarikOrAdmin() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "ADMIN" && role !== "PETUGAS_PENARIK") {
    throw new Error("Tidak diizinkan")
  }
  return session!.user
}

export async function recordPembayaran(values: PembayaranFormValues) {
  const user = await requirePenarikOrAdmin()
  const data = pembayaranSchema.parse(values)

  const pembayaran = await prisma.pembayaran.create({
    data: {
      pelangganId: data.pelangganId,
      petugasId: user.id,
      nominal: data.nominal,
      tanggal: new Date(data.tanggal),
      status: data.status,
    },
    include: { pelanggan: true },
  })

  revalidatePath("/petugas-penarik/tagihan")
  revalidatePath("/petugas-penarik/riwayat")
  revalidatePath("/admin/iuran")

  if (data.status === "LUNAS" && pembayaran.pelanggan.noHp) {
    const message = `Halo ${pembayaran.pelanggan.nama}, pembayaran iuran sampah Anda sebesar ${formatRupiah(
      data.nominal
    )} pada ${new Date(data.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} telah kami terima. Terima kasih - RESIK`

    await sendWhatsAppMessage({
      pelangganId: pembayaran.pelangganId,
      to: pembayaran.pelanggan.noHp,
      message,
      jenis: "KONFIRMASI_PEMBAYARAN",
    })
  }
}
