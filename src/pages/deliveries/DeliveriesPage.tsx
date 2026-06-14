import { useState } from 'react'
import { Truck, Plus, Filter, Download, ExternalLink } from 'lucide-react'
import { cn, formatDate, formatQuantity } from '@/lib/utils'
import { mockDeliveries } from '@/data/mockData'
import type { FuelType } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  confirmed:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  disputed:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pending:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled:   'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
}

const STATUS_LABELS: Record<string, string> = {
  confirmed:   'Confirmed',
  disputed:    'Disputed',
  pending:     'Pending',
  in_progress: 'In Progress',
  cancelled:   'Cancelled',
}

const FUEL_COLS: FuelType[] = ['VLSFO', 'HSFO', 'MGO', 'LSMGO']

export function DeliveriesPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const deliveries = mockDeliveries.filter((d) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      (d.vessel?.name ?? '').toLowerCase().includes(q) ||
      (d.port?.name ?? '').toLowerCase().includes(q) ||
      (d.supplier?.name ?? '').toLowerCase().includes(q) ||
      (d.bdn_number ?? '').toLowerCase().includes(q)
    const matchStatus = !filterStatus || (d as any).status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Deliveries
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            All bunker delivery records — BDN, quantity, supplier, and reconciliation status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs py-1.5 px-3">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button className="btn-primary text-xs py-1.5 px-3">
            <Plus className="h-3.5 w-3.5" />
            New Delivery
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search vessel, port, supplier, BDN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input h-8 text-xs py-0 pl-3 pr-8"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-select h-8 text-xs py-0 w-36"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="disputed">Disputed</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
        </select>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          {deliveries.length} records
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table-base">
          <thead className="table-head">
            <tr>
              {[
                'BDN No.',
                'Date',
                'Vessel',
                'Port',
                'Supplier',
                'Fuel Grade',
                'BDN Qty (MT)',
                'Vessel Qty (MT)',
                'Variance',
                'Status',
                '',
              ].map((h) => (
                <th key={h} className="table-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-sm text-slate-400">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  No deliveries match your filters.
                </td>
              </tr>
            ) : (
              deliveries.map((d) => {
                const bdnQty = d.bdn_quantity ?? 0
                const vesselQty = (d as any).vessel_quantity ?? bdnQty
                const diff = vesselQty - bdnQty
                const pct = bdnQty > 0 ? (diff / bdnQty) * 100 : 0
                const variance = Math.abs(pct)
                const varFlag =
                  variance >= 1 ? 'red' : variance >= 0.5 ? 'amber' : 'ok'
                const statusKey = (d as any).status ?? 'confirmed'

                return (
                  <tr key={d.id} className="table-row cursor-pointer">
                    <td className="table-td font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {d.bdn_number ?? '—'}
                    </td>
                    <td className="table-td text-xs text-slate-500">
                      {d.delivery_date ? formatDate(d.delivery_date) : '—'}
                    </td>
                    <td className="table-td font-medium text-slate-900 dark:text-slate-100">
                      {d.vessel?.name ?? '—'}
                    </td>
                    <td className="table-td text-slate-600 dark:text-slate-400">
                      {d.port?.name ?? '—'}
                    </td>
                    <td className="table-td text-slate-600 dark:text-slate-400">
                      {d.supplier?.name ?? '—'}
                    </td>
                    <td className="table-td">
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5">
                        {d.fuel_type}
                      </span>
                    </td>
                    <td className="table-td font-mono text-xs text-right pr-6">
                      {formatQuantity(bdnQty)}
                    </td>
                    <td className="table-td font-mono text-xs text-right pr-6">
                      {formatQuantity(vesselQty)}
                    </td>
                    <td className="table-td text-right pr-4">
                      <span className={cn(
                        'text-xs font-semibold font-mono',
                        varFlag === 'red'   && 'text-red-600 dark:text-red-400',
                        varFlag === 'amber' && 'text-amber-600 dark:text-amber-400',
                        varFlag === 'ok'    && 'text-slate-400'
                      )}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)} MT
                        {' '}
                        <span className="text-slate-400 font-normal">
                          ({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)
                        </span>
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={cn(
                        'inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5',
                        STATUS_STYLES[statusKey] ?? STATUS_STYLES.pending
                      )}>
                        {STATUS_LABELS[statusKey] ?? statusKey}
                      </span>
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
  )
}
