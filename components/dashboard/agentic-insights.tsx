"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Plus, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Insight {
  id: string
  type: "OPTIMIZED" | "ALERT" | "SUGGESTION"
  title: string
  description: string
}

const insights: Insight[] = [
  {
    id: "1",
    type: "OPTIMIZED",
    title: "OPTIMIZED",
    description: "AI suggested reallocation for 4 Maths faculty. Reduction in gap periods by 24% achieved.",
  },
  {
    id: "2",
    type: "ALERT",
    title: "ALERT",
    description: "Potential overlap detected in Room 302 on Tuesdays. Resolving conflict...",
  },
]

export function AgenticInsights() {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary to-primary/90 p-7 text-primary-foreground shadow-premium-lg animate-fade-in opacity-0 stagger-5" style={{ animationFillMode: 'forwards' }}>
      {/* Decorative elements */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
      
      <div className="relative mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-warning" />
          </div>
          <h3 className="text-lg font-bold tracking-tight">Agentic Insights</h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-xl bg-white/10 text-primary-foreground backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-110"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative space-y-4">
        {insights.map((insight, index) => (
          <div
            key={insight.id}
            className={cn(
              "group rounded-xl bg-white/10 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:translate-x-1",
              "animate-slide-left opacity-0"
            )}
            style={{ animationDelay: `${0.5 + index * 0.15}s`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-bold tracking-[0.15em]",
                  insight.type === "OPTIMIZED" ? "text-accent" : "text-destructive/90"
                )}
              >
                {insight.title}
              </span>
              {insight.type === "OPTIMIZED" && (
                <Sparkles className="h-3 w-3 text-accent animate-pulse-soft" />
              )}
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-primary-foreground/85">
              {insight.description}
            </p>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        className="relative mt-6 w-full overflow-hidden rounded-xl bg-white py-5 font-semibold text-primary shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-fade-in opacity-0"
        style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 transition-opacity duration-500 hover:opacity-100" />
        <span className="relative flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Efficiency Report
        </span>
      </Button>
    </Card>
  )
}
