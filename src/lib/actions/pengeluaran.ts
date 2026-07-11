"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { pengeluaranSchema, type PengeluaranFormValues } from "@/lib/validation/pengeluaran"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Tidak diizinkan")
  }
}

export async function createPengeluaran(values: PengeluaranFormValues) {
  await requireAdmin()
  const data = pengeluaranSchema.parse(values)

  await prisma.pengeluaran.create({
    data: {
      kategori: data.kategori,
      nominal: data.nominal,
      tanggal: new Date(data.tanggal),
    },
  })

  revalidatePath("/admin/pengeluaran")
  revalidatePath("/admin")
}

export async function updatePengeluaran(id: string, values: PengeluaranFormValues) {
  await requireAdmin()
  const data = pengeluaranSchema.parse(values)

  await prisma.pengeluaran.update({
    where: { id },
    data: {
      kategori: data.kategori,
      nominal: data.nominal,
      tanggal: new Date(data.tanggal),
    },
  })

  revalidatePath("/admin/pengeluaran")
  revalidatePath("/admin")
}

export async function deletePengeluaran(id: string) {
  await requireAdmin()

  await prisma.pengeluaran.delete({ where: { id } })

  revalidatePath("/admin/pengeluaran")
  revalidatePath("/admin")
}
