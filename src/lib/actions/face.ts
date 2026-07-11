"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { saveUploadedImage } from "@/lib/storage"
import { ROLE_HOME } from "@/lib/roles"

async function requirePetugas() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "PETUGAS_PENARIK" && role !== "PETUGAS_SAMPAH") {
    throw new Error("Tidak diizinkan")
  }
  return session!.user
}

export async function registerFaceDescriptor(formData: FormData) {
  const user = await requirePetugas()

  const consent = formData.get("consent")
  if (consent !== "true") {
    throw new Error("Persetujuan penyimpanan data wajah wajib dicentang")
  }

  const descriptorRaw = formData.get("descriptor")
  if (typeof descriptorRaw !== "string") {
    throw new Error("Data wajah tidak valid")
  }

  const descriptor = JSON.parse(descriptorRaw)
  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    throw new Error("Data wajah tidak valid")
  }

  const selfie = formData.get("selfie")
  let fotoReferensiUrl: string | undefined
  if (selfie instanceof File && selfie.size > 0) {
    fotoReferensiUrl = await saveUploadedImage(selfie, "face-referensi")
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      faceDescriptor: descriptor,
      fotoReferensiUrl,
      faceConsentAt: new Date(),
    },
  })

  revalidatePath(ROLE_HOME[user.role])
}
