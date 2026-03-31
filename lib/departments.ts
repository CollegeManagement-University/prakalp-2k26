export const departmentOptions = [
  { code: "cs", label: "Computer Science" },
  { code: "it", label: "Information Technology" },
  { code: "mech", label: "Mechanical Engineering" },
  { code: "civil", label: "Civil Engineering" },
  { code: "aiml", label: "Artificial Intelligence and Machine Learning" },
  { code: "aids", label: "Artificial Intelligence and Data Science" },
  { code: "csd", label: "Computer Science and Design" },
  { code: "math", label: "Mathematics" },
  { code: "physics", label: "Physics" },
  { code: "eng", label: "General Engineering" },
] as const

export type DepartmentCode = (typeof departmentOptions)[number]["code"]

export const departmentLabelByCode: Record<DepartmentCode, string> = Object.fromEntries(
  departmentOptions.map((item) => [item.code, item.label]),
) as Record<DepartmentCode, string>
