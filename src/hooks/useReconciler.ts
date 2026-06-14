import { useMemo, useState, useCallback } from 'react'
import { mockCases, mockMeasurements } from '@/data/mockData'
import { useAuth } from '@/hooks/useAuth'
import {
  runReconciliation,
  DEFAULT_THRESHOLDS,
  type ReconcilerInputs,
  type SourceAdjustment,
  type RobReference,
} from '@/lib/reconciler'
import type { Case, FuelType, MeasurementSource } from '@/types'

export interface ReconcilerComment {
  id: string
  author: string
  body: string
  created_at: string
}

export function useReconciler(initialCaseId?: string) {
  const { currentUser } = useAuth()

  const [caseId, setCaseId] = useState<string>(initialCaseId ?? mockCases[0]?.id ?? '')
  const [baseSource, setBaseSource] = useState<MeasurementSource>('barge')
  const [adjustments, setAdjustments] = useState<Partial<Record<MeasurementSource, SourceAdjustment>>>({})
  const [rob, setRob] = useState<RobReference>({ before_mt: null, after_mt: null })
  const [comments, setComments] = useState<ReconcilerComment[]>([])

  const selectedCase: Case | null = useMemo(
    () => mockCases.find((c) => c.id === caseId) ?? null,
    [caseId],
  )

  // Measurements for this case, and the grades they cover.
  const caseMeasurements = useMemo(
    () => mockMeasurements.filter((m) => m.case_id === caseId),
    [caseId],
  )

  const fuelGrades = useMemo(
    () => Array.from(new Set(caseMeasurements.map((m) => m.fuel_grade))) as FuelType[],
    [caseMeasurements],
  )

  const [fuelGrade, setFuelGrade] = useState<FuelType | null>(null)
  const effectiveGrade = fuelGrade ?? fuelGrades[0] ?? null

  const gradeMeasurements = useMemo(
    () => caseMeasurements.filter((m) => !effectiveGrade || m.fuel_grade === effectiveGrade),
    [caseMeasurements, effectiveGrade],
  )

  const inputs: ReconcilerInputs = useMemo(
    () => ({ thresholds: DEFAULT_THRESHOLDS, baseSource, adjustments, rob }),
    [baseSource, adjustments, rob],
  )

  const analysis = useMemo(
    () => runReconciliation(gradeMeasurements, inputs),
    [gradeMeasurements, inputs],
  )

  // ── Mutators ────────────────────────────────────────────────────────────────

  const selectCase = useCallback((id: string) => {
    setCaseId(id)
    setFuelGrade(null)
    setAdjustments({})
    setRob({ before_mt: null, after_mt: null })
    setComments([])
    setBaseSource('barge')
  }, [])

  const setAdjustment = useCallback((source: MeasurementSource, delta_mt: number, reason: string) => {
    setAdjustments((prev) => {
      const next = { ...prev }
      if (delta_mt === 0 && !reason.trim()) {
        delete next[source]
      } else {
        next[source] = { delta_mt, reason }
      }
      return next
    })
  }, [])

  const clearAdjustment = useCallback((source: MeasurementSource) => {
    setAdjustments((prev) => {
      const next = { ...prev }
      delete next[source]
      return next
    })
  }, [])

  const setRobValue = useCallback((field: keyof RobReference, value: number | null) => {
    setRob((prev) => ({ ...prev, [field]: value }))
  }, [])

  const addComment = useCallback((body: string) => {
    if (!body.trim()) return
    setComments((prev) => [
      ...prev,
      {
        id: `cmt-${Date.now()}`,
        author: currentUser?.full_name ?? 'Analyst',
        body: body.trim(),
        created_at: new Date().toISOString(),
      },
    ])
  }, [currentUser])

  return {
    // selection
    caseId,
    selectedCase,
    selectCase,
    fuelGrades,
    effectiveGrade,
    setFuelGrade,
    // config
    baseSource,
    setBaseSource,
    // adjustments & ROB
    adjustments,
    setAdjustment,
    clearAdjustment,
    rob,
    setRobValue,
    // comments
    comments,
    addComment,
    // derived analysis
    analysis,
    hasMeasurements: gradeMeasurements.length > 0,
  }
}
