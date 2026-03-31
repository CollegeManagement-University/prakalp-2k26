"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, Clock, Building, Bell } from "lucide-react"
import { toast } from "sonner"
import { defaultAppSettings, loadAppSettings, saveAppSettings, type AppSettings } from "@/lib/app-settings"

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings)

  useEffect(() => {
    setSettings(loadAppSettings())
  }, [])

  const updateField = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    saveAppSettings(settings)
    setSaved(true)
    toast.success("Configuration saved")
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure system preferences and timings</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* College Timings */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">College Timings</h3>
              <p className="text-sm text-muted-foreground">Set working hours</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  className="mt-1.5"
                  value={settings.startTime}
                  onChange={(event) => updateField("startTime", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  className="mt-1.5"
                  value={settings.endTime}
                  onChange={(event) => updateField("endTime", event.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="period-duration">Period Duration (minutes)</Label>
              <Input
                id="period-duration"
                type="number"
                min={30}
                max={180}
                className="mt-1.5"
                value={settings.periodDuration}
                onChange={(event) => updateField("periodDuration", Number(event.target.value || 60))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="break-start">Break Start</Label>
                <Input
                  id="break-start"
                  type="time"
                  className="mt-1.5"
                  value={settings.breakStart}
                  onChange={(event) => updateField("breakStart", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="break-end">Break End</Label>
                <Input
                  id="break-end"
                  type="time"
                  className="mt-1.5"
                  value={settings.breakEnd}
                  onChange={(event) => updateField("breakEnd", event.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="break-duration">Break Duration (minutes)</Label>
              <Input
                id="break-duration"
                type="number"
                min={15}
                max={120}
                className="mt-1.5"
                value={settings.breakDuration}
                onChange={(event) => updateField("breakDuration", Number(event.target.value || 60))}
              />
            </div>
          </div>
        </Card>

        {/* Institution Settings */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Building className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Institution Details</h3>
              <p className="text-sm text-muted-foreground">Basic information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="institution-name">Institution Name</Label>
              <Input
                id="institution-name"
                className="mt-1.5"
                value={settings.institutionName}
                onChange={(event) => updateField("institutionName", event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="academic-year">Current Academic Year</Label>
              <Input
                id="academic-year"
                className="mt-1.5"
                value={settings.academicYear}
                onChange={(event) => updateField("academicYear", event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="total-semesters">Total Semesters</Label>
              <Input
                id="total-semesters"
                type="number"
                min={1}
                max={12}
                className="mt-1.5"
                value={settings.totalSemesters}
                onChange={(event) => updateField("totalSemesters", Number(event.target.value || 8))}
              />
            </div>

            <div>
              <Label htmlFor="sections-per-sem">Sections per Semester</Label>
              <Input
                id="sections-per-sem"
                type="number"
                min={1}
                max={12}
                className="mt-1.5"
                value={settings.sectionsPerSemester}
                onChange={(event) => updateField("sectionsPerSemester", Number(event.target.value || 4))}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/20">
              <Bell className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">Manage alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email alerts</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(value) => updateField("emailNotifications", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Leave Request Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified for new requests</p>
              </div>
              <Switch
                checked={settings.leaveAlerts}
                onCheckedChange={(value) => updateField("leaveAlerts", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Feedback Reminders</p>
                <p className="text-sm text-muted-foreground">Remind students to submit feedback</p>
              </div>
              <Switch
                checked={settings.feedbackReminders}
                onCheckedChange={(value) => updateField("feedbackReminders", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Feedback Collection</p>
                <p className="text-sm text-muted-foreground">Allow students to submit feedback</p>
              </div>
              <Switch
                checked={settings.feedbackCollectionEnabled}
                onCheckedChange={(value) => updateField("feedbackCollectionEnabled", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AI Insights</p>
                <p className="text-sm text-muted-foreground">Receive AI-generated suggestions</p>
              </div>
              <Switch
                checked={settings.aiInsights}
                onCheckedChange={(value) => updateField("aiInsights", value)}
              />
            </div>
          </div>
        </Card>

        {/* AI Configuration */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
              <svg
                className="h-5 w-5 text-warning-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Configuration</h3>
              <p className="text-sm text-muted-foreground">Agentic AI settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Optimization</p>
                <p className="text-sm text-muted-foreground">Let AI optimize timetables</p>
              </div>
              <Switch
                checked={settings.autoOptimization}
                onCheckedChange={(value) => updateField("autoOptimization", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Conflict Detection</p>
                <p className="text-sm text-muted-foreground">Automatic conflict alerts</p>
              </div>
              <Switch
                checked={settings.conflictDetection}
                onCheckedChange={(value) => updateField("conflictDetection", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Substitute Suggestions</p>
                <p className="text-sm text-muted-foreground">AI-powered faculty matching</p>
              </div>
              <Switch
                checked={settings.substituteSuggestions}
                onCheckedChange={(value) => updateField("substituteSuggestions", value)}
              />
            </div>

            <div>
              <Label htmlFor="optimization-priority">Optimization Priority</Label>
              <select
                id="optimization-priority"
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={settings.optimizationPriority}
                onChange={(event) =>
                  updateField("optimizationPriority", event.target.value as AppSettings["optimizationPriority"])
                }
              >
                <option value="workload">Minimize Faculty Workload</option>
                <option value="gaps">Minimize Student Gaps</option>
                <option value="balanced">Balanced Approach</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Configuration"}
        </Button>
      </div>
    </DashboardLayout>
  )
}
