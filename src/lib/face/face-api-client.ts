"use client"

import * as faceapi from "face-api.js"

let loadPromise: Promise<void> | null = null

export function loadFaceModels() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ])
      .then(() => undefined)
      .catch((err) => {
        // Reset agar percobaan berikutnya bisa retry, bukan langsung gagal
        // permanen karena promise gagal yang di-memoize selamanya.
        loadPromise = null
        throw err
      })
  }
  return loadPromise
}

// img.width/img.height mengikuti ukuran render CSS (mis. Tailwind h-48 w-48),
// bukan resolusi asli foto — kalau elemen <img> yang sudah diberi style dipakai
// langsung sebagai input, face-api.js akan mendeteksi dari versi yang gepeng
// (di-squish ke ukuran kotak CSS, mengabaikan crop object-cover). Makanya
// deteksi wajah harus jalan dari elemen image lepas yang tidak disentuh CSS.
export function fileToDetectionImage(file: File): Promise<HTMLImageElement> {
  return faceapi.bufferToImage(file)
}

export async function computeFaceDescriptor(
  image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  await loadFaceModels()

  const result = await faceapi
    .detectSingleFace(
      image,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.3 })
    )
    .withFaceLandmarks()
    .withFaceDescriptor()

  return result?.descriptor ?? null
}

export type FaceBox = { x: number; y: number; width: number; height: number }

// Dipakai untuk overlay live di preview kamera (kotak + validasi kecocokan),
// bukan untuk hasil akhir yang dikirim ke server — jalan tiap beberapa ratus
// ms di atas elemen <video>, jadi butuh box + descriptor sekaligus per panggilan.
export async function detectFaceWithBox(
  image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<{ box: FaceBox; descriptor: Float32Array } | null> {
  await loadFaceModels()

  const result = await faceapi
    .detectSingleFace(
      image,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 })
    )
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!result) return null

  const { x, y, width, height } = result.detection.box
  return { box: { x, y, width, height }, descriptor: result.descriptor }
}
