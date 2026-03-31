"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Search, Eye, Check, X, Video, FileText, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Faculty {
  id: string
  name: string
  email: string
  qualification: string
  department: string
  status: "Approved" | "Pending" | "Rejected"
  initials: string
  color: string
  certificates: string[]
}

const facultyData: Faculty[] = [
  {
    id: "1",
    name: "Prof. James Dower",
    email: "james.dower@university.edu",
    qualification: "Ph.D. Quantum Physics",
    department: "Physics",
    status: "Approved",
    initials: "JD",
    color: "bg-primary",
    certificates: ["PhD Certificate", "Research Excellence Award"],
  },
  {
    id: "2",
    name: "Dr. Sarah Miller",
    email: "sarah.miller@university.edu",
    qualification: "Ph.D. Computer Science",
    department: "Computer Science",
    status: "Pending",
    initials: "SM",
    color: "bg-accent",
    certificates: ["PhD Certificate", "Teaching Certification"],
  },
  {
    id: "3",
    name: "Dr. Michael Chen",
    email: "michael.chen@university.edu",
    qualification: "M.Sc. Mathematics",
    department: "Mathematics",
    status: "Pending",
    initials: "MC",
    color: "bg-chart-3",
    certificates: ["Masters Degree", "Professional Certification"],
  },
  {
    id: "4",
    name: "Prof. Emily Watson",
    email: "emily.watson@university.edu",
    qualification: "Ph.D. Literature",
    department: "Humanities",
    status: "Approved",
    initials: "EW",
    color: "bg-chart-4",
    certificates: ["PhD Certificate"],
  },
  {
    id: "5",
    name: "Dr. Robert Kim",
    email: "robert.kim@university.edu",
    qualification: "Ph.D. Management",
    department: "Management",
    status: "Rejected",
    initials: "RK",
    color: "bg-destructive",
    certificates: ["PhD Certificate"],
  },
]

export default function FacultyPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredFaculty = facultyData.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Management</h1>
          <p className="text-sm text-muted-foreground">Manage faculty members and qualifications</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Faculty
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search faculty by name, email, or department..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">All Departments</Button>
          <Button variant="outline">All Status</Button>
        </div>
      </Card>

      {/* Faculty Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Faculty Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Qualification
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Department
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
              {filteredFaculty.map((faculty) => (
                <tr key={faculty.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn(faculty.color, "text-white text-sm font-semibold")}>
                          {faculty.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{faculty.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{faculty.email}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{faculty.qualification}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{faculty.department}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        faculty.status === "Approved" && "bg-accent/20 text-accent",
                        faculty.status === "Pending" && "bg-warning/20 text-warning-foreground",
                        faculty.status === "Rejected" && "bg-destructive/10 text-destructive"
                      )}
                    >
                      {faculty.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedFaculty(faculty)
                          setIsModalOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {faculty.status === "Pending" && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-accent hover:bg-accent/20"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        disabled={faculty.status !== "Pending"}
                      >
                        <Video className="h-3 w-3" />
                        Request Demo
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Faculty Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Faculty Details</DialogTitle>
            <DialogDescription>View uploaded certificates and qualifications</DialogDescription>
          </DialogHeader>
          {selectedFaculty && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className={cn(selectedFaculty.color, "text-white text-xl font-semibold")}>
                    {selectedFaculty.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedFaculty.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedFaculty.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedFaculty.department}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-medium">Qualification</h4>
                <p className="text-sm text-muted-foreground">{selectedFaculty.qualification}</p>
              </div>

              <div>
                <h4 className="mb-2 font-medium">Uploaded Certificates</h4>
                <div className="space-y-2">
                  {selectedFaculty.certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{cert}</span>
                      <Button size="sm" variant="ghost" className="ml-auto">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
