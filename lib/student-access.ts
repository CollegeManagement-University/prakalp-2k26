export const STUDENT_ACCESS_CONTEXT_KEY = 'orchestra.student.access.context'
export const FEEDBACK_SUBMISSIONS_KEY = 'orchestra.feedback.submissions'

export type StudentAccessContext = {
  departmentId: string
  departmentName: string
  semester: string
  section: string
}

export type FeedbackSubmission = {
  id: string
  userId: string
  studentName: string
  departmentId: string
  departmentName: string
  semester: string
  section: string
  facultyId: string
  facultyName: string
  rating: number
  comment: string
  submittedAt: string
}

export const defaultStudentAccessContext: StudentAccessContext = {
  departmentId: '',
  departmentName: '',
  semester: '1',
  section: 'A',
}

export function loadStudentAccessContext(): StudentAccessContext {
  if (typeof window === 'undefined') {
    return defaultStudentAccessContext
  }

  try {
    const raw = window.localStorage.getItem(STUDENT_ACCESS_CONTEXT_KEY)
    if (!raw) {
      return defaultStudentAccessContext
    }

    const parsed = JSON.parse(raw) as Partial<StudentAccessContext>
    return { ...defaultStudentAccessContext, ...parsed }
  } catch {
    return defaultStudentAccessContext
  }
}

export function saveStudentAccessContext(context: StudentAccessContext) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STUDENT_ACCESS_CONTEXT_KEY, JSON.stringify(context))
}

export function loadFeedbackSubmissions(): FeedbackSubmission[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(FEEDBACK_SUBMISSIONS_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as FeedbackSubmission[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function appendFeedbackSubmission(submission: FeedbackSubmission) {
  if (typeof window === 'undefined') {
    return
  }

  const current = loadFeedbackSubmissions()
  current.unshift(submission)
  window.localStorage.setItem(FEEDBACK_SUBMISSIONS_KEY, JSON.stringify(current))
}
