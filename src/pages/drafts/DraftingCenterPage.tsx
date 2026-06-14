import { useState } from 'react'
import { FileText, Plus, Clock, CheckCircle, Send, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DraftStatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { SelectField, Textarea, Input } from '@/components/ui/FormField'
import { mockDrafts, mockCases, mockTemplates } from '@/data/mockData'
import { formatDateTime, formatRelative } from '@/lib/utils'
import { DRAFT_TYPE_OPTIONS } from '@/lib/constants'
import type { Draft, DraftType } from '@/types'

export function DraftingCenterPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string>(mockDrafts[0]?.id ?? '')
  const [showNew, setShowNew] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')

  const filtered = mockDrafts.filter((d) => {
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter && d.type !== typeFilter) return false
    if (statusFilter && d.status !== statusFilter) return false
    return true
  })

  const activeDraft = filtered.find((d) => d.id === selectedId) ?? filtered[0] ?? null

  function startEdit(draft: Draft) {
    setEditContent(draft.content)
    setEditMode(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Drafting Center</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Create and manage LOPs, owner updates, claim letters, and internal communications
          </p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" /> New Draft
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ minHeight: '70vh' }}>
        {/* Drafts list */}
        <div className="space-y-3">
          {/* Search & filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="form-input pl-9"
                placeholder="Search drafts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="form-select text-xs"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                {DRAFT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                className="form-select text-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="sent">Sent</option>
              </select>
            </div>
          </div>

          {/* Draft cards */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No drafts match filters</p>
            ) : (
              filtered.map((d) => (
                <div
                  key={d.id}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    activeDraft?.id === d.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => { setSelectedId(d.id); setEditMode(false) }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-slate-900 leading-snug line-clamp-2">{d.title}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <DraftStatusBadge status={d.status} />
                    <span className="text-xs text-slate-400">{formatRelative(d.updated_at)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{d.type.replace(/_/g, ' ')} · v{d.version}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Draft editor panel */}
        {activeDraft ? (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">{activeDraft.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <DraftStatusBadge status={activeDraft.status} />
                    <span className="text-xs text-slate-400">Version {activeDraft.version}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400">{activeDraft.creator?.full_name}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400">{formatDateTime(activeDraft.updated_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {activeDraft.status === 'draft' && (
                    <>
                      {!editMode ? (
                        <Button size="sm" variant="secondary" onClick={() => startEdit(activeDraft)}>Edit</Button>
                      ) : (
                        <Button size="sm" onClick={() => setEditMode(false)}>Save</Button>
                      )}
                      <Button size="sm" variant="secondary">Submit for Review</Button>
                    </>
                  )}
                  {activeDraft.status === 'under_review' && (
                    <>
                      <Button size="sm" variant="secondary">Request Changes</Button>
                      <Button size="sm">Approve</Button>
                    </>
                  )}
                  {activeDraft.status === 'approved' && (
                    <Button size="sm">
                      <Send className="h-3.5 w-3.5" /> Send
                    </Button>
                  )}
                  {activeDraft.status === 'sent' && (
                    <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Sent {activeDraft.sent_at ? formatDateTime(activeDraft.sent_at) : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Linked case */}
            {(() => {
              const linkedCase = mockCases.find((c) => c.id === activeDraft.case_id)
              return linkedCase ? (
                <div className="px-5 py-2 border-b border-slate-100 bg-blue-50 flex items-center gap-2 text-xs text-blue-700">
                  <span className="font-medium">Linked case:</span>
                  <span className="font-mono font-semibold">{linkedCase.reference}</span>
                  <span>·</span>
                  <span>{linkedCase.vessel?.name}</span>
                  <span>·</span>
                  <span>{linkedCase.port?.name}</span>
                </div>
              ) : null
            })()}

            {/* Content */}
            <div className="flex-1 p-5">
              {editMode ? (
                <textarea
                  className="w-full h-full min-h-96 text-xs font-mono text-slate-800 bg-white border border-slate-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              ) : (
                <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {activeDraft.content}
                </pre>
              )}
            </div>

            {/* Sent to */}
            {activeDraft.sent_to && activeDraft.sent_to.length > 0 && (
              <div className="px-5 py-2.5 border-t border-slate-100 bg-green-50 flex items-center gap-2 text-xs text-green-700">
                <Send className="h-3.5 w-3.5" />
                <span>Sent to: {activeDraft.sent_to.join(', ')}</span>
              </div>
            )}

            {/* Notes */}
            {activeDraft.notes && (
              <div className="px-5 py-2.5 border-t border-slate-100 bg-amber-50 text-xs text-amber-700 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                {activeDraft.notes}
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            <div className="text-center">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Select a draft to view</p>
            </div>
          </div>
        )}
      </div>

      <NewDraftModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  )
}

function NewDraftModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedType, setSelectedType] = useState<DraftType>('LOP_Response')
  const template = mockTemplates.find((t) => t.type === selectedType)

  return (
    <Modal open={open} onClose={onClose} title="New Draft" size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save Draft</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Draft Type"
            options={DRAFT_TYPE_OPTIONS}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DraftType)}
          />
          <SelectField
            label="Linked Case"
            options={mockCases.map((c) => ({ value: c.id, label: `${c.reference} — ${c.vessel?.name}` }))}
            placeholder="Select case (optional)"
          />
        </div>
        <Input label="Title" defaultValue="" placeholder="Draft title" required />
        <Textarea
          label="Content"
          rows={20}
          className="font-mono text-xs"
          defaultValue={template?.content ?? ''}
          hint="Complete all fields marked in [brackets] before saving."
        />
      </div>
    </Modal>
  )
}
