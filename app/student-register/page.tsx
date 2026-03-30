'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { hasSupabaseEnv } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/client'

export default function StudentRegisterPage() {
  const router = useRouter()
  const envReady = useMemo(() => hasSupabaseEnv(), [])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!envReady) {
      setIsError(true)
      setMessage('Supabase env vars are missing. Add values to .env.local first.')
      return
    }

    setIsSubmitting(true)
    setIsError(false)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role: 'student',
          },
        },
      })

      if (error) {
        throw error
      }

      router.push('/login?message=Student account created. Please sign in.')
    } catch (error) {
      const rawText = error instanceof Error ? error.message : 'Student registration failed.'
      const normalized = rawText.toLowerCase()
      let text = rawText

      if (normalized.includes('error sending confirmation email')) {
        text =
          'Signup failed because confirmation email could not be sent. In Supabase, disable Email Confirmation for local testing or configure SMTP, then try again.'
      } else if (normalized.includes('invalid input value for enum user_role')) {
        text =
          'Signup failed because the database role enum is outdated. Re-run supabase/schema.sql so user_role includes student, then retry.'
      } else if (normalized.includes('database error saving new user')) {
        text =
          'Signup failed due to a database trigger/profile issue. Re-run supabase/schema.sql in SQL Editor, then try again.'
      }

      setIsError(true)
      setMessage(text)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
          <CardDescription>
            Create your student account with name, email, and password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />

            <Input
              type="email"
              placeholder="name@student.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />

            {message ? (
              <p className={isError ? 'text-destructive text-sm' : 'text-sm text-emerald-600'}>{message}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating student account...' : 'Register as Student'}
            </Button>
          </form>

          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to Faculty/Admin Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
