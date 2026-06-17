import { useNavigate } from 'react-router-dom'
import { mockSpecsChecks } from '@/data/mockData'
import { Card, CardHeader } from '@/components/ui/Card'
import { SpecStatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Plus, ExternalLink } from 'lucide-react'
import { formatQuantity } from '@/lib/utils'

interface SpecsTabProps {
  caseId: string
}

export function SpecsTab({ caseId }: SpecsTabProps) {
  const navigate = useNavigate()
  const specs = mockSpecsChecks.filter((s) => s.case_id === caseId)

  if (specs.length === 0) {
    return (
      <EmptyState
        title="No specification checks recorded"
        description="Add BDN, contract, and lab values to check fuel quality against specifications."
        action={<Button><Plus className="h-4 w-4" /> Add Specs Check</Button>}
      />
    )
  }

  const offSpec = specs.filter((s) => s.status === 'off_spec')
  const warnings = specs.filter((s) => s.status === 'warning')

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => navigate(`/specs?caseId=${caseId}`)}>
          <ExternalLink className="h-3.5 w-3.5" /> Open in Specs Checker
        </Button>
      </div>
      {/* Summary */}
      {(offSpec.length > 0 || warnings.length > 0) && (
        <div className="flex gap-3 flex-wrap">
          {offSpec.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-700">{offSpec.length} parameter{offSpec.length > 1 ? 's' : ''} off-spec</span>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-amber-700">{warnings.length} parameter{warnings.length > 1 ? 's' : ''} at limit</span>
            </div>
          )}
        </div>
      )}

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <CardHeader title="Specification Comparison" subtitle="BDN values vs. contract limits vs. independent lab results" />
          <Button size="sm" variant="secondary"><Plus className="h-3.5 w-3.5" /> Add Parameter</Button>
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
                <th className="table-th text-center">Status</th>
                <th className="table-th">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {specs.map((spec) => {
                const isOffSpec = spec.status === 'off_spec'
                return (
                  <tr
                    key={spec.id}
                    className={`table-row ${isOffSpec ? 'bg-red-50/50' : ''}`}
                  >
                    <td className="table-td font-medium">{spec.parameter_name}</td>
                    <td className="table-td text-right text-slate-400">{spec.unit || '—'}</td>
                    <td className="table-td text-right font-mono">
                      {spec.bdn_value !== undefined && spec.bdn_value !== null
                        ? formatQuantity(spec.bdn_value, 4)
                        : '—'}
                    </td>
                    <td className="table-td text-right font-mono text-slate-500">
                      {spec.contract_min !== undefined && spec.contract_min !== null
                        ? formatQuantity(spec.contract_min, 4)
                        : '—'}
                    </td>
                    <td className="table-td text-right font-mono text-slate-500">
                      {spec.contract_max !== undefined && spec.contract_max !== null
                        ? formatQuantity(spec.contract_max, 4)
                        : '—'}
                    </td>
                    <td className={`table-td text-right font-mono font-semibold ${isOffSpec ? 'text-red-700' : ''}`}>
                      {spec.lab_result !== undefined && spec.lab_result !== null
                        ? formatQuantity(spec.lab_result, 4)
                        : '—'}
                    </td>
                    <td className="table-td text-center">
                      <SpecStatusBadge status={spec.status} />
                    </td>
                    <td className="table-td text-xs text-slate-500 max-w-xs">
                      {spec.notes ?? '—'}
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
          <CardHeader title="Off-Spec Parameters — Detail" />
          <div className="space-y-3">
            {offSpec.map((spec) => (
              <div key={spec.id} className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">{spec.parameter_name}</p>
                  <p className="text-xs text-red-700 mt-0.5">{spec.notes}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Lab: <strong>{spec.lab_result}</strong> {spec.unit}
                    {spec.contract_max && ` · Max limit: ${spec.contract_max} ${spec.unit}`}
                    {spec.contract_min && ` · Min limit: ${spec.contract_min} ${spec.unit}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
