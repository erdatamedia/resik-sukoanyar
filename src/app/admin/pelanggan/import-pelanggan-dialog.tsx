"use client"

import { useRef, useState } from "react"
import { motion } from "motion/react"
import { UploadIcon, DownloadIcon, Loader2Icon, CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatRupiah } from "@/lib/format"
import { parseImportRow, type ParsedImportRow } from "@/lib/import-pelanggan"
import { downloadImportTemplate, parseImportFile } from "@/lib/import-pelanggan-client"
import { importPelanggan } from "@/lib/actions/import-pelanggan"

export function ImportPelangganDialog({
  open,
  onOpenChange,
  desaList,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  desaList: { id: string; nama: string }[]
}) {
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [rows, setRows] = useState<ParsedImportRow[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validRows = rows?.filter((r) => r.errors.length === 0) ?? []
  const errorRows = rows?.filter((r) => r.errors.length > 0) ?? []

  function reset() {
    setRows(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setParsing(true)
    try {
      const raw = await parseImportFile(file)
      const desaNamaSet = new Set(desaList.map((d) => d.nama))
      const parsed = raw.map((r, i) => parseImportRow(r, i + 2, desaNamaSet))
      setRows(parsed)
    } catch {
      toast.error("Gagal membaca file. Pastikan formatnya .xlsx, .xls, atau .csv")
    } finally {
      setParsing(false)
    }
  }

  async function handleImport() {
    if (validRows.length === 0) return
    setImporting(true)
    try {
      const result = await importPelanggan(
        validRows.map((r) => ({
          nama: r.nama,
          alamat: r.alamat,
          noHp: r.noHp,
          desaNama: r.desaNama,
          iuran: r.iuran,
          statusAktif: r.statusAktif,
        }))
      )
      toast.success(
        `${result.created} pelanggan berhasil diimpor` +
          (result.skippedDuplicate > 0 ? `, ${result.skippedDuplicate} dilewati (sudah ada)` : "") +
          (result.failed.length > 0 ? `, ${result.failed.length} gagal` : "")
      )
      handleOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengimpor data")
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Impor Data Pelanggan</DialogTitle>
          <DialogDescription>
            Unggah file Excel (.xlsx) atau CSV berisi data pelanggan yang sudah berjalan. Setiap
            baris akan divalidasi dulu sebelum disimpan.
          </DialogDescription>
        </DialogHeader>

        {!rows ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => downloadImportTemplate(desaList.map((d) => d.nama))}
            >
              <DownloadIcon />
              Unduh Template
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="hidden"
            />
            <Button type="button" onClick={() => inputRef.current?.click()} disabled={parsing}>
              {parsing ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
              {parsing ? "Membaca file..." : "Pilih File"}
            </Button>
            <p className="max-w-sm text-center text-xs text-muted-foreground">
              Kolom wajib: Nama, Alamat, No HP, Desa, Iuran. Desa harus sama persis dengan nama
              desa yang sudah terdaftar.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <CheckCircle2Icon className="size-3" />
                {validRows.length} valid
              </Badge>
              {errorRows.length > 0 && (
                <Badge variant="destructive">
                  <XCircleIcon className="size-3" />
                  {errorRows.length} error
                </Badge>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={reset} className="ml-auto">
                Pilih file lain
              </Button>
            </div>

            <div className="max-h-80 overflow-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Baris</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Desa</TableHead>
                    <TableHead>Iuran</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.rowNumber}>
                      <TableCell className="text-muted-foreground">{row.rowNumber}</TableCell>
                      <TableCell className="font-medium">{row.nama || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{row.desaNama || "-"}</TableCell>
                      <TableCell>{formatRupiah(row.iuran)}</TableCell>
                      <TableCell>
                        {row.errors.length === 0 ? (
                          <Badge variant="secondary">Valid</Badge>
                        ) : (
                          <Badge variant="destructive" title={row.errors.join(", ")}>
                            {row.errors[0]}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={handleImport}
                disabled={validRows.length === 0 || importing}
              >
                {importing && <Loader2Icon className="animate-spin" />}
                Impor {validRows.length} Pelanggan
              </Button>
            </DialogFooter>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
