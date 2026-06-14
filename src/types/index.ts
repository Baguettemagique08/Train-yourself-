// ============================================================
// ENUMS
// ============================================================

export type CaseStatus =
  | 'open'
  | 'under_review'
  | 'pending_response'
  | 'escalated'
  | 'resolved'
  | 'closed'

export type DocumentType =
  | 'BDN'
  | 'NOR'
  | 'LOP'
  | 'Protest'
  | 'Lab_Report'
  | 'MFM_Log'
  | 'Ullage_Report'
  | 'Charter_Party'
  | 'Other'

export type FuelType =
  | 'VLSFO'
  | 'HSFO'
  | 'MGO'
  | 'LSMGO'
  | 'LNG'
  | 'Methanol'
  | 'Ammonia'
  | 'Biofuel'
  | 'B24'
  | 'B100'

export type DraftType =
  | 'LOP_Response'
  | 'Owner_Update'
  | 'Charterer_Notice'
  | 'Internal_Memo'
  | 'Claim_Letter'
  | 'Protest_Letter'

export type DraftStatus = 'draft' | 'under_review' | 'approved' | 'sent'

export type DiscrepancyType =
  | 'quantity_short'
  | 'quantity_over'
  | 'off_spec'
  | 'mfm_dispute'
  | 'documentation'
  | 'other'

export type SpecStatus = 'ok' | 'warning' | 'off_spec' | 'not_tested'

export type DocumentStatus = 'processing' | 'ready' | 'needs_review' | 'failed'

export type UserRole = 'admin' | 'senior_broker' | 'broker' | 'analyst' | 'readonly'

export type FuelReadinessStatus = 'not_started' | 'in_progress' | 'ready' | 'certified'

// ============================================================
// ENTITIES
// ============================================================

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  type: 'shipowner' | 'charterer' | 'supplier' | 'other'
  country: string
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
  created_at: string
  updated_at: string
}

export interface Vessel {
  id: string
  name: string
  imo: string
  flag: string
  type: string
  dwt: number
  owner_id?: string
  owner?: Company
  created_at: string
  updated_at: string
}

export interface Port {
  id: string
  name: string
  country: string
  unlocode: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  country: string
  contact_email?: string
  created_at: string
  updated_at: string
}

export interface Delivery {
  id: string
  vessel_id: string
  vessel?: Vessel
  port_id: string
  port?: Port
  supplier_id: string
  supplier?: Supplier
  fuel_type: FuelType
  bdn_quantity: number
  delivery_date: string
  bdn_number: string
  case_id?: string
  created_at: string
  updated_at: string
}

export interface Case {
  id: string
  reference: string
  vessel_id: string
  vessel?: Vessel
  port_id: string
  port?: Port
  supplier_id: string
  supplier?: Supplier
  delivery_id?: string
  delivery?: Delivery
  fuel_type: FuelType
  discrepancy_type: DiscrepancyType
  claimed_quantity?: number
  bdn_quantity?: number
  status: CaseStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assigned_to?: string
  assigned_user?: User
  description: string
  delivery_date: string
  created_at: string
  updated_at: string
  documents?: Document[]
  measurements?: Measurement[]
  specs_checks?: SpecsCheck[]
  drafts?: Draft[]
  activities?: Activity[]
}

export interface Document {
  id: string
  case_id: string
  type: DocumentType
  filename: string
  file_url?: string
  file_size?: number
  status: DocumentStatus
  uploaded_by?: string
  uploader?: User
  extracted_fields?: ExtractedField[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface ExtractedField {
  id: string
  document_id: string
  field_name: string
  field_value: string
  confidence?: number
  needs_review: boolean
  created_at: string
  updated_at: string
}

export interface Measurement {
  id: string
  case_id: string
  source: 'vessel' | 'barge' | 'mfm' | 'shore'
  fuel_type: FuelType
  gross_quantity: number
  net_quantity: number
  temperature?: number
  density?: number
  vcf?: number
  trim_correction?: number
  notes?: string
  measured_by?: string
  measured_at: string
  created_at: string
  updated_at: string
}

export interface SpecsCheck {
  id: string
  case_id: string
  parameter: string
  unit: string
  bdn_value?: number | null
  contract_min?: number | null
  contract_max?: number | null
  lab_result?: number | null
  status: SpecStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface Draft {
  id: string
  case_id: string
  type: DraftType
  title: string
  content: string
  status: DraftStatus
  version: number
  created_by?: string
  creator?: User
  approved_by?: string
  approver?: User
  sent_at?: string
  sent_to?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  case_id: string
  user_id?: string
  user?: User
  action: string
  description: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface FuelReadinessRecord {
  id: string
  vessel_id: string
  vessel?: Vessel
  fuel_type: FuelType
  status: FuelReadinessStatus
  readiness_score: number
  requirements: FuelRequirement[]
  target_date?: string
  certifying_body?: string
  certificate_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface FuelRequirement {
  id: string
  label: string
  description: string
  completed: boolean
  due_date?: string
  document_ref?: string
}

// ============================================================
// UI / VIEW TYPES
// ============================================================

export interface KPIData {
  label: string
  value: number
  delta?: number
  deltaLabel?: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface ReconcilerRow {
  fuel_type: FuelType
  vessel_gross: number
  vessel_net: number
  barge_gross: number
  barge_net: number
  mfm_gross: number
  mfm_net: number
  difference_vessel_barge: number
  difference_pct_vessel_barge: number
  difference_vessel_mfm: number
  difference_pct_vessel_mfm: number
  variance_flag: 'ok' | 'amber' | 'red'
}

export interface SpecsRow {
  parameter: string
  unit: string
  bdn_value: number | null
  contract_min: number | null
  contract_max: number | null
  lab_result: number | null
  variance: number | null
  status: SpecStatus
}

export interface FilterState {
  vessel?: string
  supplier?: string
  port?: string
  fuel_type?: FuelType
  status?: CaseStatus
  date_from?: string
  date_to?: string
  search?: string
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

export interface Threshold {
  id: string
  parameter: string
  unit: string
  warning_threshold: number
  critical_threshold: number
}

export interface Template {
  id: string
  type: DraftType
  name: string
  content: string
  created_at: string
  updated_at: string
}
