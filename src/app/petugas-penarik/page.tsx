"use client"

import { Wallet, Home } from "lucide-react"
import { useSession } from "next-auth/react"
import { StatCard } from "@/components/layout/stat-card"

export default function PetugasPenarikHomePage() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Beranda</h1>
        <p className="text-sm text-muted-foreground">Halo, {session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Rumah belum bayar" value="0" icon={Home} tone="negative" index={0} />
        <StatCard label="Terkumpul hari ini" value="Rp 0" icon={Wallet} tone="positive" index={1} />
      </div>
    </div>
  )
}
