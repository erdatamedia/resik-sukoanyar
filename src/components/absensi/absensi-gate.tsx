"use client"

import { useRouter } from "next/navigation"
import { FaceRegistration } from "@/components/absensi/face-registration"
import { AbsensiPanel } from "@/components/absensi/absensi-panel"

type TodayAbsensi = {
  checkIn: Date
  checkOut: Date | null
} | null

export function AbsensiGate({
  hasFaceDescriptor,
  faceDescriptor,
  today,
}: {
  hasFaceDescriptor: boolean
  faceDescriptor: number[] | null
  today: TodayAbsensi
}) {
  const router = useRouter()

  if (!hasFaceDescriptor) {
    return <FaceRegistration onRegistered={() => router.refresh()} />
  }

  return <AbsensiPanel today={today} referenceDescriptor={faceDescriptor} />
}
