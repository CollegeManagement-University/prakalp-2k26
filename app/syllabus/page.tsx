"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Upload, FileText, Sparkles, Check, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExtractedKeyword {
  keyword: string
  relevance: number
}

interface SuggestedFaculty {
  id: string
  name: string
  initials: string
  color: string
  matchScore: number
  expertise: string[]
}

const extractedKeywords: ExtractedKeyword[] = [
  { keyword: "Machine Learning", relevance: 95 },
  { keyword: "Neural Networks", relevance: 88 },
  { keyword: "Deep Learning", relevance: 85 },
  { keyword: "Data Preprocessing", relevance: 78 },
  { keyword: "Python Programming", relevance: 75 },
  { keyword: "TensorFlow", relevance: 70 },
  { keyword: "Computer Vision", relevance: 65 },
]

const suggestedFaculty: SuggestedFaculty[] = [
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
  {
    id: "3",
    name: "Dr. Sarah Miller",
    initials: "SM",
    color: "bg-chart-3",
    matchScore: 82,
    expertise: ["Computer Vision", "AI", "Data Preprocessing"],
  },
]

export default function SyllabusPage() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleUpload = () => {
    setUploadedFile("Advanced_ML_Syllabus_2026.pdf")
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowResults(true)
    }, 2000)
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Syllabus Upload & Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Upload course syllabus for AI-powered faculty matching
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload Section */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Upload Syllabus</h3>

          {!uploadedFile ? (
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/30"
              onClick={handleUpload}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Click to upload PDF</p>
              <p className="mt-1 text-xs text-muted-foreground">or drag and drop</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{uploadedFile}</p>
                  <p className="text-xs text-muted-foreground">2.4 MB</p>
                </div>
                <Check className="h-5 w-5 text-accent" />
              </div>

              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Analyzing syllabus...
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setUploadedFile(null)
                  setShowResults(false)
                }}
              >
                Upload Different File
              </Button>
            </div>
          )}
        </Card>

        {/* Extracted Keywords */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold">Extracted Keywords</h3>
          </div>

          {showResults ? (
            <div className="space-y-3">
              {extractedKeywords.map((item) => (
                <div key={item.keyword} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.keyword}</span>
                      <span className="text-xs text-muted-foreground">{item.relevance}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${item.relevance}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <FileText className="mb-3 h-12 w-12 text-muted" />
              <p className="text-sm text-muted-foreground">
                Upload a syllabus to extract keywords
              </p>
            </div>
          )}
        </Card>

        {/* Suggested Faculty */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Suggested Faculty</h3>
          </div>

          {showResults ? (
            <div className="space-y-4">
              {suggestedFaculty.map((faculty, index) => (
                <div
                  key={faculty.id}
                  className={cn(
                    "rounded-lg border p-4 transition-colors",
                    index === 0 ? "border-accent bg-accent/5" : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className={cn(faculty.color, "text-white text-sm font-semibold")}
                        >
                          {faculty.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{faculty.name}</p>
                        <p className="text-xs text-accent">{faculty.matchScore}% match</p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                        Best Match
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {faculty.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="mt-3 w-full">
                    Assign to Course
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <User className="mb-3 h-12 w-12 text-muted" />
              <p className="text-sm text-muted-foreground">
                Faculty suggestions will appear here
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
