"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, X, UserCheck, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface LeaveRequest {
  id: string
  faculty: {
    name: string
    initials: string
    color: string
    department: string
  }
  date: string
  period: string
  reason: string
  status: "Pending" | "Approved" | "Rejected"
}

interface SubstituteFaculty {
  id: string
  name: string
  initials: string
  color: string
  available: boolean
  rating: number
}

const leaveRequests: LeaveRequest[] = [
  {
    id: "1",
    faculty: {
      name: "Prof. James Dower",
      initials: "JD",
      color: "bg-primary",
      department: "Physics",
    },
    date: "April 2, 2026",
    period: "Morning Session (9 AM - 12 PM)",
    reason: "Medical appointment",
    status: "Pending",
  },
  {
    id: "2",
    faculty: {
      name: "Dr. Sarah Miller",
      initials: "SM",
      color: "bg-accent",
      department: "Computer Science",
    },
    date: "April 3, 2026",
    period: "Full Day",
    reason: "Family emergency",
    status: "Pending",
  },
  {
    id: "3",
    faculty: {
      name: "Dr. Michael Chen",
      initials: "MC",
      color: "bg-chart-3",
      department: "Mathematics",
    },
    date: "April 5, 2026",
    period: "Afternoon Session (2 PM - 5 PM)",
    reason: "Conference attendance",
    status: "Pending",
  },
]

const suggestedSubstitutes: SubstituteFaculty[] = [
  {
    id: "1",
    name: "Prof. Lisa Park",
    initials: "LP",
    color: "bg-chart-4",
    available: true,
    rating: 4.9,
  },
  {
    id: "2",
    name: "Dr. Robert Kim",
    initials: "RK",
    color: "bg-chart-5",
    available: true,
    rating: 4.7,
  },
  {
    id: "3",
    name: "Prof. Emily Watson",
    initials: "EW",
    color: "bg-primary",
    available: false,
    rating: 4.8,
  },
]

export default function LeavePage() {
  const [requests, setRequests] = useState(leaveRequests)
  const [showSubstitutes, setShowSubstitutes] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)

  const handleApprove = (id: string) => {
    const request = requests.find((r) => r.id === id)
    if (request) {
      setSelectedRequest(request)
      setShowSubstitutes(true)
    }
  }

  const handleReject = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "Rejected" as const } : r)))
  }

  const handleAssignSubstitute = () => {
    if (selectedRequest) {
      setRequests(
        requests.map((r) =>
          r.id === selectedRequest.id ? { ...r, status: "Approved" as const } : r
        )
      )
    }
    setShowSubstitutes(false)
    setSelectedRequest(null)
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
        <p className="text-sm text-muted-foreground">Review and manage faculty leave requests</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-2xl font-bold text-warning-foreground">
            {requests.filter((r) => r.status === "Pending").length}
          </p>
          <p className="text-sm text-muted-foreground">Pending Requests</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-accent">
            {requests.filter((r) => r.status === "Approved").length}
          </p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-destructive">
            {requests.filter((r) => r.status === "Rejected").length}
          </p>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-primary">12</p>
          <p className="text-sm text-muted-foreground">Substitutes Available</p>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Faculty
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reason
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className={cn(request.faculty.color, "text-white text-sm font-semibold")}
                        >
                          {request.faculty.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{request.faculty.name}</p>
                        <p className="text-xs text-muted-foreground">{request.faculty.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {request.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{request.period}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{request.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        request.status === "Approved" && "bg-accent/20 text-accent",
                        request.status === "Pending" && "bg-warning/20 text-warning-foreground",
                        request.status === "Rejected" && "bg-destructive/10 text-destructive"
                      )}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {request.status === "Pending" ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-accent text-accent hover:bg-accent hover:text-white"
                          onClick={() => handleApprove(request.id)}
                        >
                          <Check className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                          onClick={() => handleReject(request.id)}
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Substitute Selection Dialog */}
      <Dialog open={showSubstitutes} onOpenChange={setShowSubstitutes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Substitute Faculty</DialogTitle>
            <DialogDescription>
              Select a substitute for {selectedRequest?.faculty.name}&apos;s classes on{" "}
              {selectedRequest?.date}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Suggested Substitutes</p>
            {suggestedSubstitutes.map((sub) => (
              <div
                key={sub.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border border-border p-3",
                  !sub.available && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn(sub.color, "text-white text-sm font-semibold")}>
                      {sub.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{sub.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Rating: {sub.rating}</span>
                      <span
                        className={cn(
                          "text-xs",
                          sub.available ? "text-accent" : "text-destructive"
                        )}
                      >
                        {sub.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={!sub.available}
                  onClick={handleAssignSubstitute}
                  className="gap-1"
                >
                  <UserCheck className="h-3 w-3" />
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
