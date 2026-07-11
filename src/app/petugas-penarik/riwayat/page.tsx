import { auth } from "@/auth"
import { getRiwayatPembayaran } from "@/lib/queries/pembayaran"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/format"

export default async function RiwayatPenarikanPage() {
  const session = await auth()
  const rows = await getRiwayatPembayaran(session!.user.id)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Riwayat Penarikan</h1>
        <p className="text-sm text-muted-foreground">{rows.length} transaksi terakhir</p>
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Belum ada riwayat penarikan.</p>
      ) : (
        <div className="flex flex-col divide-y rounded-xl border">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{row.pelangganNama}</p>
                <p className="text-xs text-muted-foreground">
                  {row.tanggal.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-sm font-medium">{formatRupiah(row.nominal)}</p>
                <Badge variant={row.status === "LUNAS" ? "secondary" : "default"}>
                  {row.status === "LUNAS" ? "Lunas" : "Belum"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
