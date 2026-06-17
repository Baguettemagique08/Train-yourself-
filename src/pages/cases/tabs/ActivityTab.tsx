import { useState } from 'react'
import { mockActivities, caseActivityRegistry } from '@/data/mockData'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { formatDateTime, initials } from '@/lib/utils'
import {
  FolderPlus, Upload, BarChart2, FileText, AlertTriangle, Edit, MessageSquare,
  Phone, Mail, CheckCircle, PlusCircle,
} from 'lucide-react'
import type { Activity } from '@/types'

const ACTION_ICONS: Record<string, React.ElementType> = {
  case_created: FolderPlus,
  document_uploaded: Upload,
  measurements_entered: BarChart2,
  measurement_added: BarChart2,
  draft_created: FileText,
  draft_updated: Edit,
  status_changed: AlertTriangle,
  note_added: MessageSquare,
  call_logged: Phone,
  email_logged: Mail,
  action_completed: CheckCircle,
}

const LOG_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'note_added', label: 'General Note' },
  { value: 'call_logged', label: 'Phone Call' },
  { value: 'email_logged', label: 'Email / Correspondence' },
  { value: 'action_completed', label: 'Action Completed' },
  { value: 'status_changed', label: 'Status Update' },
]

interface ActivityTabProps {
  caseId: string
}

export function ActivityTab({ caseId }: ActivityTabProps) {
  const [dynamicEntries, setDynamicEntries] = useState<Activity[]>(
    () => caseActivityRegistry.get(caseId) ?? []
  )
  const [showForm, setShowForm] = useState(false)
  const [logType, setLogType] = useState('note_added')
  const [description, setDescription] = useState('')

  const staticActivities = mockActivities
    .filter((a) => a.case_id === caseId)

  const allActivities = [...staticActivities, ...dynamicEntries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleAdd = () => {
    if (!description.trim()) return
    const entry: Activity = {
      id: `dyn-${Date.now()}`,
      case_id: caseId,
      user_id: 'u4',
      user: {
        id: 'u4',
        email: 'olivia.leblond@copemer.com',
        full_name: 'Olivia Leblond',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      activity_type: logType as Activity['activity_type'],
      description: description.trim(),
      created_at: new Date().toISOString(),
    }
    const updated = [...dynamicEntries, entry]
    caseActivityRegistry.set(caseId, updated)
    setDynamicEntries(updated)
    setDescription('')
    setLogType('note_added')
    setShowForm(false)
  }

  return (
    <div className="space-y-5">
      {/* Add entry form */}
      {showForm ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-blue-800">Log Activity</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              className="form-select col-span-1"
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
            >
              {LOG_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <textarea
              className="form-textarea col-span-2 min-h-[72px] resize-none"
              placeholder="Describe what happened, what was agreed, or what action was taken…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleAdd()
              }}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => { setShowForm(false); setDescription('') }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!description.trim()}>
              Add to Timeline
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
            <PlusCircle className="h-3.5 w-3.5" /> Log Activity
          </Button>
        </div>
      )}

      {/* Timeline */}
      {allActivities.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Activity will appear here as documents are uploaded, figures entered, and drafts created."
        />
      ) : (
        <div className="space-y-0 relative">
          <div className="absolute left-5 top-6 bottom-6 w-px bg-slate-200" />

          {allActivities.map((act, i) => {
            const Icon = ACTION_ICONS[act.activity_type] ?? MessageSquare
            const isDynamic = act.id.startsWith('dyn-')
            return (
              <div key={act.id} className={`relative flex gap-4 ${i < allActivities.length - 1 ? 'pb-6' : ''}`}>
                <div className={`relative z-10 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center border-2 ${isDynamic ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                  <Icon className={`h-4 w-4 ${isDynamic ? 'text-blue-500' : 'text-slate-500'}`} />
                </div>

                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-800">{act.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {act.user && (
                          <div className="flex items-center gap-1.5">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isDynamic ? 'bg-blue-100' : 'bg-blue-100'}`}>
                              <span className="text-xs font-semibold text-blue-700">{initials(act.user.full_name)}</span>
                            </div>
                            <span className="text-xs text-slate-500">{act.user.full_name}</span>
                          </div>
                        )}
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{formatDateTime(act.created_at)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wide flex-shrink-0">
                      {act.activity_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
