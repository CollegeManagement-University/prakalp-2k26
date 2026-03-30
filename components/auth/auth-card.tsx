'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/config'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type Mode = 'login' | 'signup'

type AuthCardProps = {
  mode: Mode
}

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(searchParams.get('error'))
  const [isError, setIsError] = useState(Boolean(searchParams.get('error')))

  const nextPath = searchParams.get('next') ?? '/'
  const isSignup = mode === 'signup'
  const envReady = useMemo(() => hasSupabaseEnv(), [])

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

      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          },
        })

        if (error) {
          throw error
        }

        setMessage('Account created. Check your inbox and confirm your email.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        router.replace(nextPath)
        router.refresh()
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Authentication failed.'
      setIsError(true)
      setMessage(text)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{isSignup ? 'Create your account' : 'Welcome back'}</CardTitle>
        <CardDescription>
          {isSignup
            ? 'Sign up with email and password to access the dashboard.'
            : 'Sign in with your Supabase account to continue.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {isSignup ? (
            <Input
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          ) : null}

          <Input
            type="email"
            placeholder="name@college.edu"
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
            {isSubmitting
              ? isSignup
                ? 'Creating account...'
                : 'Signing in...'
              : isSignup
                ? 'Create account'
                : 'Sign in'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link className="text-primary underline" href={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Sign in' : 'Create one'}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
