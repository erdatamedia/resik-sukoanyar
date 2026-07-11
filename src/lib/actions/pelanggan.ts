"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { pelangganSchema, type PelangganFormValues } from "@/lib/validation/pelanggan"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Tidak diizinkan")
  }
}

export async function createPelanggan(values: PelangganFormValues) {
  await requireAdmin()
  const data = pelangganSchema.parse(values)

  await prisma.pelanggan.create({
    data: {
      nama: data.nama,
      alamat: data.alamat,
      noHp: data.noHp,
      desaId: data.desaId,
      iuran: data.iuran,
      statusAktif: data.statusAktif,
    },
  })

  revalidatePath("/admin/pelanggan")
}

export async function updatePelanggan(id: string, values: PelangganFormValues) {
  await requireAdmin()
  const data = pelangganSchema.parse(values)

  await prisma.pelanggan.update({
    where: { id },
    data: {
      nama: data.nama,
      alamat: data.alamat,
      noHp: data.noHp,
      desaId: data.desaId,
      iuran: data.iuran,
      statusAktif: data.statusAktif,
    },
  })

  revalidatePath("/admin/pelanggan")
}

export async function setStatusAktifPelanggan(id: string, statusAktif: "AKTIF" | "NONAKTIF") {
  await requireAdmin()

  await prisma.pelanggan.update({
    where: { id },
    data: { statusAktif },
  })

  revalidatePath("/admin/pelanggan")
}

export async function deletePelanggan(id: string) {
  await requireAdmin()

  await prisma.pelanggan.delete({ where: { id } })

  revalidatePath("/admin/pelanggan")
}
