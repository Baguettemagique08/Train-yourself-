import { useEffect, useMemo, useState } from 'react'
import {
  caseRegistry,
  draftRegistry,
  mockDocuments,
  mockActivities,
  mockSpecsChecks,
  mockFuelReadiness,
} from '@/data/mockData'
import type {
  Case,
  CaseStatus,
  DashboardActionItem,
  DashboardCounterpartyRisk,
  DashboardData,
  DashboardKpi,
  DashboardTimeBarItem,
  DueUrgency,
  FuelType,
  RiskLevel,
} from '@/types'

/**
 * Reference "now" for the seeded demo dataset. In production the backend would
 * use the real wall clock; anchoring it here keeps due/overdue states stable
 * against the static sample data regardless of the host clock.
 */
const REFERENCE_NOW = new Date()

const OPEN_STATUSES: CaseStatus[] = ['open', 'under_review', 'pending_response', 'escalated']

const DAY_MS = 24 * 60 * 60 * 1000

/** Indicative bunker prices (USD/MT) used to estimate claim exposure. */
const FUEL_PRICE_USD: Record<FuelType, number> = {
  VLSFO: 600, ULSFO: 650, HSFO: 480, MGO: 720, LSMGO: 740, LNG: 820,
  LPG: 700, Methanol: 760, Ammonia: 800, Biofuel: 900, B24: 690, B100: 1100,
  HVO: 1300, Other: 700,
}

/** SLA window (days from case open) before a response is considered due. */
const SLA_DAYS: Record<string, number> = { urgent: 3, high: 7, normal: 14, low: 21 }

function estimateExposureUsd(c: Case): number {
  const price = FUEL_PRICE_USD[c.fuel_type] ?? 700
  const bdn = c.bdn_quantity ?? 0
  const claimed = c.claimed_quantity ?? bdn
  let raw: number
  switch (c.discrepancy_type) {
    case 'quantity_short':
    case 'quantity_over':
    case 'mfm_dispute':
      raw = Math.abs(bdn - claimed) * price
      break
    case 'off_spec':
    case 'contamination':
      // Declassification / remediation: a fraction of the parcel value.
      raw = (claimed || bdn) * price * 0.12
      break
    default:
      raw = 5000
  }
  return Math.max(2500, Math.round(raw / 100) * 100)
}

function dueDateFor(c: Case): Date {
  const sla = SLA_DAYS[c.priority] ?? 14
  return new Date(new Date(c.opened_at).getTime() + sla * DAY_MS)
}

function dueUrgency(due: Date): DueUrgency {
  const diffDays = Math.floor((due.getTime() - REFERENCE_NOW.getTime()) / DAY_MS)
  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 4) return 'soon'
  return 'scheduled'
}

function nextActionFor(c: Case): string {
  switch (c.status) {
    case 'open':
      return c.discrepancy_type === 'off_spec'
        ? 'Review lab results & issue LOP'
        : 'Reconcile figures & issue LOP'
    case 'under_review':
      return 'Complete documentary review'
    case 'pending_response':
      return 'Chase supplier response'
    case 'escalated':
      return 'Escalate to senior broker / counsel'
    default:
      return 'Review case'
  }
}

const URGENCY_RANK: Record<DueUrgency, number> = { overdue: 0, today: 1, soon: 2, scheduled: 3 }
const PRIORITY_RANK: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 }

function buildActionItems(): DashboardActionItem[] {
  return [...caseRegistry.values()]
    .filter((c) => OPEN_STATUSES.includes(c.status))
    .map((c) => {
      const due = dueDateFor(c)
      return {
        case_id: c.id,
        reference: c.reference,
        vessel_name: c.vessel?.name ?? '—',
        port_name: c.port?.name ?? '—',
        supplier_name: c.supplier?.name ?? '—',
        fuel_type: c.fuel_type,
        status: c.status,
        priority: c.priority,
        discrepancy_type: c.discrepancy_type,
        exposure_usd: estimateExposureUsd(c),
        due_date: due.toISOString(),
        due_urgency: dueUrgency(due),
        next_action: nextActionFor(c),
        assigned_to_name: c.assigned_user?.full_name,
      }
    })
    .sort((a, b) => {
      const u = URGENCY_RANK[a.due_urgency] - URGENCY_RANK[b.due_urgency]
      if (u !== 0) return u
      const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      if (p !== 0) return p
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
}

function buildCounterpartyRisk(): DashboardCounterpartyRisk[] {
  const bySupplier = new Map<string, DashboardCounterpartyRisk>()

  for (const c of caseRegistry.values()) {
    if (!c.supplier) continue
    const key = c.supplier.id
    const entry = bySupplier.get(key) ?? {
      id: key,
      name: c.supplier.name,
      kind: 'supplier' as const,
      open_cases: 0,
      total_cases: 0,
      off_spec_cases: 0,
      exposure_usd: 0,
      risk_level: 'low' as RiskLevel,
    }
    entry.total_cases += 1
    const isOpen = OPEN_STATUSES.includes(c.status)
    if (isOpen) {
      entry.open_cases += 1
      entry.exposure_usd += estimateExposureUsd(c)
    }
    if (c.discrepancy_type === 'off_spec' || c.discrepancy_type === 'contamination') {
      entry.off_spec_cases += 1
    }
    bySupplier.set(key, entry)
  }

  const out = [...bySupplier.values()].map((e) => {
    let risk: RiskLevel = 'low'
    if (e.open_cases >= 2 || e.exposure_usd >= 50_000) risk = 'high'
    else if (e.open_cases === 1 || e.exposure_usd >= 15_000) risk = 'medium'
    return { ...e, risk_level: risk }
  })

  return out.sort((a, b) => b.exposure_usd - a.exposure_usd)
}

function makeKpi(value: number, delta: number, higherIsWorse: boolean): DashboardKpi {
  return {
    value,
    delta,
    trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
    higher_is_worse: higherIsWorse,
  }
}

function buildDisputeTrend() {
  const now = new Date()
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - i * 7 * DAY_MS)
    const label = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    // Count cases opened in that week window.
    const allCases = [...caseRegistry.values()]
    const opened = allCases.filter((c) => {
      const d = new Date(c.opened_at).getTime()
      return d >= weekStart.getTime() && d < weekStart.getTime() + 7 * DAY_MS
    }).length
    const closed = allCases.filter((c) => {
      if (!c.closed_at) return false
      const d = new Date(c.closed_at).getTime()
      return d >= weekStart.getTime() && d < weekStart.getTime() + 7 * DAY_MS
    }).length
    weeks.push({ period_start: weekStart.toISOString(), label, opened, closed })
  }
  return weeks
}

function buildTimeBars(): DashboardTimeBarItem[] {
  const now = REFERENCE_NOW.getTime()
  const WINDOW_MS = 60 * DAY_MS
  const items: DashboardTimeBarItem[] = []

  for (const c of caseRegistry.values()) {
    const addItem = (deadline: string, barType: 'notice' | 'time_bar') => {
      const ms = new Date(deadline).getTime()
      const daysRemaining = Math.floor((ms - now) / DAY_MS)
      if (ms - now > WINDOW_MS) return
      const urgency: DashboardTimeBarItem['urgency'] =
        daysRemaining < 0 ? 'overdue'
          : daysRemaining <= 7 ? 'critical'
            : daysRemaining <= 21 ? 'warning'
              : 'ok'
      items.push({
        case_id: c.id,
        reference: c.reference,
        vessel_name: c.vessel?.name ?? '—',
        port_name: c.port?.name ?? '—',
        bar_type: barType,
        deadline,
        days_remaining: daysRemaining,
        urgency,
      })
    }
    if (c.claim_notice_deadline) addItem(c.claim_notice_deadline, 'notice')
    if (c.claim_time_bar) addItem(c.claim_time_bar, 'time_bar')
  }

  return items.sort((a, b) => a.days_remaining - b.days_remaining)
}

function computeDashboard(): DashboardData {
  const allCases = [...caseRegistry.values()]
  const caseRef = new Map(allCases.map((c) => [c.id, c]))

  const openCases = allCases.filter((c) => OPEN_STATUSES.includes(c.status))
  const urgentCases = allCases.filter((c) => c.priority === 'urgent' || c.status === 'escalated')
  const pendingDrafts = [...draftRegistry.values()].filter((d) =>
    d.status === 'draft' || d.status === 'under_review' || d.status === 'approved',
  )
  const offSpec = mockSpecsChecks.filter((s) => s.status === 'off_spec')
  const specWatch = mockSpecsChecks.filter((s) => s.status === 'off_spec' || s.status === 'warning')
  const readinessDue = mockFuelReadiness.filter((r) => r.status !== 'certified')

  const action_items = buildActionItems()

  const activity = [...mockActivities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((a) => ({
      id: a.id,
      case_id: a.case_id,
      case_reference: caseRef.get(a.case_id)?.reference ?? '—',
      activity_type: a.activity_type,
      description: a.description,
      user_name: a.user?.full_name,
      created_at: a.created_at,
    }))

  const recent_uploads = [...mockDocuments]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      case_id: d.case_id,
      case_reference: caseRef.get(d.case_id)?.reference,
      filename: d.filename,
      document_type: d.document_type,
      status: d.status,
      created_at: d.created_at,
    }))

  const spec_alerts = specWatch
    .map((s) => {
      const c = caseRef.get(s.case_id)
      const limit_kind: 'min' | 'max' = s.contract_max != null ? 'max' : 'min'
      return {
        id: s.id,
        case_id: s.case_id,
        case_reference: c?.reference ?? '—',
        vessel_name: c?.vessel?.name ?? '—',
        parameter_name: s.parameter_name,
        unit: s.unit,
        lab_result: s.lab_result ?? null,
        limit: (limit_kind === 'max' ? s.contract_max : s.contract_min) ?? null,
        limit_kind,
        status: s.status,
      }
    })
    // Off-spec first, then warnings.
    .sort((a, b) => (a.status === 'off_spec' ? 0 : 1) - (b.status === 'off_spec' ? 0 : 1))

  const readiness_due = readinessDue
    .map((r) => ({
      id: r.id,
      vessel_name: r.vessel?.name ?? '—',
      fuel_type: r.fuel_type,
      status: r.status,
      readiness_score: r.readiness_score,
      open_requirements: r.requirements.filter((req) => !req.completed).length,
      target_date: r.target_date,
    }))
    .sort((a, b) => {
      if (!a.target_date) return 1
      if (!b.target_date) return -1
      return new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    })

  return {
    generated_at: new Date().toISOString(),
    kpis: {
      open_cases: makeKpi(openCases.length, 2, true),
      urgent_cases: makeKpi(urgentCases.length, 1, true),
      pending_drafts: makeKpi(pendingDrafts.length, -1, true),
      spec_alerts: makeKpi(offSpec.length, 1, true),
      readiness_reviews_due: makeKpi(readiness_due.length, 0, true),
    },
    action_items,
    activity,
    recent_uploads,
    spec_alerts,
    readiness_due,
    counterparty_risk: buildCounterpartyRisk(),
    dispute_trend: buildDisputeTrend(),
    time_bars: buildTimeBars(),
  }
}

export interface UseDashboardResult {
  data: DashboardData | null
  isLoading: boolean
  isError: boolean
}

/**
 * Loads the operations dashboard snapshot.
 *
 * Currently derived from local mock data with a simulated latency so loading
 * skeletons are exercised. To wire a real backend, replace the body with a
 * single fetch to `GET /api/dashboard` — the response shape is `DashboardData`.
 */
export function useDashboard(): UseDashboardResult {
  const [isLoading, setIsLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const handler = () => setTick((t) => t + 1)
    window.addEventListener('caseRegistryUpdated', handler)
    window.addEventListener('draftRegistryUpdated', handler)
    return () => {
      window.removeEventListener('caseRegistryUpdated', handler)
      window.removeEventListener('draftRegistryUpdated', handler)
    }
  }, [])

  const data = useMemo(() => computeDashboard(), [tick])

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  return { data, isLoading, isError: false }
}
