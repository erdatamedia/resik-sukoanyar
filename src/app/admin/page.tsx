import { auth } from "@/auth"
import { getDashboardStats } from "@/lib/queries/dashboard"
import { DashboardStats } from "./dashboard-stats"

export default async function AdminHomePage() {
  const [session, stats] = await Promise.all([auth(), getDashboardStats()])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Halo, {session?.user?.name} — ringkasan operasional RESIK
        </p>
      </div>

      <DashboardStats {...stats} />
    </div>
  )
}
