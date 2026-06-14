import type { Case } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { CaseStatusBadge, FuelTypeBadge, PriorityBadge } from '@/components/ui/StatusBadge'
import { formatDate, formatMT, discrepancyLabel, formatQuantity } from '@/lib/utils'
import { Ship, MapPin, Package, Calendar, User, TrendingDown } from 'lucide-react'

interface OverviewTabProps {
  case_: Case
}

export function OverviewTab({ case_ }: OverviewTabProps) {
  const shortage = case_.bdn_quantity && case_.claimed_quantity
    ? case_.bdn_quantity - case_.claimed_quantity
    : null
  const shortagePct = shortage && case_.bdn_quantity
    ? (shortage / case_.bdn_quantity) * 100
    : null

  return (
    <div className="space-y-5">
      {/* Summary header */}
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
