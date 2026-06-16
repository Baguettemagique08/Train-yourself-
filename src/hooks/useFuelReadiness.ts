import { useMemo, useState, useCallback } from 'react'
import { mockVesselReadiness, mockPortCapabilities } from '@/data/fuelReadinessData'
import { mockVessels, mockPorts } from '@/data/mockData'
import {
  computeOverall, deriveStatus, DEFAULT_SCORING_CONFIG,
  type VesselFuelReadiness, type ScoringConfig, type ReadinessCategoryKey,
  type ReadinessActionItem, type ActionStatus,
} from '@/lib/fuelReadiness'
import type { FuelType, FuelReadinessStatus } from '@/types'

/** Reference "now" for the seeded data — keeps review-due states stable. */
const REFERENCE_NOW = new Date()
const DAY = 86_400_000
const REVIEW_WINDOW_DAYS = 60

export interface ReadinessFilters {
  vessel: string
  port: string
  fuel: string
  status: string
}

const EMPTY: ReadinessFilters = { vessel: '', port: '', fuel: '', status: '' }

export function reviewDue(record: VesselFuelReadiness): boolean {
  if (!record.next_review_date) return false
  const days = (new Date(record.next_review_date).getTime() - REFERENCE_NOW.getTime()) / DAY
  return days <= REVIEW_WINDOW_DAYS
}

export function reviewOverdue(record: VesselFuelReadiness): boolean {
  if (!record.next_review_date) return false
  return new Date(record.next_review_date).getTime() < REFERENCE_NOW.getTime()
}

export function useFuelReadiness() {
  const [filters, setFilters] = useState<ReadinessFilters>(EMPTY)

  const setFilter = useCallback((key: keyof ReadinessFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])
  const clearFilters = useCallback(() => setFilters(EMPTY), [])

  const records = useMemo(() => {
    return mockVesselReadiness.filter((r) => {
      if (filters.vessel && r.vessel_id !== filters.vessel) return false
      if (filters.fuel && r.fuel_type !== filters.fuel) return false
      if (filters.status && r.status !== filters.status) return false
      if (filters.port && !r.primary_port_ids.includes(filters.port)) return false
      return true
    })
  }, [filters])

  const kpis = useMemo(() => {
    const all = mockVesselReadiness
    const ready = all.filter((r) => r.status === 'ready' || r.status === 'certified').length
    const due = all.filter(reviewDue).length
    const avg = all.length ? Math.round(all.reduce((s, r) => s + r.readiness_score, 0) / all.length) : 0
    return { programmes: all.length, ready, reviewsDue: due, avgScore: avg }
  }, [])

  const fuelOptions = useMemo(
    () => Array.from(new Set(mockVesselReadiness.map((r) => r.fuel_type))) as FuelType[],
    [],
  )

  const hasFilters = Object.values(filters).some((v) => v !== '')

  return {
    filters, setFilter, clearFilters, hasFilters,
    records,
    kpis,
    vessels: mockVessels,
    ports: mockPorts,
    fuelOptions,
    portCapabilities: mockPortCapabilities,
  }
}

// ── Editable single record (detail page) ──────────────────────────────────────

export function useReadinessRecord(id: string | undefined) {
  const base = useMemo(() => mockVesselReadiness.find((r) => r.id === id) ?? null, [id])

  const [record, setRecord] = useState<VesselFuelReadiness | null>(base)
  const [config, setConfig] = useState<ScoringConfig>(DEFAULT_SCORING_CONFIG)

  // Keep local state aligned if the id changes.
  const [loadedId, setLoadedId] = useState(id)
  if (id !== loadedId) {
    setLoadedId(id)
    setRecord(base)
    setConfig(DEFAULT_SCORING_CONFIG)
  }

  const { score, contributions } = useMemo(
    () => (record ? computeOverall(record.categories, config) : { score: 0, contributions: [] }),
    [record, config],
  )
  const status: FuelReadinessStatus = useMemo(
    () => deriveStatus(score, !!record?.certificate_ref, config),
    [score, record?.certificate_ref, config],
  )

  const toggleCriterion = useCallback((category: ReadinessCategoryKey, criterionId: string) => {
    setRecord((prev) => prev && ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.category !== category ? c : {
          ...c,
          // Toggling a criterion clears any manual override so the share-based
          // score is shown again (transparent).
          manual_score: undefined,
          criteria: c.criteria.map((cr) => cr.id === criterionId ? { ...cr, met: !cr.met } : cr),
        }),
    }))
  }, [])

  const setManualScore = useCallback((category: ReadinessCategoryKey, value: number | undefined) => {
    setRecord((prev) => prev && ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.category === category ? { ...c, manual_score: value } : c),
    }))
  }, [])

  const setWeight = useCallback((category: ReadinessCategoryKey, weight: number) => {
    setConfig((prev) => ({ ...prev, weights: { ...prev.weights, [category]: Math.max(0, weight) } }))
  }, [])

  const setReadyThreshold = useCallback((value: number) => {
    setConfig((prev) => ({ ...prev, readyThreshold: Math.max(1, Math.min(100, value)) }))
  }, [])

  const setNextReview = useCallback((date: string) => {
    setRecord((prev) => prev && ({ ...prev, next_review_date: date }))
  }, [])

  const setActionStatus = useCallback((actionId: string, status: ActionStatus) => {
    setRecord((prev) => prev && ({
      ...prev,
      actions: prev.actions.map((a) => a.id === actionId ? { ...a, status } : a),
    }))
  }, [])

  const addAction = useCallback((a: Omit<ReadinessActionItem, 'id'>) => {
    setRecord((prev) => prev && ({
      ...prev,
      actions: [...prev.actions, { ...a, id: `act-${Date.now()}` }],
    }))
  }, [])

  return {
    record, config,
    score, status, contributions,
    toggleCriterion, setManualScore, setWeight, setReadyThreshold,
    setNextReview, setActionStatus, addAction,
  }
}
