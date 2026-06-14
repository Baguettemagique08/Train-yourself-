import { History, RotateCcw } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { STATUS_LABELS, type ClaimDraftVersion } from '@/hooks/useClaimDrafter'

interface Props {
  versions: ClaimDraftVersion[]
  onRestore: (v: ClaimDraftVersion) => void
}

export function VersionHistory({ versions, onRestore }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <History className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Version History</h3>
        {versions.length > 0 && <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{versions.length}</span>}
      </div>

      {versions.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6 px-4">
          No saved versions yet. Saving or advancing status records a version here.
        </p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
          {versions.map((v, i) => (
            <div key={`${v.version}-${i}`} className="px-4 py-2.5 flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center h-6 w-9 rounded bg-slate-100 dark:bg-slate-700 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                v{v.version}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{v.note}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {STATUS_LABELS[v.status]} · {v.saved_by} · {formatDateTime(v.saved_at)}
                </p>
              </div>
              <button
                onClick={() => onRestore(v)}
                title="Restore this version into the editor"
                className="flex-shrink-0 inline-flex items-center gap-1 rounded border border-slate-300 dark:border-slate-600 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <RotateCcw className="h-3 w-3" /> Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
