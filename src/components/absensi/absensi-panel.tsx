"use client"

import { useRef, useState, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CameraIcon, ImageUpIcon, LogInIcon, LogOutIcon, Loader2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { checkIn, checkOut } from "@/lib/actions/absensi"
import { computeFaceDescriptor, fileToDetectionImage } from "@/lib/face/face-api-client"
import { CameraCapture } from "@/components/absensi/camera-capture"

type TodayAbsensi = {
  checkIn: Date
  checkOut: Date | null
} | null

export function AbsensiPanel({
  today,
  referenceDescriptor,
}: {
  today: TodayAbsensi
  referenceDescriptor?: number[] | null
}) {
  const [pending, startTransition] = useTransition()
  const [verifying, setVerifying] = useState(false)
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const status = !today ? "belum" : !today.checkOut ? "checked-in" : "selesai"

  function setFile(file: File) {
    setPreview({ file, url: URL.createObjectURL(file) })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFile(file)
  }

  function handleCapture(file: File) {
    setFile(file)
    setCameraOpen(false)
  }

  function cancelPreview() {
    if (preview) URL.revokeObjectURL(preview.url)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function confirmCheckIn() {
    if (!preview) return

    const formData = new FormData()
    formData.set("selfie", preview.file)

    if (referenceDescriptor) {
      setVerifying(true)
      try {
        const detectionImage = await fileToDetectionImage(preview.file)
        const descriptor = await computeFaceDescriptor(detectionImage)
        if (descriptor) {
          formData.set("descriptor", JSON.stringify(Array.from(descriptor)))
        }
      } catch (err) {
        // Verifikasi wajah gagal (mis. model belum termuat) — lanjutkan
        // check-in tanpa deskriptor, biar admin yang meninjau manual nanti.
        console.error("Verifikasi wajah gagal:", err)
      } finally {
        setVerifying(false)
      }
    }

    startTransition(async () => {
      try {
        await checkIn(formData)
        toast.success("Check-in berhasil")
        cancelPreview()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal check-in")
      }
    })
  }

  function handleCheckOut() {
    startTransition(async () => {
      try {
        await checkOut()
        toast.success("Check-out berhasil")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal check-out")
      }
    })
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <motion.div
          key={status}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-1"
        >
          <p className="text-sm text-muted-foreground">Status hari ini</p>
          <p className="text-lg font-semibold">
            {status === "belum" && "Belum check-in"}
            {status === "checked-in" &&
              `Check-in ${today!.checkIn.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
            {status === "selesai" &&
              `Selesai (${today!.checkOut!.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })})`}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt="Pratinjau selfie"
                  className="h-48 w-48 rounded-xl object-cover ring-1 ring-foreground/10"
                />
                <button
                  type="button"
                  onClick={cancelPreview}
                  className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-background ring-1 ring-foreground/10"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
              <Button
                onClick={confirmCheckIn}
                disabled={pending || verifying}
                className="h-11 w-full max-w-56"
              >
                {pending || verifying ? <Loader2Icon className="animate-spin" /> : <LogInIcon />}
                {verifying ? "Memverifikasi wajah..." : "Konfirmasi Check-in"}
              </Button>
            </motion.div>
          ) : cameraOpen ? (
            <CameraCapture
              key="camera"
              onCapture={handleCapture}
              onCancel={() => setCameraOpen(false)}
              referenceDescriptor={referenceDescriptor ?? undefined}
            />
          ) : status === "belum" ? (
            <motion.div
              key="checkin-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button onClick={() => setCameraOpen(true)} className="h-12 w-56">
                <CameraIcon />
                Check-in (Selfie)
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                <ImageUpIcon />
                Upload dari galeri
              </Button>
            </motion.div>
          ) : status === "checked-in" ? (
            <motion.div key="checkout-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                onClick={handleCheckOut}
                disabled={pending}
                variant="outline"
                className="h-12 w-56"
              >
                {pending ? <Loader2Icon className="animate-spin" /> : <LogOutIcon />}
                Check-out
              </Button>
            </motion.div>
          ) : (
            <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
              Absensi hari ini sudah lengkap. Sampai jumpa besok.
            </motion.p>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
