import { useState, useMemo } from 'react'
import { mockCases } from '@/data/mockData'
import type { Case, FilterState } from '@/types'

export function useCases() {
  const [cases, setCases] = useState<Case[]>(mockCases)

  const addCase = (newCase: Case) => {
    setCases((prev) => [newCase, ...prev])
  }

  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    )
  }

  return { cases, addCase, updateCase }
}

export function useFilteredCases(cases: Case[], filters: Partial<FilterState>) {
  return useMemo(() => {
    return cases.filter((c) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchRef = c.reference?.toLowerCase().includes(q)
        const matchVessel = c.vessel?.name.toLowerCase().includes(q)
        const matchPort = c.port?.name.toLowerCase().includes(q)
        const matchDesc = c.description.toLowerCase().includes(q)
        if (!matchRef && !matchVessel && !matchPort && !matchDesc) return false
      }
      if (filters.status && c.status !== filters.status) return false
      if (filters.fuel_type && c.fuel_type !== filters.fuel_type) return false
      if (filters.vessel && c.vessel_id !== filters.vessel) return false
      if (filters.supplier && c.supplier_id !== filters.supplier) return false
      if (filters.port && c.port_id !== filters.port) return false
      return true
    })
  }, [cases, filters])
}

export function useCaseById(id: string | undefined) {
  return useMemo(() => {
    if (!id) return undefined
    return mockCases.find((c) => c.id === id)
  }, [id])
}

export function useCaseStats() {
  return useMemo(() => {
    const total = mockCases.length
    const open = mockCases.filter((c) => c.status === 'open').length
    const escalated = mockCases.filter((c) => c.status === 'escalated').length
    const underReview = mockCases.filter((c) => c.status === 'under_review').length
    const pendingResponse = mockCases.filter((c) => c.status === 'pending_response').length
    const resolved = mockCases.filter((c) => c.status === 'resolved').length
    const closed = mockCases.filter((c) => c.status === 'closed').length

    return { total, open, escalated, underReview, pendingResponse, resolved, closed }
  }, [])
}
