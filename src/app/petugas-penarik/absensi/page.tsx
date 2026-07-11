import { auth } from "@/auth"
import { getTodayAbsensi, getRiwayatAbsensi } from "@/lib/queries/absensi"
import { getFaceDescriptor } from "@/lib/queries/face"
import { AbsensiGate } from "@/components/absensi/absensi-gate"
import { AbsensiRiwayat } from "@/components/absensi/absensi-riwayat"

export default async function AbsensiPenarikPage() {
  const session = await auth()
  const userId = session!.user.id

  const [today, riwayat, faceDescriptor] = await Promise.all([
    getTodayAbsensi(userId),
    getRiwayatAbsensi(userId),
    getFaceDescriptor(userId),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Absensi</h1>
        <p className="text-sm text-muted-foreground">Check-in dan check-out kehadiran Anda</p>
      </div>

      <AbsensiGate
        hasFaceDescriptor={!!faceDescriptor}
        faceDescriptor={faceDescriptor}
        today={today}
      />

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Riwayat Kehadiran</h2>
        <AbsensiRiwayat rows={riwayat} />
      </div>
    </div>
  )
}
