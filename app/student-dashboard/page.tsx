'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  defaultStudentAccessContext,
  loadStudentAccessContext,
  saveStudentAccessContext,
} from '@/lib/student-access'
import { toast } from 'sonner'

type Role = 'student' | 'faculty' | 'admin'

type StudentTimetableRow = {
  day: string
  time: string
  subject: string
  faculty: string
  room: string
}

type DepartmentOption = {
  id: string
  name: string
  code: string
}

type AllocationWithRelations = {
  id: string
  semester: number
  year: number
  courses: { code: string; title: string; department_id: string } | null
  profiles: { full_name: string | null } | null
  timetable_slots: Array<{
    day_of_week: number
    start_time: string
    end_time: string
    room: string | null
  }> | null
}

const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8']
const sectionOptions = ['A', 'B', 'C', 'D']
const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function resolveRole(roleValue: unknown): Role | null {
  if (roleValue === 'student' || roleValue === 'faculty' || roleValue === 'admin') {
    return roleValue
  }

  return null
}

function toTimeLabel(timeValue: string) {
  const [hoursRaw, minutesRaw] = timeValue.split(':')
  const hours24 = Number(hoursRaw)
  const minutes = Number(minutesRaw)

  if (Number.isNaN(hours24) || Number.isNaN(minutes)) {
    return timeValue
  }

  const suffix = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

function toRangeLabel(startTime: string, endTime: string) {
  return `${toTimeLabel(startTime)} - ${toTimeLabel(endTime)}`
}

export default function StudentDashboardPage() {
  const router = useRouter()
  const envReady = useMemo(() => hasSupabaseEnv(), [])

  const [semester, setSemester] = useState('1')
  const [section, setSection] = useState('A')
  const [departmentId, setDepartmentId] = useState('')
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [studentName, setStudentName] = useState('Student')
  const [userId, setUserId] = useState('')
  const [isStudent, setIsStudent] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(false)
  const [isSavingDepartment, setIsSavingDepartment] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [rows, setRows] = useState<StudentTimetableRow[]>([])

  useEffect(() => {
    let mounted = true

    async function initializeSession() {
      if (!envReady) {
        if (!mounted) {
          return
        }

        setErrorMessage('Supabase env vars are missing. Add values to .env.local first.')
        setIsInitializing(false)
        return
      }

      try {
        const supabase = createClient()
        const storedContext = loadStudentAccessContext()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!mounted) {
          return
        }

        if (!user) {
          router.replace('/login?next=/student-dashboard')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role, department_id')
          .eq('id', user.id)
          .maybeSingle()

        if (!mounted) {
          return
        }

        const role = resolveRole(profile?.role) ?? resolveRole(user.user_metadata?.role)

        if (role !== 'student') {
          router.replace('/timetable')
          return
        }

        const { data: departmentsData } = await supabase
          .from('departments')
          .select('id, name, code')
          .order('name', { ascending: true })

        const departmentOptions = (departmentsData ?? []) as DepartmentOption[]
        const fallbackDepartment = departmentOptions[0]?.id ?? ''

        setIsStudent(true)
        setUserId(user.id)
        setStudentName(profile?.full_name ?? (user.user_metadata?.full_name as string) ?? 'Student')
        setDepartments(departmentOptions)

        const profileDepartmentId = profile?.department_id ?? ''
        const selectedDepartment =
          profileDepartmentId || storedContext.departmentId || fallbackDepartment

        setSemester(storedContext.semester || defaultStudentAccessContext.semester)
        setSection(storedContext.section || defaultStudentAccessContext.section)
        setDepartmentId(selectedDepartment)
      } catch {
        if (!mounted) {
          return
        }

        setErrorMessage('Unable to verify your session. Please sign in again.')
      } finally {
        if (mounted) {
          setIsInitializing(false)
        }
      }
    }

    initializeSession()

    return () => {
      mounted = false
    }
  }, [envReady, router])

  useEffect(() => {
    if (!isStudent || !departmentId) {
      return
    }

    const department = departments.find((item) => item.id === departmentId)
    saveStudentAccessContext({
      departmentId,
      departmentName: department?.name ?? '',
      semester,
      section,
    })
  }, [departmentId, departments, isStudent, section, semester])

  useEffect(() => {
    async function persistDepartmentPreference() {
      if (!isStudent || !userId || !departmentId) {
        return
      }

      setIsSavingDepartment(true)

      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('profiles')
          .update({ department_id: departmentId })
          .eq('id', userId)

        if (error) {
          throw error
        }
      } catch {
        toast.error('Unable to save department. Please try again.')
      } finally {
        setIsSavingDepartment(false)
      }
    }

    void persistDepartmentPreference()
  }, [departmentId, isStudent, userId])

  useEffect(() => {
    let mounted = true

    async function loadTimetable() {
      if (!envReady || !isStudent) {
        return
      }

      setIsLoadingTimetable(true)
      setErrorMessage(null)

      try {
        const supabase = createClient()
        let query = supabase
          .from('course_allocations')
          .select(
            'id, semester, year, courses!inner(code, title, department_id), profiles!course_allocations_faculty_id_fkey(full_name), timetable_slots(day_of_week, start_time, end_time, room)',
          )
          .eq('semester', Number(semester))
          .eq('section', section)
          .order('year', { ascending: false })

        if (departmentId) {
          query = query.eq('courses.department_id', departmentId)
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        if (!mounted) {
          return
        }

        const allocations = (data ?? []) as AllocationWithRelations[]
        const transformedRows = allocations
          .flatMap((allocation) => {
            const subject = allocation.courses?.title ?? allocation.courses?.code ?? 'Course TBD'
            const faculty = allocation.profiles?.full_name ?? 'Faculty TBD'
            const slots = allocation.timetable_slots ?? []

            if (slots.length === 0) {
              return [
                {
                  day: 'Not Assigned',
                  time: 'Pending',
                  subject,
                  faculty,
                  room: 'TBD',
                },
              ]
            }

            return slots.map((slot) => ({
              day: dayLabels[slot.day_of_week - 1] ?? `Day ${slot.day_of_week}`,
              time: toRangeLabel(slot.start_time, slot.end_time),
              subject,
              faculty,
              room: slot.room ?? 'TBD',
            }))
          })
          .sort((a, b) => {
            const dayCompare = dayLabels.indexOf(a.day) - dayLabels.indexOf(b.day)
            if (dayCompare !== 0) {
              return dayCompare
            }
            return a.time.localeCompare(b.time)
          })

        setRows(transformedRows)
      } catch {
        if (mounted) {
          setRows([])
          setErrorMessage('Unable to load timetable data right now. Please try again.')
        }
      } finally {
        if (mounted) {
          setIsLoadingTimetable(false)
        }
      }
    }

    loadTimetable()

    return () => {
      mounted = false
    }
  }, [departmentId, envReady, isStudent, section, semester])

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Student Access</CardTitle>
              <Badge variant="secondary">Logged in as student</Badge>
            </div>
            <CardDescription>
              Welcome, {studentName}. Select semester and section to view timetable and assigned faculty.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 sm:col-span-1">
              <p className="text-sm font-medium">Department</p>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name} ({department.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSavingDepartment ? (
                <p className="text-xs text-muted-foreground">Saving department preference...</p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-1">
              <p className="text-sm font-medium">Semester</p>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesterOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      Semester {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-1">
              <p className="text-sm font-medium">Section</p>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      Section {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-sm text-muted-foreground">
                Current section selection: <span className="font-semibold text-foreground">{section}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Timetable data is loaded for the selected semester and displayed with faculty assignments.
              </p>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <Button asChild className="w-full">
                <Link href="/feedback">Give Feedback</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semester Timetable</CardTitle>
            <CardDescription>
              View class slots and faculty details for Semester {semester}, Section {section}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInitializing ? (
              <p className="text-sm text-muted-foreground">Checking your student access...</p>
            ) : null}

            {!isInitializing && isLoadingTimetable ? (
              <p className="text-sm text-muted-foreground">Loading timetable...</p>
            ) : null}

            {!isInitializing && errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}

            {!isInitializing && !isLoadingTimetable && !errorMessage && rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No timetable has been published for this semester yet.
              </p>
            ) : null}

            {!isInitializing && !isLoadingTimetable && !errorMessage && rows.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Room</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={`${row.day}-${row.time}-${index}`}>
                      <TableCell>{row.day}</TableCell>
                      <TableCell>{row.time}</TableCell>
                      <TableCell>{row.subject}</TableCell>
                      <TableCell>{row.faculty}</TableCell>
                      <TableCell>{row.room}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}

            <form action="/auth/signout" method="post" className="pt-2">
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
