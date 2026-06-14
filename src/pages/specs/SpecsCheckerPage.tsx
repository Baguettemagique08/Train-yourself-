import { useState } from 'react'
import { FlaskConical, AlertTriangle, CheckCircle, Info, Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/FormField'
import { SpecStatusBadge, FuelTypeBadge } from '@/components/ui/StatusBadge'
import { mockCases, mockSpecsChecks } from '@/data/mockData'
import { formatQuantity } from '@/lib/utils'
import { SPEC_PARAMETERS } from '@/lib/constants'
import type { SpecStatus, FuelType } from '@/types'

interface SpecRow {
  parameter: string
  unit: string
  bdnValue: string
  contractMin: string
  contractMax: string
  labResult: string
}

function computeStatus(row: SpecRow): SpecStatus {
  const lab = parseFloat(row.labResult)
  const min = parseFloat(row.contractMin)
  const max = parseFloat(row.contractMax)
  if (isNaN(lab)) return 'not_tested'
  if ((!isNaN(min) && lab < min) || (!isNaN(max) && lab > max)) return 'off_spec'
  const buffer = 0.05
  if (!isNaN(max) && lab > max * (1 - buffer)) return 'warning'
  if (!isNaN(min) && lab < min * (1 + buffer)) return 'warning'
  return 'ok'
}

function getVariance(row: SpecRow): number | null {
  const lab = parseFloat(row.labResult)
  const max = parseFloat(row.contractMax)
  if (!isNaN(lab) && !isNaN(max)) return lab - max
  const min = parseFloat(row.contractMin)
  if (!isNaN(lab) && !isNaN(min)) return lab - min
  return null
}

export function SpecsCheckerPage() {
  const [selectedCase, setSelectedCase] = useState('')
  const [fuelType, setFuelType] = useState<FuelType>('VLSFO')
  const [rows, setRows] = useState<SpecRow[]>(
    SPEC_PARAMETERS.map((p) => ({
      parameter: p.name,
      unit: p.unit,
      bdnValue: '',
      contractMin: '',
      contractMax: '',
      labResult: '',
    }))
  )

  function loadFromCase(caseId: string) {
    const specs = mockSpecsChecks.filter((s) => s.case_id === caseId)
    if (!specs.length) return
    setRows(
      SPEC_PARAMETERS.map((p) => {
        const s = specs.find((x) => x.parameter === p.name)
        return {
          parameter: p.name,
          unit: p.unit,
          bdnValue: s?.bdn_value?.toString() ?? '',
          contractMin: s?.contract_min?.toString() ?? '',
          contractMax: s?.contract_max?.toString() ?? '',
          labResult: s?.lab_result?.toString() ?? '',
        }
      })
    )
    const c = mockCases.find((x) => x.id === caseId)
    if (c) setFuelType(c.fuel_type)
  }

  function updateRow(idx: number, field: keyof SpecRow, value: string) {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  function clearRow(idx: number) {
    setRows((prev) => prev.map((r, i) => i === idx
      ? { ...r, bdnValue: '', contractMin: '', contractMax: '', labResult: '' }
      : r))
  }

  const enriched = rows.map((r) => ({
    ...r,
    status: computeStatus(r),
    variance: getVariance(r),
  }))

  const offSpec = enriched.filter((r) => r.status === 'off_spec')
  const warnings = enriched.filter((r) => r.status === 'warning')
  const tested = enriched.filter((r) => r.status !== 'not_tested')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Specs Checker</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Compare BDN, contract, and independent lab values to identify specification non-conformances
          </p>
        </div>
      </div>

      {/* Load / config */}
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Load from Case"
            options={mockCases.map((c) => ({ value: c.id, label: `${c.reference} — ${c.vessel?.name}` }))}
            placeholder="Select a case to load specs"
            value={selectedCase}
            onChange={(e) => {
              setSelectedCase(e.target.value)
              if (e.target.value) loadFromCase(e.target.value)
            }}
          />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="form-label">Fuel Grade</label>
              <div className="flex items-center h-9 gap-2">
                <FuelTypeBadge fuel={fuelType} />
              </div>
            </div>
            <Button variant="secondary" onClick={() => {
              setRows(SPEC_PARAMETERS.map((p) => ({
                parameter: p.name, unit: p.unit, bdnValue: '', contractMin: '', contractMax: '', labResult: '',
              })))
              setSelectedCase('')
            }}>
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary */}
      {tested.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
            <FlaskConical className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">{tested.length} parameters tested</span>
          </div>
          {offSpec.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-700">{offSpec.length} off-spec</span>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-amber-700">{warnings.length} at limit</span>
            </div>
          )}
          {offSpec.length === 0 && warnings.length === 0 && tested.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-700">All tested parameters within specification</span>
            </div>
          )}
        </div>
      )}

      {/* Specs table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <CardHeader title="Specification Parameters" />
          <Button size="sm" variant="secondary">
            <Plus className="h-3.5 w-3.5" /> Add Parameter
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Parameter</th>
                <th className="table-th text-right">Unit</th>
                <th className="table-th text-right">BDN Value</th>
                <th className="table-th text-right">Min Limit</th>
                <th className="table-th text-right">Max Limit</th>
                <th className="table-th text-right">Lab Result</th>
                <th className="table-th text-right">Variance</th>
                <th className="table-th text-center">Status</th>
                <th className="table-th w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enriched.map((row, idx) => {
                const isOffSpec = row.status === 'off_spec'
                return (
                  <tr key={row.parameter} className={`${isOffSpec ? 'bg-red-50/50' : ''}`}>
                    <td className="table-td font-medium text-slate-800">{row.parameter}</td>
                    <td className="table-td text-right text-slate-400 text-xs">{row.unit}</td>
                    {(['bdnValue', 'contractMin', 'contractMax', 'labResult'] as const).map((field) => (
                      <td key={field} className="px-2 py-1.5">
                        <input
                          type="number"
                          step="any"
                          className={`form-input text-right font-mono text-xs py-1 ${isOffSpec && field === 'labResult' ? 'border-red-400 bg-red-50 text-red-700 font-semibold' : ''}`}
                          value={row[field]}
                          onChange={(e) => updateRow(idx, field, e.target.value)}
                          placeholder="—"
                        />
                      </td>
                    ))}
                    <td className={`table-td text-right font-mono text-xs ${
                      row.variance !== null && row.variance > 0 ? 'text-red-700 font-semibold' : 'text-slate-400'
                    }`}>
                      {row.variance !== null
                        ? `${row.variance >= 0 ? '+' : ''}${formatQuantity(row.variance, 4)}`
                        : '—'}
                    </td>
                    <td className="table-td text-center">
                      <SpecStatusBadge status={row.status} />
                    </td>
                    <td className="table-td">
                      <button
                        onClick={() => clearRow(idx)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {offSpec.length > 0 && (
        <Card>
          <CardHeader title="Non-Conformances" subtitle="Parameters where lab result falls outside contract limits" />
          <div className="space-y-3">
            {offSpec.map((row) => (
              <div key={row.parameter} className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">{row.parameter}</p>
                  <p className="text-xs text-red-700 mt-1">
                    Lab result: <strong>{row.labResult} {row.unit}</strong>
                    {row.contractMax && ` · Max limit: ${row.contractMax} ${row.unit}`}
                    {row.contractMin && ` · Min limit: ${row.contractMin} ${row.unit}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              This analysis is a draft comparison for internal review. All findings must be validated
              against original source documents before use in formal correspondence.
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}
