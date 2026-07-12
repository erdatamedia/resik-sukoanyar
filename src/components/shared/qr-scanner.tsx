"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import jsQR from "jsqr"
import { XIcon, Loader2Icon } from "lucide-react"

export function QrScanner({
  onScan,
  onCancel,
}: {
  onScan: (data: string) => void
  onCancel: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(false)
  const foundRef = useRef(false)
  const [starting, setStarting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setStarting(false)
      })
      .catch((err) => {
        if (cancelled) return
        setStarting(false)
        setError(
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Izin kamera ditolak. Aktifkan izin kamera untuk situs ini, lalu coba lagi."
            : "Tidak bisa mengakses kamera perangkat ini."
        )
      })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (starting || error) return

    const timer = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (
        !video ||
        !canvas ||
        video.readyState < 2 ||
        scanningRef.current ||
        foundRef.current
      ) {
        return
      }

      scanningRef.current = true
      try {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const result = jsQR(imageData.data, imageData.width, imageData.height)
        if (result?.data) {
          foundRef.current = true
          onScan(result.data)
        }
      } finally {
        scanningRef.current = false
      }
    }, 350)

    return () => clearInterval(timer)
  }, [starting, error, onScan])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-xl bg-black ring-1 ring-foreground/10">
        {starting && !error && <Loader2Icon className="absolute size-6 animate-spin text-white" />}
        {error ? (
          <p className="p-4 text-center text-sm text-white">{error}</p>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
        <button
          type="button"
          onClick={onCancel}
          className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-background ring-1 ring-foreground/10"
        >
          <XIcon className="size-4" />
        </button>
      </div>
      {!error && (
        <p className="max-w-56 text-center text-sm text-muted-foreground">
          Arahkan kamera ke QR code di rumah pelanggan
        </p>
      )}
    </motion.div>
  )
}
