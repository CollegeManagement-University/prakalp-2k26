"use client"

import { Users, GraduationCap, FileCheck, Calendar, CalendarX, TrendingUp, TrendingDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  badge?: {
    label: string
    variant: "success" | "warning" | "critical"
  }
  iconBgColor: string
  index: number
}

function StatCard({ title, value, icon, trend, badge, iconBgColor, index }: StatCardProps) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden p-6 transition-all duration-300 hover-lift cursor-pointer",
        "border-border/50 bg-card shadow-premium",
        "animate-fade-in opacity-0"
      )}
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative flex items-start justify-between">
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg",
          iconBgColor
        )}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-transform duration-200 group-hover:scale-105",
            trend.isPositive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
          )}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </div>
        )}
        {badge && (
          <span className={cn(
            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-transform duration-200 group-hover:scale-105",
            badge.variant === "success" && "bg-accent/15 text-accent",
            badge.variant === "warning" && "bg-warning/20 text-warning-foreground",
            badge.variant === "critical" && "bg-destructive/10 text-destructive"
          )}>
            {badge.variant === "critical" && (
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
            )}
            {badge.label}
          </span>
        )}
      </div>

      {/* Notification dot for Pending Approvals */}
      {title === "Pending Approvals" && (
        <span className="absolute right-5 top-5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-warning" />
        </span>
      )}

      <div className="relative mt-5">
        <p className="text-4xl font-bold tracking-tight text-foreground transition-colors duration-200">{value}</p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{title}</p>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Card>
  )
}

export function StatCards() {
  const stats = [
    {
      title: "Total Faculty",
      value: "142",
      icon: <Users className="h-6 w-6 text-primary" />,
      iconBgColor: "bg-primary/10",
      trend: { value: "12%", isPositive: true },
    },
    {
      title: "Total Students",
      value: "3,840",
      icon: <GraduationCap className="h-6 w-6 text-accent" />,
      iconBgColor: "bg-accent/10",
      trend: { value: "5%", isPositive: true },
    },
    {
      title: "Pending Approvals",
      value: "28",
      icon: <FileCheck className="h-6 w-6 text-warning-foreground" />,
      iconBgColor: "bg-warning/20",
    },
    {
      title: "Active Timetables",
      value: "12",
      icon: <Calendar className="h-6 w-6 text-primary" />,
      iconBgColor: "bg-primary/10",
      badge: { label: "Active", variant: "success" as const },
    },
    {
      title: "Leave Requests",
      value: "06",
      icon: <CalendarX className="h-6 w-6 text-destructive" />,
      iconBgColor: "bg-destructive/10",
      badge: { label: "Critical", variant: "critical" as const },
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  )
}
