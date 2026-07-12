"use client"

import { CameraIcon, ClipboardCheck } from "lucide-react"
import { StatCard } from "@/components/layout/stat-card"

export function BerandaStats({
  statusLabel,
  statusTone,
  jumlahRumah,
}: {
  statusLabel: string
  statusTone: "positive" | "negative"
  jumlahRumah: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        label="Status hari ini"
        value={statusLabel}
        icon={CameraIcon}
        tone={statusTone}
        index={0}
      />
      <StatCard
        label="Rumah dilayani"
        value={String(jumlahRumah)}
        icon={ClipboardCheck}
        index={1}
      />
    </div>
  )
}
