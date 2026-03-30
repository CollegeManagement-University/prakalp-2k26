"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, FileText, Sparkles, Check, User } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  loadSyllabusRecords,
  upsertSyllabusRecord,
  type DepartmentCode,
  type SyllabusRecord,
} from "@/lib/syllabus-store"
import { toast } from "sonner"

interface SuggestedFaculty {
  id: string
  name: string
  initials: string
  color: string
  matchScore: number
  expertise: string[]
}

const facultySuggestionsByDepartment: Record<DepartmentCode, SuggestedFaculty[]> = {
  cs: [
    {
      id: "1",
      name: "Dr. Priya Patel",
      initials: "PP",
      color: "bg-accent",
      matchScore: 94,
      expertise: ["Machine Learning", "Deep Learning", "Neural Networks"],
    },
    {
      id: "2",
      name: "Prof. David Lee",
      initials: "DL",
      color: "bg-primary",
      matchScore: 87,
      expertise: ["Data Science", "Python", "TensorFlow"],
    },
  ],
  math: [
    {
      id: "3",
      name: "Dr. Meera Singh",
      initials: "MS",
      color: "bg-chart-3",
      matchScore: 90,
      expertise: ["Calculus", "Linear Algebra", "Statistics"],
    },
    {
      id: "4",
      name: "Prof. Arun Das",
      initials: "AD",
      color: "bg-primary",
      matchScore: 84,
      expertise: ["Discrete Math", "Probability"],
    },
  ],
  physics: [
    {
      id: "5",
      name: "Dr. Nisha Rao",
      initials: "NR",
      color: "bg-chart-4",
      matchScore: 91,
      expertise: ["Quantum Physics", "Optics", "Thermodynamics"],
    },
  ],
  eng: [
    {
      id: "6",
      name: "Prof. Ravi Menon",
      initials: "RM",
      color: "bg-chart-5",
      matchScore: 89,
      expertise: ["CAD", "Control Systems", "Fluid Mechanics"],
    },
  ],
}

const departmentLabel: Record<DepartmentCode, string> = {
  cs: "Computer Science",
  math: "Mathematics",
  physics: "Physics",
  eng: "Engineering",
}

function extractKeywords(fileName: string, department: DepartmentCode) {
  const seedByDepartment: Record<DepartmentCode, string[]> = {
    cs: ["Data Structures", "Algorithms", "Database", "Machine Learning", "Python"],
    math: ["Calculus", "Linear Algebra", "Statistics", "Discrete Math", "Probability"],
    physics: ["Mechanics", "Quantum", "Thermodynamics", "Optics", "Electromagnetism"],
    eng: ["Design", "Control", "Manufacturing", "CAD", "Materials"],
  }

  const tokens = fileName
    .replace(/\.[^.]+$/, "")
    .split(/[_\-\s]+/)
    .filter(Boolean)

  const normalized = Array.from(new Set([...tokens, ...seedByDepartment[department]])).slice(0, 7)
  return normalized
}

export default function SyllabusPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [semester, setSemester] = useState("6")
  const [section, setSection] = useState("A")
  const [department, setDepartment] = useState<DepartmentCode>("cs")

  const [records, setRecords] = useState<SyllabusRecord[]>([])
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<string[]>([])

  useEffect(() => {
    setRecords(loadSyllabusRecords())
  }, [])

  const activeRecord = useMemo(
    () =>
      records.find(
        (item) =>
          item.semester === semester &&
          item.section === section &&
          item.department === department,
      ) ?? null,
    [records, semester, section, department],
  )

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const onFilePicked: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const extracted = extractKeywords(file.name, department)
    const newRecord: SyllabusRecord = {
      id: crypto.randomUUID(),
      semester,
      section,
      department,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      keywords: extracted,
    }

    const next = upsertSyllabusRecord(newRecord)
    setRecords(next)
    setUploadedFile(file.name)
    setKeywords(extracted)
    toast.success(`Syllabus uploaded for Semester ${semester} Section ${section}`)

    event.currentTarget.value = ""
  }

  useEffect(() => {
    if (activeRecord) {
      setUploadedFile(activeRecord.fileName)
      setKeywords(activeRecord.keywords)
    } else {
      setUploadedFile(null)
      setKeywords([])
    }
  }, [activeRecord])

  const suggestedFaculty = facultySuggestionsByDepartment[department]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Semester Syllabus Upload</h1>
        <p className="text-sm text-muted-foreground">
          Upload a separate syllabus per semester/section. Timetable generation requires this upload.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <p className="mb-1.5 text-sm font-medium">Semester</p>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger>
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
          <p className="mb-1.5 text-sm font-medium">Section</p>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {['A', 'B', 'C', 'D'].map((sec) => (
                <SelectItem key={sec} value={sec}>
                  Section {sec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium">Department</p>
          <Select value={department} onValueChange={(value) => setDepartment(value as DepartmentCode)}>
            <SelectTrigger>
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Upload Syllabus</h3>

          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={onFilePicked} />

          {!uploadedFile ? (
            <button
              type="button"
              className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-left transition-colors hover:border-primary/50 hover:bg-muted/30"
              onClick={handleSelectFile}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Choose PDF for Semester {semester} Section {section}</p>
              <p className="mt-1 text-xs text-muted-foreground">{departmentLabel[department]} department</p>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{uploadedFile}</p>
                  <p className="text-xs text-muted-foreground">Uploaded for Semester {semester}, Section {section}</p>
                </div>
                <Check className="h-5 w-5 text-accent" />
              </div>

              <Button variant="outline" className="w-full" onClick={handleSelectFile}>
                Replace File
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Extracted Keywords</h3>
          </div>

          {keywords.length > 0 ? (
            <div className="space-y-2">
              {keywords.map((keyword, index) => (
                <div key={keyword} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="text-sm">{keyword}</span>
                  <span className="text-xs text-muted-foreground">{95 - index * 5}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <FileText className="mb-3 h-12 w-12 text-muted" />
              <p className="text-sm text-muted-foreground">Upload a syllabus to extract keywords</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Suggested Faculty</h3>
          </div>

          {keywords.length > 0 ? (
            <div className="space-y-3">
              {suggestedFaculty.map((faculty, index) => (
                <div key={faculty.id} className={cn("rounded-lg border p-4", index === 0 ? "border-accent bg-accent/5" : "border-border")}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{faculty.name}</p>
                    <span className="text-xs text-accent">{faculty.matchScore}%</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {faculty.expertise.map((skill) => (
                      <span key={skill} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <User className="mb-3 h-12 w-12 text-muted" />
              <p className="text-sm text-muted-foreground">Faculty suggestions will appear after upload</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h3 className="mb-3 text-lg font-semibold">Uploaded Syllabus Records</h3>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">No syllabus uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2">Semester</th>
                  <th className="py-2">Section</th>
                  <th className="py-2">Department</th>
                  <th className="py-2">File</th>
                  <th className="py-2">Uploaded At</th>
                </tr>
              </thead>
              <tbody>
                {records.map((item) => (
                  <tr key={item.id} className="border-b border-border/50">
                    <td className="py-2">{item.semester}</td>
                    <td className="py-2">{item.section}</td>
                    <td className="py-2">{departmentLabel[item.department]}</td>
                    <td className="py-2">{item.fileName}</td>
                    <td className="py-2">{new Date(item.uploadedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}
