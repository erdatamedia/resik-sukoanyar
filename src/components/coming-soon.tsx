import { ConstructionIcon } from "lucide-react"

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ConstructionIcon className="size-5" />
      </div>
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Modul ini akan dibangun pada tahap berikutnya.
      </p>
    </div>
  )
}
