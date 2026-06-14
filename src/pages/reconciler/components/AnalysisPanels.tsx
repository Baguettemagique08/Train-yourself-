import {
  ShieldAlert, AlertTriangle, Info, ClipboardList, Search, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EvidenceGap, LikelyCause } from '@/lib/reconciler'

const SEV_STYLES: Record<string, { ring: string; icon: string; Icon: typeof AlertTriangle }> = {
  critical: { ring: 'border-red-200 dark:border-red-900/50 bg-red-50/60 dark:bg-red-900/10', icon: 'text-red-500', Icon: ShieldAlert },
  warning: { ring: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-900/10', icon: 'text-amber-500', Icon: AlertTriangle },
  ok: { ring: 'border-slate-200 dark:border-slate-700', icon: 'text-slate-400', Icon: Info },
}

const CATEGORY_LABELS: Record<LikelyCause['category'], string> = {
  measurement_basis: 'Measurement basis',
  instrument: 'Instrument',
  procedure: 'Procedure',
  quantity: 'Quantity',
  data_quality: 'Data quality',
}

// ── Evidence gaps ─────────────────────────────────────────────────────────────

export function EvidenceGapPanel({ gaps }: { gaps: EvidenceGap[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <Search className="h-4 w-4 text-slate-400" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Evidence Gaps</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Missing inputs that limit the reconciliation</p>
        </div>
        {gaps.length > 0 && (
          <span className="ml-auto inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {gaps.length}
          </span>
        )}
      </div>
      {gaps.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No evidence gaps detected for the figures on file.</p>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {gaps.map((g) => {
            const s = SEV_STYLES[g.severity] ?? SEV_STYLES.ok
            return (
              <div key={g.id} className={cn('rounded-lg border p-3', s.ring)}>
                <div className="flex items-start gap-2.5">
                  <s.Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', s.icon)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{g.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{g.detail}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Recommended:</span> {g.recommended_evidence}
                    </p>
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

// ── Likely causes ─────────────────────────────────────────────────────────────

export function LikelyCausesPanel({ causes }: { causes: LikelyCause[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-slate-400" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Likely Causes</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Rule-based patterns for analyst consideration</p>
        </div>
      </div>

      {/* Conservative framing — these are not determinations. */}
      <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Generated from the structured measurements by a fixed rule set. Each item lists the figures that triggered it.
          These are <span className="font-medium">candidate explanations to investigate</span>, not conclusions.
        </p>
      </div>

      {causes.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No rule patterns triggered. Variances are within tolerance or data is insufficient to assess.</p>
        </div>
      ) : (
        <div className="p-3 space-y-2.5">
          {causes.map((c) => (
            <div key={c.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{c.title}</p>
                <span className={cn(
                  'flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5',
                  c.indicator_strength === 'multiple'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
                )}>
                  {c.indicator_strength === 'multiple' ? 'Multiple indicators' : 'Single indicator'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{c.basis}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.signals.map((sig, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 dark:text-slate-500">{sig.label}:</span>
                    <span className="font-mono font-medium">{sig.value}</span>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{CATEGORY_LABELS[c.category]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
