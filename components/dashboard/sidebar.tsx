"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Calendar,
  BookOpen,
  CalendarOff,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  Boxes,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Faculty", icon: Users, href: "/faculty" },
  { label: "Approvals", icon: ClipboardCheck, href: "/approvals" },
  { label: "Timetable", icon: Calendar, href: "/timetable" },
  { label: "Syllabus", icon: BookOpen, href: "/syllabus" },
  { label: "Leave", icon: CalendarOff, href: "/leave" },
  { label: "Feedback", icon: MessageSquare, href: "/feedback" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Settings", icon: Settings, href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border/50 bg-sidebar shadow-premium">
      {/* Logo */}
      <div className="flex items-center gap-3.5 px-6 py-7">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105">
          <Boxes className="h-5 w-5 text-primary-foreground" />
          <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
        </div>
        <div className="animate-fade-in">
          <h1 className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">Faculty</h1>
          <h1 className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">Management</h1>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">AI-Orchestrated</p>
        </div>
      </div>

      {/* New Allocation Button */}
      <div className="px-5 pb-6">
        <Button className="group relative w-full gap-2.5 overflow-hidden rounded-xl bg-primary py-5 font-medium shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30">
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-shimmer" />
          <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative">New Allocation</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3.5 rounded-xl px-4 py-3 text-[13px] font-medium transition-all duration-200",
                "animate-fade-in opacity-0",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
              style={{ animationDelay: `${index * 0.03}s`, animationFillMode: 'forwards' }}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-sidebar-primary text-white shadow-md shadow-sidebar-primary/30" 
                  : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-sidebar-foreground"
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="tracking-tight">{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-pulse-soft" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom gradient fade */}
      <div className="h-16 bg-gradient-to-t from-sidebar to-transparent pointer-events-none" />
    </aside>
  )
}
