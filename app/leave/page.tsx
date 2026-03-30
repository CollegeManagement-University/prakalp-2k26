"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Send } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type LeaveItem = {
  id: string
  startDate: string
  endDate: string
  reason: string
  status: "Pending" | "Approved" | "Rejected"
}

export default function LeavePage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [requests, setRequests] = useState<LeaveItem[]>([])

  const applyLeave = () => {
    if (!startDate || !endDate || !reason.trim()) {
      toast.error("Please complete all fields")
      return
    }

    if (startDate > endDate) {
      toast.error("Start date cannot be after end date")
      return
    }

    setRequests((prev) => [
      {
        id: crypto.randomUUID(),
        startDate,
        endDate,
        reason: reason.trim(),
        status: "Pending",
      },
      ...prev,
    ])

    setStartDate("")
    setEndDate("")
    setReason("")
    toast.success("Leave request submitted")
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Apply Leave</h1>
        <p className="text-sm text-muted-foreground">Submit and track your leave requests</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">New Request</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" className="mt-1.5" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>

            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" className="mt-1.5" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" className="mt-1.5" rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for leave" />
            </div>

            <Button className="w-full gap-2" onClick={applyLeave}>
              <Send className="h-4 w-4" />
              Submit Request
            </Button>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold">My Leave Requests</h3>

          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leave requests submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-medium text-foreground">
                      {item.startDate} to {item.endDate}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        item.status === "Pending" && "bg-warning/20 text-warning-foreground",
                        item.status === "Approved" && "bg-accent/20 text-accent",
                        item.status === "Rejected" && "bg-destructive/10 text-destructive",
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
