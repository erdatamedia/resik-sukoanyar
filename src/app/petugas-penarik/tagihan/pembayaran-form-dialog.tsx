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
  DialogDescription,
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
import { pembayaranSchema, type PembayaranFormValues } from "@/lib/validation/pembayaran"
import { recordPembayaran } from "@/lib/actions/pembayaran"

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function PembayaranFormDialog({
  open,
  onOpenChange,
  pelanggan,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pelanggan: { id: string; nama: string; iuran: number } | null
}) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<PembayaranFormValues>({
    resolver: zodResolver(pembayaranSchema),
    defaultValues: { pelangganId: "", nominal: 0, tanggal: todayStr(), status: "LUNAS" },
  })

  useEffect(() => {
    if (open && pelanggan) {
      form.reset({
        pelangganId: pelanggan.id,
        nominal: pelanggan.iuran,
        tanggal: todayStr(),
        status: "LUNAS",
      })
    }
  }, [open, pelanggan, form])

  async function onSubmit(values: PembayaranFormValues) {
    setSubmitting(true)
    try {
      await recordPembayaran(values)
      toast.success("Pembayaran dicatat")
      onOpenChange(false)
    } catch {
      toast.error("Gagal mencatat pembayaran")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Pembayaran</DialogTitle>
          <DialogDescription>{pelanggan?.nama}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    items={{ LUNAS: "Lunas", BELUM: "Belum" }}
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange((value ?? "LUNAS") as "LUNAS" | "BELUM")
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LUNAS">Lunas</SelectItem>
                      <SelectItem value="BELUM">Belum</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
