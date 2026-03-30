import { Suspense } from 'react'

import { AuthCard } from '@/components/auth/auth-card'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-10">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading login...</div>}>
        <AuthCard mode="login" />
      </Suspense>
    </main>
  )
}
