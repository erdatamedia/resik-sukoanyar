"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { PrinterIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { encodePelangganQr } from "@/lib/pelanggan-qr"

export function PelangganQrDialog({
  open,
  onOpenChange,
  pelanggan,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pelanggan: { id: string; nama: string; alamat: string } | null
}) {
  const [qrImage, setQrImage] = useState<string | null>(null)

  useEffect(() => {
    if (!pelanggan) {
      setQrImage(null)
      return
    }
    let cancelled = false
    QRCode.toDataURL(encodePelangganQr(pelanggan.id), { margin: 1, width: 280 }).then((url) => {
      if (!cancelled) setQrImage(url)
    })
    return () => {
      cancelled = true
    }
  }, [pelanggan])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Rumah Pelanggan</DialogTitle>
          <DialogDescription>
            Cetak &amp; tempel di rumah pelanggan. Petugas penarik bisa scan QR ini untuk
            langsung mencatat pembayaran saat kunjungan.
          </DialogDescription>
        </DialogHeader>

        {pelanggan && (
          <div id="qr-print-area" className="flex flex-col items-center gap-3 py-2">
            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-xl border bg-white p-3">
              {qrImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrImage} alt={`QR ${pelanggan.nama}`} width={196} height={196} />
              ) : (
                <span className="text-sm text-muted-foreground">Membuat QR...</span>
              )}
            </div>
            <div className="text-center">
              <p className="font-medium">{pelanggan.nama}</p>
              <p className="text-sm text-muted-foreground">{pelanggan.alamat}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={() => window.print()} disabled={!qrImage}>
            <PrinterIcon />
            Cetak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
