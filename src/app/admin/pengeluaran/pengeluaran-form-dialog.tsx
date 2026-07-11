"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { pengeluaranSchema, type PengeluaranFormValues } from "@/lib/validation/pengeluaran"
import { createPengeluaran, updatePengeluaran } from "@/lib/actions/pengeluaran"

export type PengeluaranRow = {
  id: string
  kategori: string
  nominal: number
  tanggal: string
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function PengeluaranFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: PengeluaranRow | null
}) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<PengeluaranFormValues>({
    resolver: zodResolver(pengeluaranSchema),
    defaultValues: { kategori: "", nominal: 0, tanggal: todayStr() },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? { kategori: editing.kategori, nominal: editing.nominal, tanggal: editing.tanggal }
          : { kategori: "", nominal: 0, tanggal: todayStr() }
      )
    }
  }, [open, editing, form])

  async function onSubmit(values: PengeluaranFormValues) {
    setSubmitting(true)
    try {
      if (editing) {
        await updatePengeluaran(editing.id, values)
        toast.success("Pengeluaran diperbarui")
      } else {
        await createPengeluaran(values)
        toast.success("Pengeluaran ditambahkan")
      }
      onOpenChange(false)
    } catch {
      toast.error("Gagal menyimpan pengeluaran")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="kategori"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder="Misal: Perawatan kendaraan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nominal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal (Rp)</FormLabel>
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
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
