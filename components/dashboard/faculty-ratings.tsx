"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const ratingData = [
  { name: "Excellent", value: 82, color: "hsl(var(--accent))" },
  { name: "Good", value: 15, color: "hsl(160 60% 55%)" },
  { name: "Average", value: 2, color: "hsl(var(--warning))" },
  { name: "Poor", value: 1, color: "hsl(var(--destructive) / 0.5)" },
]

export function FacultyRatings() {
  return (
    <Card className="overflow-hidden border-border/50 p-7 shadow-premium animate-fade-in opacity-0 stagger-3" style={{ animationFillMode: 'forwards' }}>
      <div className="mb-6">
        <h3 className="text-lg font-bold tracking-tight text-foreground">Faculty Ratings</h3>
        <p className="mt-1 text-sm text-muted-foreground">Average overall satisfaction</p>
      </div>

      <div className="relative flex justify-center">
        <div className="h-52 w-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <Pie
                data={ratingData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {ratingData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="transparent"
                    className="transition-all duration-300 hover:opacity-80"
                    style={{ filter: index === 0 ? 'url(#glow)' : 'none' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tracking-tight text-foreground animate-scale-in">4.8</span>
          <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Out of 5</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {ratingData.map((item, index) => (
          <div 
            key={item.name} 
            className="group flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-muted/50 animate-fade-in opacity-0"
            style={{ animationDelay: `${0.4 + index * 0.1}s`, animationFillMode: 'forwards' }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-offset-card transition-transform duration-200 group-hover:scale-125"
              style={{ backgroundColor: item.color, ringColor: item.color }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {item.name} <span className="font-semibold text-foreground">({item.value}%)</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
