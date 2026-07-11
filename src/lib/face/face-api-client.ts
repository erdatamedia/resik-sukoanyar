"use client"

import * as faceapi from "face-api.js"

let loadPromise: Promise<void> | null = null

export function loadFaceModels() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]).then(() => undefined)
  }
  return loadPromise
}

export async function computeFaceDescriptor(
  image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  await loadFaceModels()

  const result = await faceapi
    .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 }))
    .withFaceLandmarks()
    .withFaceDescriptor()

  return result?.descriptor ?? null
}
