"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

function todayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return { start, end }
}

async function requirePetugasSampah() {
  const session = await auth()
  if (session?.user?.role !== "PETUGAS_SAMPAH") {
    throw new Error("Tidak diizinkan")
  }
  return session!.user
}

export async function recordPengambilanSampah(pelangganId: string) {
  const user = await requirePetugasSampah()
  const { start, end } = todayRange()

  const existing = await prisma.pengambilanSampah.findFirst({
    where: { pelangganId, tanggal: { gte: start, lt: end } },
  })
  if (existing) {
    throw new Error("Rumah ini sudah tercatat diambil hari ini")
  }

  await prisma.pengambilanSampah.create({
    data: { pelangganId, petugasId: user.id, tanggal: new Date() },
  })

  revalidatePath("/petugas-sampah")
  revalidatePath("/petugas-sampah/rumah")
}
