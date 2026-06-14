import { Lock, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FACT_CATEGORY_LABELS, type ApprovedFact, type FactCategory } from '@/lib/claimDrafter'

interface Props {
  facts: ApprovedFact[]
  includedIds: Set<string>
  onToggle: (id: string) => void
}

const CATEGORY_ORDER: FactCategory[] = ['delivery', 'quantity', 'specification', 'document', 'commercial']

export function FactLedger({ facts, includedIds, onToggle }: Props) {
  const approvedCount = facts.filter((f) => f.approved).length
  const includedCount = facts.filter((f) => f.approved && includedIds.has(f.id)).length

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Approved Case Facts</h3>
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{includedCount}/{approvedCount} in draft</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Only approved facts can be inserted. Unverified items are shown for context but are locked out of generation.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {facts.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No facts on file for this case.</p>
        ) : CATEGORY_ORDER.map((cat) => {
          const group = facts.filter((f) => f.category === cat)
          if (group.length === 0) return null
          return (
            <div key={cat}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 px-1">
                {FACT_CATEGORY_LABELS[cat]}
              </p>
              <div className="space-y-1">
                {group.map((f) => {
                  const included = f.approved && includedIds.has(f.id)
                  return (
                    <label
                      key={f.id}
                      className={cn(
                        'flex items-start gap-2.5 rounded-md border px-2.5 py-2 transition-colors',
                        f.approved
                          ? 'cursor-pointer border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                          : 'border-dashed border-slate-200 dark:border-slate-700 opacity-70',
                        included && 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/40',
                      )}
                    >
                      {f.approved ? (
                        <input
                          type="checkbox"
                          checked={included}
                          onChange={() => onToggle(f.id)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{f.label}</span>
                          {!f.approved && (
                            <span className="text-[9px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 flex-shrink-0">Unverified</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-900 dark:text-slate-100 mt-0.5 break-words">{f.value}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{f.source}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
