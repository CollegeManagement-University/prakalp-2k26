export type DepartmentCode = 'cs' | 'math' | 'physics' | 'eng'

export type SyllabusRecord = {
  id: string
  semester: string
  section: string
  department: DepartmentCode
  fileName: string
  uploadedAt: string
  keywords: string[]
}

const SYLLABUS_STORAGE_KEY = 'orchestra.syllabus.records'

export function loadSyllabusRecords(): SyllabusRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(SYLLABUS_STORAGE_KEY)
    if (!raw) {
      return []
    }

    return JSON.parse(raw) as SyllabusRecord[]
  } catch {
    return []
  }
}

export function saveSyllabusRecords(records: SyllabusRecord[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(records))
}

export function upsertSyllabusRecord(record: SyllabusRecord) {
  const existing = loadSyllabusRecords()
  const next = existing.filter(
    (item) =>
      !(
        item.semester === record.semester &&
        item.section === record.section &&
        item.department === record.department
      ),
  )

  next.unshift(record)
  saveSyllabusRecords(next)
  return next
}

export function findSyllabusRecord(
  records: SyllabusRecord[],
  semester: string,
  section: string,
  department: DepartmentCode,
) {
  return records.find(
    (item) =>
      item.semester === semester &&
      item.section === section &&
      item.department === department,
  )
}
