import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Inbox, UploadCloud, FileText, Search, ChevronRight, Mail, ScanLine, AlertTriangle,
} from 'lucide-react'
import { useIngestionInbox } from '@/hooks/useIngestion'
import {
  DOC_TYPE_META, DOC_TYPE_ORDER, INGEST_STATUS_META, EXTRACTION_STATUS_META,
  confidenceBand, fileSize,
  type IngestDocument,
} from '@/lib/ingestion'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn, formatRelative } from '@/lib/utils'

export default function IngestionPage() {
  const navigate = useNavigate()
  const inbox = useIngestionInbox()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    inbox.uploadFiles(Array.from(list).map((f) => ({ name: f.name, size: f.size })))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
          <Inbox className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Document Ingestion</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Upload and triage source documents. Extracted fields feed cases, measurements, specs, and drafts after review.
          </p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => fileRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          dragOver
            ? 'border-blue-400 bg-blue-50/60 dark:bg-blue-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10',
        )}
      >
        <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <UploadCloud className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Drop documents here or click to upload</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          BDN · Lab report · Survey report · Email/PDF · Protest letter · Delivery receipt · Photo/scan
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> PDF / DOCX / XLSX</span>
          <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> .eml / .msg</span>
          <span className="inline-flex items-center gap-1"><ScanLine className="h-3 w-3" /> JPG / PNG</span>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Counter label="In pipeline" value={inbox.counts.processing} tone="blue" />
        <Counter label="Needs review" value={inbox.counts.needsReview} tone="amber" />
        <Counter label="Ready" value={inbox.counts.ready} tone="green" />
        <Counter label="Failed" value={inbox.counts.failed} tone="red" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={inbox.search} onChange={(e) => inbox.setSearch(e.target.value)}
            placeholder="Search filename or case reference…"
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 pl-8 pr-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select value={inbox.typeFilter} onChange={(e) => inbox.setTypeFilter(e.target.value)}
          className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none">
          <option value="">Type: All</option>
          {DOC_TYPE_ORDER.map((t) => <option key={t} value={t}>{DOC_TYPE_META[t].label}</option>)}
        </select>
        <select value={inbox.statusFilter} onChange={(e) => inbox.setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none">
          <option value="">Status: All</option>
          {Object.entries(INGEST_STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Document list */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
        {inbox.documents.length === 0 ? (
          <EmptyState icon={<Inbox className="h-6 w-6" />} title="No documents" description="Upload a document or adjust the filters." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {inbox.documents.map((d) => (
              <DocumentRow key={d.id} d={d} onOpen={() => navigate(`/ingestion/${d.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentRow({ d, onOpen }: { d: IngestDocument; onOpen: () => void }) {
  const meta = DOC_TYPE_META[d.doc_type]
  const status = INGEST_STATUS_META[d.status]
  const extraction = EXTRACTION_STATUS_META[d.extraction_status]
  const reviewable = d.status === 'ready' || d.status === 'needs_review'
  const lowConf = d.fields.filter((f) => confidenceBand(f.confidence) === 'low').length
  const processing = d.status === 'processing' || d.status === 'queued' || d.status === 'uploading'

  return (
    <button
      onClick={reviewable ? onOpen : undefined}
      disabled={!reviewable}
      className={cn(
        'w-full text-left px-4 py-3 flex items-center gap-4 transition-colors',
        reviewable ? 'hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer' : 'cursor-default',
      )}
    >
      <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
        {d.channel === 'email' ? <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          : d.channel === 'scan' ? <ScanLine className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            : <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{d.filename}</p>
          <span className={cn('flex-shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold', meta.accent)}>{meta.short}</span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          {d.case_reference ? `${d.case_reference} · ` : ''}{fileSize(d.size_bytes)} · {d.page_count}p · {d.uploaded_by} · {formatRelative(d.uploaded_at)}
        </p>
      </div>

      {/* Field summary */}
      {d.fields.length > 0 && (
        <div className="hidden md:block text-right flex-shrink-0">
          <p className="text-xs text-slate-600 dark:text-slate-300">{d.fields.length} fields</p>
          {lowConf > 0 && (
            <p className="text-[11px] text-red-600 dark:text-red-400 inline-flex items-center gap-0.5">
              <AlertTriangle className="h-3 w-3" /> {lowConf} low-confidence
            </p>
          )}
        </div>
      )}

      {/* Status badges */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0 w-36">
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', status.cls)}>
          {processing && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
          {status.label}
        </span>
        <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium', extraction.cls)}>
          {extraction.label}
        </span>
      </div>

      <ChevronRight className={cn('h-4 w-4 flex-shrink-0', reviewable ? 'text-slate-300 dark:text-slate-600' : 'text-transparent')} />
    </button>
  )
}

function Counter({ label, value, tone }: { label: string; value: number; tone: string }) {
  const map: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
  }
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={cn('text-2xl font-bold mt-0.5 tabular-nums', map[tone])}>{value}</p>
    </div>
  )
}
