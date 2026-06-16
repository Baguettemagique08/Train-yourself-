import type { Case } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { CaseStatusBadge, FuelTypeBadge, PriorityBadge } from '@/components/ui/StatusBadge'
import { formatDate, formatMT, discrepancyLabel, formatQuantity } from '@/lib/utils'
import { Ship, MapPin, Package, Calendar, Clock, TrendingDown, AlertTriangle } from 'lucide-react'

interface OverviewTabProps {
  case_: Case
}

const LOP_WINDOW_DAYS = 14

function lopDeadline(case_: Case): { daysLeft: number; due: Date } | null {
  const base = case_.delivery?.delivery_date ?? case_.opened_at
  if (!base) return null
  const due = new Date(new Date(base).getTime() + LOP_WINDOW_DAYS * 86_400_000)
  const daysLeft = Math.floor((due.getTime() - Date.now()) / 86_400_000)
  return { daysLeft, due }
}

export function OverviewTab({ case_ }: OverviewTabProps) {
  const shortage = case_.bdn_quantity && case_.claimed_quantity
    ? case_.bdn_quantity - case_.claimed_quantity
    : null
  const shortagePct = shortage && case_.bdn_quantity
    ? (shortage / case_.bdn_quantity) * 100
    : null

  const deadline = lopDeadline(case_)
  const isClosedOrResolved = case_.status === 'closed' || case_.status === 'resolved'

  return (
    <div className="space-y-5">

      {/* LOP Response Time Bar */}
      {deadline && !isClosedOrResolved && (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
          deadline.daysLeft < 0
            ? 'border-red-200 bg-red-50'
            : deadline.daysLeft <= 3
            ? 'border-orange-200 bg-orange-50'
            : deadline.daysLeft <= 7
            ? 'border-amber-200 bg-amber-50'
            : 'border-blue-100 bg-blue-50'
        }`}>
          {deadline.daysLeft < 0 ? (
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          ) : (
            <Clock className={`h-4 w-4 shrink-0 ${
              deadline.daysLeft <= 3 ? 'text-orange-500' :
              deadline.daysLeft <= 7 ? 'text-amber-500' : 'text-blue-500'
            }`} />
          )}
          <div className="flex-1 min-w-0">
            <span className={`text-sm font-semibold ${
              deadline.daysLeft < 0 ? 'text-red-700' :
              deadline.daysLeft <= 3 ? 'text-orange-700' :
              deadline.daysLeft <= 7 ? 'text-amber-700' : 'text-blue-700'
            }`}>
              {deadline.daysLeft < 0
                ? `LOP response overdue by ${Math.abs(deadline.daysLeft)} day${Math.abs(deadline.daysLeft) !== 1 ? 's' : ''}`
                : deadline.daysLeft === 0
                ? 'LOP response due today'
                : `LOP response due in ${deadline.daysLeft} day${deadline.daysLeft !== 1 ? 's' : ''}`
              }
            </span>
            <span className="ml-2 text-xs text-slate-500">(due {formatDate(deadline.due.toISOString())})</span>
          </div>
          <span className="text-xs text-slate-400 shrink-0">14-day window from delivery date</span>
        </div>
      )}

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="BDN Quantity"
          value={case_.bdn_quantity ? formatMT(case_.bdn_quantity) : '—'}
          icon={<Package className="h-4 w-4" />}
        />
        <MetricCard
          label="Claimed Quantity"
          value={case_.claimed_quantity ? formatMT(case_.claimed_quantity) : '—'}
          icon={<Package className="h-4 w-4" />}
        />
        {shortage !== null && (
          <MetricCard
            label="Shortage"
            value={formatMT(Math.abs(shortage))}
            valueColor={shortage > 0 ? 'text-red-600' : 'text-green-600'}
            icon={<TrendingDown className="h-4 w-4" />}
          />
        )}
        {shortagePct !== null && (
          <MetricCard
            label="Variance"
            value={`${shortagePct >= 0 ? '-' : '+'}${formatQuantity(Math.abs(shortagePct), 2)}%`}
            valueColor={Math.abs(shortagePct) > 0.5 ? 'text-red-600' : 'text-amber-600'}
            icon={<TrendingDown className="h-4 w-4" />}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Case details */}
        <Card>
          <CardHeader title="Case Details" />
          <dl className="space-y-3">
            <DetailRow label="Reference" value={
              <span className="font-mono font-semibold text-slate-700">{case_.reference}</span>
            } />
            <DetailRow label="Status" value={<CaseStatusBadge status={case_.status} />} />
            <DetailRow label="Priority" value={<PriorityBadge priority={case_.priority} />} />
            <DetailRow label="Discrepancy Type" value={discrepancyLabel(case_.discrepancy_type)} />
            <DetailRow label="Fuel Grade" value={<FuelTypeBadge fuel={case_.fuel_type} />} />
            <DetailRow label="Assigned To" value={case_.assigned_user?.full_name ?? '—'} />
            <DetailRow label="Created" value={formatDate(case_.created_at)} />
            <DetailRow label="Last Updated" value={formatDate(case_.updated_at)} />
            {case_.closed_at && (
              <DetailRow label="Closed" value={formatDate(case_.closed_at)} />
            )}
          </dl>
        </Card>

        {/* Delivery details */}
        <Card>
          <CardHeader title="Delivery Details" />
          <dl className="space-y-3">
            <DetailRow
              label="Vessel"
              value={
                <div className="flex items-center gap-2">
                  <Ship className="h-3.5 w-3.5 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">{case_.vessel?.name}</div>
                    <div className="text-xs text-slate-400">IMO {case_.vessel?.imo} · {case_.vessel?.flag}</div>
                  </div>
                </div>
              }
            />
            <DetailRow
              label="Port"
              value={
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{case_.port?.name}, {case_.port?.country}</span>
                </div>
              }
            />
            <DetailRow label="Supplier" value={case_.supplier?.name ?? '—'} />
            <DetailRow label="Delivery Date" value={
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formatDate(case_.delivery?.delivery_date ?? case_.opened_at)}
              </div>
            } />
            <DetailRow label="BDN Number" value={case_.delivery?.bdn_number ?? '—'} />
          </dl>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader title="Case Description" />
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{case_.description}</p>
      </Card>

      {/* Internal notes */}
      {case_.internal_notes && (
        <Card>
          <CardHeader title="Internal Notes" />
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{case_.internal_notes}</p>
        </Card>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon, valueColor }: {
  label: string
  value: string
  icon?: React.ReactNode
  valueColor?: string
}) {
  return (
    <Card className="py-4">
      <div className="flex items-center gap-2 mb-2 text-slate-400">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      </div>
      <p className={`text-xl font-bold ${valueColor ?? 'text-slate-900'}`}>{value}</p>
    </Card>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="text-xs font-medium text-slate-500 w-36 flex-shrink-0 pt-0.5">{label}</dt>
      <dd className="text-sm text-slate-900 flex-1">{value}</dd>
    </div>
  )
}
