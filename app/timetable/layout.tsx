import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Timetable Generation | Orchestra AI',
  description:
    'Generate semester-wise class timetables using uploaded syllabus and manage admin allocations.',
  keywords: [
    'timetable generation',
    'semester syllabus',
    'faculty allocation',
    'orchestra ai',
  ],
}

export default function TimetableLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
