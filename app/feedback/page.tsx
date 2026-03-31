"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, MessageSquare, Star, Users } from "lucide-react"
import { toast } from "sonner"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { hasSupabaseEnv } from "@/lib/supabase/config"
import { defaultAppSettings, loadAppSettings, saveAppSettings } from "@/lib/app-settings"
import { loadStudentAccessContext } from "@/lib/student-access"

type Role = "student" | "faculty" | "admin"

type FacultyOption = {
  id: string
  fullName: string
}

type AllocationFacultyRow = {
  profiles: { id: string; full_name: string | null } | null
}

type FeedbackRow = {
  id: string
  semester: number
  section: string
  rating: number
  comment: string
  created_at: string
  departments: { name: string | null } | null
  student: { full_name: string | null } | null
  faculty: { full_name: string | null } | null
}

function normalizeRole(roleValue: unknown): Role | null {
  if (roleValue === "student" || roleValue === "faculty" || roleValue === "admin") {
    return roleValue
  }

  return null
}

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/\"/g, '""')}"`
  }

  return value
}

function StudentFeedbackView({
  isEnabled,
  studentName,
  userId,
}: {
  isEnabled: boolean
  studentName: string
  userId: string
}) {
  const envReady = useMemo(() => hasSupabaseEnv(), [])
  const [departmentName, setDepartmentName] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [semester, setSemester] = useState("1")
  const [section, setSection] = useState("A")
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([])
  const [facultyId, setFacultyId] = useState("")
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(false)

  useEffect(() => {
    const context = loadStudentAccessContext()
    setDepartmentId(context.departmentId)
    setDepartmentName(context.departmentName)
    setSemester(context.semester)
    setSection(context.section)
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadFaculty() {
      if (!envReady || !departmentId || !semester || !section) {
        return
      }

      setIsLoadingFaculty(true)

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("course_allocations")
          .select("profiles!course_allocations_faculty_id_fkey(id, full_name), courses!inner(department_id)")
          .eq("semester", Number(semester))
          .eq("section", section)
          .eq("courses.department_id", departmentId)

        if (error) {
          throw error
        }

        if (!mounted) {
          return
        }

        const rows = (data ?? []) as AllocationFacultyRow[]
        const uniqueFaculty = rows.reduce<FacultyOption[]>((accumulator, row) => {
          const facultyProfile = row.profiles
          if (!facultyProfile) {
            return accumulator
          }

          if (accumulator.some((item) => item.id === facultyProfile.id)) {
            return accumulator
          }

          accumulator.push({
            id: facultyProfile.id,
            fullName: facultyProfile.full_name ?? "Faculty",
          })
          return accumulator
        }, [])

        setFacultyOptions(uniqueFaculty)
        setFacultyId(uniqueFaculty[0]?.id ?? "")
      } catch {
        if (mounted) {
          setFacultyOptions([])
          setFacultyId("")
          toast.error("Unable to load faculty for your class context.")
        }
      } finally {
        if (mounted) {
          setIsLoadingFaculty(false)
        }
      }
    }

    void loadFaculty()

    return () => {
      mounted = false
    }
  }, [departmentId, envReady, section, semester])

  const canSubmit = isEnabled && Boolean(departmentId) && Boolean(facultyId)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("feedback_submissions").insert({
        student_id: userId,
        faculty_id: facultyId,
        department_id: departmentId,
        semester: Number(semester),
        section,
        rating,
        comment,
      })

      if (error) {
        throw error
      }

      setComment("")
      setRating(5)
      toast.success("Feedback submitted successfully.")
    } catch {
      toast.error("Unable to submit feedback right now.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Student Feedback</h1>
            <Badge variant="secondary">{isEnabled ? "Collection Open" : "Collection Closed"}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Feedback is linked to your department, semester, and section selected in Student Access.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium">{departmentName || "Not selected"}</p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Semester</p>
              <p className="font-medium">{semester}</p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Section</p>
              <p className="font-medium">{section}</p>
            </div>
          </div>

          {!departmentId ? (
            <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
              Select your department in Student Access before submitting feedback.
            </div>
          ) : null}

          {!isEnabled ? (
            <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
              Feedback is currently disabled by admin.
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="faculty">Faculty</Label>
              <Select value={facultyId} onValueChange={setFacultyId}>
                <SelectTrigger id="faculty" className="mt-1.5 w-full">
                  <SelectValue placeholder={isLoadingFaculty ? "Loading faculty..." : "Select faculty"} />
                </SelectTrigger>
                <SelectContent>
                  {facultyOptions.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Rating</Label>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-md p-1"
                    aria-label={`Rate ${value}`}
                  >
                    <Star
                      className={`h-6 w-6 ${value <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                className="mt-1.5"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share what worked well and what can be improved."
                required
                minLength={10}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
              <Button asChild variant="outline">
                <Link href="/student-dashboard">Back to Student Access</Link>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}

function AdminFeedbackView({ role }: { role: "admin" | "faculty" }) {
  const envReady = useMemo(() => hasSupabaseEnv(), [])
  const [settings, setSettings] = useState(defaultAppSettings)
  const [filterSemester, setFilterSemester] = useState("all")
  const [filterSection, setFilterSection] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [submissions, setSubmissions] = useState<FeedbackRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const isAdmin = role === "admin"

  useEffect(() => {
    let mounted = true

    async function loadData() {
      setSettings(loadAppSettings())

      if (!envReady) {
        if (mounted) {
          setSubmissions([])
          setIsLoading(false)
        }
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("feedback_submissions")
          .select(
            "id, semester, section, rating, comment, created_at, departments(name), student:profiles!feedback_submissions_student_id_fkey(full_name), faculty:profiles!feedback_submissions_faculty_id_fkey(full_name)",
          )
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        if (mounted) {
          setSubmissions((data ?? []) as FeedbackRow[])
        }
      } catch {
        if (mounted) {
          toast.error("Unable to load feedback submissions.")
          setSubmissions([])
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      mounted = false
    }
  }, [envReady])

  const filtered = submissions.filter((item) => {
    const departmentName = item.departments?.name ?? ""
    const matchesSemester = filterSemester === "all" || item.semester.toString() === filterSemester
    const matchesSection = filterSection === "all" || item.section === filterSection
    const matchesDepartment = filterDepartment === "all" || departmentName === filterDepartment
    return matchesSemester && matchesSection && matchesDepartment
  })

  const averageRating =
    filtered.length === 0
      ? 0
      : filtered.reduce((sum, item) => sum + item.rating, 0) / filtered.length

  const departments = Array.from(
    new Set(submissions.map((item) => item.departments?.name ?? "").filter(Boolean)),
  )

  const toggleCollection = (value: boolean) => {
    if (!isAdmin) {
      toast.error("Only admin can change feedback collection state.")
      return
    }

    const updated = { ...settings, feedbackCollectionEnabled: value }
    setSettings(updated)
    saveAppSettings(updated)
    toast.success(`Feedback collection ${value ? "enabled" : "disabled"}.`)
  }

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("No feedback data to export for current filters.")
      return
    }

    const header = [
      "Submitted At",
      "Department",
      "Semester",
      "Section",
      "Faculty",
      "Student",
      "Rating",
      "Comment",
    ]

    const body = filtered.map((item) => [
      new Date(item.created_at).toISOString(),
      item.departments?.name ?? "",
      item.semester.toString(),
      item.section,
      item.faculty?.full_name ?? "",
      item.student?.full_name ?? "",
      item.rating.toString(),
      item.comment,
    ])

    const csv = [header, ...body]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `feedback-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Feedback Control</h1>
            <p className="text-sm text-muted-foreground">
              Feedback is grouped by department, semester, and section.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-md border bg-background px-4 py-2">
              <span className="text-sm text-muted-foreground">Feedback Collection</span>
              <Switch
                checked={settings.feedbackCollectionEnabled}
                onCheckedChange={toggleCollection}
                disabled={!isAdmin}
              />
              <span className="text-sm font-medium text-foreground">
                {settings.feedbackCollectionEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            <Button type="button" variant="outline" className="gap-2" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{filtered.length}</p>
                <p className="text-xs text-muted-foreground">Filtered Responses</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-chart-3" />
              <div>
                <p className="text-2xl font-bold">{departments.length}</p>
                <p className="text-xs text-muted-foreground">Departments with Responses</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label>Department</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Semester</Label>
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="All semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All semesters</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Section</Label>
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="All sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sections</SelectItem>
                  {["A", "B", "C", "D"].map((section) => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Feedback</h2>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading feedback submissions...</p>
          ) : null}

          {!isLoading && filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedback submissions found for selected filters.</p>
          ) : null}

          {!isLoading && filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((item) => (
                <div key={item.id} className="rounded-md border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{item.faculty?.full_name ?? "Faculty"}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.departments?.name ?? "Department"} | Sem {item.semester} | Sec {item.section}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < item.rating ? "fill-accent text-accent" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.comment}</p>
                  <p className="mt-2 text-xs text-muted-foreground">By {item.student?.full_name ?? "Student"}</p>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function FeedbackPage() {
  const router = useRouter()
  const envReady = useMemo(() => hasSupabaseEnv(), [])
  const [role, setRole] = useState<Role | null>(null)
  const [userId, setUserId] = useState("")
  const [studentName, setStudentName] = useState("Student")
  const [feedbackEnabled, setFeedbackEnabled] = useState(defaultAppSettings.feedbackCollectionEnabled)

  useEffect(() => {
    let mounted = true

    async function initialize() {
      if (!envReady) {
        if (mounted) {
          setRole("student")
          setFeedbackEnabled(defaultAppSettings.feedbackCollectionEnabled)
        }
        return
      }

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!mounted) {
          return
        }

        if (!user) {
          router.replace("/login?next=/feedback")
          return
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .maybeSingle()

        if (!mounted) {
          return
        }

        const resolvedRole = normalizeRole(profile?.role) ?? normalizeRole(user.user_metadata?.role) ?? "student"
        setRole(resolvedRole)
        setUserId(user.id)
        setStudentName(profile?.full_name ?? (user.user_metadata?.full_name as string) ?? "Student")
        setFeedbackEnabled(loadAppSettings().feedbackCollectionEnabled)
      } catch {
        if (mounted) {
          setRole("student")
          setFeedbackEnabled(loadAppSettings().feedbackCollectionEnabled)
        }
      }
    }

    void initialize()

    return () => {
      mounted = false
    }
  }, [envReady, router])

  if (!role) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-10">
        <p className="text-sm text-muted-foreground">Loading feedback portal...</p>
      </main>
    )
  }

  if (role === "student") {
    return <StudentFeedbackView isEnabled={feedbackEnabled} studentName={studentName} userId={userId} />
  }

  return <AdminFeedbackView role={role} />
}
