"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"

import { Badge } from "@/components/ui/badge"
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

type Row = {
  id: string
  pelangganNama: string
  jenis: string
  pesan: string
  statusTerkirim: string
  timestamp: Date
}

const JENIS_LABEL: Record<string, string> = {
  REMINDER_TAGIHAN: "Reminder Tagihan",
  KONFIRMASI_PEMBAYARAN: "Konfirmasi Pembayaran",
}

function statusBadge(status: string) {
  switch (status) {
    case "TERKIRIM":
      return { label: "Terkirim", variant: "secondary" as const }
    case "GAGAL":
      return { label: "Gagal", variant: "destructive" as const }
    default:
      return { label: "Pending", variant: "outline" as const }
  }
}

export function NotifikasiClient({ rows }: { rows: Row[] }) {
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = useMemo(
    () => (statusFilter === "all" ? rows : rows.filter((r) => r.statusTerkirim === statusFilter)),
    [rows, statusFilter]
  )

  const gagal = rows.filter((r) => r.statusTerkirim === "GAGAL").length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Log Notifikasi WhatsApp</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} pesan terakhir{gagal > 0 && ` · ${gagal} gagal`}
          </p>
        </div>
        <Select
          items={{ all: "Semua status", TERKIRIM: "Terkirim", GAGAL: "Gagal", PENDING: "Pending" }}
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="TERKIRIM">Terkirim</SelectItem>
            <SelectItem value="GAGAL">Gagal</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
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
              <TableHead>Waktu</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Pesan</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Belum ada notifikasi yang cocok.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => {
              const s = statusBadge(row.statusTerkirim)
              return (
                <TableRow key={row.id}>
                  <TableCell className="text-muted-foreground">
                    {row.timestamp.toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{row.pelangganNama}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {JENIS_LABEL[row.jenis] ?? row.jenis}
                  </TableCell>
                  <TableCell className="max-w-80 truncate text-muted-foreground">
                    {row.pesan}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.variant}>{s.label}</Badge>
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
