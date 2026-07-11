"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CameraIcon, ImageUpIcon, Loader2Icon, XIcon, ScanFaceIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { computeFaceDescriptor, fileToDetectionImage } from "@/lib/face/face-api-client"
import { registerFaceDescriptor } from "@/lib/actions/face"
import { CameraCapture } from "@/components/absensi/camera-capture"

export function FaceRegistration({ onRegistered }: { onRegistered: () => void }) {
  const [consent, setConsent] = useState(false)
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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

  async function confirmRegistration() {
    if (!preview) return
    setProcessing(true)
    try {
      const detectionImage = await fileToDetectionImage(preview.file)
      const descriptor = await computeFaceDescriptor(detectionImage)
      if (!descriptor) {
        toast.error("Wajah tidak terdeteksi. Coba lagi dengan pencahayaan lebih baik.")
        return
      }

      const formData = new FormData()
      formData.set("selfie", preview.file)
      formData.set("descriptor", JSON.stringify(Array.from(descriptor)))
      formData.set("consent", "true")

      await registerFaceDescriptor(formData)
      toast.success("Wajah referensi berhasil didaftarkan")
      cancelPreview()
      onRegistered()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mendaftarkan wajah")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanFaceIcon className="size-5" />
          Registrasi Wajah Diperlukan
        </CardTitle>
        <CardDescription>
          Foto referensi ini dipakai untuk mencocokkan wajah Anda setiap check-in. Data disimpan
          sebagai deskriptor angka (bukan foto bebas akses) dan hanya untuk verifikasi kehadiran.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
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
                  alt="Pratinjau wajah referensi"
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
              <label className="flex max-w-sm items-start gap-2 text-left text-sm">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                  className="mt-0.5"
                />
                Saya menyetujui data wajah saya disimpan untuk keperluan verifikasi absensi.
              </label>
              <Button
                onClick={confirmRegistration}
                disabled={!consent || processing}
                className="h-11 w-full max-w-56"
              >
                {processing && <Loader2Icon className="animate-spin" />}
                Daftarkan Wajah
              </Button>
            </motion.div>
          ) : cameraOpen ? (
            <CameraCapture key="camera" onCapture={handleCapture} onCancel={() => setCameraOpen(false)} />
          ) : (
            <motion.div
              key="capture-btn"
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
                Ambil Foto Wajah
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
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
