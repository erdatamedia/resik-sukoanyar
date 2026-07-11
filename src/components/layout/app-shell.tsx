"use client"

import { Trash2Icon } from "lucide-react"
import { NAV_BY_ROLE } from "@/lib/nav"
import { SidebarNavLink, BottomNavLink } from "@/components/layout/nav-link"
import { PageTransition } from "@/components/layout/page-transition"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function AppShell({
  role,
  roleLabel,
  userName,
  children,
}: {
  role: string
  roleLabel: string
  userName: string
  children: React.ReactNode
}) {
  const navItems = NAV_BY_ROLE[role] ?? []

  return (
    <div className="flex min-h-screen flex-1">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trash2Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-sm font-semibold">RESIK</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
          </div>
          <ThemeToggle />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => (
            <SidebarNavLink key={item.href} item={item} layoutId="sidebar-active" />
          ))}
        </nav>
        <div className="flex items-center gap-2 border-t px-4 py-4">
          <Avatar className="size-8">
            <AvatarFallback>{initials(userName)}</AvatarFallback>
          </Avatar>
          <p className="flex-1 truncate text-sm font-medium">{userName}</p>
        </div>
        <div className="px-3 pb-4">
          <LogoutButton className="w-full justify-start" />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Trash2Icon className="size-3.5" />
            </div>
            <p className="text-sm font-semibold">RESIK</p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-5 pb-20 md:px-8 md:py-8 md:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
          {navItems.map((item) => (
            <BottomNavLink key={item.href} item={item} layoutId="bottomnav-active" />
          ))}
        </nav>
      </div>
    </div>
  )
}
