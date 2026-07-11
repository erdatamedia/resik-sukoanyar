"use client"

import { motion } from "motion/react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  index = 0,
  tone = "default",
}: {
  label: string
  value: string
  icon: LucideIcon
  index?: number
  tone?: "default" | "positive" | "negative"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card className="h-full">
        <CardContent className="flex h-full items-center gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              tone === "positive" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              tone === "negative" && "bg-red-500/10 text-red-600 dark:text-red-400",
              tone === "default" && "bg-primary/10 text-primary"
            )}
          >
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs leading-tight text-wrap break-words text-muted-foreground">
              {label}
            </p>
            <p className="text-lg font-semibold text-wrap break-words">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
