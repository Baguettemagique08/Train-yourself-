import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, ServiceError, unwrapMaybe } from './client'
import type { User } from '@/types'

/**
 * Auth for internal users. Copemer staff sign in with email + password against
 * Supabase Auth; their application profile (role, name) lives in the `profiles`
 * table keyed by the auth user id.
 */
export const authService = {
  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new ServiceError(error.message, { code: 'AUTH_SIGNIN' })
    if (!data.session) throw new ServiceError('No session returned', { code: 'AUTH_NO_SESSION' })
    return data.session
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new ServiceError(error.message, { code: 'AUTH_SIGNOUT' })
  },

  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw new ServiceError(error.message, { code: 'AUTH_SESSION' })
    return data.session
  },

  /** Load the application profile for an authenticated user id. */
  async getProfile(userId: string): Promise<User | null> {
    const res = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    return unwrapMaybe(res) as User | null
  },

  /** Subscribe to sign-in / sign-out; returns an unsubscribe function. */
  onAuthStateChange(cb: (event: AuthChangeEvent, session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange(cb)
    return () => data.subscription.unsubscribe()
  },
}
