import { useNavigate } from 'react-router-dom'
import { mockFuelReadiness } from '@/data/mockData'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { FuelReadinessBadge } from '@/components/ui/StatusBadge'
import { CheckCircle, Circle, ArrowRight } from 'lucide-react'

interface FuelReadinessTabProps {
  vesselId: string
}

export function FuelReadinessTab({ vesselId }: FuelReadinessTabProps) {
  const navigate = useNavigate()
  const records = mockFuelReadiness.filter((r) => r.vessel_id === vesselId)

  if (records.length === 0) {
    return (
      <EmptyState
        title="No fuel readiness records for this vessel"
        description="Track alternative fuel readiness status on the Alt Fuel Readiness page."
        action={
          <Button onClick={() => navigate('/fuel-readiness')}>
            <ArrowRight className="h-4 w-4" /> Go to Fuel Readiness
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Alternative fuel readiness status for this vessel.</p>
      {records.map((rec) => (
        <div key={rec.id} className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-slate-900">{rec.fuel_type}</h4>
              {rec.target_date && (
                <p className="text-xs text-slate-400 mt-0.5">Target: {rec.target_date}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{rec.readiness_score}%</p>
                <p className="text-xs text-slate-400">Ready</p>
              </div>
              <FuelReadinessBadge status={rec.status} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${rec.readiness_score}%`,
                backgroundColor: rec.readiness_score >= 80 ? '#16a34a' : rec.readiness_score >= 50 ? '#d97706' : '#dc2626',
              }}
            />
          </div>

          <div className="space-y-2">
            {rec.requirements.slice(0, 4).map((req) => (
              <div key={req.id} className="flex items-start gap-2.5 text-sm">
                {req.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
                )}
                <span className={req.completed ? 'text-slate-600 line-through' : 'text-slate-800'}>
                  {req.label}
                </span>
              </div>
            ))}
            {rec.requirements.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/fuel-readiness')}
              >
                +{rec.requirements.length - 4} more requirements <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
