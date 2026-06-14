// ============================================================================
// Document ingestion — types and helpers for the upload → extract → review →
// apply pipeline. Self-contained so it can model the richer ingestion state
// (classification, confidence, source snippets, target mapping) without
// disturbing the case-detail Document/ExtractedField model.
// ============================================================================

// ── Document classification ───────────────────────────────────────────────────

export type IngestDocType =
  | 'BDN'
  | 'Lab_Report'
  | 'Survey_Report'
  | 'Email'
  | 'Protest'
  | 'Delivery_Receipt'
  | 'Photo_Scan'

export interface DocTypeMeta {
  label: string
  short: string
  /** Tailwind accent for chips. */
  accent: string
}

export const DOC_TYPE_META: Record<IngestDocType, DocTypeMeta> = {
  BDN: { label: 'Bunker Delivery Note', short: 'BDN', accent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  Lab_Report: { label: 'Lab Report', short: 'Lab', accent: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  Survey_Report: { label: 'Survey Report', short: 'Survey', accent: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  Email: { label: 'Email / Forwarded', short: 'Email', accent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  Protest: { label: 'Vessel Protest Letter', short: 'Protest', accent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  Delivery_Receipt: { label: 'Delivery Receipt', short: 'Receipt', accent: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  Photo_Scan: { label: 'Photo / Scanned Note', short: 'Photo', accent: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
}

export const DOC_TYPE_ORDER: IngestDocType[] = [
  'BDN', 'Lab_Report', 'Survey_Report', 'Email', 'Protest', 'Delivery_Receipt', 'Photo_Scan',
]

// ── Pipeline status ───────────────────────────────────────────────────────────

export type IngestChannel = 'upload' | 'email' | 'scan'

/** Document-level lifecycle through the pipeline. */
export type IngestStatus = 'uploading' | 'queued' | 'processing' | 'ready' | 'needs_review' | 'failed'

/** Extraction-job outcome (sub-state of a document that reached a worker). */
export type IngestExtractionStatus = 'pending' | 'processing' | 'complete' | 'partial' | 'failed' | 'not_applicable'

export const INGEST_STATUS_META: Record<IngestStatus, { label: string; cls: string }> = {
  uploading: { label: 'Uploading', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
  queued: { label: 'Queued', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  ready: { label: 'Ready', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  needs_review: { label: 'Needs review', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  failed: { label: 'Failed', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export const EXTRACTION_STATUS_META: Record<IngestExtractionStatus, { label: string; cls: string }> = {
  pending: { label: 'Extraction pending', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
  processing: { label: 'Extracting', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  complete: { label: 'Extraction complete', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  partial: { label: 'Partial extraction', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  failed: { label: 'Extraction failed', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  not_applicable: { label: 'No extraction', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
}

// ── Field targets (where an extracted value feeds) ────────────────────────────

export type TargetKind = 'case' | 'measurement' | 'spec' | 'draft' | 'none'

export const TARGET_META: Record<TargetKind, { label: string; cls: string }> = {
  case: { label: 'Case', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/40' },
  measurement: { label: 'Measurement', cls: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border-teal-200 dark:border-teal-900/40' },
  spec: { label: 'Spec check', cls: 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border-violet-200 dark:border-violet-900/40' },
  draft: { label: 'Draft', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/40' },
  none: { label: 'No target', cls: 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
}

export const TARGET_KINDS: TargetKind[] = ['case', 'measurement', 'spec', 'draft', 'none']

// ── Field model ───────────────────────────────────────────────────────────────

export type FieldReviewStatus = 'unreviewed' | 'verified' | 'corrected' | 'rejected'

/** A pointer back into the source document for traceability. */
export interface SourceRef {
  page: number
  section: string
  snippet: string
}

export interface IngestField {
  id: string
  name: string
  value: string
  unit?: string
  /** 0–1 model confidence. */
  confidence: number
  source: SourceRef
  target_kind: TargetKind
  target_field?: string
  status: FieldReviewStatus
  /** Value as first extracted, retained when a user corrects it. */
  original_value: string
  applied: boolean
}

export interface IngestDocument {
  id: string
  filename: string
  doc_type: IngestDocType
  channel: IngestChannel
  status: IngestStatus
  extraction_status: IngestExtractionStatus
  /** Confidence of the document-type classification (0–1). */
  classification_confidence: number
  case_id?: string
  case_reference?: string
  uploaded_by: string
  uploaded_at: string
  size_bytes: number
  page_count: number
  fields: IngestField[]
  error?: string
  notes?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export type ConfidenceBand = 'high' | 'medium' | 'low'

export const CONFIDENCE_WARN = 0.7
export const CONFIDENCE_OK = 0.9

export function confidenceBand(score: number): ConfidenceBand {
  if (score >= CONFIDENCE_OK) return 'high'
  if (score >= CONFIDENCE_WARN) return 'medium'
  return 'low'
}

export const CONFIDENCE_STYLE: Record<ConfidenceBand, { bar: string; text: string }> = {
  high: { bar: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
  medium: { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  low: { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
}

/** Heuristic classification from a filename — used to pre-tag uploads. */
export function classifyByFilename(name: string): { doc_type: IngestDocType; confidence: number } {
  const n = name.toLowerCase()
  if (/\b(bdn|delivery[_-]?note)\b/.test(n)) return { doc_type: 'BDN', confidence: 0.93 }
  if (/\b(lab|analysis|assay|test[_-]?report)\b/.test(n)) return { doc_type: 'Lab_Report', confidence: 0.9 }
  if (/\b(survey|ullage|sounding)\b/.test(n)) return { doc_type: 'Survey_Report', confidence: 0.86 }
  if (/\b(lop|protest)\b/.test(n)) return { doc_type: 'Protest', confidence: 0.88 }
  if (/\b(receipt|invoice)\b/.test(n)) return { doc_type: 'Delivery_Receipt', confidence: 0.8 }
  if (/\.(eml|msg)$|email|fwd/.test(n)) return { doc_type: 'Email', confidence: 0.82 }
  if (/\.(jpg|jpeg|png|heic|tif)$|photo|scan|img/.test(n)) return { doc_type: 'Photo_Scan', confidence: 0.7 }
  return { doc_type: 'BDN', confidence: 0.4 }
}

export interface DocSummary {
  total: number
  verified: number
  rejected: number
  lowConfidence: number
  applied: number
  /** Verified or corrected, not rejected — eligible to apply. */
  applicable: number
}

export function summarizeFields(fields: IngestField[]): DocSummary {
  return {
    total: fields.length,
    verified: fields.filter((f) => f.status === 'verified' || f.status === 'corrected').length,
    rejected: fields.filter((f) => f.status === 'rejected').length,
    lowConfidence: fields.filter((f) => confidenceBand(f.confidence) === 'low' && f.status === 'unreviewed').length,
    applied: fields.filter((f) => f.applied).length,
    applicable: fields.filter((f) => (f.status === 'verified' || f.status === 'corrected') && f.target_kind !== 'none' && !f.applied).length,
  }
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}
