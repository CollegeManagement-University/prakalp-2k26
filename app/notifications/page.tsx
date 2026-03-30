"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"

type NotificationItem = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Timetable updated",
    description: "Your timetable for Semester 6 Section A has been regenerated.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: "2",
    title: "Leave request approved",
    description: "Your leave request for April 4 has been approved.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "3",
    title: "Qualification reviewed",
    description: "Your recent qualification update has been reviewed.",
    time: "Yesterday",
    read: true,
  },
]

export default function NotificationsPage() {
  const [items, setItems] = useState(initialNotifications)

  const markRead = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">View system updates and alerts</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={markAllRead}>
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border p-4 transition-colors",
                item.read ? "border-border bg-background" : "border-primary/20 bg-primary/5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="mt-0.5 rounded-full bg-muted p-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                {!item.read ? (
                  <Button size="sm" variant="ghost" onClick={() => markRead(item.id)}>
                    Mark read
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}
