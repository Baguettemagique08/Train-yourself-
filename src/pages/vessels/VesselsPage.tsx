import { useState } from 'react'
import { Ship, Plus, Search, Anchor, ExternalLink } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { mockVessels, mockCases } from '@/data/mockData'

const FLAG_MAP: Record<string, string> = {
  'Panama':       '🇵🇦',
  'Marshall Islands': '🇲🇭',
  'Liberia':      '🇱🇷',
  'Bahamas':      '🇧🇸',
  'Malta':        '🇲🇹',
  'Cyprus':       '🇨🇾',
  'Greece':       '🇬🇷',
  'Singapore':    '🇸🇬',
}

export function VesselsPage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const vessels = mockVessels.filter((v) => {
    const q = search.toLowerCase()
    return (
      !q ||
      v.name.toLowerCase().includes(q) ||
      (v.imo ?? '').toLowerCase().includes(q) ||
      (v.flag ?? '').toLowerCase().includes(q)
    )
  })

  const selected = mockVessels.find((v) => v.id === selectedId)
  const vesselCases = selected
    ? mockCases.filter((c) => c.vessel_id === selected.id)
    : []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Vessels
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Fleet register — vessel particulars, IMO numbers, and case history.
          </p>
        </div>
        <button className="btn-primary text-xs py-1.5 px-3">
          <Plus className="h-3.5 w-3.5" />
          Add Vessel
        </button>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-5 items-start">
        {/* Left: vessel list */}
        <div className="space-y-3">
          <div className="card p-3 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search vessel name or IMO…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input h-8 text-xs py-0 pl-8"
              />
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {vessels.length} vessel{vessels.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="table-container">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  {['Vessel', 'IMO', 'Flag', 'Type', 'DWT', 'Open Cases', ''].map(
                    (h) => <th key={h} className="table-th">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {vessels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                      <Ship className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      No vessels found.
                    </td>
                  </tr>
                ) : (
                  vessels.map((v) => {
                    const openCases = mockCases.filter(
                      (c) => c.vessel_id === v.id && !['resolved', 'closed'].includes(c.status)
                    ).length
                    const isSelected = v.id === selectedId

                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedId(isSelected ? null : v.id)}
                        className={cn(
                          'table-row cursor-pointer',
                          isSelected && 'bg-blue-50 dark:bg-blue-900/10'
                        )}
                      >
                        <td className="table-td">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                              <Anchor className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {v.name}
                            </span>
                          </div>
                        </td>
                        <td className="table-td font-mono text-xs text-slate-500">
                          {v.imo ?? '—'}
                        </td>
                        <td className="table-td text-sm">
                          <div className="flex items-center gap-1.5">
                            <span>{FLAG_MAP[v.flag ?? ''] ?? '🏳️'}</span>
                            <span className="text-xs text-slate-500">{v.flag ?? '—'}</span>
                          </div>
                        </td>
                        <td className="table-td text-xs text-slate-500">
                          {(v as any).vessel_type ?? 'Tanker'}
                        </td>
                        <td className="table-td font-mono text-xs text-slate-500">
                          {(v as any).dwt ? `${((v as any).dwt / 1000).toFixed(0)}k` : '—'}
                        </td>
                        <td className="table-td">
                          {openCases > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold px-2 py-0.5">
                              {openCases}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="table-td">
                          <button className="btn-ghost py-1 px-2 text-xs">
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: vessel detail */}
        <div className="card p-0 overflow-hidden sticky top-0">
          {!selected ? (
            <div className="py-16 text-center text-sm text-slate-400 px-4">
              <Ship className="h-8 w-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              Select a vessel to view particulars and case history.
            </div>
          ) : (
            <div>
              <div className="card-header">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Anchor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {selected.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      IMO {selected.imo ?? '—'} · {selected.flag ?? '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Particulars */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Type', (selected as any).vessel_type ?? 'Tanker'],
                    ['Flag', selected.flag ?? '—'],
                    ['DWT', (selected as any).dwt ? `${(selected as any).dwt.toLocaleString()} MT` : '—'],
                    ['Call Sign', (selected as any).call_sign ?? '—'],
                    ['Built', (selected as any).year_built ?? '—'],
                    ['Owner', (selected as any).owner ?? '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-2">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                        {label}
                      </div>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Case history */}
                <div className="pt-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Case History ({vesselCases.length})
                  </div>
                  {vesselCases.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No cases on record for this vessel.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {vesselCases.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-2"
                        >
                          <div>
                            <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                              {c.reference}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {c.port?.name ?? '—'} · {c.created_at ? formatDate(c.created_at) : '—'}
                            </div>
                          </div>
                          <span className={cn(
                            'text-[10px] font-semibold rounded-full px-1.5 py-0.5',
                            `status-${c.status}`
                          )}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
