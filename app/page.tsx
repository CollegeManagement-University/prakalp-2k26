import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCards } from "@/components/dashboard/stat-cards"
import { WorkloadChart } from "@/components/dashboard/workload-chart"
import { FacultyRatings } from "@/components/dashboard/faculty-ratings"
import { PendingAllocations } from "@/components/dashboard/pending-allocations"
import { AgenticInsights } from "@/components/dashboard/agentic-insights"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { hasSupabaseEnv } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  let connectionState: "connected" | "missing-env" | "not-signed-in" | "error" = "missing-env"
  let profileName = ""
  let departmentsCount = 0
  let coursesCount = 0

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        connectionState = "connected"

        const [{ data: profile }, { count: departmentTotal }, { count: courseTotal }] = await Promise.all([
          supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
          supabase.from("departments").select("id", { count: "exact", head: true }),
          supabase.from("courses").select("id", { count: "exact", head: true }),
        ])

        profileName = profile?.full_name ?? ""
        departmentsCount = departmentTotal ?? 0
        coursesCount = courseTotal ?? 0
      } else {
        connectionState = "not-signed-in"
      }
    } catch {
      connectionState = "error"
    }
  }

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {connectionState === "connected" ? (
            <>
              <p className="text-emerald-600">Connected to Supabase schema successfully.</p>
              <p>
                Signed in as: <span className="font-semibold">{profileName || "User"}</span>
              </p>
              <p>
                Departments: <span className="font-semibold">{departmentsCount}</span> | Courses:{" "}
                <span className="font-semibold">{coursesCount}</span>
              </p>
            </>
          ) : null}

          {connectionState === "missing-env" ? (
            <p className="text-amber-600">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.</p>
          ) : null}

          {connectionState === "not-signed-in" ? (
            <p className="text-amber-600">Supabase connected, but no active user session was found.</p>
          ) : null}

          {connectionState === "error" ? (
            <p className="text-destructive">Supabase is configured but schema queries failed. Re-run schema.sql in Supabase SQL editor.</p>
          ) : null}
        </CardContent>
      </Card>

      {/* Stats Row */}
      <StatCards />

      {/* Charts Row */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WorkloadChart />
        </div>
        <FacultyRatings />
      </div>

      {/* Bottom Row */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PendingAllocations />
        </div>
        <AgenticInsights />
      </div>
    </DashboardLayout>
  )
}
