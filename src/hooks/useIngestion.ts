import { useCallback, useMemo, useRef, useState } from 'react'
import { mockIngestDocuments } from '@/data/ingestionData'
import { useAuth } from '@/hooks/useAuth'
import {
  classifyByFilename, summarizeFields,
  type IngestDocument, type IngestField, type IngestStatus,
  type TargetKind, type FieldReviewStatus,
} from '@/lib/ingestion'

// ── Inbox (list + upload simulation) ──────────────────────────────────────────

export function useIngestionInbox() {
  const { currentUser } = useAuth()
  const [documents, setDocuments] = useState<IngestDocument[]>(mockIngestDocuments)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const patch = useCallback((id: string, next: Partial<IngestDocument>) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...next } : d)))
  }, [])

  /** Simulate the pipeline: uploading → queued → processing → ready/needs_review. */
  const uploadFiles = useCallback((files: { name: string; size: number }[]) => {
    const now = new Date().toISOString()
    const created = files.map((file, i) => {
      const { doc_type, confidence } = classifyByFilename(file.name)
      const id = `doc-up-${Date.now()}-${i}`
      const doc: IngestDocument = {
        id,
        filename: file.name,
        doc_type,
        channel: 'upload',
        status: 'uploading',
        extraction_status: 'pending',
        classification_confidence: confidence,
        uploaded_by: currentUser?.full_name ?? 'You',
        uploaded_at: now,
        size_bytes: file.size,
        page_count: 1,
        fields: [],
      }
      return doc
    })
    setDocuments((prev) => [...created, ...prev])

    // Advance each new document through the pipeline.
    created.forEach((doc, i) => {
      const base = 400 + i * 150
      timers.current.push(setTimeout(() => patch(doc.id, { status: 'queued' }), base))
      timers.current.push(setTimeout(() => patch(doc.id, { status: 'processing', extraction_status: 'processing' }), base + 900))
      timers.current.push(setTimeout(() => {
        // Low classification confidence routes to manual review.
        const review = doc.classification_confidence < 0.75
        patch(doc.id, {
          status: review ? 'needs_review' : 'ready',
          extraction_status: review ? 'partial' : 'complete',
        })
      }, base + 2200))
    })
  }, [currentUser, patch])

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      if (statusFilter && d.status !== statusFilter) return false
      if (typeFilter && d.doc_type !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!d.filename.toLowerCase().includes(q) && !(d.case_reference ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [documents, statusFilter, typeFilter, search])

  const counts = useMemo(() => {
    const by = (s: IngestStatus) => documents.filter((d) => d.status === s).length
    return {
      total: documents.length,
      needsReview: by('needs_review'),
      processing: by('processing') + by('queued') + by('uploading'),
      ready: by('ready'),
      failed: by('failed'),
    }
  }, [documents])

  return {
    documents: filtered,
    counts,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    search, setSearch,
    uploadFiles,
  }
}

// ── Single-document review (editable) ─────────────────────────────────────────

export function useDocumentReview(id: string | undefined) {
  const { currentUser } = useAuth()
  const base = useMemo(() => mockIngestDocuments.find((d) => d.id === id) ?? null, [id])

  const [doc, setDoc] = useState<IngestDocument | null>(base)
  const [loadedId, setLoadedId] = useState(id)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(base?.fields[0]?.id ?? null)
  const [appliedToast, setAppliedToast] = useState<string | null>(null)

  if (id !== loadedId) {
    setLoadedId(id)
    setDoc(base)
    setSelectedFieldId(base?.fields[0]?.id ?? null)
  }

  const updateField = useCallback((fieldId: string, next: Partial<IngestField>) => {
    setDoc((prev) => prev && ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === fieldId ? { ...f, ...next } : f)),
    }))
  }, [])

  const editValue = useCallback((fieldId: string, value: string) => {
    setDoc((prev) => prev && ({
      ...prev,
      fields: prev.fields.map((f) => {
        if (f.id !== fieldId) return f
        const corrected = value !== f.original_value
        const status: FieldReviewStatus = corrected ? 'corrected' : (f.status === 'corrected' ? 'unreviewed' : f.status)
        return { ...f, value, status }
      }),
    }))
  }, [])

  const setTarget = useCallback((fieldId: string, kind: TargetKind, target_field?: string) => {
    updateField(fieldId, { target_kind: kind, target_field })
  }, [updateField])

  const verifyField = useCallback((fieldId: string) => updateField(fieldId, { status: 'verified' }), [updateField])
  const rejectField = useCallback((fieldId: string) => updateField(fieldId, { status: 'rejected' }), [updateField])
  const resetField = useCallback((fieldId: string) => {
    setDoc((prev) => prev && ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === fieldId ? { ...f, value: f.original_value, status: 'unreviewed' } : f)),
    }))
  }, [])

  const verifyAllConfident = useCallback(() => {
    setDoc((prev) => prev && ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.status === 'unreviewed' && f.confidence >= 0.9 ? { ...f, status: 'verified' as FieldReviewStatus } : f),
    }))
  }, [])

  const applyVerified = useCallback(() => {
    setDoc((prev) => {
      if (!prev) return prev
      const applicable = prev.fields.filter(
        (f) => (f.status === 'verified' || f.status === 'corrected') && f.target_kind !== 'none' && !f.applied,
      )
      if (applicable.length === 0) return prev
      setAppliedToast(`${applicable.length} field${applicable.length !== 1 ? 's' : ''} pushed to ${prev.case_reference ?? 'the case'} by ${currentUser?.full_name ?? 'you'}.`)
      return {
        ...prev,
        status: 'ready',
        fields: prev.fields.map((f) =>
          applicable.some((a) => a.id === f.id) ? { ...f, applied: true } : f),
      }
    })
  }, [currentUser])

  const summary = useMemo(() => (doc ? summarizeFields(doc.fields) : null), [doc])

  return {
    doc, summary,
    selectedFieldId, setSelectedFieldId,
    editValue, setTarget, verifyField, rejectField, resetField, verifyAllConfident, applyVerified,
    appliedToast, dismissToast: () => setAppliedToast(null),
  }
}
