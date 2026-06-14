import { cn, formatQuantity, formatDateTime } from '@/lib/utils'
import { SOURCE_LABELS, type BasisRow } from '@/lib/reconciler'
import type { MeasurementSource } from '@/types'

const SEV_BADGE: Record<string, string> = {
  ok: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface Props {
  rows: BasisRow[]
  presentSources: MeasurementSource[]
}

export function BasisMatrix({ rows, presentSources }: Props) {
  if (presentSources.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Measurement Basis</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Temperature, density, VCF and timing underpin the volume-to-mass conversion. Spread across sources is flagged.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/40 text-left">
              <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700">Attribute</th>
              {presentSources.map((s) => (
                <th key={s} className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right whitespace-nowrap border-b border-slate-200 dark:border-slate-700">
                  {SOURCE_LABELS[s]}
                </th>
              ))}
              <th className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700">Spread</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map((row) => (
              <tr key={row.attr.key} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{row.attr.label}</span>
                  {row.attr.unit && <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">{row.attr.unit}</span>}
                </td>
                {presentSources.map((s) => {
                  const cell = row.cells[s]
                  if (!cell || cell.missing) {
                    return (
                      <td key={s} className="px-4 py-2.5 text-right">
                        <span className="inline-flex items-center rounded bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                          missing
                        </span>
                      </td>
                    )
                  }
                  return (
                    <td key={s} className="px-4 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {row.attr.kind === 'datetime'
                        ? <span className="text-xs">{formatDateTime(cell.value as string)}</span>
                        : formatQuantity(cell.value as number, row.attr.decimals ?? 2)}
                    </td>
                  )
                })}
                <td className="px-4 py-2.5 whitespace-nowrap">
                  {row.spread_severity === 'ok' ? (
                    <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                  ) : (
                    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold', SEV_BADGE[row.spread_severity])}>
                      {row.spread_note ?? row.spread_severity}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
