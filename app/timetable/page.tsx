"use client"

import { useState } from "react"
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
import { Sparkles, Lock, Pencil, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const periods = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]

const sampleTimetable = {
  Monday: {
    "9:00 AM": { subject: "Data Structures", faculty: "Dr. Miller", room: "CS-101" },
    "10:00 AM": { subject: "Algorithms", faculty: "Prof. Chen", room: "CS-102" },
    "11:00 AM": null,
    "12:00 PM": { subject: "LUNCH BREAK", faculty: "", room: "", isBreak: true },
    "2:00 PM": { subject: "Database Systems", faculty: "Dr. Kim", room: "CS-201" },
    "3:00 PM": { subject: "Networks", faculty: "Prof. Lee", room: "CS-202" },
    "4:00 PM": null,
  },
  Tuesday: {
    "9:00 AM": { subject: "Machine Learning", faculty: "Dr. Patel", room: "AI-101" },
    "10:00 AM": null,
    "11:00 AM": { subject: "Statistics", faculty: "Prof. Wang", room: "MATH-101" },
    "12:00 PM": { subject: "LUNCH BREAK", faculty: "", room: "", isBreak: true },
    "2:00 PM": { subject: "Data Structures", faculty: "Dr. Miller", room: "CS-101" },
    "3:00 PM": null,
    "4:00 PM": { subject: "Project Lab", faculty: "Dr. Miller", room: "LAB-1" },
  },
  Wednesday: {
    "9:00 AM": { subject: "Algorithms", faculty: "Prof. Chen", room: "CS-102" },
    "10:00 AM": { subject: "Database Systems", faculty: "Dr. Kim", room: "CS-201" },
    "11:00 AM": { subject: "Machine Learning", faculty: "Dr. Patel", room: "AI-101" },
    "12:00 PM": { subject: "LUNCH BREAK", faculty: "", room: "", isBreak: true },
    "2:00 PM": null,
    "3:00 PM": { subject: "Networks", faculty: "Prof. Lee", room: "CS-202" },
    "4:00 PM": null,
  },
  Thursday: {
    "9:00 AM": null,
    "10:00 AM": { subject: "Statistics", faculty: "Prof. Wang", room: "MATH-101" },
    "11:00 AM": { subject: "Data Structures", faculty: "Dr. Miller", room: "CS-101" },
    "12:00 PM": { subject: "LUNCH BREAK", faculty: "", room: "", isBreak: true },
    "2:00 PM": { subject: "Algorithms", faculty: "Prof. Chen", room: "CS-102" },
    "3:00 PM": { subject: "Database Systems", faculty: "Dr. Kim", room: "CS-201" },
    "4:00 PM": { subject: "Project Lab", faculty: "Dr. Miller", room: "LAB-1" },
  },
  Friday: {
    "9:00 AM": { subject: "Machine Learning", faculty: "Dr. Patel", room: "AI-101" },
    "10:00 AM": { subject: "Networks", faculty: "Prof. Lee", room: "CS-202" },
    "11:00 AM": null,
    "12:00 PM": { subject: "LUNCH BREAK", faculty: "", room: "", isBreak: true },
    "2:00 PM": { subject: "Statistics", faculty: "Prof. Wang", room: "MATH-101" },
    "3:00 PM": null,
    "4:00 PM": null,
  },
}

export default function TimetablePage() {
  const [isLocked, setIsLocked] = useState(false)
  const [showTimetable, setShowTimetable] = useState(true)

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timetable Management</h1>
          <p className="text-sm text-muted-foreground">Generate and manage class schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowTimetable(false)}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button
            className={cn("gap-2", isLocked && "bg-accent hover:bg-accent/90")}
            onClick={() => setIsLocked(!isLocked)}
          >
            <Lock className="h-4 w-4" />
            {isLocked ? "Locked" : "Lock Timetable"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Configuration Form */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="mb-4 text-lg font-semibold">Configuration</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select defaultValue="6">
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
              <Select defaultValue="A">
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
              <Select defaultValue="cs">
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
              <Input id="start-time" type="time" defaultValue="09:00" className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input id="end-time" type="time" defaultValue="17:00" className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="break-start">Break Time</Label>
              <div className="mt-1.5 flex gap-2">
                <Input id="break-start" type="time" defaultValue="12:00" />
                <Input type="time" defaultValue="13:00" />
              </div>
            </div>

            <Button className="w-full gap-2" onClick={() => setShowTimetable(true)}>
              <Sparkles className="h-4 w-4" />
              Generate Timetable
            </Button>
          </div>
        </Card>

        {/* Timetable Grid */}
        <Card className="overflow-hidden p-6 lg:col-span-3">
          {showTimetable ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Semester 6 - Section A</h3>
                  <p className="text-sm text-muted-foreground">Computer Science Department</p>
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
                    {periods.map((period) => (
                      <tr key={period}>
                        <td className="border border-border bg-muted/30 p-3 text-sm font-medium text-muted-foreground">
                          {period}
                        </td>
                        {days.map((day) => {
                          const slot = sampleTimetable[day as keyof typeof sampleTimetable]?.[period as keyof typeof sampleTimetable.Monday]
                          return (
                            <td
                              key={`${day}-${period}`}
                              className={cn(
                                "border border-border p-2 text-center",
                                slot?.isBreak && "bg-muted/50"
                              )}
                            >
                              {slot ? (
                                slot.isBreak ? (
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {slot.subject}
                                  </span>
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
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                )
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Generate Timetable</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Configure the settings and click Generate Timetable to create an AI-optimized schedule.
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
