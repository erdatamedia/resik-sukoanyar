import { prisma } from "@/lib/prisma"

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function getTodayAbsensi(userId: string) {
  return prisma.absensi.findFirst({
    where: { userId, checkIn: { gte: startOfToday() } },
    orderBy: { checkIn: "desc" },
  })
}

export async function getRiwayatAbsensi(userId: string, take = 30) {
  return prisma.absensi.findMany({
    where: { userId },
    orderBy: { checkIn: "desc" },
    take,
  })
}
