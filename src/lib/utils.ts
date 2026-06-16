import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import type { BdnSigningStatus, BunkerSampleStatus, BunkerSampleType, CaseStatus, DiscrepancyType, DocumentType, DraftStatus, FuelReadinessStatus, FuelType, JointSurveyStatus, SettlementMethod, SpecStatus } from '@/types'

// ── Tailwind class merger ────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy')
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy HH:mm')
  } catch {
    return dateStr
  }
}

export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

// ── Number helpers ───────────────────────────────────────────────────────────

export function formatQuantity(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPct(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatMT(value: number): string {
  return `${formatQuantity(value)} MT`
}

// ── Label helpers ────────────────────────────────────────────────────────────

export function caseStatusLabel(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    open: 'Open',
    under_review: 'Under Review',
    pending_response: 'Pending Response',
    escalated: 'Escalated',
    resolved: 'Resolved',
    closed: 'Closed',
  }
  return map[status] ?? status
}

export function discrepancyLabel(type: DiscrepancyType): string {
  const map: Record<DiscrepancyType, string> = {
    quantity_short: 'Quantity Short',
    quantity_over: 'Quantity Over',
    off_spec: 'Off-Spec',
    mfm_dispute: 'MFM Dispute',
    documentation: 'Documentation',
    contamination: 'Contamination',
    other: 'Other',
  }
  return map[type] ?? type
}

export function documentTypeLabel(type: DocumentType): string {
  const map: Record<DocumentType, string> = {
    BDN: 'Bunker Delivery Note',
    NOR: 'Notice of Readiness',
    LOP: 'Letter of Protest',
    Protest: 'Protest',
    Lab_Report: 'Lab Report',
    MFM_Log: 'MFM Log',
    Ullage_Report: 'Ullage Report',
    Charter_Party: 'Charter Party',
    Statement_of_Facts: 'Statement of Facts',
    Laytime_Statement: 'Laytime Statement',
    Survey_Report: 'Survey Report',
    Invoice: 'Invoice',
    Correspondence: 'Correspondence',
    Other: 'Other',
    Bunker_Record_Book: 'Bunker Record Book',
    Sample_Analysis_Certificate: 'Sample Analysis Certificate',
    MFM_Certificate: 'MFM Calibration Certificate',
    Joint_Survey_Report: 'Joint Survey Report',
    Supplier_Response: 'Supplier Response',
  }
  return map[type] ?? type
}

export function draftStatusLabel(status: DraftStatus): string {
  const map: Record<DraftStatus, string> = {
    draft: 'Draft',
    under_review: 'Under Review',
    approved: 'Approved',
    sent: 'Sent',
    superseded: 'Superseded',
  }
  return map[status] ?? status
}

export function fuelReadinessLabel(status: FuelReadinessStatus): string {
  const map: Record<FuelReadinessStatus, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    ready: 'Ready',
    certified: 'Certified',
  }
  return map[status] ?? status
}

export function specStatusLabel(status: SpecStatus): string {
  const map: Record<SpecStatus, string> = {
    ok: 'OK',
    warning: 'Warning',
    off_spec: 'Off-Spec',
    not_tested: 'Not Tested',
  }
  return map[status] ?? status
}

// ── Color helpers ────────────────────────────────────────────────────────────

export function caseStatusColor(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    open: 'status-open',
    under_review: 'status-under_review',
    pending_response: 'status-pending_response',
    escalated: 'status-escalated',
    resolved: 'status-resolved',
    closed: 'status-closed',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}

export function specStatusColor(status: SpecStatus): string {
  const map: Record<SpecStatus, string> = {
    ok: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    off_spec: 'bg-red-100 text-red-700',
    not_tested: 'bg-slate-100 text-slate-500',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}

export function fuelTypeColor(fuel: FuelType): string {
  const map: Record<FuelType, string> = {
    VLSFO: 'bg-blue-100 text-blue-700',
    ULSFO: 'bg-blue-100 text-blue-800',
    HSFO: 'bg-orange-100 text-orange-700',
    MGO: 'bg-teal-100 text-teal-700',
    LSMGO: 'bg-cyan-100 text-cyan-700',
    LNG: 'bg-purple-100 text-purple-700',
    LPG: 'bg-violet-100 text-violet-700',
    Methanol: 'bg-pink-100 text-pink-700',
    Ammonia: 'bg-yellow-100 text-yellow-700',
    Biofuel: 'bg-green-100 text-green-700',
    B24: 'bg-lime-100 text-lime-700',
    B100: 'bg-emerald-100 text-emerald-700',
    HVO: 'bg-green-100 text-green-800',
    Other: 'bg-slate-100 text-slate-600',
  }
  return map[fuel] ?? 'bg-slate-100 text-slate-600'
}

export function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
  }
  return map[priority] ?? 'bg-slate-100 text-slate-600'
}

export function varianceFlagColor(flag: 'ok' | 'amber' | 'red'): string {
  const map = {
    ok: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  }
  return map[flag]
}

export function fuelReadinessColor(status: FuelReadinessStatus): string {
  const map: Record<FuelReadinessStatus, string> = {
    not_started: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-amber-100 text-amber-700',
    ready: 'bg-blue-100 text-blue-700',
    certified: 'bg-green-100 text-green-700',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}

// ── Misc ─────────────────────────────────────────────────────────────────────

export function generateCaseRef(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `CPM-${year}-${rand}`
}

export function fileSizeLabel(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function clampVariance(value: number, warningPct = 0.3, criticalPct = 0.5): 'ok' | 'amber' | 'red' {
  const abs = Math.abs(value)
  if (abs >= criticalPct) return 'red'
  if (abs >= warningPct) return 'amber'
  return 'ok'
}

export function bdnSigningStatusLabel(status: BdnSigningStatus): string {
  const map: Record<BdnSigningStatus, string> = {
    clean: 'Signed Clean',
    under_protest: 'Signed Under Protest',
    refused: 'Refused to Sign',
  }
  return map[status] ?? status
}

export function bdnSigningStatusColor(status: BdnSigningStatus): string {
  const map: Record<BdnSigningStatus, string> = {
    clean: 'bg-amber-100 text-amber-700',
    under_protest: 'bg-green-100 text-green-700',
    refused: 'bg-red-100 text-red-700',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}

export function jointSurveyStatusLabel(status: JointSurveyStatus): string {
  const map: Record<JointSurveyStatus, string> = {
    not_requested: 'Not Requested',
    requested: 'Requested',
    refused: 'Refused by Supplier',
    scheduled: 'Scheduled',
    completed: 'Completed',
  }
  return map[status] ?? status
}

export function settlementMethodLabel(method: SettlementMethod): string {
  const map: Record<SettlementMethod, string> = {
    credit_note: 'Credit Note',
    cash: 'Cash Payment',
    supplementary_delivery: 'Supplementary Delivery',
    arbitration_award: 'Arbitration Award',
    other: 'Other',
  }
  return map[method] ?? method
}

export function bunkerSampleTypeLabel(type: BunkerSampleType): string {
  const map: Record<BunkerSampleType, string> = {
    marpol: 'MARPOL Retained Sample',
    vessel: "Vessel's Sample",
    joint_drip: 'Joint Drip Sample',
    other: 'Other',
  }
  return map[type] ?? type
}

export function bunkerSampleStatusLabel(status: BunkerSampleStatus): string {
  const map: Record<BunkerSampleStatus, string> = {
    sealed: 'Sealed',
    in_transit: 'In Transit to Lab',
    at_lab: 'At Laboratory',
    results_received: 'Results Received',
    disputed: 'Disputed',
  }
  return map[status] ?? status
}
