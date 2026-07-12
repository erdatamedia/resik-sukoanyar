"use client"

import { useMemo, useState, useTransition } from "react"
import { motion } from "motion/react"
import { SearchIcon, Trash2Icon, CheckIcon } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { recordPengambilanSampah } from "@/lib/actions/pengambilan-sampah"

type Row = {
  id: string
  nama: string
  alamat: string
  desaNama: string
  sudahDiambil: boolean
}

export function RumahClient({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("")
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.nama.toLowerCase().includes(search.toLowerCase()) ||
          r.alamat.toLowerCase().includes(search.toLowerCase())
      ),
    [rows, search]
  )

  const sudahDiambil = rows.filter((r) => r.sudahDiambil).length

  function handleTandai(row: Row) {
    setPendingId(row.id)
    startTransition(async () => {
      try {
        await recordPengambilanSampah(row.id)
        toast.success(`${row.nama} ditandai sudah diambil`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal menandai")
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Rumah Dilayani</h1>
        <p className="text-sm text-muted-foreground">
          {sudahDiambil} dari {rows.length} rumah sudah diambil hari ini
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau alamat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada rumah yang cocok.
          </p>
        )}
        {filtered.map((row, i) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.02 }}
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{row.nama}</p>
              <p className="truncate text-xs text-muted-foreground">
                {row.desaNama} &middot; {row.alamat}
              </p>
            </div>
            {row.sudahDiambil ? (
              <Badge variant="secondary">
                <CheckIcon className="size-3" />
                Diambil
              </Badge>
            ) : (
              <Button size="sm" onClick={() => handleTandai(row)} disabled={pendingId === row.id}>
                <Trash2Icon />
                Tandai Diambil
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
