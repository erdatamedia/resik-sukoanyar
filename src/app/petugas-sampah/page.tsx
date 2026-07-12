import { auth } from "@/auth"
import { getTodayAbsensi } from "@/lib/queries/absensi"
import { getJumlahRumahDilayaniHariIni } from "@/lib/queries/pengambilan-sampah"
import { BerandaStats } from "./beranda-stats"

export default async function PetugasSampahHomePage() {
  const session = await auth()
  const userId = session!.user.id

  const [today, jumlahRumah] = await Promise.all([
    getTodayAbsensi(userId),
    getJumlahRumahDilayaniHariIni(userId),
  ])

  const status = !today ? "belum" : !today.checkOut ? "checked-in" : "selesai"
  const statusLabel =
    status === "belum" ? "Belum absen" : status === "checked-in" ? "Sedang bertugas" : "Selesai"
  const statusTone = status === "belum" ? "negative" : "positive"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Beranda</h1>
        <p className="text-sm text-muted-foreground">Halo, {session?.user?.name}</p>
      </div>

      <BerandaStats statusLabel={statusLabel} statusTone={statusTone} jumlahRumah={jumlahRumah} />
    </div>
  )
}
