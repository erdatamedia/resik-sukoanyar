"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { CameraIcon, XIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CameraCapture({
  onCapture,
  onCancel,
}: {
  onCapture: (file: File) => void
  onCancel: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [starting, setStarting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
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

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        onCapture(new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" }))
      },
      "image/jpeg",
      0.9
    )
  }

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
          // Video di-mirror hanya secara visual (CSS) supaya terasa seperti
          // cermin; frame yang ditangkap canvas tetap dari stream asli, tidak
          // ikut ke-flip.
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
          />
        )}
        <button
          type="button"
          onClick={onCancel}
          className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-background ring-1 ring-foreground/10"
        >
          <XIcon className="size-4" />
        </button>
      </div>
      {!error && (
        <Button type="button" onClick={capture} disabled={starting} className="h-11 w-56">
          <CameraIcon />
          Jepret
        </Button>
      )}
    </motion.div>
  )
}
