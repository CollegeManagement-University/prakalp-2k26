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
import {
  Sparkles,
  Lock,
  LockOpen,
  Pencil,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Printer,
  ShieldAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { defaultAppSettings, loadAppSettings } from "@/lib/app-settings"
import { findSyllabusRecord, loadSyllabusRecords, type DepartmentCode } from "@/lib/syllabus-store"
import { departmentLabelByCode, departmentOptions } from "@/lib/departments"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const allDays = [...weekdays, "Saturday"]

const subjectsByDepartment: Record<string, string[]> = {
  cs: ["Data Structures", "Algorithms", "Database Systems", "Machine Learning", "Networks"],
  it: ["Web Technologies", "Network Security", "Cloud Fundamentals", "Database Systems", "DevOps"],
  mech: ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing", "Engineering Materials"],
  civil: ["Structural Analysis", "Surveying", "Geotechnical Engineering", "Construction Planning", "Transportation Engineering"],
  aiml: ["Machine Learning", "Deep Learning", "Neural Networks", "Computer Vision", "Natural Language Processing"],
  aids: ["Data Mining", "Statistics for AI", "Machine Learning", "Big Data Analytics", "Data Visualization"],
  csd: ["Design Thinking", "UI/UX Fundamentals", "Data Structures", "Web Technologies", "Interaction Design"],
  math: ["Linear Algebra", "Statistics", "Discrete Mathematics", "Calculus", "Probability"],
  physics: ["Quantum Physics", "Thermodynamics", "Optics", "Electromagnetism", "Mechanics"],
  eng: ["Engineering Drawing", "Materials Science", "Fluid Mechanics", "Control Systems", "CAD Lab"],
}

const facultyByDepartment: Record<string, string[]> = {
  cs: ["Dr. Miller", "Prof. Chen", "Dr. Kim", "Dr. Patel", "Prof. Lee"],
  it: ["Dr. Rhea", "Prof. Sanjay", "Dr. Mehta", "Prof. Kunal", "Dr. Nina"],
  mech: ["Dr. Arjun", "Prof. Kumar", "Dr. Reddy", "Prof. Vijay", "Dr. Nair"],
  civil: ["Dr. Iqbal", "Prof. Suresh", "Dr. Priyanka", "Prof. Anil", "Dr. Rekha"],
  aiml: ["Dr. Kavya", "Prof. Rahul", "Dr. Arav", "Prof. Sneha", "Dr. Arpit"],
  aids: ["Dr. Latha", "Prof. Nikhil", "Dr. Tejas", "Prof. Bhavna", "Dr. Gopal"],
  csd: ["Dr. Sonia", "Prof. Vivek", "Dr. Aditi", "Prof. Rohan", "Dr. Ishan"],
  math: ["Dr. Brown", "Prof. Singh", "Dr. Wang", "Prof. Gupta"],
  physics: ["Dr. Sharma", "Prof. Nair", "Dr. Iyer", "Prof. Bose"],
  eng: ["Dr. Rao", "Prof. Menon", "Dr. Thomas", "Prof. Kapoor"],
}

const nonTeachingSubjects = new Set(["year", "syllabus", "lunch break", "break", "no class"])

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

type SubjectConstraint = {
  min: number
  max: number
}

type SubjectConstraintMap = Record<string, SubjectConstraint>

type ConflictItem = {
  type: "room" | "faculty"
  day: string
  periodKey: string
  value: string
}

function isTeachingSubject(value: string) {
  const normalized = value.trim().toLowerCase()
  return Boolean(normalized) && !nonTeachingSubjects.has(normalized)
}

function slotKey(day: string, periodKey: string) {
  return `${day}__${periodKey}`
}

function activeDaysFromSettings(saturdayWorking: boolean) {
  return saturdayWorking ? allDays : weekdays
}

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

function detectConflicts(table: TimetableGrid, rows: Period[], days: string[]) {
  const roomMap = new Map<string, Slot[]>()
  const facultyMap = new Map<string, Slot[]>()

  for (const day of days) {
    for (const row of rows) {
      const slot = table[day]?.[row.key]
      if (!slot || slot.isBreak) {
        continue
      }

      const roomKey = `${day}|${row.key}|${slot.room.trim().toLowerCase()}`
      const facultyKey = `${day}|${row.key}|${slot.faculty.trim().toLowerCase()}`

      roomMap.set(roomKey, [...(roomMap.get(roomKey) ?? []), slot])
      facultyMap.set(facultyKey, [...(facultyMap.get(facultyKey) ?? []), slot])
    }
  }

  const conflicts: ConflictItem[] = []

  roomMap.forEach((slots, key) => {
    if (slots.length <= 1) {
      return
    }
    const [day, periodKey, value] = key.split("|")
    conflicts.push({ type: "room", day, periodKey, value })
  })

  facultyMap.forEach((slots, key) => {
    if (slots.length <= 1) {
      return
    }
    const [day, periodKey, value] = key.split("|")
    conflicts.push({ type: "faculty", day, periodKey, value })
  })

  return conflicts
}

function sanitizeConstraintMap(subjects: string[], constraints: SubjectConstraintMap) {
  const next: SubjectConstraintMap = {}
  for (const subject of subjects) {
    const current = constraints[subject] ?? { min: 2, max: 6 }
    const min = Math.max(0, Math.min(current.min, 30))
    const max = Math.max(min, Math.min(current.max, 40))
    next[subject] = { min, max }
  }
  return next
}

function generateTimetable(
  periodRows: Period[],
  activeDays: string[],
  saturdayMode: "half-day" | "full-day",
  department: string,
  section: string,
  semester: string,
  subjectPool: string[],
  subjectConstraints: SubjectConstraintMap,
  lockedKeys: Set<string>,
  existingTimetable: TimetableGrid,
): TimetableGrid {
  const subjects = Array.from(new Set(subjectPool.filter(isTeachingSubject)))
  const facultyList = facultyByDepartment[department] ?? facultyByDepartment.cs

  const subjectFacultyMap = new Map(subjects.map((subject, index) => [subject, facultyList[index % facultyList.length]]))
  const table: TimetableGrid = {}

  const periodIndexByKey = new Map(periodRows.map((row, index) => [row.key, index]))
  const candidateSlots: Array<{ day: string; periodKey: string; periodIndex: number }> = []
  const subjectCounts = new Map<string, number>()

  for (const day of activeDays) {
    table[day] = {}

    const dayRows = periodRows.filter((row) => !row.isBreak)
    const allowedRowsCount =
      day === "Saturday" && saturdayMode === "half-day"
        ? Math.max(1, Math.ceil(dayRows.length / 2))
        : dayRows.length

    let teachingIndex = 0
    for (const row of periodRows) {
      if (row.isBreak) {
        table[day][row.key] = { subject: "LUNCH BREAK", faculty: "", room: "", isBreak: true }
        continue
      }

      if (teachingIndex >= allowedRowsCount) {
        table[day][row.key] = { subject: "NO CLASS", faculty: "", room: "", isBreak: true }
        teachingIndex += 1
        continue
      }

      const key = slotKey(day, row.key)
      const existing = existingTimetable[day]?.[row.key]
      if (lockedKeys.has(key) && existing && !existing.isBreak && isTeachingSubject(existing.subject)) {
        table[day][row.key] = existing
        subjectCounts.set(existing.subject, (subjectCounts.get(existing.subject) ?? 0) + 1)
      } else {
        table[day][row.key] = null
        candidateSlots.push({ day, periodKey: row.key, periodIndex: periodIndexByKey.get(row.key) ?? 0 })
      }

      teachingIndex += 1
    }
  }

  if (subjects.length === 0 || candidateSlots.length === 0) {
    return table
  }

  const constraints = sanitizeConstraintMap(subjects, subjectConstraints)

  const canPlace = (subject: string, day: string, periodKey: string) => {
    const periodIndex = periodIndexByKey.get(periodKey) ?? 0

    if (periodIndex === 0) {
      const existingFirst = table[day]?.[periodKey]
      if (!existingFirst || existingFirst.isBreak) {
        return true
      }
    }

    const prev = periodRows[periodIndex - 1]
    if (prev) {
      const prevSlot = table[day]?.[prev.key]
      if (prevSlot && !prevSlot.isBreak && prevSlot.subject === subject) {
        return false
      }
    }

    const next = periodRows[periodIndex + 1]
    if (next) {
      const nextSlot = table[day]?.[next.key]
      if (nextSlot && !nextSlot.isBreak && nextSlot.subject === subject) {
        return false
      }
    }

    return true
  }

  const assign = (subject: string, day: string, periodKey: string, slotIndexSeed: number) => {
    const room = `${department.toUpperCase()}-${100 + ((slotIndexSeed + section.charCodeAt(0)) % 20)}`
    table[day][periodKey] = {
      subject,
      faculty: subjectFacultyMap.get(subject) ?? facultyList[slotIndexSeed % facultyList.length],
      room,
    }
    subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1)
  }

  const findAndAssign = (subject: string, slots: Array<{ day: string; periodKey: string; periodIndex: number }>) => {
    let chosenIndex = slots.findIndex((slot) => canPlace(subject, slot.day, slot.periodKey))
    if (chosenIndex < 0) {
      chosenIndex = 0
    }

    if (chosenIndex < 0) {
      return false
    }

    const chosen = slots[chosenIndex]
    assign(subject, chosen.day, chosen.periodKey, chosenIndex)
    slots.splice(chosenIndex, 1)
    return true
  }

  const availableSlots = [...candidateSlots]

  const totalMin = subjects.reduce((sum, subject) => sum + constraints[subject].min, 0)
  if (totalMin > availableSlots.length + Array.from(subjectCounts.values()).reduce((a, b) => a + b, 0)) {
    toast.warning("Minimum periods exceed available slots. Constraint targets were relaxed during generation.")
  }

  for (const subject of subjects) {
    let required = Math.max(0, constraints[subject].min - (subjectCounts.get(subject) ?? 0))
    while (required > 0 && availableSlots.length > 0) {
      if (!findAndAssign(subject, availableSlots)) {
        break
      }
      required -= 1
    }
  }

  let safety = 0
  while (availableSlots.length > 0 && safety < 10000) {
    safety += 1
    const slot = availableSlots[0]

    const candidates = subjects
      .filter((subject) => (subjectCounts.get(subject) ?? 0) < constraints[subject].max)
      .sort((a, b) => (subjectCounts.get(a) ?? 0) - (subjectCounts.get(b) ?? 0))

    let chosen = candidates.find((subject) => canPlace(subject, slot.day, slot.periodKey))
    if (!chosen) {
      chosen = candidates[0] ?? subjects[0]
    }

    if (!chosen) {
      break
    }

    assign(chosen, slot.day, slot.periodKey, safety)
    availableSlots.shift()
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
  const [activeDays, setActiveDays] = useState<string[]>(weekdays)

  const [startTime, setStartTime] = useState(defaultAppSettings.startTime)
  const [endTime, setEndTime] = useState(defaultAppSettings.endTime)
  const [breakStart, setBreakStart] = useState(defaultAppSettings.breakStart)
  const [breakEnd, setBreakEnd] = useState(defaultAppSettings.breakEnd)
  const [periodDuration, setPeriodDuration] = useState(defaultAppSettings.periodDuration)
  const [saturdayMode, setSaturdayMode] = useState<"half-day" | "full-day">(defaultAppSettings.saturdayMode)

  const [periodRows, setPeriodRows] = useState<Period[]>([])
  const [timetable, setTimetable] = useState<TimetableGrid>({})
  const [lockedSlotKeys, setLockedSlotKeys] = useState<string[]>([])
  const [subjectConstraints, setSubjectConstraints] = useState<SubjectConstraintMap>({})
  const [conflicts, setConflicts] = useState<ConflictItem[]>([])

  const [editing, setEditing] = useState<EditState | null>(null)
  const [editSubject, setEditSubject] = useState("")
  const [editFaculty, setEditFaculty] = useState("")
  const [editRoom, setEditRoom] = useState("")

  const subjectSuggestions = useMemo(() => {
    const syllabus = findSyllabusRecord(loadSyllabusRecords(), semester, section, department as DepartmentCode)
    const syllabusSubjects = syllabus?.generatedSubjects ?? syllabus?.keywords ?? []
    const base = subjectsByDepartment[department] ?? subjectsByDepartment.cs
    return Array.from(new Set([...syllabusSubjects, ...base])).filter(isTeachingSubject)
  }, [department, semester, section])

  const facultySuggestions = useMemo(() => {
    return facultyByDepartment[department] ?? facultyByDepartment.cs
  }, [department])

  const subjectFacultyMap = useMemo(() => {
    const map = new Map<string, string>()
    const faculties = facultyByDepartment[department] ?? facultyByDepartment.cs
    subjectSuggestions.forEach((subject, index) => {
      map.set(subject, faculties[index % faculties.length])
    })
    return map
  }, [department, subjectSuggestions])

  const selectedDepartmentLabel = useMemo(() => {
    return departmentLabelByCode[department as DepartmentCode] ?? "Computer Science"
  }, [department])

  const lockedSet = useMemo(() => new Set(lockedSlotKeys), [lockedSlotKeys])

  useEffect(() => {
    setSubjectConstraints((prev) => sanitizeConstraintMap(subjectSuggestions, prev))
  }, [subjectSuggestions])

  useEffect(() => {
    setConflicts(detectConflicts(timetable, periodRows, activeDays))
  }, [timetable, periodRows, activeDays])

  useEffect(() => {
    const loadPageData = async () => {
      const supabase = createClient()
      const settings = loadAppSettings()
      setStartTime(settings.startTime)
      setEndTime(settings.endTime)
      setBreakStart(settings.breakStart)
      setBreakEnd(settings.breakEnd)
      setPeriodDuration(settings.periodDuration)
      setSaturdayMode(settings.saturdayMode)
      setActiveDays(activeDaysFromSettings(settings.saturdayWorking))

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

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

        const allocations = (allocationsData ?? []) as Array<{ id: string; courses: { title: string } | null }>

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
          (a, b) => timeStringToMinutes(a.key.split("-")[0]) - timeStringToMinutes(b.key.split("-")[0]),
        )

        const dayMap: Record<number, string> = {
          1: "Monday",
          2: "Tuesday",
          3: "Wednesday",
          4: "Thursday",
          5: "Friday",
          6: "Saturday",
        }

        const usedDays = Array.from(new Set(slots.map((slot) => dayMap[slot.day_of_week]).filter(Boolean) as string[]))
        const facultyDays = usedDays.length > 0 ? allDays.filter((day) => usedDays.includes(day)) : weekdays
        setActiveDays(facultyDays)

        const facultyTable: TimetableGrid = {}
        for (const day of facultyDays) {
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

  const setConstraint = (subject: string, field: "min" | "max", value: number) => {
    setSubjectConstraints((prev) => {
      const current = prev[subject] ?? { min: 2, max: 6 }
      const next = { ...current, [field]: Math.max(0, Math.floor(value || 0)) }
      if (next.max < next.min) {
        if (field === "min") {
          next.max = next.min
        } else {
          next.min = next.max
        }
      }
      return { ...prev, [subject]: next }
    })
  }

  const toggleCriticalLock = (day: string, periodKey: string) => {
    const key = slotKey(day, periodKey)
    setLockedSlotKeys((prev) => {
      if (prev.includes(key)) {
        toast.success("Critical lock removed")
        return prev.filter((item) => item !== key)
      }
      toast.success("Critical lock added")
      return [...prev, key]
    })
  }

  const createSchedule = () => {
    const settings = loadAppSettings()
    const daysForGeneration = activeDaysFromSettings(settings.saturdayWorking)
    setActiveDays(daysForGeneration)
    setSaturdayMode(settings.saturdayMode)

    const syllabi = loadSyllabusRecords()
    const matchedSyllabus = findSyllabusRecord(syllabi, semester, section, department as DepartmentCode)

    if (!matchedSyllabus) {
      toast.error(`Upload syllabus for Semester ${semester}, Section ${section}, ${department.toUpperCase()} first`)
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
        ? matchedSyllabus.generatedSubjects.filter(isTeachingSubject)
        : matchedSyllabus.keywords.filter(isTeachingSubject)

    if (subjectsFromSyllabus.length === 0) {
      toast.error("Syllabus subjects are invalid. Remove non-teaching entries like Year/Syllabus.")
      return
    }

    const safeConstraints = sanitizeConstraintMap(subjectsFromSyllabus, subjectConstraints)
    setSubjectConstraints(safeConstraints)

    const next = generateTimetable(
      rows,
      daysForGeneration,
      settings.saturdayMode,
      department,
      section,
      semester,
      subjectsFromSyllabus,
      safeConstraints,
      lockedSet,
      timetable,
    )

    const nextConflicts = detectConflicts(next, rows, daysForGeneration)

    setPeriodRows(rows)
    setTimetable(next)
    setShowTimetable(true)
    setConflicts(nextConflicts)

    if (nextConflicts.length > 0) {
      toast.warning(`Generated with ${nextConflicts.length} conflict(s). Review before finalizing.`)
    } else {
      toast.success(`Timetable generated using syllabus: ${matchedSyllabus.fileName}`)
    }
  }

  const runConflictEngine = () => {
    const found = detectConflicts(timetable, periodRows, activeDays)
    setConflicts(found)
    if (found.length === 0) {
      toast.success("Conflict engine: no room or same-time faculty collisions found")
      return
    }
    toast.error(`Conflict engine detected ${found.length} issue(s)`)
  }

  const openEditor = (day: string, periodKey: string) => {
    const current = timetable[day]?.[periodKey]
    if (current?.isBreak) {
      return
    }

    setEditing({ day, periodKey })
    setEditSubject(current?.subject ?? "")
    setEditFaculty(current?.faculty ?? subjectFacultyMap.get(current?.subject ?? "") ?? "")
    setEditRoom(current?.room ?? "")
  }

  const saveEdit = () => {
    if (!editing) {
      return
    }

    const subject = editSubject.trim()
    if (!subject) {
      toast.error("Subject is required")
      return
    }

    if (!isTeachingSubject(subject)) {
      toast.error("Year and syllabus are not allowed as teaching subjects")
      return
    }

    const mappedFaculty = subjectFacultyMap.get(subject)
    const enteredFaculty = editFaculty.trim()

    if (enteredFaculty && mappedFaculty && enteredFaculty !== mappedFaculty) {
      toast.error(`Faculty mismatch. ${subject} is allocated to ${mappedFaculty}.`)
      return
    }

    const periodIndex = periodRows.findIndex((row) => row.key === editing.periodKey)
    const prevRow = periodRows[periodIndex - 1]
    const nextRow = periodRows[periodIndex + 1]

    if (prevRow) {
      const prevSlot = timetable[editing.day]?.[prevRow.key]
      if (prevSlot && !prevSlot.isBreak && prevSlot.subject === subject) {
        toast.error("Subject spread rule violated: consecutive periods cannot have the same subject")
        return
      }
    }

    if (nextRow) {
      const nextSlot = timetable[editing.day]?.[nextRow.key]
      if (nextSlot && !nextSlot.isBreak && nextSlot.subject === subject) {
        toast.error("Subject spread rule violated: consecutive periods cannot have the same subject")
        return
      }
    }

    setTimetable((prev) => ({
      ...prev,
      [editing.day]: {
        ...prev[editing.day],
        [editing.periodKey]: {
          subject,
          faculty: mappedFaculty ?? (enteredFaculty || "TBD Faculty"),
          room: editRoom.trim() || "TBD Room",
        },
      },
    }))

    setEditing(null)
    toast.success("Slot updated")
  }

  const toExportRows = () => {
    const headers = ["Time", ...activeDays]
    const rows = periodRows.map((period) => {
      const row: string[] = [period.label]
      for (const day of activeDays) {
        const slot = timetable[day]?.[period.key]
        if (!slot) {
          row.push("-")
          continue
        }
        if (slot.isBreak) {
          row.push(slot.subject)
          continue
        }
        row.push(`${slot.subject} | ${slot.faculty} | ${slot.room}`)
      }
      return row
    })

    return { headers, rows }
  }

  const exportExcel = () => {
    if (!showTimetable || periodRows.length === 0) {
      toast.error("Generate timetable first")
      return
    }

    const { headers, rows } = toExportRows()
    const data = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Timetable")
    XLSX.writeFile(wb, `timetable-sem${semester}-sec${section}.xlsx`)
    toast.success("Excel exported")
  }

  const exportPdf = () => {
    if (!showTimetable || periodRows.length === 0) {
      toast.error("Generate timetable first")
      return
    }

    const { headers, rows } = toExportRows()
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
    doc.text(`Timetable - Semester ${semester} Section ${section} (${selectedDepartmentLabel})`, 40, 32)

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 44,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175] },
    })

    doc.save(`timetable-sem${semester}-sec${section}.pdf`)
    toast.success("PDF exported")
  }

  const printFacultyViews = () => {
    if (!showTimetable || periodRows.length === 0) {
      toast.error("Generate timetable first")
      return
    }

    const facultyMap = new Map<string, Array<{ day: string; time: string; subject: string; room: string }>>()

    for (const day of activeDays) {
      for (const row of periodRows) {
        const slot = timetable[day]?.[row.key]
        if (!slot || slot.isBreak || !slot.faculty.trim()) {
          continue
        }
        const entries = facultyMap.get(slot.faculty) ?? []
        entries.push({ day, time: row.label, subject: slot.subject, room: slot.room })
        facultyMap.set(slot.faculty, entries)
      }
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=800")
    if (!printWindow) {
      toast.error("Unable to open print window")
      return
    }

    const facultySections = Array.from(facultyMap.entries())
      .map(([faculty, entries]) => {
        const rows = entries
          .map(
            (entry) => `<tr><td>${entry.day}</td><td>${entry.time}</td><td>${entry.subject}</td><td>${entry.room}</td></tr>`,
          )
          .join("")

        return `
          <section style="margin-bottom:24px; page-break-inside: avoid;">
            <h2 style="margin:0 0 8px 0;">${faculty}</h2>
            <table style="width:100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr>
                  <th style="border:1px solid #ccc; padding:6px; text-align:left;">Day</th>
                  <th style="border:1px solid #ccc; padding:6px; text-align:left;">Time</th>
                  <th style="border:1px solid #ccc; padding:6px; text-align:left;">Subject</th>
                  <th style="border:1px solid #ccc; padding:6px; text-align:left;">Room</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </section>
        `
      })
      .join("")

    printWindow.document.write(`
      <html>
        <head>
          <title>Faculty Timetable Views</title>
        </head>
        <body style="font-family: Segoe UI, sans-serif; padding: 20px;">
          <h1 style="margin-bottom: 16px;">Per-Faculty Printable Timetable</h1>
          ${facultySections || "<p>No faculty allocations available.</p>"}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    toast.success("Opened per-faculty printable views")
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

        {role === "admin" ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={runConflictEngine}>
              <ShieldAlert className="h-4 w-4" />
              Run Conflict Check
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportExcel}>
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportPdf}>
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={printFacultyViews}>
              <Printer className="h-4 w-4" />
              Print Faculty Views
            </Button>
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
          </div>
        ) : null}
      </div>

      <div className={cn("grid grid-cols-1 gap-6", role === "admin" ? "lg:grid-cols-4" : "lg:grid-cols-1")}>
        {role === "admin" ? (
          <Card className="p-6 lg:col-span-1">
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
                    {departmentOptions.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.label}
                      </SelectItem>
                    ))}
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

              <div className="rounded-lg border border-border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Hard Subject Constraints (Weekly)
                </p>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {subjectSuggestions.map((subject) => (
                    <div key={subject} className="rounded-md border border-border p-2">
                      <p className="mb-1 text-xs font-medium text-foreground">{subject}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs" htmlFor={`min-${subject}`}>
                            Min
                          </Label>
                          <Input
                            id={`min-${subject}`}
                            type="number"
                            min={0}
                            value={subjectConstraints[subject]?.min ?? 2}
                            onChange={(event) => setConstraint(subject, "min", Number(event.target.value || 0))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs" htmlFor={`max-${subject}`}>
                            Max
                          </Label>
                          <Input
                            id={`max-${subject}`}
                            type="number"
                            min={0}
                            value={subjectConstraints[subject]?.max ?? 6}
                            onChange={(event) => setConstraint(subject, "max", Number(event.target.value || 0))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full gap-2" onClick={createSchedule}>
                <Sparkles className="h-4 w-4" />
                Generate Timetable
              </Button>
            </div>
          </Card>
        ) : null}

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
                <div className="flex items-center gap-2">
                  {lockedSlotKeys.length > 0 ? (
                    <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-warning-foreground">
                      {lockedSlotKeys.length} critical slot(s)
                    </span>
                  ) : null}
                  {isLocked && (
                    <span className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                      <Lock className="h-3 w-3" />
                      Confirmed
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border bg-muted/50 p-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                        Time
                      </th>
                      {activeDays.map((day) => (
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
                        {activeDays.map((day) => {
                          const slot = timetable[day]?.[period.key]
                          const isCritical = lockedSet.has(slotKey(day, period.key))
                          return (
                            <td
                              key={`${day}-${period.key}`}
                              className={cn(
                                "border border-border p-2 text-center",
                                slot?.isBreak && "bg-muted/50",
                                isCritical && "bg-warning/10",
                              )}
                            >
                              {slot ? (
                                slot.isBreak ? (
                                  <span className="text-xs font-medium text-muted-foreground">{slot.subject}</span>
                                ) : (
                                  <div className={cn("group relative rounded-lg bg-primary/10 p-2", isCritical && "ring-1 ring-warning")}>
                                    <p className="text-xs font-semibold text-primary">{slot.subject}</p>
                                    <p className="text-xs text-muted-foreground">{slot.faculty}</p>
                                    <p className="text-xs text-muted-foreground">{slot.room}</p>
                                    {role === "admin" && !isLocked ? (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute -left-1 -top-1 hidden h-6 w-6 group-hover:flex"
                                        onClick={() => toggleCriticalLock(day, period.key)}
                                      >
                                        {isCritical ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                                      </Button>
                                    ) : null}
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

              {conflicts.length > 0 ? (
                <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm font-semibold text-destructive">Conflict Engine Findings</p>
                  <div className="mt-2 space-y-1 text-xs text-destructive">
                    {conflicts.map((conflict, index) => (
                      <p key={`${conflict.type}-${conflict.day}-${conflict.periodKey}-${index}`}>
                        {conflict.type.toUpperCase()} collision on {conflict.day} ({conflict.periodKey}) for {conflict.value}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

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
            <DialogDescription>Update subject, faculty, and room details for the selected period.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-subject">Subject</Label>
              <Input
                id="edit-subject"
                list="subject-suggestions"
                value={editSubject}
                onChange={(event) => setEditSubject(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-faculty">Faculty</Label>
              <Input
                id="edit-faculty"
                list="faculty-suggestions"
                value={editFaculty}
                onChange={(event) => setEditFaculty(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-room">Room</Label>
              <Input
                id="edit-room"
                list="room-suggestions"
                value={editRoom}
                onChange={(event) => setEditRoom(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <datalist id="subject-suggestions">
              {subjectSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            <datalist id="faculty-suggestions">
              {facultySuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            <datalist id="room-suggestions">
              {["CS-101", "CS-102", "LAB-1", "LAB-2", "SEM-1", "SEM-2"].map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
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
