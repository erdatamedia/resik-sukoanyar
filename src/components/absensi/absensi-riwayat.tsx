import { Badge } from "@/components/ui/badge"

type Row = {
  id: string
  checkIn: Date
  checkOut: Date | null
  verifikasiStatus: string
}

function verifikasiLabel(status: string) {
  switch (status) {
    case "VERIFIED":
      return { label: "Wajah terverifikasi", variant: "secondary" as const }
    case "FAILED":
      return { label: "Verifikasi gagal", variant: "destructive" as const }
    case "OVERRIDE_MANUAL":
      return { label: "Override admin", variant: "outline" as const }
    default:
      return null
  }
}

export function AbsensiRiwayat({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Belum ada riwayat absensi.</p>
    )
  }

  return (
    <div className="flex flex-col divide-y rounded-xl border">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium">
              {row.checkIn.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.checkIn.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              {" - "}
              {row.checkOut
                ? row.checkOut.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                : "..."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(() => {
              const v = verifikasiLabel(row.verifikasiStatus)
              return v ? <Badge variant={v.variant}>{v.label}</Badge> : null
            })()}
            <Badge variant={row.checkOut ? "secondary" : "default"}>
              {row.checkOut ? "Selesai" : "Berlangsung"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
