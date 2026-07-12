import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Wallet,
  Receipt,
  History,
  CameraIcon,
  MessageCircleIcon,
  UserCogIcon,
  Trash2Icon,
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_BY_ROLE: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Pelanggan", href: "/admin/pelanggan", icon: Users },
    { label: "Absensi", href: "/admin/absensi", icon: ClipboardCheck },
    { label: "Iuran", href: "/admin/iuran", icon: Wallet },
    { label: "Pengeluaran", href: "/admin/pengeluaran", icon: Receipt },
    { label: "Notifikasi", href: "/admin/notifikasi", icon: MessageCircleIcon },
    { label: "Pengguna", href: "/admin/pengguna", icon: UserCogIcon },
  ],
  PETUGAS_PENARIK: [
    { label: "Beranda", href: "/petugas-penarik", icon: LayoutDashboard },
    { label: "Absensi", href: "/petugas-penarik/absensi", icon: CameraIcon },
    { label: "Tagihan", href: "/petugas-penarik/tagihan", icon: Wallet },
    { label: "Riwayat", href: "/petugas-penarik/riwayat", icon: History },
  ],
  PETUGAS_SAMPAH: [
    { label: "Beranda", href: "/petugas-sampah", icon: LayoutDashboard },
    { label: "Absensi", href: "/petugas-sampah/absensi", icon: CameraIcon },
    { label: "Rumah", href: "/petugas-sampah/rumah", icon: Trash2Icon },
    { label: "Riwayat", href: "/petugas-sampah/riwayat", icon: History },
  ],
}
