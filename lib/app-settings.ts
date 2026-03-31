export const APP_SETTINGS_KEY = 'orchestra.app.settings'

export type AppSettings = {
  startTime: string
  endTime: string
  periodDuration: number
  breakStart: string
  breakEnd: string
  breakDuration: number
  institutionName: string
  academicYear: string
  totalSemesters: number
  sectionsPerSemester: number
  emailNotifications: boolean
  leaveAlerts: boolean
  feedbackReminders: boolean
  feedbackCollectionEnabled: boolean
  aiInsights: boolean
  autoOptimization: boolean
  conflictDetection: boolean
  substituteSuggestions: boolean
  optimizationPriority: 'workload' | 'gaps' | 'balanced'
}

export const defaultAppSettings: AppSettings = {
  startTime: '09:00',
  endTime: '17:00',
  periodDuration: 60,
  breakStart: '12:00',
  breakEnd: '13:00',
  breakDuration: 60,
  institutionName: 'University of Technology',
  academicYear: '2025-2026',
  totalSemesters: 8,
  sectionsPerSemester: 4,
  emailNotifications: true,
  leaveAlerts: true,
  feedbackReminders: true,
  feedbackCollectionEnabled: true,
  aiInsights: true,
  autoOptimization: true,
  conflictDetection: true,
  substituteSuggestions: true,
  optimizationPriority: 'balanced',
}

export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return defaultAppSettings
  }

  try {
    const raw = window.localStorage.getItem(APP_SETTINGS_KEY)
    if (!raw) {
      return defaultAppSettings
    }

    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return { ...defaultAppSettings, ...parsed }
  } catch {
    return defaultAppSettings
  }
}

export function saveAppSettings(settings: AppSettings) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings))
}
