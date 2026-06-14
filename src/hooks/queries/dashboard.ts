import { useQuery } from '@tanstack/react-query'
import { dashboardService, isSupabaseConfigured } from '@/services'
import type { DashboardCounts } from '@/services'
import { mockCases, mockDrafts, mockSpecsChecks, mockFuelReadiness } from '@/data/mockData'
import { qk } from './keys'

function mockCounts(): DashboardCounts {
  const open = ['open', 'under_review', 'pending_response', 'escalated']
  return {
    openCases: mockCases.filter((c) => open.includes(c.status)).length,
    urgentCases: mockCases.filter((c) => c.priority === 'urgent' || c.status === 'escalated').length,
    pendingDrafts: mockDrafts.filter((d) => ['draft', 'under_review', 'approved'].includes(d.status)).length,
    specAlerts: mockSpecsChecks.filter((s) => s.status === 'off_spec').length,
    readinessDue: mockFuelReadiness.filter((r) => r.status !== 'certified').length,
  }
}

export function useDashboardCounts() {
  return useQuery({
    queryKey: qk.dashboard.counts,
    queryFn: () => (isSupabaseConfigured ? dashboardService.getCounts() : Promise.resolve(mockCounts())),
  })
}

export function useActionableCases(limit = 8) {
  return useQuery({
    queryKey: qk.dashboard.actionable,
    queryFn: () => (isSupabaseConfigured
      ? dashboardService.getActionableCases(limit)
      : Promise.resolve(mockCases.filter((c) => !['resolved', 'closed'].includes(c.status)).slice(0, limit))),
  })
}
