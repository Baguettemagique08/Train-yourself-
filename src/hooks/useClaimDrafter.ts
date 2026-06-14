import { useCallback, useMemo, useState } from 'react'
import { mockCases } from '@/data/mockData'
import { useAuth } from '@/hooks/useAuth'
import {
  buildFactLedger,
  generateDraft,
  CLAIM_DRAFT_TYPES,
  type ApprovedFact,
  type GeneratedDraft,
} from '@/lib/claimDrafter'
import type { Case, DraftStatus, DraftType } from '@/types'

export interface ClaimDraftVersion {
  version: number
  status: DraftStatus
  subject: string
  recipient: string
  body: string
  saved_at: string
  saved_by: string
  note: string
}

/** Linear status workflow. */
export const STATUS_FLOW: DraftStatus[] = ['draft', 'under_review', 'approved', 'sent']
export const STATUS_LABELS: Record<DraftStatus, string> = {
  draft: 'Draft',
  under_review: 'Internal review',
  approved: 'Approved',
  sent: 'Sent',
  superseded: 'Superseded',
}

function todayFormatted(): string {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function useClaimDrafter(initialCaseId?: string) {
  const { currentUser } = useAuth()

  const [caseId, setCaseId] = useState(initialCaseId ?? mockCases[0]?.id ?? '')
  const [draftType, setDraftTypeState] = useState<DraftType>(CLAIM_DRAFT_TYPES[0])

  const selectedCase: Case | null = useMemo(() => mockCases.find((c) => c.id === caseId) ?? null, [caseId])

  // Fact ledger for the case.
  const facts: ApprovedFact[] = useMemo(() => buildFactLedger(caseId), [caseId])
  const approvedIds = useMemo(() => facts.filter((f) => f.approved).map((f) => f.id), [facts])

  const [includedIds, setIncludedIds] = useState<Set<string>>(() => new Set(approvedIds))

  const includedFacts = useMemo(
    () => facts.filter((f) => f.approved && includedIds.has(f.id)),
    [facts, includedIds],
  )

  const ctx = useMemo(
    () => ({ caseReference: selectedCase?.reference ?? '', today: todayFormatted() }),
    [selectedCase],
  )

  // Live generation preview (subject / grounding / unmet) — does not clobber edits.
  const generation: GeneratedDraft = useMemo(
    () => generateDraft(draftType, includedFacts, ctx),
    [draftType, includedFacts, ctx],
  )

  // Editable document state.
  const [subject, setSubject] = useState(generation.subject)
  const [recipient, setRecipient] = useState(generation.recipient)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [body, setBody] = useState(generation.body)
  const [status, setStatus] = useState<DraftStatus>('draft')
  const [version, setVersion] = useState(1)
  const [versions, setVersions] = useState<ClaimDraftVersion[]>([])
  const [dirty, setDirty] = useState(false)

  // ── Reset helpers ────────────────────────────────────────────────────────────

  const applyGeneration = useCallback((gen: GeneratedDraft) => {
    setSubject(gen.subject)
    setRecipient(gen.recipient)
    setBody(gen.body)
    setDirty(false)
  }, [])

  const selectCase = useCallback((id: string) => {
    const fresh = buildFactLedger(id)
    const freshApproved = new Set(fresh.filter((f) => f.approved).map((f) => f.id))
    const c = mockCases.find((x) => x.id === id)
    const gen = generateDraft(
      draftType,
      fresh.filter((f) => f.approved),
      { caseReference: c?.reference ?? '', today: todayFormatted() },
    )
    setCaseId(id)
    setIncludedIds(freshApproved)
    applyGeneration(gen)
    setStatus('draft')
    setVersion(1)
    setVersions([])
  }, [draftType, applyGeneration])

  const setDraftType = useCallback((t: DraftType) => {
    const gen = generateDraft(t, includedFacts, ctx)
    setDraftTypeState(t)
    applyGeneration(gen)
    setStatus('draft')
    setVersion(1)
    setVersions([])
  }, [includedFacts, ctx, applyGeneration])

  const regenerate = useCallback(() => {
    applyGeneration(generation)
  }, [generation, applyGeneration])

  // ── Editing ──────────────────────────────────────────────────────────────────

  const toggleFact = useCallback((id: string) => {
    setIncludedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const editBody = useCallback((v: string) => { setBody(v); setDirty(true) }, [])
  const editSubject = useCallback((v: string) => { setSubject(v); setDirty(true) }, [])
  const editRecipient = useCallback((v: string) => { setRecipient(v); setDirty(true) }, [])

  // ── Versions & status ─────────────────────────────────────────────────────────

  const snapshot = useCallback((note: string, atVersion: number, atStatus: DraftStatus): ClaimDraftVersion => ({
    version: atVersion,
    status: atStatus,
    subject,
    recipient,
    body,
    saved_at: new Date().toISOString(),
    saved_by: currentUser?.full_name ?? 'Analyst',
    note,
  }), [subject, recipient, body, currentUser])

  const saveVersion = useCallback((note = 'Manual save') => {
    setVersions((prev) => [snapshot(note, version, status), ...prev])
    setVersion((v) => v + 1)
    setDirty(false)
  }, [snapshot, version, status])

  const transition = useCallback((next: DraftStatus) => {
    setVersions((prev) => [snapshot(`Status → ${STATUS_LABELS[next]}`, version, next), ...prev])
    setStatus(next)
    setVersion((v) => v + 1)
  }, [snapshot, version])

  const restoreVersion = useCallback((v: ClaimDraftVersion) => {
    setSubject(v.subject)
    setRecipient(v.recipient)
    setBody(v.body)
    setDirty(true)
  }, [])

  const nextStatus = useMemo<DraftStatus | null>(() => {
    const i = STATUS_FLOW.indexOf(status)
    return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null
  }, [status])

  return {
    // selection
    caseId, selectedCase, selectCase,
    draftType, setDraftType,
    // facts
    facts, includedIds, toggleFact, includedFacts,
    // generation analysis
    generation,
    // document
    subject, recipient, recipientEmail, body, status, version, dirty,
    setRecipientEmail, editBody, editSubject, editRecipient,
    regenerate,
    // versions & workflow
    versions, saveVersion, transition, restoreVersion, nextStatus,
  }
}
