"use client"

import { CameraIcon, ClipboardCheck } from "lucide-react"
import { useSession } from "next-auth/react"
import { StatCard } from "@/components/layout/stat-card"

export default function PetugasSampahHomePage() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Beranda</h1>
        <p className="text-sm text-muted-foreground">Halo, {session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Status hari ini" value="Belum absen" icon={CameraIcon} tone="negative" index={0} />
        <StatCard label="Rumah dilayani" value="0" icon={ClipboardCheck} index={1} />
      </div>
    </div>
  )
}
