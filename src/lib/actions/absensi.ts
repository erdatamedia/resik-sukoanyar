"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { saveUploadedImage } from "@/lib/storage"
import { ROLE_HOME } from "@/lib/roles"
import { euclideanDistance, FACE_MATCH_THRESHOLD } from "@/lib/face/distance"

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

async function requirePetugas() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "PETUGAS_PENARIK" && role !== "PETUGAS_SAMPAH") {
    throw new Error("Tidak diizinkan")
  }
  return session!.user
}

export async function checkIn(formData: FormData) {
  const user = await requirePetugas()

  const existing = await prisma.absensi.findFirst({
    where: { userId: user.id, checkIn: { gte: startOfToday() }, checkOut: null },
  })
  if (existing) {
    throw new Error("Anda sudah check-in hari ini")
  }

  const selfie = formData.get("selfie")
  let selfieUrl: string | undefined

  if (selfie instanceof File && selfie.size > 0) {
    selfieUrl = await saveUploadedImage(selfie, "absensi")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { faceDescriptor: true },
  })

  const descriptorRaw = formData.get("descriptor")
  let verifikasiStatus: "PENDING" | "VERIFIED" | "FAILED" = "PENDING"

  if (dbUser?.faceDescriptor && typeof descriptorRaw === "string") {
    try {
      const incoming = JSON.parse(descriptorRaw) as number[]
      const reference = dbUser.faceDescriptor as number[]
      const distance = euclideanDistance(incoming, reference)
      verifikasiStatus = distance < FACE_MATCH_THRESHOLD ? "VERIFIED" : "FAILED"
    } catch {
      verifikasiStatus = "FAILED"
    }
  } else if (dbUser?.faceDescriptor) {
    verifikasiStatus = "FAILED"
  }

  await prisma.absensi.create({
    data: {
      userId: user.id,
      checkIn: new Date(),
      selfieUrl,
      verifikasiStatus,
    },
  })

  revalidatePath(ROLE_HOME[user.role])
}

export async function overrideVerifikasi(absensiId: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Tidak diizinkan")
  }

  await prisma.absensi.update({
    where: { id: absensiId },
    data: { verifikasiStatus: "OVERRIDE_MANUAL", overrideByAdmin: true },
  })

  revalidatePath("/admin/absensi")
}

export async function checkOut() {
  const user = await requirePetugas()

  const open = await prisma.absensi.findFirst({
    where: { userId: user.id, checkIn: { gte: startOfToday() }, checkOut: null },
    orderBy: { checkIn: "desc" },
  })

  if (!open) {
    throw new Error("Belum ada check-in hari ini")
  }

  await prisma.absensi.update({
    where: { id: open.id },
    data: { checkOut: new Date() },
  })

  revalidatePath(ROLE_HOME[user.role])
}
