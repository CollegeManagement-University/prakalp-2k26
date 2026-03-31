export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      departments: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string
          created_at: string
          department_id: string
          id: string
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id: string
          id?: string
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'courses_department_id_fkey'
            columns: ['department_id']
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department_id: string | null
          full_name: string | null
          id: string
          role: 'student' | 'faculty' | 'admin'
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          full_name?: string | null
          id: string
          role?: 'student' | 'faculty' | 'admin'
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          full_name?: string | null
          id?: string
          role?: 'student' | 'faculty' | 'admin'
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_department_id_fkey'
            columns: ['department_id']
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
        ]
      }
      course_allocations: {
        Row: {
          assigned_at: string
          course_id: string
          faculty_id: string
          id: string
          semester: number
          section: string
          year: number
        }
        Insert: {
          assigned_at?: string
          course_id: string
          faculty_id: string
          id?: string
          semester: number
          section?: string
          year: number
        }
        Update: {
          assigned_at?: string
          course_id?: string
          faculty_id?: string
          id?: string
          semester?: number
          section?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: 'course_allocations_course_id_fkey'
            columns: ['course_id']
            referencedRelation: 'courses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'course_allocations_faculty_id_fkey'
            columns: ['faculty_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      feedback_submissions: {
        Row: {
          comment: string
          created_at: string
          department_id: string
          faculty_id: string
          id: string
          rating: number
          section: string
          semester: number
          student_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          department_id: string
          faculty_id: string
          id?: string
          rating: number
          section: string
          semester: number
          student_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          department_id?: string
          faculty_id?: string
          id?: string
          rating?: number
          section?: string
          semester?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'feedback_submissions_department_id_fkey'
            columns: ['department_id']
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'feedback_submissions_faculty_id_fkey'
            columns: ['faculty_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'feedback_submissions_student_id_fkey'
            columns: ['student_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string
          end_date: string
          id: string
          reason: string | null
          reviewer_id: string | null
          start_date: string
          status: 'pending' | 'approved' | 'rejected'
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          reason?: string | null
          reviewer_id?: string | null
          start_date: string
          status?: 'pending' | 'approved' | 'rejected'
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          reason?: string | null
          reviewer_id?: string | null
          start_date?: string
          status?: 'pending' | 'approved' | 'rejected'
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'leave_requests_reviewer_id_fkey'
            columns: ['reviewer_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leave_requests_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      timetable_slots: {
        Row: {
          course_allocation_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          room: string | null
          start_time: string
        }
        Insert: {
          course_allocation_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          room?: string | null
          start_time: string
        }
        Update: {
          course_allocation_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          room?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: 'timetable_slots_course_allocation_id_fkey'
            columns: ['course_allocation_id']
            referencedRelation: 'course_allocations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      leave_status: 'pending' | 'approved' | 'rejected'
      user_role: 'student' | 'faculty' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
