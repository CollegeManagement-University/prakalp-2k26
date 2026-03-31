"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts"

const weeklyData = [
  { department: "COMPUTER SCI.", hours: 85, fullName: "Computer Science" },
  { department: "MATHEMATICS", hours: 92, fullName: "Mathematics" },
  { department: "PHYSICS", hours: 65, fullName: "Physics" },
  { department: "HUMANITIES", hours: 58, fullName: "Humanities" },
  { department: "MANAGEMENT", hours: 78, fullName: "Management" },
  { department: "ENGINEERING", hours: 88, fullName: "Engineering" },
]

const monthlyData = [
  { department: "COMPUTER SCI.", hours: 340, fullName: "Computer Science" },
  { department: "MATHEMATICS", hours: 368, fullName: "Mathematics" },
  { department: "PHYSICS", hours: 260, fullName: "Physics" },
  { department: "HUMANITIES", hours: 232, fullName: "Humanities" },
  { department: "MANAGEMENT", hours: 312, fullName: "Management" },
  { department: "ENGINEERING", hours: 352, fullName: "Engineering" },
]

export function WorkloadChart() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly")
  const data = period === "weekly" ? weeklyData : monthlyData

  return (
    <Card className="overflow-hidden border-border/50 p-7 shadow-premium animate-fade-in opacity-0 stagger-2" style={{ animationFillMode: 'forwards' }}>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">Workload Distribution</h3>
          <p className="mt-1 text-sm text-muted-foreground">Hours allocated across departments</p>
        </div>
        <div className="flex rounded-xl border border-border/60 bg-muted/30 p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-lg px-5 text-sm font-medium transition-all duration-200",
              period === "weekly" 
                ? "bg-card text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setPeriod("weekly")}
          >
            Weekly
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-lg px-5 text-sm font-medium transition-all duration-200",
              period === "monthly" 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </Button>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="18%">
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="barGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="department"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              dy={8}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted) / 0.5)', radius: 8 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl bg-card px-4 py-3 shadow-premium-lg border border-border/50 animate-scale-in">
                      <p className="text-sm font-semibold text-foreground">{payload[0].payload.fullName}</p>
                      <p className="mt-1 text-2xl font-bold text-primary">
                        {payload[0].value}
                        <span className="ml-1 text-sm font-normal text-muted-foreground">hours</span>
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar 
              dataKey="hours" 
              radius={[8, 8, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 1 ? "url(#barGradient)" : "url(#barGradientLight)"}
                  className="transition-all duration-300 hover:opacity-90"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
