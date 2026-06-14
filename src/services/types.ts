// Insert/update payload shapes — derived from the domain types, with the
// server-managed and join-only fields removed.

import type { Case, Measurement, SpecCheck, Draft } from '@/types'

type ServerManaged = 'id' | 'created_at' | 'updated_at'
type CaseJoins = 'vessel' | 'port' | 'supplier' | 'delivery' | 'assigned_user'
  | 'documents' | 'measurements' | 'spec_checks' | 'drafts' | 'activities'

export type CaseInsert = Omit<Case, ServerManaged | CaseJoins | 'deleted_at'>
export type CaseUpdate = Partial<CaseInsert>

export type MeasurementInsert = Omit<Measurement, ServerManaged>
export type MeasurementUpdate = Partial<MeasurementInsert>

export type SpecCheckInsert = Omit<SpecCheck, ServerManaged>
export type SpecCheckUpdate = Partial<SpecCheckInsert>

type DraftJoins = 'creator' | 'reviewer' | 'approver'
export type DraftInsert = Omit<Draft, ServerManaged | DraftJoins>
export type DraftUpdate = Partial<DraftInsert>

export interface DashboardCounts {
  openCases: number
  urgentCases: number
  pendingDrafts: number
  specAlerts: number
  readinessDue: number
}
