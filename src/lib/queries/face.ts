import { prisma } from "@/lib/prisma"

export async function getFaceDescriptor(userId: string): Promise<number[] | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { faceDescriptor: true },
  })

  return (user?.faceDescriptor as number[] | null) ?? null
}
