"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Allocation {
  id: string
  faculty: {
    name: string
    role: string
    initials: string
    color: string
  }
  course: {
    name: string
    department: string
  }
  load: string
  status: "PROCESSING" | "PENDING" | "APPROVED"
}

const allocations: Allocation[] = [
  {
    id: "1",
    faculty: {
      name: "Prof. James Dower",
      role: "Senior Researcher",
      initials: "JD",
      color: "bg-gradient-to-br from-primary to-primary/70",
    },
    course: {
      name: "Advanced Quantum Theory",
      department: "Physics Dept.",
    },
    load: "18h/wk",
    status: "PROCESSING",
  },
  {
    id: "2",
    faculty: {
      name: "Dr. Sarah Miller",
      role: "Assistant Professor",
      initials: "SM",
      color: "bg-gradient-to-br from-accent to-accent/70",
    },
    course: {
      name: "Data Structures",
      department: "CS Dept.",
    },
    load: "12h/wk",
    status: "PROCESSING",
  },
]

export function PendingAllocations() {
  const router = useRouter()

  return (
    <Card className="overflow-hidden border-border/50 p-7 shadow-premium animate-fade-in opacity-0 stagger-4" style={{ animationFillMode: 'forwards' }}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight text-foreground">Pending Allocations</h3>
        <Button 
          variant="ghost" 
          className="group gap-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary"
          onClick={() => router.push('/approvals')}
        >
          View All 
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 border-b border-border/50 pb-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <div>Faculty Member</div>
        <div>Course</div>
        <div>Load</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-border/50">
        {allocations.map((allocation, index) => (
          <div 
            key={allocation.id} 
            className="group grid grid-cols-5 gap-4 py-5 items-center transition-colors duration-200 hover:bg-muted/30 -mx-2 px-2 rounded-xl animate-fade-in opacity-0"
            style={{ animationDelay: `${0.4 + index * 0.1}s`, animationFillMode: 'forwards' }}
          >
            {/* Faculty */}
            <div className="flex items-center gap-3.5">
              <Avatar className="h-11 w-11 ring-2 ring-border/50 ring-offset-2 ring-offset-card transition-all duration-200 group-hover:ring-primary/30">
                <AvatarFallback className={cn(allocation.faculty.color, "text-white text-sm font-bold shadow-lg")}>
                  {allocation.faculty.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">{allocation.faculty.name}</p>
                <p className="mt-0.5 text-xs font-medium text-sidebar-primary">{allocation.faculty.role}</p>
              </div>
            </div>

            {/* Course */}
            <div>
              <p className="text-sm font-medium text-foreground">{allocation.course.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{allocation.course.department}</p>
            </div>

            {/* Load */}
            <div className="text-sm font-semibold text-foreground">{allocation.load}</div>

            {/* Status */}
            <div>
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                allocation.status === "PROCESSING" && "bg-primary/10 text-primary",
                allocation.status === "PENDING" && "bg-warning/20 text-warning-foreground",
                allocation.status === "APPROVED" && "bg-accent/15 text-accent"
              )}>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  allocation.status === "PROCESSING" && "bg-primary",
                  allocation.status === "PENDING" && "bg-warning-foreground",
                  allocation.status === "APPROVED" && "bg-accent"
                )} />
                {allocation.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-xl bg-accent/10 text-accent transition-all duration-200 hover:bg-accent hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-accent/25"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive transition-all duration-200 hover:bg-destructive hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-destructive/25"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
