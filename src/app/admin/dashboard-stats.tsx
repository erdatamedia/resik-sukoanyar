"use client"

import { Wallet, TrendingDown, PiggyBank, Users } from "lucide-react"
import { StatCard } from "@/components/layout/stat-card"
import { formatRupiah } from "@/lib/format"

export function DashboardStats({
  pemasukanBulanIni,
  pengeluaranBulanIni,
  saldo,
  pelangganAktif,
}: {
  pemasukanBulanIni: number
  pengeluaranBulanIni: number
  saldo: number
  pelangganAktif: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        label="Pemasukan bulan ini"
        value={formatRupiah(pemasukanBulanIni)}
        icon={Wallet}
        tone="positive"
        index={0}
      />
      <StatCard
        label="Pengeluaran bulan ini"
        value={formatRupiah(pengeluaranBulanIni)}
        icon={TrendingDown}
        tone="negative"
        index={1}
      />
      <StatCard label="Saldo" value={formatRupiah(saldo)} icon={PiggyBank} index={2} />
      <StatCard label="Pelanggan aktif" value={String(pelangganAktif)} icon={Users} index={3} />
    </div>
  )
}
