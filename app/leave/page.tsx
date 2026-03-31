"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Check, X, UserCheck, ClipboardList, Send } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type LeaveStatus = "Pending" | "Approved" | "Rejected"

type LeaveItem = {
  id: string
  facultyName: string
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
}

const initialManagementRequests: LeaveItem[] = [
  {
    id: "m1",
    facultyName: "Prof. Anika Rao",
    startDate: "2026-04-06",
    endDate: "2026-04-06",
    reason: "Medical appointment",
    status: "Pending",
  },
  {
    id: "m2",
    facultyName: "Prof. Kiran Mehta",
    startDate: "2026-04-08",
    endDate: "2026-04-09",
    reason: "Conference duty",
    status: "Pending",
  },
]

export default function LeavePage() {
  const [role, setRole] = useState<"admin" | "faculty">("faculty")

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [myRequests, setMyRequests] = useState<LeaveItem[]>([])

  const [managementRequests, setManagementRequests] = useState<LeaveItem[]>(initialManagementRequests)

  useEffect(() => {
    const loadRole = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle()

        if (profile?.role === "admin") {
          setRole("admin")
        }
      } catch {
        setRole("faculty")
      }
    }

    void loadRole()
  }, [])

  const applyLeave = () => {
    if (!startDate || !endDate || !reason.trim()) {
      toast.error("Please complete all fields")
      return
    }

    if (startDate > endDate) {
      toast.error("Start date cannot be after end date")
      return
    }

    setMyRequests((prev) => [
      {
        id: crypto.randomUUID(),
        facultyName: "Me",
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

  const approveRequest = (id: string) => {
    setManagementRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Approved" } : item)),
    )
    toast.success("Leave request approved")
  }

  const rejectRequest = (id: string) => {
    setManagementRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Rejected" } : item)),
    )
    toast.success("Leave request rejected")
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {role === "admin" ? "Leave Management" : "Apply Leave"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {role === "admin"
            ? "Review and manage faculty leave requests"
            : "Submit and track your leave requests"}
        </p>
      </div>

      {role === "admin" ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Pending and Recent Requests</h3>
          </div>

          <div className="space-y-3">
            {managementRequests.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{item.facultyName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.startDate} to {item.endDate}
                    </p>
                  </div>
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

                <p className="mb-3 text-sm text-muted-foreground">{item.reason}</p>

                {item.status === "Pending" ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => approveRequest(item.id)}>
                      <Check className="h-3 w-3" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => rejectRequest(item.id)}
                    >
                      <X className="h-3 w-3" />
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">New Request</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  className="mt-1.5"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  className="mt-1.5"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  className="mt-1.5"
                  rows={4}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Reason for leave"
                />
              </div>

              <Button className="w-full gap-2" onClick={applyLeave}>
                <Send className="h-4 w-4" />
                Submit Request
              </Button>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">My Leave Requests</h3>
            </div>

            {myRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leave requests submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {myRequests.map((item) => (
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
      )}
    </DashboardLayout>
  )
}
