import { useState, useCallback } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Printer,
  Flag,
  Save,
  Plus,
  X,
} from 'lucide-react'
import { mockCases, mockMeasurements } from '@/data/mockData'
import { cn, formatDate, formatQuantity } from '@/lib/utils'
import type { FuelType } from '@/types'

// ── Thresholds ─────────────────────────────────────────────────────────────────
const WARNING_PCT = 0.5
const CRITICAL_PCT = 1.0

// ── Types ──────────────────────────────────────────────────────────────────────
interface ReconcilerRowData {
  id: string
  fuelGrade: FuelType
  vesselFigures: string
  bargeBdn: string
  mfmReading: string
  flagged: boolean
}

function calcDiff(a: string, b: string): number | null {
  const na = parseFloat(a)
  const nb = parseFloat(b)
  if (isNaN(na) || isNaN(nb) || nb === 0) return null
  return na - nb
}

function calcPct(diff: number | null, base: string): number | null {
  const nb = parseFloat(base)
  if (diff === null || isNaN(nb) || nb === 0) return null
  return (diff / nb) * 100
}

function getVarianceFlag(pct: number | null): 'ok' | 'amber' | 'red' {
  if (pct === null) return 'ok'
  const abs = Math.abs(pct)
  if (abs >= CRITICAL_PCT) return 'red'
  if (abs >= WARNING_PCT) return 'amber'
  return 'ok'
}

function StatusDot({ flag }: { flag: 'ok' | 'amber' | 'red' }) {
  if (flag === 'ok') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Within Tolerance
      </span>
    )
  }
  if (flag === 'amber') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Warning
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      Critical
    </span>
  )
}

function DiffCell({ diff, pct }: { diff: number | null; pct: number | null }) {
  if (diff === null || pct === null) {
    return <span className="text-slate-400">—</span>
  }
  const flag = getVarianceFlag(pct)
  const colorClass =
    flag === 'red'
      ? 'text-red-600 font-semibold'
      : flag === 'amber'
      ? 'text-amber-600 font-semibold'
      : 'text-green-600'
  return (
    <span className={cn(colorClass)}>
      {diff >= 0 ? '+' : ''}
      {formatQuantity(diff, 3)}
    </span>
  )
}

function PctCell({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-slate-400">—</span>
  const flag = getVarianceFlag(pct)
  const colorClass =
    flag === 'red'
      ? 'text-red-600 font-semibold'
      : flag === 'amber'
      ? 'text-amber-600 font-semibold'
      : 'text-green-600'
  return (
    <span className={cn(colorClass)}>
      {pct >= 0 ? '+' : ''}
      {pct.toFixed(3)}%
    </span>
  )
}

// ── Build initial rows from mock data ─────────────────────────────────────────
function buildInitialRows(caseId: string): ReconcilerRowData[] {
  const measurements = mockMeasurements.filter((m) => m.case_id === caseId)
  const fuelGrades = Array.from(new Set(measurements.map((m) => m.fuel_type)))

  if (fuelGrades.length === 0) {
    return [
      {
        id: 'row-default',
        fuelGrade: 'VLSFO',
        vesselFigures: '',
        bargeBdn: '',
        mfmReading: '',
        flagged: false,
      },
    ]
  }

  return fuelGrades.map((grade, idx) => {
    const vessel = measurements.find((m) => m.source === 'vessel' && m.fuel_type === grade)
    const barge = measurements.find((m) => m.source === 'barge' && m.fuel_type === grade)
    const mfm = measurements.find((m) => m.source === 'mfm' && m.fuel_type === grade)
    return {
      id: `row-${caseId}-${idx}`,
      fuelGrade: grade,
      vesselFigures: vessel ? String(vessel.net_quantity) : '',
      bargeBdn: barge ? String(barge.net_quantity) : '',
      mfmReading: mfm ? String(mfm.net_quantity) : '',
      flagged: false,
    }
  })
}

const FUEL_TYPES: FuelType[] = [
  'VLSFO', 'HSFO', 'MGO', 'LSMGO', 'LNG', 'Methanol', 'Ammonia', 'Biofuel', 'B24', 'B100',
]

let rowCounter = 0

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ReconcilerPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(mockCases[0]?.id ?? '')
  const [rows, setRows] = useState<ReconcilerRowData[]>(() =>
    buildInitialRows(mockCases[0]?.id ?? '')
  )
  const [showFlagHighlight, setShowFlagHighlight] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedCase = mockCases.find((c) => c.id === selectedCaseId) ?? null

  const handleCaseChange = useCallback((caseId: string) => {
    setSelectedCaseId(caseId)
    setRows(buildInitialRows(caseId))
    setShowFlagHighlight(false)
    setSaved(false)
  }, [])

  const updateRow = useCallback(
    (id: string, field: keyof ReconcilerRowData, value: string | boolean | FuelType) => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
      setSaved(false)
    },
    []
  )

  const addRow = useCallback(() => {
    rowCounter += 1
    setRows((prev) => [
      ...prev,
      {
        id: `row-new-${rowCounter}`,
        fuelGrade: 'MGO',
        vesselFigures: '',
        bargeBdn: '',
        mfmReading: '',
        flagged: false,
      },
    ])
  }, [])

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const handleFlagForDispute = useCallback(() => {
    setShowFlagHighlight((prev) => !prev)
    setRows((prev) =>
      prev.map((r) => {
        const diffVB = calcDiff(r.vesselFigures, r.bargeBdn)
        const pctVB = calcPct(diffVB, r.bargeBdn)
        const flag = getVarianceFlag(pctVB)
        return { ...r, flagged: flag !== 'ok' }
      })
    )
  }, [])

  const handleSave = useCallback(() => {
    setSaved(true)
  }, [])

  const handleExportCSV = useCallback(() => {
    const headers = [
      'Fuel Grade',
      'Vessel Figures (MT)',
      'Barge / BDN (MT)',
      'MFM Reading (MT)',
      'Vessel-Barge Diff',
      'Vessel-Barge %',
      'Vessel-MFM Diff',
      'Vessel-MFM %',
    ]
    const csvRows = rows.map((r) => {
      const diffVB = calcDiff(r.vesselFigures, r.bargeBdn)
      const pctVB = calcPct(diffVB, r.bargeBdn)
      const diffVM = calcDiff(r.vesselFigures, r.mfmReading)
      const pctVM = calcPct(diffVM, r.mfmReading)
      return [
        r.fuelGrade,
        r.vesselFigures,
        r.bargeBdn,
        r.mfmReading,
        diffVB !== null ? diffVB.toFixed(3) : '',
        pctVB !== null ? pctVB.toFixed(3) + '%' : '',
        diffVM !== null ? diffVM.toFixed(3) : '',
        pctVM !== null ? pctVM.toFixed(3) + '%' : '',
      ].join(',')
    })
    const csv = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reconciliation-${selectedCase?.reference ?? 'export'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [rows, selectedCase])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // ── Summary calculations ───────────────────────────────────────────────────
  const totalVessel = rows.reduce((sum, r) => {
    const v = parseFloat(r.vesselFigures)
    return sum + (isNaN(v) ? 0 : v)
  }, 0)

  const totalBdn = rows.reduce((sum, r) => {
    const v = parseFloat(r.bargeBdn)
    return sum + (isNaN(v) ? 0 : v)
  }, 0)

  const totalDiscrepancy = totalVessel - totalBdn
  const totalDiscrepancyPct = totalBdn !== 0 ? (totalDiscrepancy / totalBdn) * 100 : 0
  const summaryFlag = getVarianceFlag(totalDiscrepancyPct)

  const summaryBgClass =
    summaryFlag === 'red'
      ? 'bg-red-50 border-red-200'
      : summaryFlag === 'amber'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-green-50 border-green-200'

  const summaryTextClass =
    summaryFlag === 'red'
      ? 'text-red-700'
      : summaryFlag === 'amber'
      ? 'text-amber-700'
      : 'text-green-700'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quantity Reconciler</h1>
            <p className="mt-1 text-sm text-slate-500">
              Compare barge, vessel, and MFM measurements to identify quantity discrepancies.
            </p>
          </div>
        </div>

        {/* Draft Analysis Disclaimer */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Draft Analysis:</span> All reconciliation outputs are
            draft analyses requiring review by a qualified marine surveyor before formal use in
            dispute proceedings.
          </p>
        </div>

        {/* Case Selector */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Select Case
          </label>
          <select
            className="w-full max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedCaseId}
            onChange={(e) => handleCaseChange(e.target.value)}
          >
            {mockCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.reference} — {c.vessel?.name} — {c.port?.name} ({c.fuel_type})
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Context Panel */}
        {selectedCase && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Delivery Context</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Vessel</p>
                <p className="text-sm font-semibold text-slate-900">{selectedCase.vessel?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Port</p>
                <p className="text-sm font-semibold text-slate-900">{selectedCase.port?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Supplier</p>
                <p className="text-sm font-semibold text-slate-900">{selectedCase.supplier?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Delivery Date</p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatDate(selectedCase.delivery_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Fuel Type</p>
                <p className="text-sm font-semibold text-slate-900">{selectedCase.fuel_type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">BDN Quantity</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedCase.bdn_quantity != null
                    ? `${formatQuantity(selectedCase.bdn_quantity)} MT`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Reconciliation Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Measurement Reconciliation</h2>
            <button
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200">
                    Fuel Grade
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200">
                    Vessel Figures (MT)
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200">
                    Barge / BDN (MT)
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200">
                    MFM Reading (MT)
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200">
                    Vessel–Barge Diff
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200">
                    V–B %
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200">
                    Vessel–MFM Diff
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200">
                    V–M %
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200">
                    Status
                  </th>
                  <th className="px-4 py-3 border-b border-slate-200" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const diffVB = calcDiff(row.vesselFigures, row.bargeBdn)
                  const pctVB = calcPct(diffVB, row.bargeBdn)
                  const diffVM = calcDiff(row.vesselFigures, row.mfmReading)
                  const pctVM = calcPct(diffVM, row.mfmReading)
                  const worstFlag = getVarianceFlag(
                    Math.abs(pctVB ?? 0) >= Math.abs(pctVM ?? 0) ? pctVB : pctVM
                  )
                  const isFlagged = showFlagHighlight && row.flagged

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'transition-colors',
                        isFlagged
                          ? 'bg-red-50 ring-1 ring-inset ring-red-200'
                          : 'hover:bg-slate-50'
                      )}
                    >
                      {/* Fuel Grade */}
                      <td className="px-4 py-2.5">
                        <select
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={row.fuelGrade}
                          onChange={(e) =>
                            updateRow(row.id, 'fuelGrade', e.target.value as FuelType)
                          }
                        >
                          {FUEL_TYPES.map((ft) => (
                            <option key={ft} value={ft}>
                              {ft}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Vessel Figures */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-right text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={row.vesselFigures}
                          onChange={(e) => updateRow(row.id, 'vesselFigures', e.target.value)}
                          placeholder="0.000"
                        />
                      </td>

                      {/* Barge / BDN */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-right text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={row.bargeBdn}
                          onChange={(e) => updateRow(row.id, 'bargeBdn', e.target.value)}
                          placeholder="0.000"
                        />
                      </td>

                      {/* MFM Reading */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-right text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={row.mfmReading}
                          onChange={(e) => updateRow(row.id, 'mfmReading', e.target.value)}
                          placeholder="0.000"
                        />
                      </td>

                      {/* Diffs & Pcts */}
                      <td className="px-4 py-2.5 text-right font-mono text-xs">
                        <DiffCell diff={diffVB} pct={pctVB} />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs">
                        <PctCell pct={pctVB} />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs">
                        <DiffCell diff={diffVM} pct={pctVM} />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs">
                        <PctCell pct={pctVM} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <StatusDot flag={worstFlag} />
                      </td>

                      {/* Remove */}
                      <td className="px-2 py-2.5">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove row"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Panel */}
        <div className={cn('rounded-lg border p-5 shadow-sm', summaryBgClass)}>
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Reconciliation Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
                Net Delivered (Vessel)
              </p>
              <p className="text-lg font-bold text-slate-900">
                {formatQuantity(totalVessel, 3)} MT
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
                BDN Quantity
              </p>
              <p className="text-lg font-bold text-slate-900">
                {formatQuantity(totalBdn, 3)} MT
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
                Total Discrepancy
              </p>
              <p className={cn('text-lg font-bold', summaryTextClass)}>
                {totalDiscrepancy >= 0 ? '+' : ''}
                {formatQuantity(totalDiscrepancy, 3)} MT ({totalDiscrepancyPct >= 0 ? '+' : ''}
                {totalDiscrepancyPct.toFixed(3)}%)
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
                Severity
              </p>
              <div className="flex items-center gap-2">
                {summaryFlag === 'ok' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {(summaryFlag === 'amber' || summaryFlag === 'red') && (
                  <AlertTriangle className={cn('h-5 w-5', summaryFlag === 'red' ? 'text-red-500' : 'text-amber-500')} />
                )}
                <span className={cn('text-sm font-semibold', summaryTextClass)}>
                  {summaryFlag === 'ok'
                    ? 'Within Tolerance'
                    : summaryFlag === 'amber'
                    ? `Warning (>${WARNING_PCT}%)`
                    : `Critical (>${CRITICAL_PCT}%)`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" />
            {saved ? 'Saved' : 'Save to Case'}
          </button>

          <button
            onClick={handleFlagForDispute}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors shadow-sm',
              showFlagHighlight
                ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-red-300 bg-white text-red-600 hover:bg-red-50'
            )}
          >
            <Flag className="h-4 w-4" />
            {showFlagHighlight ? 'Flagged for Dispute' : 'Flag for Dispute'}
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>

        {/* Threshold legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-200 pt-4">
          <span className="font-medium text-slate-600">Thresholds:</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Within tolerance (&lt;{WARNING_PCT}%)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Warning (&ge;{WARNING_PCT}%)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Critical (&ge;{CRITICAL_PCT}%)
          </span>
        </div>
      </div>
    </div>
  )
}
