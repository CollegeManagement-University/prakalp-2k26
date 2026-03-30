import { Suspense } from 'react'

import { AuthCard } from '@/components/auth/auth-card'

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-10">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading sign up...</div>}>
        <AuthCard mode="signup" />
      </Suspense>
    </main>
  )
}
