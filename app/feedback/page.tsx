"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Star, MessageSquare, TrendingUp, Users } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const feedbackData = [
  { faculty: "Dr. Miller", rating: 4.9, responses: 45 },
  { faculty: "Prof. Chen", rating: 4.7, responses: 38 },
  { faculty: "Dr. Kim", rating: 4.5, responses: 42 },
  { faculty: "Prof. Lee", rating: 4.8, responses: 36 },
  { faculty: "Dr. Patel", rating: 4.6, responses: 40 },
]

const recentComments = [
  {
    id: "1",
    faculty: "Dr. Miller",
    rating: 5,
    comment: "Excellent teaching methodology. Very clear explanations.",
    date: "2 hours ago",
  },
  {
    id: "2",
    faculty: "Prof. Chen",
    rating: 4,
    comment: "Good lectures, but could use more practical examples.",
    date: "5 hours ago",
  },
  {
    id: "3",
    faculty: "Dr. Kim",
    rating: 5,
    comment: "Very engaging and always available for doubts.",
    date: "1 day ago",
  },
]

export default function FeedbackPage() {
  const [feedbackEnabled, setFeedbackEnabled] = useState(true)

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedback Control</h1>
          <p className="text-sm text-muted-foreground">Manage and view student feedback</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Feedback Collection</span>
          <Switch checked={feedbackEnabled} onCheckedChange={setFeedbackEnabled} />
          <span
            className={`text-sm font-medium ${feedbackEnabled ? "text-accent" : "text-muted-foreground"}`}
          >
            {feedbackEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Feedback Settings</h3>
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
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" className="mt-1.5" />
            </div>

            <Button className="w-full">Save Settings</Button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Star className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-xs text-muted-foreground">Avg. Rating</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">201</p>
                  <p className="text-xs text-muted-foreground">Total Responses</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/20">
                  <Users className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">78%</p>
                  <p className="text-xs text-muted-foreground">Participation</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Ratings Chart */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Faculty Ratings</h3>
              <div className="flex items-center gap-1 text-sm text-accent">
                <TrendingUp className="h-4 w-4" />
                +5% from last month
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedbackData} layout="vertical" barSize={20}>
                  <XAxis type="number" domain={[0, 5]} hide />
                  <YAxis
                    type="category"
                    dataKey="faculty"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg bg-card px-3 py-2 shadow-lg border border-border">
                            <p className="text-sm font-medium">{payload[0].payload.faculty}</p>
                            <p className="text-sm text-accent">
                              Rating: {payload[0].payload.rating}/5
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payload[0].payload.responses} responses
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="rating" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Comments */}
      <Card className="mt-6 p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Comments</h3>
        <div className="space-y-4">
          {recentComments.map((comment) => (
            <div key={comment.id} className="flex gap-4 border-b border-border pb-4 last:border-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{comment.faculty}</p>
                  <span className="text-xs text-muted-foreground">{comment.date}</span>
                </div>
                <div className="my-1 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < comment.rating ? "fill-accent text-accent" : "text-muted"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}
