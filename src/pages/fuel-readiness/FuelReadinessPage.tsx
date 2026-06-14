import { useState } from 'react'
import { CheckCircle, Circle, AlertCircle, Fuel, Calendar, Award } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { FuelReadinessBadge, FuelTypeBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { mockFuelReadiness, mockVessels } from '@/data/mockData'
import { fuelReadinessColor } from '@/lib/utils'
import type { FuelReadinessRecord } from '@/types'

export function FuelReadinessPage() {
  const [selectedVessel, setSelectedVessel] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = selectedVessel
    ? mockFuelReadiness.filter((r) => r.vessel_id === selectedVessel)
    : mockFuelReadiness

  const certifiedCount = mockFuelReadiness.filter((r) => r.status === 'certified').length
  const readyCount = mockFuelReadiness.filter((r) => r.status === 'ready').length
  const inProgressCount = mockFuelReadiness.filter((r) => r.status === 'in_progress').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Alternative Fuel Readiness</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track fleet readiness for methanol, ammonia, biofuel, and FuelEU compliance
          </p>
        </div>
        <Button variant="secondary">Export Report</Button>
      </div>

      {/* Fleet summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Records</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{mockFuelReadiness.length}</p>
        </Card>
        <Card className="py-4">
          <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Certified</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{certifiedCount}</p>
        </Card>
        <Card className="py-4">
          <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Ready</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{readyCount}</p>
        </Card>
        <Card className="py-4">
          <p className="text-xs text-amber-600 uppercase tracking-wide font-medium">In Progress</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{inProgressCount}</p>
        </Card>
      </div>

      {/* Fleet overview table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <CardHeader title="Fleet Readiness Overview" />
          <select
            className="form-select text-sm w-48"
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
          >
            <option value="">All vessels</option>
            {mockVessels.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Vessel</th>
                <th className="table-th">Fuel Type</th>
                <th className="table-th text-right">Readiness %</th>
                <th className="table-th">Progress</th>
                <th className="table-th">Status</th>
                <th className="table-th">Target Date</th>
                <th className="table-th">Certifying Body</th>
                <th className="table-th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rec) => (
                <tr key={rec.id} className="table-row">
                  <td className="table-td">
                    <div className="font-medium text-slate-900">{rec.vessel?.name}</div>
                    <div className="text-xs text-slate-400">IMO {rec.vessel?.imo}</div>
                  </td>
                  <td className="table-td"><FuelTypeBadge fuel={rec.fuel_type} /></td>
                  <td className="table-td text-right font-bold">
                    <span className={
                      rec.readiness_score >= 80 ? 'text-green-700'
                      : rec.readiness_score >= 50 ? 'text-amber-700'
                      : 'text-red-700'
                    }>
                      {rec.readiness_score}%
                    </span>
                  </td>
                  <td className="table-td" style={{ minWidth: '120px' }}>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${rec.readiness_score}%`,
                          backgroundColor:
                            rec.readiness_score >= 80 ? '#16a34a'
                            : rec.readiness_score >= 50 ? '#d97706'
                            : '#dc2626',
                        }}
                      />
                    </div>
                  </td>
                  <td className="table-td"><FuelReadinessBadge status={rec.status} /></td>
                  <td className="table-td text-slate-500">{rec.target_date ?? '—'}</td>
                  <td className="table-td text-slate-500">{rec.certifying_body ?? '—'}</td>
                  <td className="table-td">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                    >
                      {expandedId === rec.id ? 'Hide' : 'Details'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail cards */}
      <div className="space-y-4">
        {filtered.map((rec) => expandedId === rec.id && (
          <ReadinessDetailCard key={rec.id} record={rec} />
        ))}
      </div>

      {/* FuelEU info banner */}
      <Card className="border-blue-200 bg-blue-50">
        <div className="flex gap-3">
          <Fuel className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900">FuelEU Maritime — 2025 Requirements</h4>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              FuelEU Maritime entered into force 1 January 2025. Vessels operating in EU ports must report
              GHG intensity of energy used on board. The initial reduction target is −2% vs. 2020 baseline.
              Biofuel blends (B24, B100) and alternative fuels (LNG, methanol, ammonia) can contribute to
              compliance. Penalties for non-compliance apply from reporting year 2025.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ReadinessDetailCard({ record }: { record: FuelReadinessRecord }) {
  const completed = record.requirements.filter((r) => r.completed).length
  const total = record.requirements.length

  return (
    <Card>
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{record.vessel?.name}</h3>
            <FuelTypeBadge fuel={record.fuel_type} />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>{completed}/{total} requirements completed</span>
            {record.certifying_body && (
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3" /> {record.certifying_body}
              </span>
            )}
            {record.certificate_number && (
              <span>Cert: {record.certificate_number}</span>
            )}
            {record.target_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Target: {record.target_date}
              </span>
            )}
          </div>
        </div>
        <FuelReadinessBadge status={record.status} />
      </div>

      {record.notes && (
        <p className="text-xs text-slate-500 italic mb-4 p-3 bg-slate-50 rounded-lg">{record.notes}</p>
      )}

      <div className="space-y-2.5">
        {record.requirements.map((req) => (
          <div key={req.id} className={`flex gap-3 p-3 rounded-lg border ${
            req.completed ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'
          }`}>
            {req.completed ? (
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            ) : req.due_date && new Date(req.due_date) < new Date() ? (
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${req.completed ? 'text-green-800 line-through' : 'text-slate-800'}`}>
                  {req.label}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                  {req.due_date && !req.completed && (
                    <span className={`flex items-center gap-1 ${
                      new Date(req.due_date) < new Date() ? 'text-red-600 font-medium' : 'text-slate-400'
                    }`}>
                      <Calendar className="h-3 w-3" />
                      {req.due_date}
                    </span>
                  )}
                  {req.document_ref && (
                    <span className="text-slate-400 font-mono">{req.document_ref}</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{req.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
