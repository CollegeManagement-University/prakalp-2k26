"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts"

const performanceData = [
  { month: "Jan", rating: 4.2, workload: 75 },
  { month: "Feb", rating: 4.3, workload: 78 },
  { month: "Mar", rating: 4.5, workload: 82 },
  { month: "Apr", rating: 4.4, workload: 80 },
  { month: "May", rating: 4.6, workload: 85 },
  { month: "Jun", rating: 4.8, workload: 88 },
]

const workloadVsPerformance = [
  { faculty: "Dr. Miller", workload: 18, performance: 4.9 },
  { faculty: "Prof. Chen", workload: 22, performance: 4.7 },
  { faculty: "Dr. Kim", workload: 16, performance: 4.5 },
  { faculty: "Prof. Lee", workload: 20, performance: 4.8 },
  { faculty: "Dr. Patel", workload: 24, performance: 4.6 },
  { faculty: "Prof. Wang", workload: 14, performance: 4.4 },
]

const topPerformers = [
  {
    id: "1",
    name: "Dr. Sarah Miller",
    initials: "SM",
    color: "bg-accent",
    rating: 4.9,
    department: "Computer Science",
    trend: "+0.3",
  },
  {
    id: "2",
    name: "Prof. David Lee",
    initials: "DL",
    color: "bg-primary",
    rating: 4.8,
    department: "Engineering",
    trend: "+0.2",
  },
  {
    id: "3",
    name: "Prof. Michael Chen",
    initials: "MC",
    color: "bg-chart-3",
    rating: 4.7,
    department: "Mathematics",
    trend: "+0.1",
  },
]

const lowPerformers = [
  {
    id: "1",
    name: "Dr. Robert Kim",
    initials: "RK",
    color: "bg-destructive",
    rating: 3.2,
    department: "Management",
    trend: "-0.2",
  },
  {
    id: "2",
    name: "Prof. Lisa Park",
    initials: "LP",
    color: "bg-chart-4",
    rating: 3.5,
    department: "Humanities",
    trend: "-0.1",
  },
]

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground">Faculty performance and workload insights</p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">4.6</p>
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+0.2</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">18.5h</p>
              <p className="text-sm text-muted-foreground">Avg. Workload/Week</p>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+2h</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">92%</p>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+5%</span>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
            </div>
            <div className="flex items-center gap-1 text-destructive">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">+1</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Performance Over Time */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[4, 5]}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg bg-card px-3 py-2 shadow-lg border border-border">
                          <p className="text-sm font-medium">{payload[0].payload.month}</p>
                          <p className="text-sm text-accent">Rating: {payload[0].value}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Workload vs Performance */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Workload vs Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadVsPerformance} layout="vertical" barSize={16}>
                <XAxis type="number" domain={[0, 30]} hide />
                <YAxis
                  type="category"
                  dataKey="faculty"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg bg-card px-3 py-2 shadow-lg border border-border">
                          <p className="text-sm font-medium">{payload[0].payload.faculty}</p>
                          <p className="text-sm text-primary">
                            Workload: {payload[0].payload.workload}h/week
                          </p>
                          <p className="text-sm text-accent">
                            Rating: {payload[0].payload.performance}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="workload" radius={[0, 4, 4, 0]}>
                  {workloadVsPerformance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.performance >= 4.7
                          ? "hsl(var(--accent))"
                          : entry.performance >= 4.5
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Performers */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Top Performers</h3>
          </div>
          <div className="space-y-4">
            {topPerformers.map((faculty, index) => (
              <div
                key={faculty.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                    {index + 1}
                  </span>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={cn(faculty.color, "text-white text-sm font-semibold")}
                    >
                      {faculty.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{faculty.name}</p>
                    <p className="text-xs text-muted-foreground">{faculty.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{faculty.rating}</p>
                  <p className="text-xs text-accent">{faculty.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Needs Attention */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-semibold">Needs Attention</h3>
          </div>
          <div className="space-y-4">
            {lowPerformers.map((faculty) => (
              <div
                key={faculty.id}
                className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={cn(faculty.color, "text-white text-sm font-semibold")}
                    >
                      {faculty.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{faculty.name}</p>
                    <p className="text-xs text-muted-foreground">{faculty.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{faculty.rating}</p>
                  <p className="text-xs text-destructive">{faculty.trend}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Consider scheduling feedback sessions or providing additional support for these faculty
            members.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
