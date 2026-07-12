"use client"

import { useMemo, useState, useTransition } from "react"
import { motion } from "motion/react"
import { CheckCircle2Icon, PencilIcon, QrCodeIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/format"
import { quickRecordLunas } from "@/lib/actions/pembayaran"
import { PembayaranFormDialog } from "./pembayaran-form-dialog"
import { ScanQrDialog } from "./scan-qr-dialog"

type Row = {
  id: string
  nama: string
  alamat: string
  desaNama: string
  iuran: number
  sudahLunas: boolean
}

export function TagihanClient({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Row | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [scanOpen, setScanOpen] = useState(false)
  const [, startTransition] = useTransition()

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.nama.toLowerCase().includes(search.toLowerCase()) ||
          r.alamat.toLowerCase().includes(search.toLowerCase())
      ),
    [rows, search]
  )

  const belumLunas = rows.filter((r) => !r.sudahLunas).length

  function openDialog(row: Row) {
    setSelected(row)
    setDialogOpen(true)
  }

  function handleTandaiLunas(row: Row) {
    setPendingId(row.id)
    startTransition(async () => {
      try {
        await quickRecordLunas(row.id)
        toast.success(`${row.nama} ditandai lunas`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal menandai lunas")
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tagihan Bulan Ini</h1>
          <p className="text-sm text-muted-foreground">{belumLunas} rumah belum bayar</p>
        </div>
        <Button variant="outline" onClick={() => setScanOpen(true)}>
          <QrCodeIcon />
          Scan QR
        </Button>
      </div>

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau alamat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada pelanggan yang cocok.
          </p>
        )}
        {filtered.map((row, i) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.02 }}
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{row.nama}</p>
              <p className="truncate text-xs text-muted-foreground">
                {row.desaNama} &middot; {formatRupiah(row.iuran)}
              </p>
            </div>
            {row.sudahLunas ? (
              <Badge variant="secondary">Lunas</Badge>
            ) : (
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={() => handleTandaiLunas(row)}
                  disabled={pendingId === row.id}
                >
                  <CheckCircle2Icon />
                  Tandai Lunas
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="size-8"
                  onClick={() => openDialog(row)}
                  title="Catat manual (nominal/tanggal berbeda)"
                >
                  <PencilIcon className="size-4" />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <PembayaranFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pelanggan={selected}
      />

      <ScanQrDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        rows={rows}
        onTandaiLunas={handleTandaiLunas}
        onCatatManual={openDialog}
        pendingId={pendingId}
      />
    </div>
  )
}
