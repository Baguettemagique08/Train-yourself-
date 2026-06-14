import { useState } from 'react'
import { AlertTriangle, CheckCircle, Scale, Info } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SelectField, Input } from '@/components/ui/FormField'
import { FuelTypeBadge } from '@/components/ui/StatusBadge'
import { mockCases, mockMeasurements } from '@/data/mockData'
import { formatQuantity, formatPct, clampVariance } from '@/lib/utils'
import type { FuelType } from '@/types'

type SourceKey = 'vessel' | 'barge' | 'mfm' | 'shore'

interface FigureRow {
  source: SourceKey
  label: string
  gross: string
  net: string
  temp: string
  density: string
  vcf: string
}

const EMPTY_ROW = (source: SourceKey, label: string): FigureRow => ({
  source, label, gross: '', net: '', temp: '', density: '', vcf: '',
})

export function ReconcilerPage() {
  const [selectedCase, setSelectedCase] = useState<string>('')
  const [fuelType, setFuelType] = useState<FuelType>('VLSFO')
  const [rows, setRows] = useState<FigureRow[]>([
    EMPTY_ROW('vessel', 'Vessel'),
    EMPTY_ROW('barge', 'Barge / BDN'),
    EMPTY_ROW('mfm', 'MFM'),
    EMPTY_ROW('shore', 'Shore Tank'),
  ])

  function loadFromCase(caseId: string) {
    const measurements = mockMeasurements.filter((m) => m.case_id === caseId)
    if (!measurements.length) return
    const updated = rows.map((row) => {
      const m = measurements.find((x) => x.source === row.source)
      if (!m) return row
      return {
        ...row,
        gross: m.gross_quantity.toString(),
        net: m.net_quantity.toString(),
        temp: m.temperature?.toString() ?? '',
        density: m.density?.toString() ?? '',
        vcf: m.vcf?.toString() ?? '',
      }
    })
    setRows(updated)
    const m0 = measurements[0]
    if (m0) setFuelType(m0.fuel_type)
  }

  function updateRow(source: SourceKey, field: keyof FigureRow, value: string) {
    setRows((prev) => prev.map((r) => r.source === source ? { ...r, [field]: value } : r))
  }

  const parsed = rows.map((r) => ({
    ...r,
    netNum: parseFloat(r.net) || null,
    grossNum: parseFloat(r.gross) || null,
  }))

  const vessel = parsed.find((r) => r.source === 'vessel')
  const barge = parsed.find((r) => r.source === 'barge')
  const mfm = parsed.find((r) => r.source === 'mfm')
  const shore = parsed.find((r) => r.source === 'shore')

  function pct(a: number | null, b: number | null) {
    if (!a || !b) return null
    return ((a - b) / b) * 100
  }

  const comparisons = [
    { label: 'Vessel vs Barge/BDN', a: vessel?.netNum ?? null, b: barge?.netNum ?? null },
    { label: 'Vessel vs MFM', a: vessel?.netNum ?? null, b: mfm?.netNum ?? null },
    { label: 'Barge/BDN vs MFM', a: barge?.netNum ?? null, b: mfm?.netNum ?? null },
    { label: 'Vessel vs Shore', a: vessel?.netNum ?? null, b: shore?.netNum ?? null },
  ].filter((c) => c.a !== null && c.b !== null)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Quantity Reconciler</h2>
          <p className="text-sm text-slate-500 mt-0.5">Compare vessel, barge, MFM, and shore figures to identify quantity discrepancies</p>
        </div>
      </div>

      {/* Load from case */}
      <Card>
        <CardHeader title="Load from Case" subtitle="Pre-populate figures from a recorded case" />
        <div className="flex items-end gap-4">
          <SelectField
            label="Select Case"
            options={mockCases.map((c) => ({ value: c.id, label: `${c.reference} — ${c.vessel?.name}` }))}
            placeholder="Select a case to load figures"
            value={selectedCase}
            onChange={(e) => {
              setSelectedCase(e.target.value)
              if (e.target.value) loadFromCase(e.target.value)
            }}
            wrapperClassName="flex-1"
          />
          <Button variant="secondary" onClick={() => {
            setRows([
              EMPTY_ROW('vessel', 'Vessel'),
              EMPTY_ROW('barge', 'Barge / BDN'),
              EMPTY_ROW('mfm', 'MFM'),
              EMPTY_ROW('shore', 'Shore Tank'),
            ])
            setSelectedCase('')
          }}>
            Clear
          </Button>
        </div>
      </Card>

      {/* Figure entry */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="h-5 w-5 text-slate-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Measurement Figures</h3>
              <p className="text-xs text-slate-400">Enter net and gross quantities per source</p>
            </div>
          </div>
          <FuelTypeBadge fuel={fuelType} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th w-36">Source</th>
                <th className="table-th">Gross (MT)</th>
                <th className="table-th">Net (MT)</th>
                <th className="table-th">Temp (°C)</th>
                <th className="table-th">Density (kg/m³)</th>
                <th className="table-th">VCF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.source}>
                  <td className="table-td font-medium text-slate-700">{row.label}</td>
                  {(['gross', 'net', 'temp', 'density', 'vcf'] as const).map((field) => (
                    <td key={field} className="px-3 py-2">
                      <input
                        type="number"
                        step="any"
                        className="form-input text-right font-mono text-sm py-1.5"
                        value={row[field]}
                        onChange={(e) => updateRow(row.source, field, e.target.value)}
                        placeholder="—"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Results */}
      {comparisons.length > 0 && (
        <Card>
          <CardHeader
            title="Reconciliation Results"
            subtitle="Positive difference = Source A received more than Source B"
          />
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">Comparison</th>
                  <th className="table-th text-right">Source A (MT)</th>
                  <th className="table-th text-right">Source B (MT)</th>
                  <th className="table-th text-right">Difference (MT)</th>
                  <th className="table-th text-right">Variance %</th>
                  <th className="table-th text-center">Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisons.map((c) => {
                  const diff = (c.a ?? 0) - (c.b ?? 0)
                  const p = pct(c.a, c.b)
                  const flag = p !== null ? clampVariance(p) : 'ok'

                  return (
                    <tr key={c.label} className={`table-row ${flag === 'red' ? 'bg-red-50/40' : flag === 'amber' ? 'bg-amber-50/40' : ''}`}>
                      <td className="table-td font-medium">{c.label}</td>
                      <td className="table-td text-right font-mono">{formatQuantity(c.a ?? 0, 3)}</td>
                      <td className="table-td text-right font-mono">{formatQuantity(c.b ?? 0, 3)}</td>
                      <td className={`table-td text-right font-mono font-semibold ${diff !== 0 ? (diff > 0 ? 'text-green-700' : 'text-red-700') : ''}`}>
                        {diff >= 0 ? '+' : ''}{formatQuantity(diff, 3)}
                      </td>
                      <td className={`table-td text-right font-mono font-semibold ${
                        flag === 'red' ? 'text-red-700' : flag === 'amber' ? 'text-amber-700' : 'text-green-700'
                      }`}>
                        {p !== null ? formatPct(p) : '—'}
                      </td>
                      <td className="table-td text-center">
                        {flag === 'red' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-700 font-semibold">
                            <AlertTriangle className="h-3.5 w-3.5" /> Dispute threshold exceeded
                          </span>
                        ) : flag === 'amber' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" /> Monitor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Within tolerance
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Thresholds: <strong>Monitor</strong> ≥ 0.3% · <strong>Dispute threshold exceeded</strong> ≥ 0.5%.
              These can be adjusted in Admin → Thresholds.
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}
