"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { WalletIcon, UsersIcon, AlertCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatCard } from "@/components/layout/stat-card"
import { formatRupiah } from "@/lib/format"

type Row = {
  id: string
  pelangganNama: string
  desaNama: string
  petugasNama: string
  nominal: number
  tanggal: Date
  status: string
}

export function IuranRekapClient({
  rows,
  desaList,
  monthValue,
  pelangganAktifCount,
}: {
  rows: Row[]
  desaList: { id: string; nama: string }[]
  monthValue: string
  pelangganAktifCount: number
}) {
  const router = useRouter()
  const [desaFilter, setDesaFilter] = useState("all")

  const filteredRows = useMemo(
    () => (desaFilter === "all" ? rows : rows.filter((r) => r.desaNama === desaFilter)),
    [rows, desaFilter]
  )

  const totalTerkumpul = useMemo(
    () => rows.filter((r) => r.status === "LUNAS").reduce((sum, r) => sum + r.nominal, 0),
    [rows]
  )
  const jumlahLunas = useMemo(() => new Set(rows.filter((r) => r.status === "LUNAS").map((r) => r.pelangganNama)).size, [rows])
  const belumBayar = Math.max(pelangganAktifCount - jumlahLunas, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Rekap Iuran</h1>
          <p className="text-sm text-muted-foreground">{rows.length} transaksi bulan ini</p>
        </div>
        <div className="flex gap-3">
          <Select
            items={{ all: "Semua desa", ...Object.fromEntries(desaList.map((d) => [d.nama, d.nama])) }}
            value={desaFilter}
            onValueChange={(value) => setDesaFilter(value ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Semua desa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua desa</SelectItem>
              {desaList.map((d) => (
                <SelectItem key={d.id} value={d.nama}>
                  {d.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="month"
            value={monthValue}
            onChange={(e) => router.push(`/admin/iuran?month=${e.target.value}`)}
            className="w-full sm:w-44"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Terkumpul bulan ini" value={formatRupiah(totalTerkumpul)} icon={WalletIcon} tone="positive" index={0} />
        <StatCard label="Pelanggan lunas" value={String(jumlahLunas)} icon={UsersIcon} index={1} />
        <StatCard label="Belum bayar" value={String(belumBayar)} icon={AlertCircleIcon} tone="negative" index={2} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-x-auto rounded-xl border"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Desa</TableHead>
              <TableHead>Petugas</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Belum ada transaksi yang cocok.
                </TableCell>
              </TableRow>
            )}
            {filteredRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {row.tanggal.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
                <TableCell className="font-medium">{row.pelangganNama}</TableCell>
                <TableCell className="text-muted-foreground">{row.desaNama}</TableCell>
                <TableCell className="text-muted-foreground">{row.petugasNama}</TableCell>
                <TableCell>{formatRupiah(row.nominal)}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "LUNAS" ? "secondary" : "default"}>
                    {row.status === "LUNAS" ? "Lunas" : "Belum"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}
