"use client"

import { useState } from "react"
import { CheckCircle2Icon, PencilIcon } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/format"
import { decodePelangganQr } from "@/lib/pelanggan-qr"
import { QrScanner } from "@/components/shared/qr-scanner"

type Row = {
  id: string
  nama: string
  alamat: string
  desaNama: string
  iuran: number
  sudahLunas: boolean
}

export function ScanQrDialog({
  open,
  onOpenChange,
  rows,
  onTandaiLunas,
  onCatatManual,
  pendingId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: Row[]
  onTandaiLunas: (row: Row) => void
  onCatatManual: (row: Row) => void
  pendingId: string | null
}) {
  const [matched, setMatched] = useState<Row | null>(null)

  function handleScan(data: string) {
    const id = decodePelangganQr(data)
    if (!id) {
      toast.error("QR tidak dikenali sebagai QR pelanggan RESIK")
      return
    }
    const row = rows.find((r) => r.id === id)
    if (!row) {
      toast.error("Pelanggan tidak ditemukan di daftar tagihan bulan ini")
      return
    }
    setMatched(row)
  }

  function handleClose(next: boolean) {
    if (!next) setMatched(null)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Scan QR Pelanggan</DialogTitle>
          <DialogDescription>
            {matched
              ? "Pelanggan ditemukan dari QR yang di-scan."
              : "Arahkan kamera ke QR code yang tertempel di rumah pelanggan."}
          </DialogDescription>
        </DialogHeader>

        {!matched ? (
          <div className="flex justify-center py-2">
            <QrScanner onScan={handleScan} onCancel={() => handleClose(false)} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="text-center">
              <p className="text-lg font-medium">{matched.nama}</p>
              <p className="text-sm text-muted-foreground">
                {matched.desaNama} &middot; {formatRupiah(matched.iuran)}
              </p>
            </div>
            {matched.sudahLunas ? (
              <Badge variant="secondary">Sudah Lunas</Badge>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  onClick={() => {
                    onTandaiLunas(matched)
                    handleClose(false)
                  }}
                  disabled={pendingId === matched.id}
                >
                  <CheckCircle2Icon />
                  Tandai Lunas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onCatatManual(matched)
                    handleClose(false)
                  }}
                >
                  <PencilIcon />
                  Catat Manual
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setMatched(null)}>
              Scan Lagi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
