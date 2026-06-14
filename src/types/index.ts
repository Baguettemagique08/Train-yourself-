// ============================================================
// ENUMS — mirror the Postgres enum definitions exactly
// ============================================================

export type UserRole =
  | 'admin'
  | 'senior_broker'
  | 'broker'
  | 'analyst'
  | 'readonly'

export type CompanyType = 'shipowner' | 'charterer' | 'supplier' | 'other'

export type DeliveryStatus =
  | 'in_progress'
  | 'completed'
  | 'confirmed'
  | 'disputed'
  | 'cancelled'

export type CaseStatus =
  | 'open'
  | 'under_review'
  | 'pending_response'
  | 'escalated'
  | 'resolved'
  | 'closed'

export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent'

export type DiscrepancyType =
  | 'quantity_short'
  | 'quantity_over'
  | 'off_spec'
  | 'mfm_dispute'
  | 'documentation'
  | 'contamination'
  | 'other'

export type DocumentType =
  | 'BDN'
  | 'NOR'
  | 'LOP'
  | 'Protest'
  | 'Lab_Report'
  | 'MFM_Log'
  | 'Ullage_Report'
  | 'Charter_Party'
  | 'Statement_of_Facts'
  | 'Laytime_Statement'
  | 'Survey_Report'
  | 'Invoice'
  | 'Correspondence'
  | 'Other'

export type DocumentStatus =
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'needs_review'
  | 'failed'

export type ExtractionStatus =
  | 'pending'
  | 'processing'
  | 'complete'
  | 'failed'
  | 'not_applicable'

// Source of a bunker quantity figure
export type MeasurementSource = 'vessel' | 'barge' | 'mfm' | 'surveyor' | 'manual'

export type SpecStatus = 'ok' | 'warning' | 'off_spec' | 'not_tested'

export type DraftType =
  | 'LOP_Response'
  | 'Owner_Update'
  | 'Charterer_Notice'
  | 'Internal_Memo'
  | 'Claim_Letter'
  | 'Protest_Letter'
  | 'Reservation_of_Rights'

export type DraftStatus = 'draft' | 'under_review' | 'approved' | 'sent' | 'superseded'

export type FuelType =
  | 'VLSFO'
  | 'ULSFO'
  | 'HSFO'
  | 'MGO'
  | 'LSMGO'
  | 'LNG'
  | 'LPG'
  | 'Methanol'
  | 'Ammonia'
  | 'Biofuel'
  | 'B24'
  | 'B100'
  | 'HVO'
  | 'Other'

export type FuelReadinessStatus = 'not_started' | 'in_progress' | 'ready' | 'certified'

export type ActivityType =
  | 'case_created'
  | 'case_status_changed'
  | 'case_assigned'
  | 'case_priority_changed'
  | 'case_closed'
  | 'document_uploaded'
  | 'document_reviewed'
  | 'extraction_complete'
  | 'measurement_added'
  | 'measurement_disputed'
  | 'spec_check_added'
  | 'spec_result_received'
  | 'draft_created'
  | 'draft_submitted'
  | 'draft_approved'
  | 'draft_sent'
  | 'draft_superseded'
  | 'delivery_reconciled'
  | 'note_added'
  | 'escalated'
  | 'fuel_readiness_updated'

export type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE'

// ============================================================
// MASTER DATA ENTITIES
// ============================================================

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  is_active: boolean
  last_seen_at?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  type: CompanyType
  country: string
  address?: string
  website?: string
  notes?: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  company_id: string
  company?: Company
  full_name: string
  email: string
  phone?: string
  role: string
  is_primary: boolean
  notes?: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

export interface Vessel {
  id: string
  name: string
  imo?: string
  mmsi?: string
  call_sign?: string
  flag: string
  vessel_type: string
  dwt?: number
  grt?: number
  year_built?: number
  owner_id?: string
  owner?: Company
  manager_id?: string
  manager?: Company
  notes?: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

export interface Port {
  id: string
  name: string
  country: string
  unlocode: string
  region?: string
  timezone: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  country: string
  license_number?: string
  contact_email?: string
  contact_phone?: string
  is_approved: boolean
  approval_note?: string
  notes?: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

// ============================================================
// OPERATIONAL ENTITIES
// ============================================================

export interface Delivery {
  id: string
  reference: string
  vessel_id: string
  vessel?: Vessel
  port_id: string
  port?: Port
  supplier_id: string
  supplier?: Supplier
  fuel_type: FuelType
  status: DeliveryStatus

  // BDN figures
  bdn_number: string
  bdn_quantity: number
  bdn_density?: number

  // Received figures
  vessel_quantity?: number
  mfm_quantity?: number

  // Timing
  delivery_date: string
  commenced_at?: string
  completed_at?: string

  charter_party_ref?: string
  nominated_by?: string

  notes?: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

export interface Case {
  id: string
  reference: string
  delivery_id: string
  delivery?: Delivery

  vessel_id: string
  vessel?: Vessel
  port_id: string
  port?: Port
  supplier_id: string
  supplier?: Supplier
  fuel_type: FuelType

  discrepancy_type: DiscrepancyType
  claimed_quantity?: number
  bdn_quantity?: number

  status: CaseStatus
  priority: PriorityLevel

  assigned_to?: string
  assigned_user?: User
  opened_by?: string
  opened_at: string
  closed_at?: string

  description: string
  internal_notes?: string

  deleted_at?: string
  created_at: string
  updated_at: string

  // Populated via joins
  documents?: Document[]
  measurements?: Measurement[]
  spec_checks?: SpecCheck[]
  drafts?: Draft[]
  activities?: Activity[]
}

export interface Document {
  id: string
  case_id: string
  delivery_id?: string
  uploaded_by?: string
  uploader?: User

  document_type: DocumentType
  filename: string
  storage_path: string
  file_size_bytes?: number
  mime_type?: string
  checksum_sha256?: string

  status: DocumentStatus
  extraction_status: ExtractionStatus
  source_description?: string

  notes?: string
  deleted_at?: string
  created_at: string
  updated_at: string

  extracted_fields?: ExtractedField[]
}

export interface ExtractedField {
  id: string
  document_id: string
  case_id?: string

  field_name: string
  field_value: string
  field_unit?: string
  confidence_score?: number
  page_number?: number

  is_verified: boolean
  verified_by?: string
  verified_at?: string
  override_value?: string

  created_at: string
  updated_at: string
}

export interface Measurement {
  id: string
  case_id: string
  delivery_id?: string
  document_id?: string

  source: MeasurementSource
  fuel_grade: FuelType

  quantity_mt: number

  // Full correction chain (optional)
  observed_volume_m3?: number
  temperature_c?: number
  density_at_obs_kgm3?: number
  density_at_15c_kgm3?: number
  vcf?: number
  trim_correction_m3?: number
  wedge_correction_m3?: number

  timestamp_utc: string
  surveyor_name?: string
  surveyor_company?: string

  is_disputed: boolean
  dispute_reason?: string

  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface SpecCheck {
  id: string
  case_id: string
  document_id?: string

  fuel_grade: FuelType
  parameter_name: string
  unit: string

  bdn_value?: number | null
  contract_min?: number | null
  contract_max?: number | null
  lab_result?: number | null

  status: SpecStatus
  deviation_pct?: number | null

  lab_reference?: string
  lab_date?: string
  lab_name?: string

  checked_by?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Draft {
  id: string
  case_id: string
  parent_draft_id?: string

  draft_type: DraftType
  title: string
  body: string
  status: DraftStatus
  version: number

  // Approval chain
  created_by?: string
  creator?: User
  submitted_for_review_at?: string
  reviewed_by?: string
  reviewer?: User
  reviewed_at?: string
  approved_by?: string
  approver?: User
  approved_at?: string
  sent_by?: string
  sent_at?: string

  recipient_name?: string
  recipient_email?: string
  sent_reference?: string

  template_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  case_id: string
  delivery_id?: string
  user_id?: string
  user?: User

  activity_type: ActivityType
  description: string
  metadata?: Record<string, unknown>

  created_at: string
}

export interface FuelRequirement {
  id: string
  label: string
  description: string
  completed: boolean
  due_date?: string
  doc_ref?: string
}

export interface FuelReadinessRecord {
  id: string
  vessel_id: string
  vessel?: Vessel
  port_id?: string
  port?: Port

  fuel_type: FuelType
  status: FuelReadinessStatus
  readiness_score: number
  requirements: FuelRequirement[]

  target_date?: string
  certifying_body?: string
  certificate_ref?: string
  certificate_expiry?: string

  assessed_by?: string
  assessed_at?: string
  notes?: string

  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  table_name: string
  record_id: string
  operation: AuditOperation
  old_data?: Record<string, unknown>
  new_data?: Record<string, unknown>
  changed_fields?: string[]
  ip_address?: string
  user_agent?: string
  created_at: string
}

// ============================================================
// CONFIGURATION ENTITIES
// ============================================================

export interface Threshold {
  id: string
  category: 'spec' | 'quantity'
  parameter: string
  unit: string
  warning_threshold: number
  critical_threshold: number
  fuel_type?: FuelType
  notes?: string
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  draft_type: DraftType
  name: string
  description?: string
  body: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

// ============================================================
// UI / VIEW TYPES (no DB backing)
// ============================================================

export interface KPIData {
  label: string
  value: number
  delta?: number
  deltaLabel?: string
  trend?: 'up' | 'down' | 'neutral'
}

// ============================================================
// DASHBOARD — shape returned by GET /api/dashboard
// (one aggregate endpoint; see useDashboard hook)
// ============================================================

/** A single headline metric with period-over-period movement. */
export interface DashboardKpi {
  /** Current value for the metric. */
  value: number
  /** Change vs the previous comparable period (e.g. last week). */
  delta: number
  /** Direction of the delta. */
  trend: 'up' | 'down' | 'neutral'
  /**
   * Whether an *increase* is operationally bad (e.g. more open cases).
   * Drives whether an upward delta renders red or green.
   */
  higher_is_worse: boolean
}

export interface DashboardKpis {
  open_cases: DashboardKpi
  urgent_cases: DashboardKpi
  pending_drafts: DashboardKpi
  spec_alerts: DashboardKpi
  readiness_reviews_due: DashboardKpi
}

export type DueUrgency = 'overdue' | 'today' | 'soon' | 'scheduled'

/** A case that needs a human decision/action inside the current week. */
export interface DashboardActionItem {
  case_id: string
  reference: string
  vessel_name: string
  port_name: string
  supplier_name: string
  fuel_type: FuelType
  status: CaseStatus
  priority: PriorityLevel
  discrepancy_type: DiscrepancyType
  /** Estimated financial exposure of the claim in USD. */
  exposure_usd: number
  /** Response/SLA deadline (ISO timestamp). */
  due_date: string
  /** Bucketed urgency, precomputed server-side against "now". */
  due_urgency: DueUrgency
  /** Short, human-readable next step (verb-first). */
  next_action: string
  assigned_to_name?: string
}

export interface DashboardActivityItem {
  id: string
  case_id: string
  case_reference: string
  activity_type: ActivityType
  description: string
  user_name?: string
  created_at: string
}

export interface DashboardUploadItem {
  id: string
  case_id?: string
  case_reference?: string
  filename: string
  document_type: DocumentType
  status: DocumentStatus
  created_at: string
}

/** A spec parameter currently outside tolerance, surfaced for triage. */
export interface DashboardSpecAlert {
  id: string
  case_id: string
  case_reference: string
  vessel_name: string
  parameter_name: string
  unit: string
  lab_result: number | null
  limit: number | null
  limit_kind: 'min' | 'max'
  status: SpecStatus
}

/** A vessel readiness assessment that needs review before its target date. */
export interface DashboardReadinessItem {
  id: string
  vessel_name: string
  fuel_type: FuelType
  status: FuelReadinessStatus
  readiness_score: number
  open_requirements: number
  target_date?: string
}

export type RiskLevel = 'low' | 'medium' | 'high'

/** Aggregated dispute exposure for a single counterparty (supplier/port). */
export interface DashboardCounterpartyRisk {
  id: string
  name: string
  kind: 'supplier' | 'port'
  open_cases: number
  total_cases: number
  off_spec_cases: number
  exposure_usd: number
  risk_level: RiskLevel
}

/** One bucket in the dispute-volume trend (typically a calendar week). */
export interface DashboardTrendPoint {
  /** ISO date of the bucket start. */
  period_start: string
  /** Short axis label, e.g. "W22". */
  label: string
  opened: number
  closed: number
}

export interface DashboardData {
  /** When the snapshot was generated (ISO). */
  generated_at: string
  kpis: DashboardKpis
  action_items: DashboardActionItem[]
  activity: DashboardActivityItem[]
  recent_uploads: DashboardUploadItem[]
  spec_alerts: DashboardSpecAlert[]
  readiness_due: DashboardReadinessItem[]
  counterparty_risk: DashboardCounterpartyRisk[]
  dispute_trend: DashboardTrendPoint[]
}

export interface ReconcilerRow {
  fuel_grade: FuelType
  vessel_mt?: number
  barge_mt?: number
  mfm_mt?: number
  surveyor_mt?: number
  bdn_mt: number
  diff_vessel_barge?: number
  diff_pct_vessel_barge?: number
  diff_vessel_mfm?: number
  diff_pct_vessel_mfm?: number
  variance_flag: 'ok' | 'amber' | 'red'
}

export interface SpecsRow {
  parameter_name: string
  unit: string
  bdn_value: number | null
  contract_min: number | null
  contract_max: number | null
  lab_result: number | null
  deviation_pct: number | null
  status: SpecStatus
}

export interface FilterState {
  vessel?: string
  supplier?: string
  port?: string
  fuel_type?: FuelType
  status?: CaseStatus
  priority?: PriorityLevel
  discrepancy_type?: DiscrepancyType
  date_from?: string
  date_to?: string
  search?: string
  assigned_to?: string
}

export interface PaginationState {
  page: number
  per_page: number
  total: number
}

export interface SortState {
  column: string
  direction: 'asc' | 'desc'
}

export interface TabDefinition {
  id: string
  label: string
  count?: number
}

export interface SelectOption {
  value: string
  label: string
}

// ── Legacy aliases for backward compat with existing page components ─────────
/** @deprecated use SpecCheck */
export type SpecsCheck = SpecCheck
/** @deprecated use User */
export type Profile = User
