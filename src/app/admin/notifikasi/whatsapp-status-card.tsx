"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { RefreshCwIcon, CheckCircle2Icon, QrCodeIcon, WifiOffIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchWhatsAppStatus } from "@/lib/actions/whatsapp"

type Status = { reachable: boolean; ready: boolean; qrImage: string | null }

export function WhatsAppStatusCard({ initial }: { initial: Status }) {
  const [status, setStatus] = useState<Status>(initial)
  const [checking, setChecking] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function refresh() {
    setChecking(true)
    try {
      const next = await fetchWhatsAppStatus()
      setStatus(next)
    } catch {
      setStatus({ reachable: false, ready: false, qrImage: null })
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (status.ready) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(refresh, 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.ready])

  const badge = !status.reachable
    ? { label: "Service tidak terhubung", variant: "destructive" as const, icon: WifiOffIcon }
    : status.ready
      ? { label: "Tersambung", variant: "secondary" as const, icon: CheckCircle2Icon }
      : { label: "Menunggu Scan QR", variant: "outline" as const, icon: QrCodeIcon }

  const Icon = badge.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-4 rounded-xl border p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-medium">Status Koneksi WhatsApp</h2>
          <Badge variant={badge.variant}>
            <Icon className="size-3" />
            {badge.label}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={checking}>
          <RefreshCwIcon className={checking ? "animate-spin" : ""} />
          Cek Ulang
        </Button>
      </div>

      {!status.reachable && (
        <p className="text-sm text-muted-foreground">
          Tidak dapat menghubungi whatsapp-service di server. Pastikan proses{" "}
          <code className="rounded bg-muted px-1">resik-whatsapp-service</code> berjalan (
          <code className="rounded bg-muted px-1">pm2 status</code>).
        </p>
      )}

      {status.reachable && !status.ready && status.qrImage && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="rounded-xl border bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={status.qrImage} alt="QR WhatsApp" width={220} height={220} />
          </div>
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            Buka WhatsApp di HP nomor layanan → Perangkat Tertaut → Tautkan Perangkat, lalu scan
            kode ini. Halaman ini otomatis memeriksa ulang tiap 5 detik.
          </p>
        </div>
      )}

      {status.reachable && !status.ready && !status.qrImage && (
        <p className="text-sm text-muted-foreground">
          Menunggu kode QR dari service... jika lebih dari 1 menit tidak muncul, coba &quot;Cek
          Ulang&quot;.
        </p>
      )}

      {status.ready && (
        <p className="text-sm text-muted-foreground">
          WhatsApp siap mengirim notifikasi dan reminder tagihan.
        </p>
      )}
    </motion.div>
  )
}
