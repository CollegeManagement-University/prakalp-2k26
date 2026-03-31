"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, GraduationCap } from "lucide-react"
import { toast } from "sonner"

type Qualification = {
  id: string
  title: string
  institute: string
  year: string
}

const STORAGE_KEY = "orchestra.faculty.qualifications"

export default function QualificationsPage() {
  const [title, setTitle] = useState("")
  const [institute, setInstitute] = useState("")
  const [year, setYear] = useState("")
  const [items, setItems] = useState<Qualification[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Qualification[]
      setItems(parsed)
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const canSubmit = useMemo(() => title.trim() && institute.trim() && year.trim(), [title, institute, year])

  const addQualification = () => {
    if (!canSubmit) {
      toast.error("Please fill all fields")
      return
    }

    setItems((prev) => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        institute: institute.trim(),
        year: year.trim(),
      },
      ...prev,
    ])

    setTitle("")
    setInstitute("")
    setYear("")
    toast.success("Qualification added")
  }

  const removeQualification = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    toast.success("Qualification removed")
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Add Qualifications</h1>
        <p className="text-sm text-muted-foreground">Manage your academic and professional qualifications</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">New Qualification</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" className="mt-1.5" placeholder="M.Tech Computer Science" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="institute">Institute</Label>
              <Input id="institute" className="mt-1.5" placeholder="IIT Madras" value={institute} onChange={(event) => setInstitute(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input id="year" className="mt-1.5" placeholder="2021" value={year} onChange={(event) => setYear(event.target.value)} />
            </div>

            <Button className="w-full" onClick={addQualification}>Add Qualification</Button>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold">Saved Qualifications</h3>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No qualifications added yet.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.institute} • {item.year}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeQualification(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
