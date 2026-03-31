export type DepartmentCode = 'cs' | 'math' | 'physics' | 'eng'

export type SyllabusRecord = {
  id: string
  semester: string
  section: string
  department: DepartmentCode
  fileName: string
  uploadedAt: string
  keywords: string[]
  generatedSubjects: string[]
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

    const parsed = JSON.parse(raw) as Array<Partial<SyllabusRecord>>
    return parsed.map((item) => ({
      id: item.id ?? crypto.randomUUID(),
      semester: item.semester ?? '1',
      section: item.section ?? 'A',
      department: (item.department as DepartmentCode) ?? 'cs',
      fileName: item.fileName ?? 'unknown.pdf',
      uploadedAt: item.uploadedAt ?? new Date().toISOString(),
      keywords: item.keywords ?? [],
      generatedSubjects: item.generatedSubjects ?? item.keywords ?? [],
    }))
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
