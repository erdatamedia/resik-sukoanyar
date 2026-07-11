"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Tidak diizinkan")
  }
}

export type ImportPelangganInput = {
  nama: string
  alamat: string
  noHp: string
  desaNama: string
  iuran: number
  statusAktif: "AKTIF" | "NONAKTIF"
}

export async function importPelanggan(rows: ImportPelangganInput[]) {
  await requireAdmin()

  if (rows.length === 0) {
    return { created: 0, skippedDuplicate: 0, failed: [] as { nama: string; reason: string }[] }
  }

  const desaList = await prisma.desa.findMany()
  const desaByName = new Map(desaList.map((d) => [d.nama, d.id]))

  const existing = await prisma.pelanggan.findMany({
    select: { nama: true, alamat: true },
  })
  const existingKeys = new Set(existing.map((p) => `${p.nama.toLowerCase()}|${p.alamat.toLowerCase()}`))

  const failed: { nama: string; reason: string }[] = []
  const toCreate: {
    nama: string
    alamat: string
    noHp: string
    desaId: string
    iuran: number
    statusAktif: "AKTIF" | "NONAKTIF"
  }[] = []
  let skippedDuplicate = 0

  for (const row of rows) {
    const desaId = desaByName.get(row.desaNama)
    if (!desaId) {
      failed.push({ nama: row.nama, reason: `Desa "${row.desaNama}" tidak ditemukan` })
      continue
    }

    const key = `${row.nama.toLowerCase()}|${row.alamat.toLowerCase()}`
    if (existingKeys.has(key)) {
      skippedDuplicate += 1
      continue
    }
    existingKeys.add(key)

    toCreate.push({
      nama: row.nama,
      alamat: row.alamat,
      noHp: row.noHp,
      desaId,
      iuran: row.iuran,
      statusAktif: row.statusAktif,
    })
  }

  if (toCreate.length > 0) {
    await prisma.pelanggan.createMany({ data: toCreate })
  }

  revalidatePath("/admin/pelanggan")

  return { created: toCreate.length, skippedDuplicate, failed }
}
