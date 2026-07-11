"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/lib/nav"

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/petugas-penarik" || href === "/petugas-sampah") {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SidebarNavLink({ item, layoutId }: { item: NavItem; layoutId: string }) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-lg bg-primary"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <Icon className="relative z-10 size-4" />
      <span className="relative z-10">{item.label}</span>
    </Link>
  )
}

export function BottomNavLink({ item, layoutId }: { item: NavItem; layoutId: string }) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2"
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-1">
        <Icon
          className={cn(
            "size-5 transition-colors",
            active ? "text-primary" : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "text-[11px] font-medium transition-colors",
            active ? "text-primary" : "text-muted-foreground"
          )}
        >
          {item.label}
        </span>
      </motion.div>
    </Link>
  )
}
