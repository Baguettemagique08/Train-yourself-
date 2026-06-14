import { useEffect, useState, useCallback } from 'react'
import { mockUsers } from '@/data/mockData'
import { isSupabaseConfigured } from '@/lib/supabase'
import { authService } from '@/services/auth.service'
import type { User } from '@/types'

// In demo mode (no Supabase env), we use a fixed mock user so the UI is usable.
const DEMO_USER_ID = 'u4' // Olivia Le Blond — Compliance Officer
const demoUser = mockUsers.find((u) => u.id === DEMO_USER_ID) ?? mockUsers[0] ?? null

/**
 * Authentication for internal users.
 *
 * - With Supabase configured: backed by Supabase Auth; the signed-in user's
 *   application profile is loaded from the `profiles` table and the session is
 *   kept in sync via onAuthStateChange.
 * - Without configuration (demo mode): resolves a fixed mock user.
 *
 * The return shape is a superset of the original ({ currentUser, isAuthenticated,
 * signOut }) so existing callers keep working.
 */
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(isSupabaseConfigured ? null : demoUser)
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true

    const load = async () => {
      try {
        const session = await authService.getSession()
        if (!active) return
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id)
          if (active) setCurrentUser(profile)
        } else {
          setCurrentUser(null)
        }
      } catch {
        if (active) setCurrentUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()

    const unsubscribe = authService.onAuthStateChange(async (_event, session) => {
      if (!active) return
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id).catch(() => null)
        if (active) setCurrentUser(profile)
      } else {
        setCurrentUser(null)
      }
    })

    return () => { active = false; unsubscribe() }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return // no-op in demo mode
    setLoading(true)
    try {
      await authService.signIn(email, password)
      // onAuthStateChange will populate currentUser.
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) { setCurrentUser(null); return }
    await authService.signOut()
    setCurrentUser(null)
  }, [])

  return {
    currentUser,
    isAuthenticated: currentUser !== null,
    loading,
    signIn,
    signOut,
  }
}
