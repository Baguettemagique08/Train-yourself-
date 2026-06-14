import { useState } from 'react'
import { mockUsers } from '@/data/mockData'
import type { User } from '@/types'

// In production this would use Supabase Auth.
// For demo mode we use a mock current user.
const DEMO_USER_ID = 'u4' // Olivia Le Blond - Compliance Officer

export function useAuth() {
  const [currentUser] = useState<User | null>(
    mockUsers.find((u) => u.id === DEMO_USER_ID) ?? mockUsers[0] ?? null
  )

  const isAuthenticated = currentUser !== null

  const signOut = () => {
    // In production: supabase.auth.signOut()
    console.info('Sign out (demo mode — no-op)')
  }

  return { currentUser, isAuthenticated, signOut }
}
