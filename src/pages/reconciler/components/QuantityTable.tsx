import { Fragment, useState } from 'react'
import { Plus, X, Pencil, Lock } from 'lucide-react'
import { cn, formatQuantity, formatDateTime } from '@/lib/utils'
import type {
  QuantityRow, QuantitySummary, SourceAdjustment, RobReference,
} from '@/lib/reconciler'
import { SOURCE_LABELS } from '@/lib/reconciler'
import type { MeasurementSource } from '@/types'

const SEV_TEXT: Record<string, string> = {
  ok: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  critical: 'text-red-600 dark:text-red-400',
}
const SEV_LABEL: Record<string, string> = { ok: 'Within tolerance', warning: 'Warning', critical: 'Critical' }
const SEV_DOT: Record<string, string> = { ok: 'bg-green-500', warning: 'bg-amber-500', critical: 'bg-red-500' }

interface Props {
  rows: QuantityRow[]
  summary: QuantitySummary
  baseSource: MeasurementSource
  presentSources: MeasurementSource[]
  adjustments: Partial<Record<MeasurementSource, SourceAdjustment>>
  onChangeBase: (s: MeasurementSource) => void
  onSetAdjustment: (s: MeasurementSource, delta: number, reason: string) => void
  onClearAdjustment: (s: MeasurementSource) => void
  rob: RobReference
  onSetRob: (field: keyof RobReference, value: number | null) => void
}

export function QuantityTable({
  rows, summary, baseSource, presentSources, adjustments,
  onChangeBase, onSetAdjustment, onClearAdjustment, rob, onSetRob,
}: Props) {
  const [editing, setEditing] = useState<MeasurementSource | null>(null)

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Quantity Reconciliation</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Each source compared against the chosen baseline</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          Baseline
          <select
            value={baseSource}
            onChange={(e) => onChangeBase(e.target.value as MeasurementSource)}
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
          >
            {presentSources.map((s) => (
              <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/40 text-left">
              {['Source', 'Reading time', 'Measured (MT)', 'Adjustment', 'Net (MT)', 'Δ vs base (MT)', 'Δ %', 'Flag', ''].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap border-b border-slate-200 dark:border-slate-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map((row) => {
              const adj = row.source ? adjustments[row.source] : undefined
              const isEditing = editing && editing === row.source
              return (
                <Fragment key={row.key}>
                  <tr
                    className={cn(
                      row.present ? 'hover:bg-slate-50 dark:hover:bg-slate-700/30' : 'opacity-60',
                      row.severity === 'critical' && 'bg-red-50/60 dark:bg-red-900/10',
                    )}
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{row.label}</span>
                        {row.is_base && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            <Lock className="h-2.5 w-2.5" /> Baseline
                          </span>
                        )}
                        {row.derived && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">Derived</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {row.timestamp ? formatDateTime(row.timestamp) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {row.present && row.raw_qty !== null
                        ? formatQuantity(row.raw_qty, 1)
                        : <MissingPill />}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {row.adjustment !== 0
                        ? <span className="text-violet-600 dark:text-violet-400">{row.adjustment > 0 ? '+' : ''}{formatQuantity(row.adjustment, 1)}</span>
                        : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {row.adjusted_qty !== null ? formatQuantity(row.adjusted_qty, 1) : '—'}
                    </td>
                    <td className={cn('px-4 py-2.5 text-right font-mono', row.delta_vs_base_mt !== null ? SEV_TEXT[row.severity] : 'text-slate-300 dark:text-slate-600')}>
                      {row.is_base ? 'base' : row.delta_vs_base_mt !== null ? `${row.delta_vs_base_mt > 0 ? '+' : ''}${formatQuantity(row.delta_vs_base_mt, 1)}` : '—'}
                    </td>
                    <td className={cn('px-4 py-2.5 text-right font-mono', row.delta_vs_base_pct !== null ? SEV_TEXT[row.severity] : 'text-slate-300 dark:text-slate-600')}>
                      {row.is_base ? '—' : row.delta_vs_base_pct !== null ? `${row.delta_vs_base_pct > 0 ? '+' : ''}${row.delta_vs_base_pct.toFixed(2)}%` : '—'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {row.present && !row.is_base ? (
                        <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', SEV_TEXT[row.severity])}>
                          <span className={cn('h-2 w-2 rounded-full', SEV_DOT[row.severity])} />
                          {SEV_LABEL[row.severity]}
                        </span>
                      ) : <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      {row.present && !row.derived && row.source && (
                        <button
                          onClick={() => setEditing(isEditing ? null : row.source!)}
                          className="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Manual adjustment"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>

                  {row.adjustment !== 0 && adj?.reason && !isEditing && (
                    <tr key={`${row.key}-reason`} className="bg-violet-50/40 dark:bg-violet-900/10">
                      <td colSpan={9} className="px-4 py-1.5 text-xs text-violet-700 dark:text-violet-300">
                        <span className="font-medium">Analyst adjustment:</span> {adj.reason}
                      </td>
                    </tr>
                  )}

                  {isEditing && row.source && (
                    <tr key={`${row.key}-edit`} className="bg-slate-50 dark:bg-slate-900/40">
                      <td colSpan={9} className="px-4 py-3">
                        <AdjustmentEditor
                          current={adj}
                          onSave={(delta, reason) => { onSetAdjustment(row.source!, delta, reason); setEditing(null) }}
                          onClear={() => { onClearAdjustment(row.source!); setEditing(null) }}
                          onCancel={() => setEditing(null)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}

            {/* ROB reference inputs (feed the derived 'Vessel by ROB difference' row) */}
            <tr className="bg-slate-50/60 dark:bg-slate-900/30">
              <td className="px-4 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400">ROB references</td>
              <td className="px-4 py-2.5 text-xs text-slate-400 dark:text-slate-500" colSpan={2}>
                <div className="flex items-center gap-2">
                  <RobInput label="ROB before" value={rob.before_mt} onChange={(v) => onSetRob('before_mt', v)} />
                  <RobInput label="ROB after" value={rob.after_mt} onChange={(v) => onSetRob('after_mt', v)} />
                </div>
              </td>
              <td colSpan={6} className="px-4 py-2.5 text-xs text-slate-400 dark:text-slate-500">
                Net by difference = ROB after − ROB before
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary band */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <SummaryStat label="Baseline" value={summary.base_label} />
        <SummaryStat label="Baseline qty" value={summary.base_qty !== null ? `${formatQuantity(summary.base_qty, 1)} MT` : '—'} />
        <SummaryStat label="Spread (max−min)" value={summary.spread_mt !== null ? `${formatQuantity(summary.spread_mt, 1)} MT` : '—'} />
        <SummaryStat
          label="Worst flag"
          value={SEV_LABEL[summary.worst_severity]}
          valueClass={SEV_TEXT[summary.worst_severity]}
        />
      </div>
    </div>
  )
}

function SummaryStat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className={cn('font-semibold mt-0.5', valueClass ?? 'text-slate-900 dark:text-slate-100')}>{value}</p>
    </div>
  )
}

function MissingPill() {
  return (
    <span className="inline-flex items-center rounded bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
      Not provided
    </span>
  )
}

function RobInput({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <label className="flex items-center gap-1.5">
      <span className="text-[11px] text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="number" step="0.1" inputMode="decimal"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
        placeholder="MT"
        className="w-20 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-right text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
      />
    </label>
  )
}

function AdjustmentEditor({
  current, onSave, onClear, onCancel,
}: {
  current?: SourceAdjustment
  onSave: (delta: number, reason: string) => void
  onClear: () => void
  onCancel: () => void
}) {
  const [delta, setDelta] = useState(String(current?.delta_mt ?? ''))
  const [reason, setReason] = useState(current?.reason ?? '')
  const parsed = parseFloat(delta)
  const valid = !Number.isNaN(parsed) && reason.trim().length > 0

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Adjustment (MT, signed)</span>
        <input
          type="number" step="0.1" value={delta}
          onChange={(e) => setDelta(e.target.value)}
          placeholder="e.g. -1.5"
          className="w-28 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-right text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 flex-1 min-w-[200px]">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Reason (required — kept on the record)</span>
        <input
          type="text" value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Applied trim correction per sounding table"
          className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          disabled={!valid}
          onClick={() => onSave(parsed, reason)}
          className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-3.5 w-3.5" /> Apply
        </button>
        {current && (
          <button onClick={onClear} className="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        )}
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1.5">Cancel</button>
      </div>
    </div>
  )
}
