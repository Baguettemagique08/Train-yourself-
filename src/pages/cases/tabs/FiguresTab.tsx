import { useNavigate } from 'react-router-dom'
import { mockMeasurements } from '@/data/mockData'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { FuelTypeBadge } from '@/components/ui/StatusBadge'
import { formatQuantity, formatPct, clampVariance } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Plus, ExternalLink } from 'lucide-react'
import type { Measurement } from '@/types'

interface FiguresTabProps {
  caseId: string
}

export function FiguresTab({ caseId }: FiguresTabProps) {
  const navigate = useNavigate()
  const measurements = mockMeasurements.filter((m) => m.case_id === caseId)

  const vessel = measurements.find((m) => m.source === 'vessel')
  const barge = measurements.find((m) => m.source === 'barge')
  const mfm = measurements.find((m) => m.source === 'mfm')
  const shore = measurements.find((m) => m.source === 'manual')

  if (measurements.length === 0) {
    return (
      <EmptyState
        title="No figures recorded"
        description="Enter vessel, barge, and MFM measurements to perform a quantity reconciliation."
        action={<Button><Plus className="h-4 w-4" /> Add Measurements</Button>}
      />
    )
  }

  const vsVesselBarge = vessel && barge
    ? ((barge.quantity_mt - vessel.quantity_mt) / barge.quantity_mt) * 100
    : null
  const vsVesselMfm = vessel && mfm
    ? ((mfm.quantity_mt - vessel.quantity_mt) / mfm.quantity_mt) * 100
    : null
  const vsBargeMfm = barge && mfm
    ? ((barge.quantity_mt - mfm.quantity_mt) / barge.quantity_mt) * 100
    : null

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => navigate(`/reconciler?caseId=${caseId}`)}>
          <ExternalLink className="h-3.5 w-3.5" /> Open in Reconciler
        </Button>
      </div>
      {/* Measurement cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {vessel && <MeasurementCard m={vessel} label="Vessel" color="blue" />}
        {barge && <MeasurementCard m={barge} label="Barge / BDN" color="slate" />}
        {mfm && <MeasurementCard m={mfm} label="MFM" color="purple" />}
        {shore && <MeasurementCard m={shore} label="Shore Tank" color="green" />}
      </div>

      {/* Reconciliation summary */}
      <Card>
        <CardHeader
          title="Quantity Reconciliation"
          subtitle="Net quantities compared across measurement sources"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Comparison</th>
                <th className="table-th text-right">Source A (MT)</th>
                <th className="table-th text-right">Source B (MT)</th>
                <th className="table-th text-right">Difference (MT)</th>
                <th className="table-th text-right">Variance %</th>
                <th className="table-th text-center">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vsVesselBarge !== null && vessel && barge && (
                <ReconcilerRow
                  label="Vessel vs Barge/BDN"
                  aQty={vessel.quantity_mt}
                  bQty={barge.quantity_mt}
                  pct={vsVesselBarge}
                />
              )}
              {vsVesselMfm !== null && vessel && mfm && (
                <ReconcilerRow
                  label="Vessel vs MFM"
                  aQty={vessel.quantity_mt}
                  bQty={mfm.quantity_mt}
                  pct={vsVesselMfm}
                />
              )}
              {vsBargeMfm !== null && barge && mfm && (
                <ReconcilerRow
                  label="Barge/BDN vs MFM"
                  aQty={barge.quantity_mt}
                  bQty={mfm.quantity_mt}
                  pct={vsBargeMfm}
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail measurements */}
      <Card>
        <CardHeader
          title="Measurement Detail"
          subtitle="Raw figures and correction factors per source"
          action={<Button size="sm" variant="secondary"><Plus className="h-3.5 w-3.5" /> Add Source</Button>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Source</th>
                <th className="table-th">Fuel</th>
                <th className="table-th text-right">Gross (MT)</th>
                <th className="table-th text-right">Net (MT)</th>
                <th className="table-th text-right">Temp (°C)</th>
                <th className="table-th text-right">Density</th>
                <th className="table-th text-right">VCF</th>
                <th className="table-th">Measured By</th>
                <th className="table-th">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {measurements.map((m) => (
                <tr key={m.id} className="table-row">
                  <td className="table-td font-medium capitalize">{m.source.replace('_', ' ')}</td>
                  <td className="table-td"><FuelTypeBadge fuel={m.fuel_grade} /></td>
                  <td className="table-td text-right font-mono">{formatQuantity(m.quantity_mt, 3)}</td>
                  <td className="table-td text-right font-mono font-semibold">{formatQuantity(m.quantity_mt, 3)}</td>
                  <td className="table-td text-right text-slate-500">{m.temperature_c ?? '—'}</td>
                  <td className="table-td text-right text-slate-500">{m.density_at_obs_kgm3 ? formatQuantity(m.density_at_obs_kgm3, 4) : '—'}</td>
                  <td className="table-td text-right text-slate-500">{m.vcf ? formatQuantity(m.vcf, 4) : '—'}</td>
                  <td className="table-td text-slate-500 text-xs">{m.surveyor_name}</td>
                  <td className="table-td text-slate-400 text-xs max-w-xs truncate">{m.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function MeasurementCard({ m, label, color }: { m: Measurement; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  }
  return (
    <div className={`border rounded-lg p-4 ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{formatQuantity(m.quantity_mt, 3)}</p>
      <p className="text-xs opacity-70 mt-0.5">MT</p>
      <p className="text-xs mt-2 opacity-70">{m.surveyor_name ?? '—'}</p>
    </div>
  )
}

function ReconcilerRow({ label, aQty, bQty, pct }: {
  label: string
  aQty: number
  bQty: number
  pct: number
}) {
  const diff = aQty - bQty
  const flag = clampVariance(pct)

  return (
    <tr className="table-row">
      <td className="table-td font-medium">{label}</td>
      <td className="table-td text-right font-mono">{formatQuantity(aQty, 3)}</td>
      <td className="table-td text-right font-mono">{formatQuantity(bQty, 3)}</td>
      <td className={`table-td text-right font-mono font-semibold ${diff !== 0 ? 'text-red-600' : 'text-green-600'}`}>
        {diff >= 0 ? '+' : ''}{formatQuantity(diff, 3)}
      </td>
      <td className={`table-td text-right font-mono font-semibold ${
        flag === 'red' ? 'text-red-600' : flag === 'amber' ? 'text-amber-600' : 'text-green-600'
      }`}>
        {formatPct(pct)}
      </td>
      <td className="table-td text-center">
        {flag === 'red' ? (
          <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" /> Dispute flag
          </span>
        ) : flag === 'amber' ? (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" /> Monitor
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle className="h-3.5 w-3.5" /> Within tolerance
          </span>
        )}
      </td>
    </tr>
  )
}
