import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { casesService, isSupabaseConfigured } from '@/services'
import type { CaseInsert, CaseUpdate } from '@/services'
import { mockCases } from '@/data/mockData'
import { qk } from './keys'
import type { Case, FilterState } from '@/types'

// Mirrors casesService.list filtering so demo mode behaves the same.
function filterMock(filters: Partial<FilterState>): Case[] {
  return mockCases.filter((c) => {
    if (filters.status && c.status !== filters.status) return false
    if (filters.priority && c.priority !== filters.priority) return false
    if (filters.fuel_type && c.fuel_type !== filters.fuel_type) return false
    if (filters.vessel && c.vessel_id !== filters.vessel) return false
    if (filters.supplier && c.supplier_id !== filters.supplier) return false
    if (filters.port && c.port_id !== filters.port) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const hit = c.reference?.toLowerCase().includes(q)
        || c.vessel?.name.toLowerCase().includes(q)
        || c.port?.name.toLowerCase().includes(q)
        || c.description.toLowerCase().includes(q)
      if (!hit) return false
    }
    return true
  })
}

/** List cases. `data`, `isLoading`, `error` come straight from React Query. */
export function useCases(filters: Partial<FilterState> = {}) {
  return useQuery({
    queryKey: qk.cases.list(filters),
    queryFn: () => (isSupabaseConfigured ? casesService.list(filters) : Promise.resolve(filterMock(filters))),
  })
}

export function useCase(id?: string) {
  return useQuery({
    queryKey: qk.cases.detail(id),
    enabled: !!id,
    queryFn: () => {
      if (!id) return null
      return isSupabaseConfigured ? casesService.getById(id) : Promise.resolve(mockCases.find((c) => c.id === id) ?? null)
    },
  })
}

export function useCreateCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CaseInsert) => casesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.cases.all }),
  })
}

export function useUpdateCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: CaseUpdate }) => casesService.update(id, patch),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.cases.all })
      qc.invalidateQueries({ queryKey: qk.cases.detail(vars.id) })
    },
  })
}
