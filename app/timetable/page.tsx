"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sparkles, Lock, Pencil, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { defaultAppSettings, loadAppSettings } from "@/lib/app-settings"
import { findSyllabusRecord, loadSyllabusRecords, type DepartmentCode } from "@/lib/syllabus-store"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const subjectsByDepartment: Record<string, string[]> = {
  cs: ["Data Structures", "Algorithms", "Database Systems", "Machine Learning", "Networks"],
  math: ["Linear Algebra", "Statistics", "Discrete Mathematics", "Calculus", "Probability"],
  physics: ["Quantum Physics", "Thermodynamics", "Optics", "Electromagnetism", "Mechanics"],
  eng: ["Engineering Drawing", "Materials Science", "Fluid Mechanics", "Control Systems", "CAD Lab"],
}

const facultyByDepartment: Record<string, string[]> = {
  cs: ["Dr. Miller", "Prof. Chen", "Dr. Kim", "Dr. Patel", "Prof. Lee"],
  math: ["Dr. Brown", "Prof. Singh", "Dr. Wang", "Prof. Gupta"],
  physics: ["Dr. Sharma", "Prof. Nair", "Dr. Iyer", "Prof. Bose"],
  eng: ["Dr. Rao", "Prof. Menon", "Dr. Thomas", "Prof. Kapoor"],
}

type Slot = {
  subject: string
  faculty: string
  room: string
  isBreak?: boolean
}

type Period = {
  key: string
  label: string
  isBreak: boolean
}

type TimetableGrid = Record<string, Record<string, Slot | null>>

type EditState = {
  day: string
  periodKey: string
}

type AllocationLookup = Record<string, { subject: string }>

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

function toLabel(totalMinutes: number) {
  const hours24 = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const suffix = hours24 >= 12 ? "PM" : "AM"
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${suffix}`
}

function timeStringToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

function formatTimeRange(start: string, end: string) {
  return `${toLabel(timeStringToMinutes(start))} - ${toLabel(timeStringToMinutes(end))}`
}

function buildPeriods(
  startTime: string,
  endTime: string,
  breakStart: string,
  breakEnd: string,
  duration: number,
): Period[] {
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  const breakStartMin = toMinutes(breakStart)
  const breakEndMin = toMinutes(breakEnd)

  const rows: Period[] = []
  let cursor = start

  while (cursor + duration <= end) {
    const next = cursor + duration
    const intersectsBreak = cursor < breakEndMin && next > breakStartMin

    rows.push({
      key: `${cursor}-${next}`,
      label: `${toLabel(cursor)} - ${toLabel(next)}`,
      isBreak: intersectsBreak,
    })

    cursor = next
  }

  return rows
}

function generateTimetable(
  periodRows: Period[],
  department: string,
  section: string,
  semester: string,
  subjectPool?: string[],
): TimetableGrid {
  const subjects =
    subjectPool && subjectPool.length > 0
      ? subjectPool
      : subjectsByDepartment[department] ?? subjectsByDepartment.cs
  const facultyList = facultyByDepartment[department] ?? facultyByDepartment.cs

  const table: TimetableGrid = {}
  let slotIndex = 0

  for (const day of days) {
    table[day] = {}

    for (const period of periodRows) {
      if (period.isBreak) {
        table[day][period.key] = {
          subject: "LUNCH BREAK",
          faculty: "",
          room: "",
          isBreak: true,
        }
        continue
      }

      if ((slotIndex + day.length) % 7 === 0) {
        table[day][period.key] = null
        slotIndex += 1
        continue
      }

      const subject = subjects[(slotIndex + day.length) % subjects.length]
      const faculty = facultyList[(slotIndex + Number(semester)) % facultyList.length]
      const room = `${department.toUpperCase()}-${100 + ((slotIndex + section.charCodeAt(0)) % 20)}`

      table[day][period.key] = {
        subject,
        faculty,
        room,
      }

      slotIndex += 1
    }
  }

  return table
}

export default function TimetablePage() {
  const [isLocked, setIsLocked] = useState(false)
  const [showTimetable, setShowTimetable] = useState(false)
  const [role, setRole] = useState<"admin" | "faculty">("admin")
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(false)

  const [semester, setSemester] = useState("6")
  const [section, setSection] = useState("A")
  const [department, setDepartment] = useState("cs")

  const [startTime, setStartTime] = useState(defaultAppSettings.startTime)
  const [endTime, setEndTime] = useState(defaultAppSettings.endTime)
  const [breakStart, setBreakStart] = useState(defaultAppSettings.breakStart)
  const [breakEnd, setBreakEnd] = useState(defaultAppSettings.breakEnd)
  const [periodDuration, setPeriodDuration] = useState(defaultAppSettings.periodDuration)

  const [periodRows, setPeriodRows] = useState<Period[]>([])
  const [timetable, setTimetable] = useState<TimetableGrid>({})

  const [editing, setEditing] = useState<EditState | null>(null)
  const [editSubject, setEditSubject] = useState("")
  const [editFaculty, setEditFaculty] = useState("")
  const [editRoom, setEditRoom] = useState("")

  useEffect(() => {
    const loadPageData = async () => {
      const supabase = createClient()
      const settings = loadAppSettings()
      setStartTime(settings.startTime)
      setEndTime(settings.endTime)
      setBreakStart(settings.breakStart)
      setBreakEnd(settings.breakEnd)
      setPeriodDuration(settings.periodDuration)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (profile?.role === "faculty") {
        setRole("faculty")
        setIsLocked(true)
        setShowTimetable(true)
        setIsLoadingAllocations(true)

        const { data: allocationsData, error: allocationsError } = await supabase
          .from("course_allocations")
          .select("id, courses(title)")
          .eq("faculty_id", user.id)

        if (allocationsError) {
          setIsLoadingAllocations(false)
          toast.error("Unable to load allocated timetable")
          return
        }

        const allocations = (allocationsData ?? []) as Array<{
          id: string
          courses: { title: string } | null
        }>

        if (allocations.length === 0) {
          setPeriodRows([])
          setTimetable({})
          setIsLoadingAllocations(false)
          return
        }

        const allocationLookup: AllocationLookup = Object.fromEntries(
          allocations.map((item) => [item.id, { subject: item.courses?.title ?? "Allocated Class" }]),
        )

        const allocationIds = allocations.map((item) => item.id)

        const { data: slotsData, error: slotsError } = await supabase
          .from("timetable_slots")
          .select("course_allocation_id, day_of_week, start_time, end_time, room")
          .in("course_allocation_id", allocationIds)

        if (slotsError) {
          setIsLoadingAllocations(false)
          toast.error("Unable to load allocated timetable slots")
          return
        }

        const slots = (slotsData ?? []) as Array<{
          course_allocation_id: string
          day_of_week: number
          start_time: string
          end_time: string
          room: string | null
        }>

        const periodMap = new Map<string, Period>()

        for (const slot of slots) {
          const key = `${slot.start_time}-${slot.end_time}`
          if (!periodMap.has(key)) {
            periodMap.set(key, {
              key,
              label: formatTimeRange(slot.start_time, slot.end_time),
              isBreak: false,
            })
          }
        }

        const rows = [...periodMap.values()].sort(
          (a, b) =>
            timeStringToMinutes(a.key.split("-")[0]) - timeStringToMinutes(b.key.split("-")[0]),
        )

        const dayMap: Record<number, string> = {
          1: "Monday",
          2: "Tuesday",
          3: "Wednesday",
          4: "Thursday",
          5: "Friday",
        }

        const facultyTable: TimetableGrid = {}
        for (const day of days) {
          facultyTable[day] = {}
          for (const row of rows) {
            facultyTable[day][row.key] = null
          }
        }

        for (const slot of slots) {
          const day = dayMap[slot.day_of_week]
          const periodKey = `${slot.start_time}-${slot.end_time}`
          if (!day || !facultyTable[day]) {
            continue
          }

          facultyTable[day][periodKey] = {
            subject: allocationLookup[slot.course_allocation_id]?.subject ?? "Allocated Class",
            faculty: "Assigned",
            room: slot.room ?? "TBD Room",
          }
        }

        setPeriodRows(rows)
        setTimetable(facultyTable)
        setIsLoadingAllocations(false)
      }
    }

    void loadPageData()
  }, [])

  const selectedDepartmentLabel = useMemo(() => {
    const labels: Record<string, string> = {
      cs: "Computer Science",
      math: "Mathematics",
      physics: "Physics",
      eng: "Engineering",
    }
    return labels[department] ?? "Computer Science"
  }, [department])

  const createSchedule = () => {
    const syllabi = loadSyllabusRecords()
    const matchedSyllabus = findSyllabusRecord(
      syllabi,
      semester,
      section,
      department as DepartmentCode,
    )

    if (!matchedSyllabus) {
      toast.error(
        `Upload syllabus for Semester ${semester}, Section ${section}, ${department.toUpperCase()} first`,
      )
      setShowTimetable(false)
      return
    }

    if (toMinutes(startTime) >= toMinutes(endTime)) {
      toast.error("Start time must be before end time")
      return
    }

    if (toMinutes(breakStart) >= toMinutes(breakEnd)) {
      toast.error("Break start must be before break end")
      return
    }

    if (periodDuration < 30) {
      toast.error("Period duration must be at least 30 minutes")
      return
    }

    const rows = buildPeriods(startTime, endTime, breakStart, breakEnd, periodDuration)

    if (rows.length === 0) {
      toast.error("No valid periods generated. Check timings and duration.")
      return
    }

    const subjectsFromSyllabus =
      matchedSyllabus.generatedSubjects?.length > 0
        ? matchedSyllabus.generatedSubjects
        : matchedSyllabus.keywords

    setPeriodRows(rows)
    setTimetable(generateTimetable(rows, department, section, semester, subjectsFromSyllabus))
    setShowTimetable(true)
    toast.success(`Timetable generated using syllabus: ${matchedSyllabus.fileName}`)
  }

  const openEditor = (day: string, periodKey: string) => {
    const current = timetable[day]?.[periodKey]

    if (current?.isBreak) {
      return
    }

    setEditing({ day, periodKey })
    setEditSubject(current?.subject ?? "")
    setEditFaculty(current?.faculty ?? "")
    setEditRoom(current?.room ?? "")
  }

  const saveEdit = () => {
    if (!editing) {
      return
    }

    if (!editSubject.trim()) {
      toast.error("Subject is required")
      return
    }

    setTimetable((prev) => ({
      ...prev,
      [editing.day]: {
        ...prev[editing.day],
        [editing.periodKey]: {
          subject: editSubject.trim(),
          faculty: editFaculty.trim() || "TBD Faculty",
          room: editRoom.trim() || "TBD Room",
        },
      },
    }))

    setEditing(null)
    toast.success("Slot updated")
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timetable Management</h1>
          <p className="text-sm text-muted-foreground">
            {role === "faculty"
              ? "Your timetable is shown from admin allocations"
              : "Generate and manage class schedules"}
          </p>
        </div>
        {role === "admin" ? <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={createSchedule}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button
            className={cn("gap-2", isLocked && "bg-accent hover:bg-accent/90")}
            onClick={() => setIsLocked((prev) => !prev)}
          >
            <Lock className="h-4 w-4" />
            {isLocked ? "Locked" : "Lock Timetable"}
          </Button>
        </div> : null}
      </div>

      <div className={cn("grid grid-cols-1 gap-6", role === "admin" ? "lg:grid-cols-4" : "lg:grid-cols-1")}>
        {role === "admin" ? <Card className="p-6 lg:col-span-1">
          <h3 className="mb-4 text-lg font-semibold">Configuration</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger id="semester" className="mt-1.5">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="section">Section</Label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger id="section" className="mt-1.5">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((sec) => (
                    <SelectItem key={sec} value={sec}>
                      Section {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department" className="mt-1.5">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="eng">Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                className="mt-1.5"
                onChange={(event) => setStartTime(event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                className="mt-1.5"
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="period-duration">Period Duration (minutes)</Label>
              <Input
                id="period-duration"
                type="number"
                min={30}
                max={180}
                value={periodDuration}
                className="mt-1.5"
                onChange={(event) => setPeriodDuration(Number(event.target.value || 60))}
              />
            </div>

            <div>
              <Label htmlFor="break-start">Break Time</Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  id="break-start"
                  type="time"
                  value={breakStart}
                  onChange={(event) => setBreakStart(event.target.value)}
                />
                <Input
                  type="time"
                  value={breakEnd}
                  onChange={(event) => setBreakEnd(event.target.value)}
                />
              </div>
            </div>

            <Button className="w-full gap-2" onClick={createSchedule}>
              <Sparkles className="h-4 w-4" />
              Generate Timetable
            </Button>
          </div>
        </Card> : null}

        <Card className={cn("overflow-hidden p-6", role === "admin" ? "lg:col-span-3" : "lg:col-span-1")}>
          {showTimetable ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {role === "faculty" ? "My Allocated Timetable" : `Semester ${semester} - Section ${section}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {role === "faculty" ? "Allocated by admin" : `${selectedDepartmentLabel} Department`}
                  </p>
                </div>
                {isLocked && (
                  <span className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                    <Lock className="h-3 w-3" />
                    Confirmed
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border bg-muted/50 p-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                        Time
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="border border-border bg-muted/50 p-3 text-center text-xs font-semibold uppercase text-muted-foreground"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periodRows.map((period) => (
                      <tr key={period.key}>
                        <td className="border border-border bg-muted/30 p-3 text-sm font-medium text-muted-foreground">
                          {period.label}
                        </td>
                        {days.map((day) => {
                          const slot = timetable[day]?.[period.key]
                          return (
                            <td
                              key={`${day}-${period.key}`}
                              className={cn("border border-border p-2 text-center", slot?.isBreak && "bg-muted/50")}
                            >
                              {slot ? (
                                slot.isBreak ? (
                                  <span className="text-xs font-medium text-muted-foreground">{slot.subject}</span>
                                ) : (
                                  <div className="group relative rounded-lg bg-primary/10 p-2">
                                    <p className="text-xs font-semibold text-primary">{slot.subject}</p>
                                    <p className="text-xs text-muted-foreground">{slot.faculty}</p>
                                    <p className="text-xs text-muted-foreground">{slot.room}</p>
                                    {!isLocked && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute -right-1 -top-1 hidden h-6 w-6 group-hover:flex"
                                        onClick={() => openEditor(day, period.key)}
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                )
                              ) : isLocked ? (
                                <span className="text-xs text-muted-foreground">-</span>
                              ) : (
                                <Button variant="ghost" size="sm" onClick={() => openEditor(day, period.key)}>
                                  Add
                                </Button>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {role === "faculty" && isLoadingAllocations ? (
                <p className="mt-4 text-sm text-muted-foreground">Loading your allocations...</p>
              ) : null}

              {role === "faculty" && !isLoadingAllocations && periodRows.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No timetable allocated yet. Please contact admin for allocation.
                </p>
              ) : null}
            </>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Generate Timetable</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Configure the settings and click Generate Timetable to create a schedule from your inputs.
              </p>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(value) => !value && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timetable Slot</DialogTitle>
            <DialogDescription>
              Update subject, faculty, and room details for the selected period.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-subject">Subject</Label>
              <Input
                id="edit-subject"
                value={editSubject}
                onChange={(event) => setEditSubject(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-faculty">Faculty</Label>
              <Input
                id="edit-faculty"
                value={editFaculty}
                onChange={(event) => setEditFaculty(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-room">Room</Label>
              <Input
                id="edit-room"
                value={editRoom}
                onChange={(event) => setEditRoom(event.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Slot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
