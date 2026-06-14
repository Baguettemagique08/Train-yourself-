import { useState } from 'react'
import { FileText, Plus, Clock, CheckCircle, Send } from 'lucide-react'
import { mockDrafts, mockTemplates } from '@/data/mockData'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { DraftStatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { SelectField, Textarea, Input } from '@/components/ui/FormField'
import { formatDateTime } from '@/lib/utils'
import { DRAFT_TYPE_OPTIONS } from '@/lib/constants'
import type { DraftType } from '@/types'

interface DraftsTabProps {
  caseId: string
}

export function DraftsTab({ caseId }: DraftsTabProps) {
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const drafts = mockDrafts.filter((d) => d.case_id === caseId)
  const activeDraft = drafts.find((d) => d.id === selectedDraft) ?? drafts[0] ?? null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" /> New Draft
        </Button>
      </div>

      {drafts.length === 0 ? (
        <EmptyState
          title="No drafts yet"
          description="Create LOPs, owner updates, claim letters, and internal memos from templates."
          action={<Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> New Draft</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Draft list */}
          <div className="space-y-2">
            {drafts.map((d) => (
              <div
                key={d.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeDraft?.id === d.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
                onClick={() => setSelectedDraft(d.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{d.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">v{d.version} · {d.draft_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <DraftStatusBadge status={d.status} />
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(d.updated_at)}
                </div>
              </div>
            ))}
          </div>

          {/* Draft editor */}
          {activeDraft && (
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activeDraft.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <DraftStatusBadge status={activeDraft.status} />
                    <span className="text-xs text-slate-400">v{activeDraft.version}</span>
                    <span className="text-xs text-slate-400">by {activeDraft.creator?.full_name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeDraft.status === 'draft' && (
                    <Button size="sm" variant="secondary">Submit for Review</Button>
                  )}
                  {activeDraft.status === 'approved' && (
                    <Button size="sm">
                      <Send className="h-3.5 w-3.5" /> Send
                    </Button>
                  )}
                  {activeDraft.status === 'sent' && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Sent {activeDraft.sent_at ? formatDateTime(activeDraft.sent_at) : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5">
                <textarea
                  className="w-full h-96 text-xs font-mono text-slate-800 bg-white border-0 resize-none focus:outline-none leading-relaxed"
                  defaultValue={activeDraft.body}
                  readOnly={activeDraft.status === 'sent'}
                />
              </div>
              {activeDraft.notes && (
                <div className="px-5 py-3 border-t border-slate-100 bg-amber-50 text-xs text-amber-700">
                  Note: {activeDraft.notes}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <NewDraftModal open={showNew} onClose={() => setShowNew(false)} caseId={caseId} />
    </div>
  )
}

function NewDraftModal({ open, onClose, caseId: _caseId }: { open: boolean; onClose: () => void; caseId: string }) {
  const [selectedType, setSelectedType] = useState<DraftType>('LOP_Response')
  const template = mockTemplates.find((t) => t.draft_type === selectedType)

  return (
    <Modal open={open} onClose={onClose} title="New Draft" size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button>Save Draft</Button>
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
          <Input label="Title" defaultValue={template ? `${template.name}` : ''} />
        </div>
        <Textarea
          label="Content"
          rows={20}
          className="font-mono text-xs"
          defaultValue={template?.body ?? ''}
          hint="Edit the template before saving. All fields in [brackets] must be completed."
        />
      </div>
    </Modal>
  )
}
