"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, X, FileText, Download, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApprovalRequest {
  id: string
  faculty: {
    name: string
    initials: string
    color: string
  }
  qualification: string
  submittedAt: string
  certificates: string[]
}

const pendingApprovals: ApprovalRequest[] = [
  {
    id: "1",
    faculty: {
      name: "Dr. Sarah Miller",
      initials: "SM",
      color: "bg-accent",
    },
    qualification: "Ph.D. Computer Science - Stanford University",
    submittedAt: "2 days ago",
    certificates: ["PhD_Certificate.pdf", "Research_Publications.pdf"],
  },
  {
    id: "2",
    faculty: {
      name: "Dr. Michael Chen",
      initials: "MC",
      color: "bg-chart-3",
    },
    qualification: "M.Sc. Applied Mathematics - MIT",
    submittedAt: "3 days ago",
    certificates: ["Masters_Degree.pdf", "Teaching_Certificate.pdf"],
  },
  {
    id: "3",
    faculty: {
      name: "Prof. Lisa Park",
      initials: "LP",
      color: "bg-primary",
    },
    qualification: "Ph.D. Mechanical Engineering - Caltech",
    submittedAt: "5 days ago",
    certificates: ["PhD_Certificate.pdf", "Industry_Experience.pdf", "Patents.pdf"],
  },
]

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState(pendingApprovals)

  const handleApprove = (id: string) => {
    setApprovals(approvals.filter((a) => a.id !== id))
  }

  const handleReject = (id: string) => {
    setApprovals(approvals.filter((a) => a.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Qualification Approvals</h1>
        <p className="text-sm text-muted-foreground">Review and approve faculty qualification requests</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-2xl font-bold text-warning-foreground">{approvals.length}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-accent">24</p>
          <p className="text-sm text-muted-foreground">Approved This Month</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-destructive">3</p>
          <p className="text-sm text-muted-foreground">Rejected This Month</p>
        </Card>
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <Check className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">All Caught Up!</h3>
            <p className="text-sm text-muted-foreground">No pending approval requests at the moment.</p>
          </Card>
        ) : (
          approvals.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={cn(request.faculty.color, "text-white font-semibold")}>
                      {request.faculty.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{request.faculty.name}</h3>
                    <p className="text-sm text-muted-foreground">{request.qualification}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Submitted {request.submittedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 border-accent text-accent hover:bg-accent hover:text-white"
                    onClick={() => handleApprove(request.id)}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => handleReject(request.id)}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>

              {/* Certificates */}
              <div className="mt-4 border-t border-border pt-4">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Uploaded Certificates</h4>
                <div className="flex flex-wrap gap-2">
                  {request.certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{cert}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
