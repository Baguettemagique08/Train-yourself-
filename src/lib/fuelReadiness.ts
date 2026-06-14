// ============================================================================
// Alternative Fuel Readiness — model + transparent scoring engine.
//
// This is an OPERATIONAL readiness tracker, not a regulatory compliance engine.
// The score is a plain weighted average of category scores, where each category
// score is the share of its criteria that are met. Weights and thresholds are
// configurable, and any category score can be manually overridden — all of it
// is visible so the number can be explained and audited.
// ============================================================================

import type { FuelType, FuelReadinessStatus, Vessel, Port } from '@/types'

// ── Gap categories ────────────────────────────────────────────────────────────

export type ReadinessCategoryKey =
  | 'documentation'
  | 'supplier_access'
  | 'tank_system'
  | 'crew_readiness'
  | 'port_capability'
  | 'sampling_testing'
  | 'reporting_compliance'

export interface CategoryMeta {
  key: ReadinessCategoryKey
  label: string
  short: string
  description: string
}

export const CATEGORY_META: Record<ReadinessCategoryKey, CategoryMeta> = {
  documentation: {
    key: 'documentation', label: 'Documentation & Approvals', short: 'Documentation',
    description: 'Class approvals, flag-state authorisation, certificates and procedures on file.',
  },
  supplier_access: {
    key: 'supplier_access', label: 'Supplier Access', short: 'Supplier access',
    description: 'Qualified suppliers and supply agreements for the fuel at the trading range.',
  },
  tank_system: {
    key: 'tank_system', label: 'Tank / System Suitability', short: 'Tank & systems',
    description: 'Fuel containment, piping, materials and safety systems suitable for the fuel.',
  },
  crew_readiness: {
    key: 'crew_readiness', label: 'Crew Readiness', short: 'Crew',
    description: 'Crew training, competency and emergency procedures for the fuel.',
  },
  port_capability: {
    key: 'port_capability', label: 'Port Capability', short: 'Port capability',
    description: 'Bunkering availability and method at the vessel’s primary ports.',
  },
  sampling_testing: {
    key: 'sampling_testing', label: 'Sampling / Testing Process', short: 'Sampling & testing',
    description: 'Representative sampling, retained samples and quality-testing arrangements.',
  },
  reporting_compliance: {
    key: 'reporting_compliance', label: 'Reporting / Compliance Process', short: 'Reporting',
    description: 'GHG/FuelEU data capture, MRV reporting and record-keeping process.',
  },
}

export const CATEGORY_ORDER: ReadinessCategoryKey[] = [
  'documentation', 'supplier_access', 'tank_system', 'crew_readiness',
  'port_capability', 'sampling_testing', 'reporting_compliance',
]

/** Alternative / transitional fuels tracked by this module. */
export const ALT_FUEL_TYPES: FuelType[] = ['Methanol', 'Ammonia', 'B24', 'Biofuel', 'LNG', 'HVO']

// ── Record model ──────────────────────────────────────────────────────────────

export interface ReadinessCriterion {
  id: string
  label: string
  met: boolean
  note?: string
}

export interface CategoryAssessment {
  category: ReadinessCategoryKey
  /** Relative weight used in the overall score (normalised at compute time). */
  weight: number
  criteria: ReadinessCriterion[]
  /** Optional manual override of the derived category score (0–100). */
  manual_score?: number
  notes?: string
}

export type ActionStatus = 'open' | 'in_progress' | 'done' | 'blocked'
export type ActionPriority = 'low' | 'normal' | 'high'

export interface ReadinessActionItem {
  id: string
  title: string
  category: ReadinessCategoryKey
  owner?: string
  due_date?: string
  status: ActionStatus
  priority: ActionPriority
}

export interface VesselFuelReadiness {
  id: string
  vessel_id: string
  vessel?: Vessel
  fuel_type: FuelType
  /** Derived from the score (stored for list/filter convenience). */
  status: FuelReadinessStatus
  /** Derived aggregate 0–100 (stored; always recomputable). */
  readiness_score: number
  categories: CategoryAssessment[]
  actions: ReadinessActionItem[]
  primary_port_ids: string[]
  target_date?: string
  next_review_date?: string
  certifying_body?: string
  certificate_ref?: string
  assessed_by?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type PortCapabilityStatus = 'available' | 'planned' | 'unavailable'

export interface PortFuelCapability {
  id: string
  port_id: string
  port?: Port
  fuel_type: FuelType
  status: PortCapabilityStatus
  bunkering_method?: string
  suppliers?: string[]
  earliest_date?: string
  notes?: string
}

// ── Scoring configuration (transparent + editable) ────────────────────────────

export interface ScoringConfig {
  weights: Record<ReadinessCategoryKey, number>
  /** Score at/above which a programme is considered "ready". */
  readyThreshold: number
}

export const DEFAULT_WEIGHTS: Record<ReadinessCategoryKey, number> = {
  documentation: 0.15,
  supplier_access: 0.15,
  tank_system: 0.20,
  crew_readiness: 0.15,
  port_capability: 0.15,
  sampling_testing: 0.10,
  reporting_compliance: 0.10,
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  weights: DEFAULT_WEIGHTS,
  readyThreshold: 85,
}

// ── Scoring functions ─────────────────────────────────────────────────────────

/** Category score = manual override, else share of criteria met (0–100). */
export function categoryScore(a: CategoryAssessment): number {
  if (typeof a.manual_score === 'number') return clamp(a.manual_score)
  if (a.criteria.length === 0) return 0
  const met = a.criteria.filter((c) => c.met).length
  return Math.round((met / a.criteria.length) * 100)
}

export interface CategoryContribution {
  category: ReadinessCategoryKey
  score: number
  weight: number          // normalised weight actually applied
  weighted: number        // score * normalised weight
  manual: boolean
}

/** Overall score with a full per-category contribution breakdown. */
export function computeOverall(
  categories: CategoryAssessment[],
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): { score: number; contributions: CategoryContribution[] } {
  const raw = categories.map((a) => ({
    category: a.category,
    score: categoryScore(a),
    weight: config.weights[a.category] ?? a.weight ?? 0,
    manual: typeof a.manual_score === 'number',
  }))
  const totalWeight = raw.reduce((s, r) => s + r.weight, 0) || 1
  const contributions: CategoryContribution[] = raw.map((r) => {
    const w = r.weight / totalWeight
    return { ...r, weight: w, weighted: r.score * w }
  })
  const score = Math.round(contributions.reduce((s, c) => s + c.weighted, 0))
  return { score, contributions }
}

export function deriveStatus(
  score: number,
  hasCertificate: boolean,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): FuelReadinessStatus {
  if (score <= 0) return 'not_started'
  if (score >= config.readyThreshold) return hasCertificate ? 'certified' : 'ready'
  return 'in_progress'
}

/** Lowest-scoring categories — the headline gaps for a programme. */
export function topGaps(
  categories: CategoryAssessment[],
  limit = 3,
): { category: ReadinessCategoryKey; score: number }[] {
  return categories
    .map((a) => ({ category: a.category, score: categoryScore(a) }))
    .filter((c) => c.score < 100)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
}

export function scoreBand(score: number): 'low' | 'medium' | 'high' {
  if (score >= 85) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}
