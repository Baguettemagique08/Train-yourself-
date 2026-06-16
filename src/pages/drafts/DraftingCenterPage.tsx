import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Plus,
  Save,
  Send,
  CheckCircle,
  Clock,
  FileText,
  ChevronDown,
  Edit2,
  History,
} from 'lucide-react'
import { mockDrafts, mockCases, mockTemplates } from '@/data/mockData'
import { cn, formatDateTime, formatRelative, draftStatusLabel } from '@/lib/utils'
import type { Draft, DraftType, DraftStatus } from '@/types'
import { DRAFT_TYPE_OPTIONS } from '@/lib/constants'

// ── Constants ──────────────────────────────────────────────────────────────────
const DRAFT_TYPE_LABELS: Record<DraftType, string> = {
  LOP_Response: 'LOP Response',
  Owner_Update: 'Owner Update',
  Charterer_Notice: 'Charterer Notice',
  Internal_Memo: 'Internal Memo',
  Claim_Letter: 'Claim Letter',
  Protest_Letter: 'Protest Letter',
  Reservation_of_Rights: 'Reservation of Rights',
  Supplier_Challenge: 'Supplier Challenge',
}

const STATUS_COLORS: Record<DraftStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  sent: 'bg-blue-100 text-blue-700',
  superseded: 'bg-slate-100 text-slate-400',
}

const TYPE_COLORS: Record<DraftType, string> = {
  LOP_Response: 'bg-indigo-100 text-indigo-700',
  Owner_Update: 'bg-sky-100 text-sky-700',
  Charterer_Notice: 'bg-violet-100 text-violet-700',
  Internal_Memo: 'bg-slate-100 text-slate-600',
  Claim_Letter: 'bg-orange-100 text-orange-700',
  Protest_Letter: 'bg-red-100 text-red-700',
  Reservation_of_Rights: 'bg-rose-100 text-rose-700',
  Supplier_Challenge: 'bg-amber-100 text-amber-700',
}

type FilterTab = 'all' | DraftType

// ── Helpers ────────────────────────────────────────────────────────────────────
function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function StatusBadge({ status }: { status: DraftStatus }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', STATUS_COLORS[status])}>
      {status === 'draft' && <Clock className="h-2.5 w-2.5" />}
      {status === 'under_review' && <Clock className="h-2.5 w-2.5" />}
      {status === 'approved' && <CheckCircle className="h-2.5 w-2.5" />}
      {status === 'sent' && <Send className="h-2.5 w-2.5" />}
      {draftStatusLabel(status)}
    </span>
  )
}

function TypeBadge({ type }: { type: DraftType }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', TYPE_COLORS[type])}>
      {DRAFT_TYPE_LABELS[type]}
    </span>
  )
}

// ── New Draft Modal ────────────────────────────────────────────────────────────
interface NewDraftModalProps {
  onClose: () => void
  onCreate: (draft: Draft) => void
}

function NewDraftModal({ onClose, onCreate }: NewDraftModalProps) {
  const [draftType, setDraftType] = useState<DraftType>('LOP_Response')
  const [title, setTitle] = useState('')
  const [caseId, setCaseId] = useState('')
  const [templateId, setTemplateId] = useState('')

  const availableTemplates = mockTemplates.filter((t) => t.draft_type === draftType)

  const handleCreate = () => {
    if (!title.trim()) return
    const template = mockTemplates.find((t) => t.id === templateId)
    const linkedCase = mockCases.find((c) => c.id === caseId)

    const now = new Date().toISOString()
    const newDraft: Draft = {
      id: `dr-new-${Date.now()}`,
      case_id: caseId || 'c1',
      draft_type: draftType,
      title: title.trim(),
      body: template?.body ?? '',
      status: 'draft',
      version: 1,
      created_by: 'u4',
      notes: linkedCase ? `Linked to case ${linkedCase.reference}` : '',
      created_at: now,
      updated_at: now,
    }
    onCreate(newDraft)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">New Draft</h2>
          <p className="text-xs text-slate-500 mt-0.5">Create a new communication draft</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Draft Type */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Draft Type</label>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={draftType}
              onChange={(e) => { setDraftType(e.target.value as DraftType); setTemplateId('') }}
            >
              {DRAFT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LOP Response — MV Nordic Star — Rotterdam"
            />
          </div>

          {/* Link to Case */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Link to Case (optional)</label>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            >
              <option value="">— No case —</option>
              {mockCases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.reference} — {c.vessel?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Template (optional)</label>
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value="">— Blank —</option>
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Draft
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DraftingCenterPage() {
  const [drafts, setDrafts] = useState<Draft[]>([...mockDrafts])
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(mockDrafts[0]?.id ?? null)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [saved, setSaved] = useState(false)
  const [recipientTo, setRecipientTo] = useState<string>('')
  const [recipientCc, setRecipientCc] = useState<string>('')
  const [recipientBcc, setRecipientBcc] = useState<string>('')

  const selectedDraft = drafts.find((d) => d.id === selectedDraftId) ?? null

  useEffect(() => {
    setRecipientTo('')
    setRecipientCc('')
    setRecipientBcc('')
  }, [selectedDraftId])

  const filteredDrafts = useMemo(() => {
    if (filterTab === 'all') return drafts
    return drafts.filter((d) => d.draft_type === filterTab)
  }, [drafts, filterTab])

  const updateDraftField = useCallback(
    (field: keyof Draft, value: string) => {
      if (!selectedDraftId) return
      const now = new Date().toISOString()
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === selectedDraftId ? { ...d, [field]: value, updated_at: now } : d
        )
      )
      setSaved(false)
    },
    [selectedDraftId]
  )

  const handleSave = useCallback(() => {
    if (!selectedDraftId) return
    const now = new Date().toISOString()
    setDrafts((prev) =>
      prev.map((d) => (d.id === selectedDraftId ? { ...d, updated_at: now } : d))
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [selectedDraftId])

  const handleStatusChange = useCallback(
    (newStatus: DraftStatus) => {
      if (!selectedDraftId) return
      const now = new Date().toISOString()
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === selectedDraftId
            ? {
                ...d,
                status: newStatus,
                updated_at: now,
                ...(newStatus === 'sent' ? { sent_at: now } : {}),
              }
            : d
        )
      )
    },
    [selectedDraftId]
  )

  const handleCreateDraft = useCallback((newDraft: Draft) => {
    setDrafts((prev) => [newDraft, ...prev])
    setSelectedDraftId(newDraft.id)
  }, [])

  const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'LOP_Response', label: 'LOP Response' },
    { id: 'Owner_Update', label: 'Owner Update' },
    { id: 'Charterer_Notice', label: 'Charterer Notice' },
    { id: 'Internal_Memo', label: 'Internal Memo' },
    { id: 'Claim_Letter', label: 'Claim Letter' },
    { id: 'Protest_Letter', label: 'Protest Letter' },
  ]

  // Mock version history entries
  const versionHistory = selectedDraft
    ? [
        { version: selectedDraft.version, date: selectedDraft.updated_at, user: selectedDraft.creator?.full_name ?? 'Unknown', note: 'Current version' },
        ...(selectedDraft.version > 1
          ? [{ version: selectedDraft.version - 1, date: selectedDraft.created_at, user: selectedDraft.creator?.full_name ?? 'Unknown', note: 'Initial draft' }]
          : []),
      ]
    : []

  return (
    <>
      {showNewModal && (
        <NewDraftModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateDraft}
        />
      )}

      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <div className="w-80 shrink-0 flex flex-col border-r border-slate-200 bg-white">
          {/* Header */}
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-base font-bold text-slate-900">Drafting Center</h1>
            </div>
            <p className="text-xs text-slate-500">
              Create, review, and manage formal communications.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Draft
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="px-3 py-2 border-b border-slate-100 space-y-0.5 overflow-y-auto max-h-48">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={cn(
                  'w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  filterTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {tab.label}
                {tab.id === 'all' && (
                  <span className="ml-1.5 text-slate-400">({drafts.length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Draft List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredDrafts.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">
                No drafts in this category
              </div>
            )}
            {filteredDrafts.map((draft) => {
              const linkedCase = mockCases.find((c) => c.id === draft.case_id)
              return (
                <button
                  key={draft.id}
                  onClick={() => setSelectedDraftId(draft.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors',
                    selectedDraftId === draft.id && 'bg-blue-50 border-l-2 border-blue-500'
                  )}
                >
                  <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug mb-1.5">
                    {draft.title}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    <TypeBadge type={draft.draft_type} />
                    <StatusBadge status={draft.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{linkedCase?.reference ?? '—'}</span>
                    <span>{formatRelative(draft.updated_at)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedDraft ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <FileText className="h-12 w-12 text-slate-300 mb-4" />
              <h2 className="text-base font-semibold text-slate-600 mb-1">No draft selected</h2>
              <p className="text-sm text-slate-400">Select a draft from the list, or create a new one.</p>
              <button
                onClick={() => setShowNewModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Draft
              </button>
            </div>
          ) : (
            <>
              {/* Draft Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Title row */}
                  <div className="flex-1 min-w-0">
                    {editingTitle ? (
                      <input
                        autoFocus
                        type="text"
                        className="w-full text-base font-bold text-slate-900 border-b-2 border-blue-500 bg-transparent focus:outline-none pb-0.5"
                        value={selectedDraft.title}
                        onChange={(e) => updateDraftField('title', e.target.value)}
                        onBlur={() => setEditingTitle(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                      />
                    ) : (
                      <button
                        className="flex items-center gap-2 group"
                        onClick={() => setEditingTitle(true)}
                      >
                        <h2 className="text-base font-bold text-slate-900 text-left line-clamp-2">
                          {selectedDraft.title}
                        </h2>
                        <Edit2 className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <TypeBadge type={selectedDraft.draft_type} />
                      <StatusBadge status={selectedDraft.status} />
                      <span className="text-xs text-slate-400 font-mono">v{selectedDraft.version}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      <span>Created by <span className="font-medium">{selectedDraft.creator?.full_name ?? 'Unknown'}</span></span>
                      <span className="text-slate-300">·</span>
                      <span>{formatDateTime(selectedDraft.created_at)}</span>
                      <span className="text-slate-300">·</span>
                      <span>Updated {formatRelative(selectedDraft.updated_at)}</span>
                    </div>

                    {recipientTo && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                        <Send className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-500">To: </span>
                        <span className="text-slate-700 font-medium">{recipientTo}</span>
                        {recipientCc && <span className="text-slate-400">· CC: {recipientCc}</span>}
                      </div>
                    )}

                    {/* Case link */}
                    {(() => {
                      const linkedCase = mockCases.find((c) => c.id === selectedDraft.case_id)
                      return linkedCase ? (
                        <div className="mt-1.5">
                          <span className="text-xs text-slate-500">Case: </span>
                          <span className="text-xs font-semibold text-blue-600">{linkedCase.reference}</span>
                          <span className="text-xs text-slate-500 ml-1">— {linkedCase.vessel?.name}</span>
                        </div>
                      ) : null
                    })()}
                  </div>

                  {/* Toolbar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {saved ? 'Saved' : 'Save'}
                      </button>
                      <span className="text-xs text-slate-400">Demo mode — session only</span>
                    </div>

                    {selectedDraft.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange('under_review')}
                        className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Submit for Review
                      </button>
                    )}

                    {selectedDraft.status === 'under_review' && (
                      <button
                        onClick={() => handleStatusChange('approved')}
                        className="inline-flex items-center gap-1.5 rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    )}

                    {selectedDraft.status === 'approved' && (
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => handleStatusChange('sent')}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Mark as Sent
                        </button>
                        <span className="text-xs text-amber-600">Demo mode — no email dispatched</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Recipients */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-700">Addressing</p>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">To <span className="text-red-400">*</span></label>
                      <input
                        type="email"
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="recipient@example.com"
                        value={recipientTo}
                        onChange={(e) => setRecipientTo(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">CC</label>
                        <input
                          type="text"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="cc@example.com; cc2@example.com"
                          value={recipientCc}
                          onChange={(e) => setRecipientCc(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">BCC</label>
                        <input
                          type="text"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="bcc@example.com"
                          value={recipientBcc}
                          onChange={(e) => setRecipientBcc(e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      Separate multiple addresses with semicolons. CC your P&I correspondent and owner/charterer as appropriate.
                    </p>
                  </div>
                </div>

                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                  rows={Math.max(30, selectedDraft.body.split('\n').length + 5)}
                  value={selectedDraft.body}
                  onChange={(e) => updateDraftField('body', e.target.value)}
                  placeholder="Begin drafting your communication here..."
                />
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{selectedDraft.body.length.toLocaleString()} characters</span>
                  <span className="text-slate-300">·</span>
                  <span>{wordCount(selectedDraft.body).toLocaleString()} words</span>
                  <span className="text-slate-300">·</span>
                  <span>{selectedDraft.body.split('\n').length} lines</span>
                </div>

                {/* Version History Panel */}
                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setShowHistory((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <History className="h-4 w-4 text-slate-500" />
                      Version History
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-slate-400 transition-transform',
                        showHistory && 'rotate-180'
                      )}
                    />
                  </button>
                  {showHistory && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                      {versionHistory.map((vh) => (
                        <div key={vh.version} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              Version {vh.version}
                              {vh.version === selectedDraft.version && (
                                <span className="ml-2 text-blue-600">(current)</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{vh.note}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-600">{vh.user}</p>
                            <p className="text-xs text-slate-400">{formatRelative(vh.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
