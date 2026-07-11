"use client"

import { useMemo, useState, useTransition } from "react"
import { motion } from "motion/react"
import { PlusIcon, SearchIcon, MoreVerticalIcon, SendIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatRupiah } from "@/lib/format"
import { setStatusAktifPelanggan, deletePelanggan } from "@/lib/actions/pelanggan"
import { sendReminderSatuPelanggan } from "@/lib/actions/pembayaran"
import { PelangganFormDialog, type PelangganRow } from "./pelanggan-form-dialog"

export function PelangganClient({
  pelanggan,
  desaList,
}: {
  pelanggan: (PelangganRow & { desaNama: string; sudahLunasBulanIni: boolean })[]
  desaList: { id: string; nama: string }[]
}) {
  const [search, setSearch] = useState("")
  const [desaFilter, setDesaFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PelangganRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PelangganRow | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return pelanggan.filter((p) => {
      const matchSearch =
        p.nama.toLowerCase().includes(search.toLowerCase()) ||
        p.alamat.toLowerCase().includes(search.toLowerCase())
      const matchDesa = desaFilter === "all" || p.desaId === desaFilter
      const matchStatus = statusFilter === "all" || p.statusAktif === statusFilter
      return matchSearch && matchDesa && matchStatus
    })
  }, [pelanggan, search, desaFilter, statusFilter])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(row: PelangganRow) {
    setEditing(row)
    setFormOpen(true)
  }

  async function toggleStatus(row: PelangganRow) {
    const next = row.statusAktif === "AKTIF" ? "NONAKTIF" : "AKTIF"
    try {
      await setStatusAktifPelanggan(row.id, next)
      toast.success(next === "AKTIF" ? "Pelanggan diaktifkan" : "Pelanggan dinonaktifkan")
    } catch {
      toast.error("Gagal mengubah status")
    }
  }

  function handleSendReminder(row: PelangganRow) {
    setSendingId(row.id)
    startTransition(async () => {
      try {
        await sendReminderSatuPelanggan(row.id)
        toast.success(`Reminder tagihan dikirim ke ${row.nama}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal mengirim reminder")
      } finally {
        setSendingId(null)
      }
    })
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deletePelanggan(deleteTarget.id)
      toast.success("Pelanggan dihapus")
    } catch {
      toast.error("Gagal menghapus pelanggan")
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Data Pelanggan</h1>
          <p className="text-sm text-muted-foreground">{pelanggan.length} pelanggan terdaftar</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          Tambah Pelanggan
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          items={{ all: "Semua desa", ...Object.fromEntries(desaList.map((d) => [d.id, d.nama])) }}
          value={desaFilter}
          onValueChange={(value) => setDesaFilter(value ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Semua desa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua desa</SelectItem>
            {desaList.map((desa) => (
              <SelectItem key={desa.id} value={desa.id}>
                {desa.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={{ all: "Semua status", AKTIF: "Aktif", NONAKTIF: "Nonaktif" }}
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="AKTIF">Aktif</SelectItem>
            <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-x-auto rounded-xl border"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead>Desa</TableHead>
              <TableHead>Iuran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Iuran Bulan Ini</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  Tidak ada pelanggan yang cocok.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.nama}</TableCell>
                <TableCell className="max-w-56 truncate text-muted-foreground">
                  {row.alamat}
                </TableCell>
                <TableCell className="text-muted-foreground">{row.noHp}</TableCell>
                <TableCell>{row.desaNama}</TableCell>
                <TableCell>{formatRupiah(row.iuran)}</TableCell>
                <TableCell>
                  <Badge variant={row.statusAktif === "AKTIF" ? "default" : "secondary"}>
                    {row.statusAktif === "AKTIF" ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {row.statusAktif !== "AKTIF" ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    <Badge variant={row.sudahLunasBulanIni ? "secondary" : "destructive"}>
                      {row.sudahLunasBulanIni ? "Lunas" : "Belum bayar"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" className="size-8" />}
                    >
                      <MoreVerticalIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(row)}>Edit</DropdownMenuItem>
                      {row.statusAktif === "AKTIF" && !row.sudahLunasBulanIni && (
                        <DropdownMenuItem
                          disabled={!row.noHp || sendingId === row.id}
                          onClick={() => handleSendReminder(row)}
                        >
                          <SendIcon />
                          {sendingId === row.id ? "Mengirim..." : "Kirim Reminder Tagihan"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => toggleStatus(row)}>
                        {row.statusAktif === "AKTIF" ? "Nonaktifkan" : "Aktifkan"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(row)}
                      >
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <PelangganFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        desaList={desaList}
        editing={editing}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pelanggan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data {deleteTarget?.nama} akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
