"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { pembayaranSchema, type PembayaranFormValues } from "@/lib/validation/pembayaran"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { formatRupiah } from "@/lib/format"
import { getPelangganBelumBayarBulanIni } from "@/lib/queries/pembayaran"

async function requirePenarikOrAdmin() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "ADMIN" && role !== "PETUGAS_PENARIK") {
    throw new Error("Tidak diizinkan")
  }
  return session!.user
}

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Tidak diizinkan")
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

async function runReminderTagihan(
  belumBayar: Awaited<ReturnType<typeof getPelangganBelumBayarBulanIni>>
) {
  const bulanIni = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })

  for (const p of belumBayar) {
    if (!p.noHp) continue

    const message = `Halo ${p.nama}, ini pengingat iuran sampah bulan ${bulanIni} sebesar ${formatRupiah(
      p.iuran
    )} masih belum dibayar. Mohon segera diselesaikan sebelum akhir bulan. Terima kasih - RESIK`

    await sendWhatsAppMessage({
      pelangganId: p.id,
      to: p.noHp,
      message,
      jenis: "REMINDER_TAGIHAN",
    })

    // Jeda antar pesan supaya tidak terlihat sebagai pola bulk-blast oleh WhatsApp
    await sleep(2000)
  }

  revalidatePath("/admin/notifikasi")
}

/**
 * Sengaja tidak menunggu seluruh loop selesai (ratusan pelanggan x jeda 2 detik
 * bisa >10 menit — nyaris pasti timeout di reverse proxy). Action ini cuma
 * memicu pengiriman di background lalu langsung balas; progress/hasil dicek
 * lewat halaman Log Notifikasi.
 */
export async function triggerReminderTagihan() {
  await requireAdmin()

  const belumBayar = await getPelangganBelumBayarBulanIni()
  const totalDenganNomor = belumBayar.filter((p) => p.noHp).length
  const skipped = belumBayar.length - totalDenganNomor

  runReminderTagihan(belumBayar).catch((err) => {
    console.error("[triggerReminderTagihan] gagal jalan di background:", err)
  })

  return { total: belumBayar.length, akanDikirim: totalDenganNomor, skipped }
}

export async function sendReminderSatuPelanggan(pelangganId: string) {
  await requireAdmin()

  const pelanggan = await prisma.pelanggan.findUnique({ where: { id: pelangganId } })
  if (!pelanggan) {
    throw new Error("Pelanggan tidak ditemukan")
  }
  if (!pelanggan.noHp) {
    throw new Error("Pelanggan belum punya nomor HP")
  }

  const bulanIni = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })
  const message = `Halo ${pelanggan.nama}, ini pengingat iuran sampah bulan ${bulanIni} sebesar ${formatRupiah(
    Number(pelanggan.iuran)
  )} masih belum dibayar. Mohon segera diselesaikan sebelum akhir bulan. Terima kasih - RESIK`

  const result = await sendWhatsAppMessage({
    pelangganId: pelanggan.id,
    to: pelanggan.noHp,
    message,
    jenis: "REMINDER_TAGIHAN",
  })

  revalidatePath("/admin/notifikasi")

  if (!result.success) {
    throw new Error(result.error ?? "Gagal mengirim reminder")
  }
}
