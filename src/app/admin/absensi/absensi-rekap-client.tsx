"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { ClipboardCheckIcon, UsersIcon, ShieldCheckIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { ROLE_LABEL } from "@/lib/roles"
import { overrideVerifikasi } from "@/lib/actions/absensi"

type Row = {
  id: string
  userId: string
  userNama: string
  userRole: string
  checkIn: Date
  checkOut: Date | null
  verifikasiStatus: string
}

function verifikasiLabel(status: string) {
  switch (status) {
    case "VERIFIED":
      return { label: "Terverifikasi", variant: "secondary" as const }
    case "FAILED":
      return { label: "Gagal", variant: "destructive" as const }
    case "OVERRIDE_MANUAL":
      return { label: "Override admin", variant: "outline" as const }
    default:
      return { label: "-", variant: "outline" as const }
  }
}

function formatDurasi(checkIn: Date, checkOut: Date | null) {
  if (!checkOut) return "Berlangsung"
  const ms = checkOut.getTime() - checkIn.getTime()
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}j ${minutes}m`
}

export function AbsensiRekapClient({
  rows,
  petugasList,
  monthValue,
}: {
  rows: Row[]
  petugasList: { id: string; nama: string; role: string }[]
  monthValue: string
}) {
  const router = useRouter()
  const [petugasFilter, setPetugasFilter] = useState("all")
  const [pending, startTransition] = useTransition()
  const [overridingId, setOverridingId] = useState<string | null>(null)

  function handleOverride(id: string) {
    setOverridingId(id)
    startTransition(async () => {
      try {
        await overrideVerifikasi(id)
        toast.success("Absensi di-override sebagai valid")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal override")
      } finally {
        setOverridingId(null)
      }
    })
  }

  const filteredRows = useMemo(
    () => (petugasFilter === "all" ? rows : rows.filter((r) => r.userId === petugasFilter)),
    [rows, petugasFilter]
  )

  const selesai = useMemo(() => rows.filter((r) => r.checkOut).length, [rows])
  const petugasHariIni = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Set(rows.filter((r) => r.checkIn >= today).map((r) => r.userId)).size
  }, [rows])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Rekap Absensi</h1>
          <p className="text-sm text-muted-foreground">{rows.length} catatan bulan ini</p>
        </div>
        <div className="flex gap-3">
          <Select
            items={{ all: "Semua petugas", ...Object.fromEntries(petugasList.map((p) => [p.id, p.nama])) }}
            value={petugasFilter}
            onValueChange={(value) => setPetugasFilter(value ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Semua petugas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua petugas</SelectItem>
              {petugasList.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="month"
            value={monthValue}
            onChange={(e) => router.push(`/admin/absensi?month=${e.target.value}`)}
            className="w-full sm:w-44"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total kehadiran" value={String(rows.length)} icon={ClipboardCheckIcon} index={0} />
        <StatCard label="Sudah check-out" value={String(selesai)} icon={ClipboardCheckIcon} tone="positive" index={1} />
        <StatCard label="Petugas aktif hari ini" value={String(petugasHariIni)} icon={UsersIcon} index={2} />
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
              <TableHead>Petugas</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Verifikasi Wajah</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  Belum ada absensi yang cocok.
                </TableCell>
              </TableRow>
            )}
            {filteredRows.map((row) => {
              const v = verifikasiLabel(row.verifikasiStatus)
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.checkIn.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="font-medium">{row.userNama}</TableCell>
                  <TableCell className="text-muted-foreground">{ROLE_LABEL[row.userRole]}</TableCell>
                  <TableCell>
                    {row.checkIn.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                  <TableCell>
                    {row.checkOut
                      ? row.checkOut.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.checkOut ? "secondary" : "default"}>
                      {formatDurasi(row.checkIn, row.checkOut)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={v.variant}>{v.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {row.verifikasiStatus === "FAILED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending && overridingId === row.id}
                        onClick={() => handleOverride(row.id)}
                      >
                        {pending && overridingId === row.id ? (
                          <Loader2Icon className="animate-spin" />
                        ) : (
                          <ShieldCheckIcon />
                        )}
                        Override
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}
