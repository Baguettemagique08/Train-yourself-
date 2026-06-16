import { useState, useCallback } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Plus, Download, Save, BookOpen, ChevronDown } from 'lucide-react'
import { mockCases, mockSpecsChecks } from '@/data/mockData'
import { cn, formatDate, specStatusColor, specStatusLabel } from '@/lib/utils'
import {
  ISO_EDITIONS, ISO_8217_SPECS, MARKET_TO_ISO_GRADE,
  getIsoEditionGrades, getIsoSpec,
  type IsoEdition,
} from '@/lib/iso8217'
import type { SpecStatus } from '@/types'

// ── Types ──────────────────────────────────────────────────────────────────────
interface SpecRow {
  id: string
  parameter: string
  unit: string
  bdnValue: string
  contractMin: string
  contractMax: string
  labResult: string
}

function computeVariance(labResult: string, contractMin: string, contractMax: string): number | null {
  const lab = parseFloat(labResult)
  if (isNaN(lab)) return null
  const max = parseFloat(contractMax)
  const min = parseFloat(contractMin)
  if (!isNaN(max)) return lab - max
  if (!isNaN(min)) return lab - min
  return null
}

function computeStatus(
  labResult: string,
  contractMin: string,
  contractMax: string
): SpecStatus {
  const lab = parseFloat(labResult)
  if (isNaN(lab)) return 'not_tested'
  const max = parseFloat(contractMax)
  const min = parseFloat(contractMin)
  if (!isNaN(max) && lab > max) return 'off_spec'
  if (!isNaN(min) && lab < min) return 'off_spec'
  // at-limit warning: within 2% of limit
  if (!isNaN(max) && lab > max * 0.98) return 'warning'
  if (!isNaN(min) && lab < min * 1.02) return 'warning'
  return 'ok'
}

function StatusBadge({ status }: { status: SpecStatus }) {
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
        <CheckCircle className="h-3 w-3" />
        OK
      </span>
    )
  }
  if (status === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
        <AlertTriangle className="h-3 w-3" />
        At Limit
      </span>
    )
  }
  if (status === 'off_spec') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        <XCircle className="h-3 w-3" />
        Off-Spec
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
      Not Tested
    </span>
  )
}

function rowBgClass(status: SpecStatus): string {
  if (status === 'off_spec') return 'bg-red-50'
  if (status === 'warning') return 'bg-amber-50'
  return ''
}

// ── Build initial rows from mock spec checks ───────────────────────────────────
function buildRows(caseId: string): SpecRow[] {
  const checks = mockSpecsChecks.filter((sc) => sc.case_id === caseId)
  if (checks.length === 0) {
    // Default empty row set
    return [
      { id: 'sr-default-1', parameter: 'Density at 15°C', unit: 'kg/m³', bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-default-2', parameter: 'Kinematic Viscosity at 50°C', unit: 'cSt', bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-default-3', parameter: 'Flash Point', unit: '°C', bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-default-4', parameter: 'Sulphur Content', unit: '% m/m', bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-default-5', parameter: 'Water Content', unit: '% v/v', bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-default-6', parameter: 'Ash Content', unit: '% m/m', bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-default-7', parameter: 'CCAI', unit: '', bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-default-8', parameter: 'Net Heat Value', unit: 'MJ/kg', bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-default-9', parameter: 'Aluminium + Silicon', unit: 'mg/kg', bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
    ]
  }
  return checks.map((sc) => ({
    id: sc.id,
    parameter: sc.parameter_name,
    unit: sc.unit,
    bdnValue: sc.bdn_value != null ? String(sc.bdn_value) : '',
    contractMin: sc.contract_min != null ? String(sc.contract_min) : '',
    contractMax: sc.contract_max != null ? String(sc.contract_max) : '',
    labResult: sc.lab_result != null ? String(sc.lab_result) : '',
  }))
}

let customRowCounter = 0

// ── Page ───────────────────────────────────────────────────────────────────────
export default function SpecsCheckerPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => {
    // Pre-select case c2 which has specs data
    const c2 = mockCases.find((c) => c.id === 'c2')
    return c2?.id ?? mockCases[0]?.id ?? ''
  })
  const [rows, setRows] = useState<SpecRow[]>(() => buildRows('c2'))
  const [labRef, setLabRef] = useState('BV-SG-2026-44821')
  const [cpRef, setCpRef] = useState('CP-PCH-2026-001')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [linkedToCase, setLinkedToCase] = useState(false)

  // ISO 8217 limit loader state
  const [isoEdition, setIsoEdition] = useState<IsoEdition>('2017')
  const [isoGrade, setIsoGrade] = useState<string>('RMG380')
  const [isoExpanded, setIsoExpanded] = useState(false)

  const selectedCase = mockCases.find((c) => c.id === selectedCaseId) ?? null

  const handleCaseChange = useCallback((caseId: string) => {
    setSelectedCaseId(caseId)
    setRows(buildRows(caseId))
    setSaved(false)
    // Suggest an ISO grade based on the case fuel type
    const c = mockCases.find((mc) => mc.id === caseId)
    if (c?.fuel_type) {
      const suggestion = MARKET_TO_ISO_GRADE[c.fuel_type.toUpperCase()]
      if (suggestion) {
        setIsoEdition(suggestion.edition)
        setIsoGrade(suggestion.grade)
      }
    }
  }, [])

  const applyIsoLimits = useCallback(() => {
    const spec = getIsoSpec(isoEdition, isoGrade)
    if (!spec) return
    let rowId = 0
    const newRows = spec.params.map((param) => {
      rowId += 1
      return {
        id: `iso-${isoEdition}-${isoGrade}-${rowId}`,
        parameter: param.name,
        unit: param.unit,
        bdnValue: '',
        contractMin: param.min != null ? String(param.min) : '',
        contractMax: param.max != null ? String(param.max) : '',
        labResult: '',
      }
    })
    setRows(newRows)
    setSaved(false)
  }, [isoEdition, isoGrade])

  const updateRow = useCallback(
    (id: string, field: keyof Omit<SpecRow, 'id'>, value: string) => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
      setSaved(false)
    },
    []
  )

  const addCustomRow = useCallback(() => {
    customRowCounter += 1
    setRows((prev) => [
      ...prev,
      {
        id: `custom-${customRowCounter}`,
        parameter: 'Custom Parameter',
        unit: '',
        bdnValue: '',
        contractMin: '',
        contractMax: '',
        labResult: '',
      },
    ])
  }, [])

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // ── Summary counts ──────────────────────────────────────────────────────────
  const statusCounts = rows.reduce(
    (acc, r) => {
      const status = computeStatus(r.labResult, r.contractMin, r.contractMax)
      acc[status] = (acc[status] ?? 0) + 1
      return acc
    },
    {} as Record<SpecStatus, number>
  )

  const offSpecCount = statusCounts['off_spec'] ?? 0
  const warningCount = statusCounts['warning'] ?? 0
  const okCount = statusCounts['ok'] ?? 0

  const handleExport = useCallback(() => {
    const headers = ['Parameter', 'Unit', 'BDN Value', 'Contract Min', 'Contract Max', 'Lab Result', 'Variance', 'Status']
    const csvRows = rows.map((r) => {
      const variance = computeVariance(r.labResult, r.contractMin, r.contractMax)
      const status = computeStatus(r.labResult, r.contractMin, r.contractMax)
      return [
        r.parameter,
        r.unit,
        r.bdnValue,
        r.contractMin,
        r.contractMax,
        r.labResult,
        variance != null ? variance.toFixed(4) : '',
        specStatusLabel(status),
      ].join(',')
    })
    const csv = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `specs-analysis-${selectedCase?.reference ?? 'export'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [rows, selectedCase])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Specifications Checker</h1>
          <p className="mt-1 text-sm text-slate-500">
            Compare lab results against BDN values and charter party contract limits to identify off-spec parameters.
          </p>
        </div>

        {/* Draft Analysis Disclaimer */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Draft Analysis:</span> All specifications outputs are
            draft analyses and must be verified against original certified lab reports before use in
            formal claim proceedings.
          </p>
        </div>

        {/* ISO 8217 Limit Loader */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
            onClick={() => setIsoExpanded((v) => !v)}
          >
            <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-blue-800">ISO 8217 Standard Limits</span>
            <span className="ml-2 text-xs text-blue-600 font-normal">
              Pre-fill contract limits from the official specification
            </span>
            <ChevronDown className={cn('h-4 w-4 text-blue-500 ml-auto transition-transform', isoExpanded && 'rotate-180')} />
          </button>

          {isoExpanded && (
            <div className="border-t border-blue-200 bg-white px-5 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                {/* Edition */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Edition</label>
                  <select
                    value={isoEdition}
                    onChange={(e) => {
                      const ed = e.target.value as IsoEdition
                      setIsoEdition(ed)
                      // keep grade if available in new edition, else reset
                      const grades = getIsoEditionGrades(ed)
                      const all = [...grades.distillate, ...grades.residual]
                      if (!all.includes(isoGrade)) setIsoGrade(all[0] ?? '')
                    }}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {ISO_EDITIONS.map((ed) => (
                      <option key={ed.value} value={ed.value}>{ed.label}</option>
                    ))}
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fuel Grade</label>
                  <select
                    value={isoGrade}
                    onChange={(e) => setIsoGrade(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {(() => {
                      const grades = getIsoEditionGrades(isoEdition)
                      return (
                        <>
                          <optgroup label="Residual">
                            {grades.residual.map((g) => <option key={g} value={g}>{g}</option>)}
                          </optgroup>
                          <optgroup label="Distillate">
                            {grades.distillate.map((g) => <option key={g} value={g}>{g}</option>)}
                          </optgroup>
                        </>
                      )
                    })()}
                  </select>
                </div>

                {/* Apply */}
                <div>
                  <button
                    onClick={applyIsoLimits}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    Apply ISO Limits
                  </button>
                </div>
              </div>

              {/* Preview of spec */}
              {(() => {
                const spec = getIsoSpec(isoEdition, isoGrade)
                if (!spec) return null
                const note = MARKET_TO_ISO_GRADE[Object.keys(MARKET_TO_ISO_GRADE).find(k =>
                  MARKET_TO_ISO_GRADE[k].grade === isoGrade && MARKET_TO_ISO_GRADE[k].edition === isoEdition
                ) ?? '']?.note
                return (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">
                      <span className="font-medium text-slate-700">{spec.params.length} parameters</span>
                      {' · '}
                      {spec.category === 'residual' ? 'Residual fuel' : 'Distillate fuel'}
                      {note && <span className="ml-2 text-amber-700 font-medium">⚠ {note}</span>}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {spec.params.slice(0, 12).map((param) => (
                        <span key={param.name} className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">
                          {param.name}
                          {param.max != null && <span className="ml-1 text-slate-400">≤{param.max}</span>}
                          {param.min != null && param.max == null && <span className="ml-1 text-slate-400">≥{param.min}</span>}
                        </span>
                      ))}
                      {spec.params.length > 12 && (
                        <span className="text-[10px] text-slate-400 self-center">+{spec.params.length - 12} more</span>
                      )}
                    </div>
                  </div>
                )
              })()}

              <p className="text-[11px] text-slate-400">
                Applying ISO limits will replace the current parameter rows. BDN values and lab results are preserved if the parameter name matches exactly.
              </p>
            </div>
          )}
        </div>

        {/* Case / Delivery Selector Panel */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Case &amp; Reference Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Case</label>
              <select
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedCaseId}
                onChange={(e) => handleCaseChange(e.target.value)}
              >
                {mockCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.reference} — {c.vessel?.name} ({c.fuel_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Lab Report Reference</label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={labRef}
                onChange={(e) => setLabRef(e.target.value)}
                placeholder="e.g. BV-SG-2026-44821"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Charter Party Reference</label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={cpRef}
                onChange={(e) => setCpRef(e.target.value)}
                placeholder="e.g. CP-PCH-2026-001"
              />
            </div>
          </div>
          {selectedCase && (
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <span><span className="font-medium text-slate-700">Vessel:</span> {selectedCase.vessel?.name}</span>
              <span><span className="font-medium text-slate-700">Port:</span> {selectedCase.port?.name}</span>
              <span><span className="font-medium text-slate-700">Supplier:</span> {selectedCase.supplier?.name}</span>
              <span><span className="font-medium text-slate-700">Delivery:</span> {formatDate(selectedCase.delivery?.delivery_date ?? selectedCase.opened_at)}</span>
              <span><span className="font-medium text-slate-700">Fuel:</span> {selectedCase.fuel_type}</span>
            </div>
          )}
        </div>

        {/* Summary Banner */}
        <div className="grid grid-cols-3 gap-4">
          <div className={cn(
            'rounded-lg border p-4 flex items-center gap-3',
            offSpecCount > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
          )}>
            <XCircle className={cn('h-8 w-8', offSpecCount > 0 ? 'text-red-500' : 'text-slate-300')} />
            <div>
              <p className="text-2xl font-bold text-slate-900">{offSpecCount}</p>
              <p className="text-xs text-slate-600 font-medium">Off-Spec</p>
            </div>
          </div>
          <div className={cn(
            'rounded-lg border p-4 flex items-center gap-3',
            warningCount > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
          )}>
            <AlertTriangle className={cn('h-8 w-8', warningCount > 0 ? 'text-amber-500' : 'text-slate-300')} />
            <div>
              <p className="text-2xl font-bold text-slate-900">{warningCount}</p>
              <p className="text-xs text-slate-600 font-medium">At Limit</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 flex items-center gap-3">
            <CheckCircle className={cn('h-8 w-8', okCount > 0 ? 'text-green-500' : 'text-slate-300')} />
            <div>
              <p className="text-2xl font-bold text-slate-900">{okCount}</p>
              <p className="text-xs text-slate-600 font-medium">Within Specification</p>
            </div>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Parameter Analysis</h2>
            <button
              onClick={addCustomRow}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Custom Parameter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  {[
                    'Parameter',
                    'Unit',
                    'BDN Value',
                    'Contract Min',
                    'Contract Max',
                    'Lab Result',
                    'Variance',
                    'Status',
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const variance = computeVariance(row.labResult, row.contractMin, row.contractMax)
                  const status = computeStatus(row.labResult, row.contractMin, row.contractMax)
                  const bg = rowBgClass(status)

                  return (
                    <tr key={row.id} className={cn('transition-colors hover:brightness-95', bg)}>
                      {/* Parameter */}
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          className="w-48 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={row.parameter}
                          onChange={(e) => updateRow(row.id, 'parameter', e.target.value)}
                        />
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={row.unit}
                          onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                          placeholder="unit"
                        />
                      </td>

                      {/* BDN Value */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="any"
                          className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-right text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={row.bdnValue}
                          onChange={(e) => updateRow(row.id, 'bdnValue', e.target.value)}
                          placeholder="—"
                        />
                      </td>

                      {/* Contract Min */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="any"
                          className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-right text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={row.contractMin}
                          onChange={(e) => updateRow(row.id, 'contractMin', e.target.value)}
                          placeholder="—"
                        />
                      </td>

                      {/* Contract Max */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="any"
                          className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-right text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={row.contractMax}
                          onChange={(e) => updateRow(row.id, 'contractMax', e.target.value)}
                          placeholder="—"
                        />
                      </td>

                      {/* Lab Result */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="any"
                          className={cn(
                            'w-24 rounded border px-2 py-1 text-sm text-right focus:outline-none focus:ring-1',
                            status === 'off_spec'
                              ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-200'
                              : status === 'warning'
                              ? 'border-amber-400 bg-amber-50 text-amber-900 focus:border-amber-500 focus:ring-amber-200'
                              : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500'
                          )}
                          value={row.labResult}
                          onChange={(e) => updateRow(row.id, 'labResult', e.target.value)}
                          placeholder="—"
                        />
                      </td>

                      {/* Variance (read-only) */}
                      <td className="px-4 py-2.5 text-right font-mono text-xs">
                        {variance !== null ? (
                          <span
                            className={cn(
                              status === 'off_spec'
                                ? 'font-semibold text-red-600'
                                : status === 'warning'
                                ? 'font-semibold text-amber-600'
                                : 'text-green-600'
                            )}
                          >
                            {variance >= 0 ? '+' : ''}
                            {variance.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <StatusBadge status={status} />
                      </td>

                      {/* Remove */}
                      <td className="px-2 py-2.5">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove row"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSaved(true)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" />
            {saved ? 'Analysis Saved' : 'Save Analysis'}
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>

          <button
            onClick={() => setLinkedToCase(true)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors shadow-sm',
              linkedToCase
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            <CheckCircle className="h-4 w-4" />
            {linkedToCase ? `Linked to ${selectedCase?.reference ?? 'Case'}` : 'Link to Case'}
          </button>
        </div>

        {/* Notes Section */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Analysis Notes
          </label>
          <textarea
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record interpretation notes, surveyor observations, or follow-up actions required..."
          />
          <p className="mt-1.5 text-xs text-slate-400">{notes.length} characters</p>
        </div>
      </div>
    </div>
  )
}
