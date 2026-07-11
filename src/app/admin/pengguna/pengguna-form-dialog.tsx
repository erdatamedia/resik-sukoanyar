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
import { userSchema, type UserFormValues } from "@/lib/validation/user"
import { createUser, updateUser } from "@/lib/actions/user"
import { ROLE_LABEL } from "@/lib/roles"

export type UserRow = {
  id: string
  nama: string
  email: string
  role: "ADMIN" | "PETUGAS_PENARIK" | "PETUGAS_SAMPAH"
  desaId: string | null
  isActive: boolean
}

export function PenggunaFormDialog({
  open,
  onOpenChange,
  desaList,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  desaList: { id: string; nama: string }[]
  editing: UserRow | null
}) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { nama: "", email: "", role: "PETUGAS_SAMPAH", desaId: "", password: "" },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
              nama: editing.nama,
              email: editing.email,
              role: editing.role,
              desaId: editing.desaId ?? "",
              password: "",
            }
          : { nama: "", email: "", role: "PETUGAS_SAMPAH", desaId: "", password: "" }
      )
    }
  }, [open, editing, form])

  async function onSubmit(values: UserFormValues) {
    setSubmitting(true)
    try {
      if (editing) {
        await updateUser(editing.id, values)
        toast.success("Akun diperbarui")
      } else {
        await createUser(values)
        toast.success("Akun baru dibuat")
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan akun")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Kosongkan password kalau tidak ingin mengubahnya."
              : "Akun bisa langsung dipakai untuk login setelah dibuat."}
          </DialogDescription>
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
                    <Input placeholder="Nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="nama@resik.local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      items={ROLE_LABEL}
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange((value ?? "PETUGAS_SAMPAH") as UserFormValues["role"])
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ROLE_LABEL).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desa (opsional)</FormLabel>
                    <Select
                      items={{ "": "Tidak diset", ...Object.fromEntries(desaList.map((d) => [d.id, d.nama])) }}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? "")}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tidak diset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Tidak diset</SelectItem>
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
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{editing ? "Password baru" : "Password"}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={editing ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
                      {...field}
                    />
                  </FormControl>
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
