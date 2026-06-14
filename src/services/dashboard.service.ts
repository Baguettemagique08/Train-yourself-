import { supabase, fromPostgrest } from './client'
import type { DashboardCounts } from './types'
import type { Case } from '@/types'

/** Count helper using a head-only exact count (no rows transferred). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function count(table: string, apply: (q: any) => any): Promise<number> {
  const q = apply(supabase.from(table).select('id', { count: 'exact', head: true }))
  const { count: c, error } = await q
  if (error) throw fromPostgrest(error)
  return c ?? 0
}

export const dashboardService = {
  /** Headline KPI counts for the dashboard, fetched in parallel. */
  async getCounts(): Promise<DashboardCounts> {
    const [openCases, urgentCases, pendingDrafts, specAlerts, readinessDue] = await Promise.all([
      count('cases', (q) => q.is('deleted_at', null).in('status', ['open', 'under_review', 'pending_response', 'escalated'])),
      count('cases', (q) => q.is('deleted_at', null).or('priority.eq.urgent,status.eq.escalated')),
      count('drafts', (q) => q.in('status', ['draft', 'under_review', 'approved'])),
      count('spec_checks', (q) => q.eq('status', 'off_spec')),
      count('fuel_readiness_records', (q) => q.neq('status', 'certified')),
    ])
    return { openCases, urgentCases, pendingDrafts, specAlerts, readinessDue }
  },

  /** Most recently updated open cases for the "action this week" panel. */
  async getActionableCases(limit = 8): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*, vessel:vessel_id(*), port:port_id(*), supplier:supplier_id(*), assigned_user:assigned_to(*)')
      .is('deleted_at', null)
      .in('status', ['open', 'under_review', 'pending_response', 'escalated'])
      .order('updated_at', { ascending: false })
      .limit(limit)
    if (error) throw fromPostgrest(error)
    return (data ?? []) as unknown as Case[]
  },
}
