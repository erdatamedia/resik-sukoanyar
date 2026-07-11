"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { userSchema, type UserFormValues } from "@/lib/validation/user"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Tidak diizinkan")
  }
  return session.user
}

export async function createUser(values: UserFormValues) {
  await requireAdmin()
  const data = userSchema.parse(values)

  if (!data.password) {
    throw new Error("Password wajib diisi untuk akun baru")
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    throw new Error("Email sudah dipakai")
  }

  const passwordHash = await bcrypt.hash(data.password, 10)

  await prisma.user.create({
    data: {
      nama: data.nama,
      email: data.email,
      role: data.role,
      desaId: data.desaId || null,
      passwordHash,
    },
  })

  revalidatePath("/admin/pengguna")
}

export async function updateUser(id: string, values: UserFormValues) {
  const admin = await requireAdmin()
  const data = userSchema.parse(values)

  if (id === admin.id && data.role !== "ADMIN") {
    throw new Error("Tidak bisa mengubah role akun Anda sendiri")
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing && existing.id !== id) {
    throw new Error("Email sudah dipakai")
  }

  await prisma.user.update({
    where: { id },
    data: {
      nama: data.nama,
      email: data.email,
      role: data.role,
      desaId: data.desaId || null,
      ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 10) } : {}),
    },
  })

  revalidatePath("/admin/pengguna")
}

export async function setUserActive(id: string, isActive: boolean) {
  const admin = await requireAdmin()

  if (id === admin.id && !isActive) {
    throw new Error("Tidak bisa menonaktifkan akun Anda sendiri")
  }

  await prisma.user.update({
    where: { id },
    data: { isActive },
  })

  revalidatePath("/admin/pengguna")
}
