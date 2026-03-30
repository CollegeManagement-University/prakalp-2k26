import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCards } from "@/components/dashboard/stat-cards"
import { WorkloadChart } from "@/components/dashboard/workload-chart"
import { FacultyRatings } from "@/components/dashboard/faculty-ratings"
import { PendingAllocations } from "@/components/dashboard/pending-allocations"
import { AgenticInsights } from "@/components/dashboard/agentic-insights"

export default function DashboardPage() {
  return (
    <DashboardLayout>
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
