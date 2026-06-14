import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FileText, Check, X, RotateCcw, CheckCheck, Send, MapPin,
  CheckCircle2, AlertTriangle, Clock,
} from 'lucide-react'
import { useDocumentReview } from '@/hooks/useIngestion'
import {
  DOC_TYPE_META, INGEST_STATUS_META, TARGET_META, TARGET_KINDS,
  confidenceBand, CONFIDENCE_STYLE,
  type IngestField, type TargetKind,
} from '@/lib/ingestion'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

const FIELD_STATUS_STYLE: Record<string, string> = {
  unreviewed: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  verified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  corrected: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function DocumentReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const r = useDocumentReview(id)

  if (!r.doc) {
    return (
      <div className="py-16">
        <EmptyState icon={<FileText className="h-6 w-6" />} title="Document not found"
          action={<button onClick={() => navigate('/ingestion')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Back to inbox</button>} />
      </div>
    )
  }

  const doc = r.doc
  const meta = DOC_TYPE_META[doc.doc_type]
  const status = INGEST_STATUS_META[doc.status]

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/ingestion')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Ingestion inbox
      </button>

      {/* Apply toast */}
      {r.appliedToast && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 px-4 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-800 dark:text-green-300 flex-1">{r.appliedToast}</p>
          <button onClick={r.dismissToast} className="text-green-700 dark:text-green-400"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{doc.filename}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold', meta.accent)}>{meta.label}</span>
                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold', status.cls)}>{status.label}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  classification {(doc.classification_confidence * 100).toFixed(0)}%{doc.case_reference ? ` · ${doc.case_reference}` : ''}
                </span>
              </div>
            </div>
          </div>

          {r.summary && doc.fields.length > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={r.verifyAllConfident}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                <CheckCheck className="h-3.5 w-3.5" /> Verify high-confidence
              </button>
              <button onClick={r.applyVerified} disabled={r.summary.applicable === 0}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                <Send className="h-3.5 w-3.5" /> Apply verified ({r.summary.applicable})
              </button>
            </div>
          )}
        </div>

        {r.summary && doc.fields.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            <span><span className="font-semibold text-slate-700 dark:text-slate-200">{r.summary.verified}</span>/{r.summary.total} verified</span>
            {r.summary.lowConfidence > 0 && <span className="text-red-600 dark:text-red-400">{r.summary.lowConfidence} low-confidence to check</span>}
            {r.summary.rejected > 0 && <span>{r.summary.rejected} rejected</span>}
            {r.summary.applied > 0 && <span className="text-green-600 dark:text-green-400">{r.summary.applied} applied</span>}
          </div>
        )}
      </div>

      {/* No fields states */}
      {doc.fields.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
          {doc.status === 'failed' ? (
            <EmptyState icon={<AlertTriangle className="h-6 w-6" />} title="Extraction failed"
              description={doc.error ?? 'The extractor could not read this document. Manual transcription is required.'} />
          ) : (
            <EmptyState icon={<Clock className="h-6 w-6" />} title="Extraction in progress"
              description="Fields will appear here once the document has been processed." />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Source panel */}
          <SourcePanel doc={doc} selectedFieldId={r.selectedFieldId} onSelect={r.setSelectedFieldId} />

          {/* Fields panel */}
          <div className="space-y-3">
            {doc.fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                selected={r.selectedFieldId === field.id}
                onSelect={() => r.setSelectedFieldId(field.id)}
                onEdit={(v) => r.editValue(field.id, v)}
                onTarget={(k, tf) => r.setTarget(field.id, k, tf)}
                onVerify={() => r.verifyField(field.id)}
                onReject={() => r.rejectField(field.id)}
                onReset={() => r.resetField(field.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Source panel (snippets grouped by page / section) ─────────────────────────

function SourcePanel({
  doc, selectedFieldId, onSelect,
}: { doc: ReturnType<typeof useDocumentReview>['doc']; selectedFieldId: string | null; onSelect: (id: string) => void }) {
  if (!doc) return null
  const pages = Array.from(new Set(doc.fields.map((f) => f.source.page))).sort()

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden lg:sticky lg:top-4">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <FileText className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Source</h3>
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{doc.page_count} page{doc.page_count !== 1 ? 's' : ''}</span>
      </div>
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {pages.map((page) => {
          const sections = Array.from(new Set(doc.fields.filter((f) => f.source.page === page).map((f) => f.source.section)))
          return (
            <div key={page}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Page {page}</p>
              {/* Faux document page */}
              <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3 space-y-3">
                {sections.map((section) => (
                  <div key={section}>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-1">{section}</p>
                    <div className="space-y-1">
                      {doc.fields.filter((f) => f.source.page === page && f.source.section === section).map((f) => {
                        const sel = selectedFieldId === f.id
                        return (
                          <button
                            key={f.id}
                            onClick={() => onSelect(f.id)}
                            className={cn(
                              'w-full text-left rounded px-2 py-1.5 text-xs font-mono leading-relaxed transition-colors',
                              sel
                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-300 dark:ring-blue-700'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800',
                            )}
                          >
                            {f.source.snippet}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Field card ────────────────────────────────────────────────────────────────

function FieldCard({
  field, selected, onSelect, onEdit, onTarget, onVerify, onReject, onReset,
}: {
  field: IngestField
  selected: boolean
  onSelect: () => void
  onEdit: (v: string) => void
  onTarget: (k: TargetKind, tf?: string) => void
  onVerify: () => void
  onReject: () => void
  onReset: () => void
}) {
  const band = confidenceBand(field.confidence)
  const conf = CONFIDENCE_STYLE[band]
  const target = TARGET_META[field.target_kind]
  const corrected = field.value !== field.original_value

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white dark:bg-slate-800 border rounded-lg shadow-sm p-3.5 transition-all cursor-pointer',
        selected ? 'border-blue-400 dark:border-blue-600 ring-1 ring-blue-200 dark:ring-blue-900/50' : 'border-slate-200 dark:border-slate-700',
        field.status === 'rejected' && 'opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{field.name}</p>
            {field.applied && <span className="text-[9px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">applied</span>}
          </div>
        </div>
        <span className={cn('flex-shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize', FIELD_STATUS_STYLE[field.status])}>
          {field.status}
        </span>
      </div>

      {/* Value editor */}
      <div className="flex items-center gap-2 mt-2">
        <input
          value={field.value}
          onChange={(e) => onEdit(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
        />
        {field.unit && <span className="text-xs text-slate-400 dark:text-slate-500 w-12">{field.unit}</span>}
      </div>
      {corrected && (
        <p className="text-[11px] text-violet-600 dark:text-violet-400 mt-1">
          Corrected from <span className="font-mono line-through">{field.original_value}</span>
        </p>
      )}

      {/* Confidence */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 w-16">Confidence</span>
        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className={cn('h-full rounded-full', conf.bar)} style={{ width: `${Math.round(field.confidence * 100)}%` }} />
        </div>
        <span className={cn('text-xs font-semibold tabular-nums w-9 text-right', conf.text)}>{Math.round(field.confidence * 100)}%</span>
      </div>
      {band === 'low' && field.status === 'unreviewed' && (
        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 inline-flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Low confidence — verify against source
        </p>
      )}

      {/* Source link + target mapping */}
      <div className="flex flex-wrap items-center gap-2 mt-2.5" onClick={(e) => e.stopPropagation()}>
        <button onClick={onSelect} className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
          <MapPin className="h-3 w-3" /> p{field.source.page} · {field.source.section}
        </button>
        <div className="flex items-center gap-1 ml-auto">
          <select
            value={field.target_kind}
            onChange={(e) => onTarget(e.target.value as TargetKind, field.target_field)}
            className={cn('rounded border px-1.5 py-1 text-[11px] font-medium focus:outline-none', target.cls)}
          >
            {TARGET_KINDS.map((k) => <option key={k} value={k}>{TARGET_META[k].label}</option>)}
          </select>
          {field.target_kind !== 'none' && (
            <input
              value={field.target_field ?? ''}
              onChange={(e) => onTarget(field.target_kind, e.target.value)}
              placeholder="field"
              className="w-28 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-1.5 py-1 text-[11px] font-mono text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        <button onClick={onVerify}
          className={cn('inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium',
            field.status === 'verified' ? 'bg-green-600 text-white' : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-green-900/20')}>
          <Check className="h-3 w-3" /> Verify
        </button>
        <button onClick={onReject}
          className={cn('inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium',
            field.status === 'rejected' ? 'bg-red-600 text-white' : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20')}>
          <X className="h-3 w-3" /> Reject
        </button>
        <button onClick={onReset}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-auto">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
    </div>
  )
}
