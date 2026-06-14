import type { FilterState } from '@/types'

/** Centralised React Query keys so invalidation stays consistent. */
export const qk = {
  cases: {
    all: ['cases'] as const,
    list: (filters: Partial<FilterState>) => ['cases', 'list', filters] as const,
    detail: (id?: string) => ['cases', 'detail', id] as const,
  },
  measurements: {
    byCase: (caseId: string) => ['measurements', caseId] as const,
  },
  specChecks: {
    byCase: (caseId: string) => ['specChecks', caseId] as const,
  },
  drafts: {
    byCase: (caseId: string) => ['drafts', caseId] as const,
    detail: (id: string) => ['drafts', 'detail', id] as const,
  },
  dashboard: {
    counts: ['dashboard', 'counts'] as const,
    actionable: ['dashboard', 'actionable'] as const,
  },
}
