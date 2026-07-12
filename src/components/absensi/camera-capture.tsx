"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { CameraIcon, XIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { detectFaceWithBox } from "@/lib/face/face-api-client"
import { euclideanDistance, FACE_MATCH_THRESHOLD } from "@/lib/face/distance"

type FaceStatus = "none" | "ok" | "mismatch"

const STATUS_TEXT: Record<FaceStatus, string> = {
  none: "Posisikan wajah di dalam bingkai",
  ok: "Wajah terlihat jelas, siap difoto",
  mismatch: "Wajah tidak cocok dengan data terdaftar",
}

const STATUS_TEXT_VERIFY_OK = "Wajah cocok, siap check-in"

export function CameraCapture({
  onCapture,
  onCancel,
  referenceDescriptor,
}: {
  onCapture: (file: File) => void
  onCancel: () => void
  /** Kalau diisi, overlay memvalidasi kecocokan wajah live, bukan cuma deteksi. */
  referenceDescriptor?: number[]
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectingRef = useRef(false)
  const [starting, setStarting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<FaceStatus>("none")

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

  useEffect(() => {
    if (starting || error) return

    const timer = setInterval(async () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2 || detectingRef.current) return

      detectingRef.current = true
      try {
        const displayW = canvas.clientWidth
        const displayH = canvas.clientHeight
        if (canvas.width !== displayW) canvas.width = displayW
        if (canvas.height !== displayH) canvas.height = displayH
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const result = await detectFaceWithBox(video)
        if (!result) {
          setStatus("none")
          return
        }

        const matched = referenceDescriptor
          ? euclideanDistance(Array.from(result.descriptor), referenceDescriptor) <=
            FACE_MATCH_THRESHOLD
          : true
        setStatus(matched ? "ok" : "mismatch")

        // object-cover: video asli discale+dicrop biar penuh di kotak preview —
        // box hasil deteksi (dalam koordinat video asli) perlu disesuaikan pakai
        // faktor skala & offset crop yang sama, supaya pas menempel di wajah.
        const scale = Math.max(displayW / video.videoWidth, displayH / video.videoHeight)
        const offsetX = (video.videoWidth * scale - displayW) / 2
        const offsetY = (video.videoHeight * scale - displayH) / 2
        const { x, y, width, height } = result.box

        ctx.strokeStyle = matched ? "#22c55e" : "#ef4444"
        ctx.lineWidth = 3
        ctx.strokeRect(x * scale - offsetX, y * scale - offsetY, width * scale, height * scale)
      } catch {
        // abaikan kegagalan deteksi satu tick, coba lagi di tick berikutnya
      } finally {
        detectingRef.current = false
      }
    }, 500)

    return () => clearInterval(timer)
  }, [starting, error, referenceDescriptor])

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

  const statusText =
    status === "ok" && referenceDescriptor ? STATUS_TEXT_VERIFY_OK : STATUS_TEXT[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col items-center gap-3"
    >
      <div
        className={`relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-xl bg-black ring-2 transition-colors ${
          error
            ? "ring-foreground/10"
            : status === "none"
              ? "ring-muted-foreground/40"
              : status === "ok"
                ? "ring-green-500"
                : "ring-red-500"
        }`}
      >
        {starting && !error && <Loader2Icon className="absolute size-6 animate-spin text-white" />}
        {error ? (
          <p className="p-4 text-center text-sm text-white">{error}</p>
        ) : (
          // Video di-mirror hanya secara visual (CSS) supaya terasa seperti
          // cermin; frame yang ditangkap canvas tetap dari stream asli, tidak
          // ikut ke-flip. Canvas overlay ikut di-mirror bareng lewat wrapper
          // ini juga, jadi kotak deteksi dihitung di koordinat video asli
          // tanpa perlu di-flip manual.
          <div className="relative h-full w-full -scale-x-100">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          </div>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-background ring-1 ring-foreground/10"
        >
          <XIcon className="size-4" />
        </button>
      </div>
      {!error && !starting && (
        <p
          className={`text-sm ${status === "ok" ? "text-green-600 dark:text-green-500" : "text-muted-foreground"}`}
        >
          {statusText}
        </p>
      )}
      {!error && (
        <Button type="button" onClick={capture} disabled={starting} className="h-11 w-56">
          <CameraIcon />
          Jepret
        </Button>
      )}
    </motion.div>
  )
}
