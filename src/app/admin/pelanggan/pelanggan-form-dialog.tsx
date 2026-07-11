"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { pelangganSchema, type PelangganFormValues } from "@/lib/validation/pelanggan"
import { createPelanggan, updatePelanggan } from "@/lib/actions/pelanggan"

export type PelangganRow = {
  id: string
  nama: string
  alamat: string
  noHp: string
  desaId: string
  statusAktif: "AKTIF" | "NONAKTIF"
  iuran: number
}

export function PelangganFormDialog({
  open,
  onOpenChange,
  desaList,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  desaList: { id: string; nama: string }[]
  editing: PelangganRow | null
}) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<PelangganFormValues>({
    resolver: zodResolver(pelangganSchema),
    defaultValues: {
      nama: "",
      alamat: "",
      noHp: "",
      desaId: "",
      iuran: 0,
      statusAktif: "AKTIF",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
              nama: editing.nama,
              alamat: editing.alamat,
              noHp: editing.noHp,
              desaId: editing.desaId,
              iuran: editing.iuran,
              statusAktif: editing.statusAktif,
            }
          : { nama: "", alamat: "", noHp: "", desaId: "", iuran: 0, statusAktif: "AKTIF" }
      )
    }
  }, [open, editing, form])

  async function onSubmit(values: PelangganFormValues) {
    setSubmitting(true)
    try {
      if (editing) {
        await updatePelanggan(editing.id, values)
        toast.success("Data pelanggan diperbarui")
      } else {
        await createPelanggan(values)
        toast.success("Pelanggan baru ditambahkan")
      }
      onOpenChange(false)
    } catch {
      toast.error("Gagal menyimpan data pelanggan")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Pelanggan" : "Tambah Pelanggan"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama pelanggan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alamat lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="noHp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor HP (WhatsApp)</FormLabel>
                  <FormControl>
                    <Input placeholder="08123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="desaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desa</FormLabel>
                  <Select
                    items={Object.fromEntries(desaList.map((d) => [d.id, d.nama]))}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih desa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {desaList.map((desa) => (
                        <SelectItem key={desa.id} value={desa.id}>
                          {desa.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="iuran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Iuran (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={500}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="statusAktif"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      items={{ AKTIF: "Aktif", NONAKTIF: "Nonaktif" }}
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange((value ?? "AKTIF") as "AKTIF" | "NONAKTIF")
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AKTIF">Aktif</SelectItem>
                        <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2Icon className="animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
