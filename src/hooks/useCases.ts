import { useState, useMemo } from 'react'
import { mockCases, caseRegistry } from '@/data/mockData'
import type { Case, FilterState } from '@/types'

export function useCases() {
  const [cases, setCases] = useState<Case[]>([...caseRegistry.values()])

  const addCase = (newCase: Case) => {
    caseRegistry.set(newCase.id, newCase)
    setCases([...caseRegistry.values()])
  }

  const updateCase = (id: string, updates: Partial<Case>) => {
    const existing = caseRegistry.get(id)
    if (!existing) return
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() }
    caseRegistry.set(id, updated)
    setCases([...caseRegistry.values()])
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
    return caseRegistry.get(id) ?? mockCases.find((c) => c.id === id)
  }, [id])
}

export function useCaseStats() {
  return useMemo(() => {
    const all = [...caseRegistry.values()]
    const total = all.length
    const open = all.filter((c) => c.status === 'open').length
    const escalated = all.filter((c) => c.status === 'escalated').length
    const underReview = all.filter((c) => c.status === 'under_review').length
    const pendingResponse = all.filter((c) => c.status === 'pending_response').length
    const resolved = all.filter((c) => c.status === 'resolved').length
    const closed = all.filter((c) => c.status === 'closed').length
    return { total, open, escalated, underReview, pendingResponse, resolved, closed }
  }, [])
}
