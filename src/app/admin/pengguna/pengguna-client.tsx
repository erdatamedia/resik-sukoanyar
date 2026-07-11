"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { PlusIcon, SearchIcon, MoreVerticalIcon } from "lucide-react"
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
import { ROLE_LABEL } from "@/lib/roles"
import { setUserActive } from "@/lib/actions/user"
import { PenggunaFormDialog, type UserRow } from "./pengguna-form-dialog"

export function PenggunaClient({
  users,
  desaList,
  currentUserId,
}: {
  users: (UserRow & { desaNama: string | null })[]
  desaList: { id: string; nama: string }[]
  currentUserId: string
}) {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.nama.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === "all" || u.role === roleFilter
      return matchSearch && matchRole
    })
  }, [users, search, roleFilter])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(row: UserRow) {
    setEditing(row)
    setFormOpen(true)
  }

  async function toggleActive(row: UserRow) {
    try {
      await setUserActive(row.id, !row.isActive)
      toast.success(row.isActive ? "Akun dinonaktifkan" : "Akun diaktifkan")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status akun")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Kelola Pengguna</h1>
          <p className="text-sm text-muted-foreground">{users.length} akun terdaftar</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          Tambah Pengguna
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          items={{ all: "Semua role", ...ROLE_LABEL }}
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Semua role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua role</SelectItem>
            {Object.entries(ROLE_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
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
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Desa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Tidak ada pengguna yang cocok.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  {row.nama}
                  {row.id === currentUserId && (
                    <span className="ml-2 text-xs text-muted-foreground">(Anda)</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{row.email}</TableCell>
                <TableCell>{ROLE_LABEL[row.role]}</TableCell>
                <TableCell className="text-muted-foreground">{row.desaNama ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={row.isActive ? "default" : "secondary"}>
                    {row.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
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
                      <DropdownMenuItem
                        variant={row.isActive ? "destructive" : "default"}
                        onClick={() => toggleActive(row)}
                        disabled={row.id === currentUserId && row.isActive}
                      >
                        {row.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <PenggunaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        desaList={desaList}
        editing={editing}
      />
    </div>
  )
}
