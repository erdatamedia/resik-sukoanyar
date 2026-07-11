"use client"

import { signOut } from "next-auth/react"
import { LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LogoutButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOutIcon />
      Keluar
    </Button>
  )
}
