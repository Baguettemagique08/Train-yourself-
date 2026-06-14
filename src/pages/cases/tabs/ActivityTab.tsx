import { mockActivities } from '@/data/mockData'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateTime } from '@/lib/utils'
import { initials } from '@/lib/utils'
import {
  FolderPlus, Upload, BarChart2, FileText, AlertTriangle, Edit, MessageSquare,
} from 'lucide-react'

const ACTION_ICONS: Record<string, React.ElementType> = {
  case_created: FolderPlus,
  document_uploaded: Upload,
  measurements_entered: BarChart2,
  draft_created: FileText,
  draft_updated: Edit,
  status_changed: AlertTriangle,
  note_added: MessageSquare,
}

interface ActivityTabProps {
  caseId: string
}

export function ActivityTab({ caseId }: ActivityTabProps) {
  const activities = mockActivities
    .filter((a) => a.case_id === caseId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  if (activities.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Activity will appear here as documents are uploaded, figures entered, and drafts created."
      />
    )
  }

  return (
    <div className="space-y-0 relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-6 bottom-6 w-px bg-slate-200" />

      {activities.map((act, i) => {
        const Icon = ACTION_ICONS[act.activity_type] ?? MessageSquare
        return (
          <div key={act.id} className={`relative flex gap-4 ${i < activities.length - 1 ? 'pb-6' : ''}`}>
            {/* Icon bubble */}
            <div className="relative z-10 flex-shrink-0 h-10 w-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
              <Icon className="h-4 w-4 text-slate-500" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-800">{act.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {act.user && (
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
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
  )
}
