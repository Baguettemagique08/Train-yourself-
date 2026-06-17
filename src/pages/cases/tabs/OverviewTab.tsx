import type { Case } from '@/types'
import { mockDocuments } from '@/data/mockData'
import { Card, CardHeader } from '@/components/ui/Card'
import { CaseStatusBadge, FuelTypeBadge, PriorityBadge } from '@/components/ui/StatusBadge'
import {
  formatDate,
  formatMT,
  discrepancyLabel,
  formatQuantity,
  bdnSigningStatusLabel,
  bdnSigningStatusColor,
  jointSurveyStatusLabel,
  settlementMethodLabel,
  cn,
} from '@/lib/utils'
import {
  Ship,
  MapPin,
  Package,
  Calendar,
  Clock,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FlaskConical,
  Scale,
  Shield,
  Users,
  FileText,
} from 'lucide-react'

interface OverviewTabProps {
  case_: Case
}

interface DeadlineBanner {
  label: string
  daysLeft: number
  due: Date
}

function computeDeadlines(case_: Case): DeadlineBanner[] {
  const banners: DeadlineBanner[] = []
  const now = Date.now()

  if (case_.claim_notice_deadline) {
    const due = new Date(case_.claim_notice_deadline)
    const daysLeft = Math.floor((due.getTime() - now) / 86_400_000)
    banners.push({ label: 'Formal Notice of Claim Deadline', daysLeft, due })
  }

  if (case_.claim_time_bar) {
    const due = new Date(case_.claim_time_bar)
    const daysLeft = Math.floor((due.getTime() - now) / 86_400_000)
    banners.push({ label: 'Contractual Claim Time Bar', daysLeft, due })
  }

  return banners
}

function deadlineColors(daysLeft: number) {
  if (daysLeft < 0) return { bg: 'border-red-200 bg-red-50', text: 'text-red-700', icon: 'text-red-500' }
  if (daysLeft <= 7) return { bg: 'border-orange-200 bg-orange-50', text: 'text-orange-700', icon: 'text-orange-500' }
  if (daysLeft <= 30) return { bg: 'border-amber-200 bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' }
  return { bg: 'border-slate-200 bg-slate-50', text: 'text-slate-600', icon: 'text-slate-400' }
}

const OFF_SPEC_TYPES = new Set(['off_spec', 'contamination'])

function jointSurveyColors(status: string): string {
  const map: Record<string, string> = {
    not_requested: 'bg-slate-100 text-slate-600',
    requested: 'bg-amber-100 text-amber-700',
    refused: 'bg-red-100 text-red-700',
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}

export function OverviewTab({ case_ }: OverviewTabProps) {
  const shortage =
    case_.bdn_quantity && case_.claimed_quantity
      ? case_.bdn_quantity - case_.claimed_quantity
      : null
  const shortagePct =
    shortage && case_.bdn_quantity ? (shortage / case_.bdn_quantity) * 100 : null

  const isClosedOrResolved = case_.status === 'closed' || case_.status === 'resolved'
  const deadlines = isClosedOrResolved ? [] : computeDeadlines(case_)
  const hasLop = mockDocuments.some(
    (d) => d.case_id === case_.id && (d.document_type === 'LOP' || d.document_type === 'Protest'),
  )
  const isOffSpec = OFF_SPEC_TYPES.has(case_.discrepancy_type)
  const showOffSpecBanner =
    isOffSpec ||
    case_.fuel_use_stopped !== undefined ||
    case_.fuel_segregated !== undefined

  return (
    <div className="space-y-5">
      {/* ── Time bar banners ── */}
      {deadlines.length > 0 && (
        <div className="space-y-2">
          {deadlines.map((d) => {
            const isNoticeDeadline = d.label === 'Formal Notice of Claim Deadline'
            const lopFiled = isNoticeDeadline && hasLop

            if (lopFiled) {
              return (
                <div
                  key={d.label}
                  className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3"
                >
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-green-700">
                      LOP / Protest Filed — Formal Notice Established
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      (deadline {formatDate(d.due.toISOString())})
                    </span>
                  </div>
                </div>
              )
            }

            const colors = deadlineColors(d.daysLeft)
            const expired = d.daysLeft < 0
            return (
              <div
                key={d.label}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${colors.bg}`}
              >
                {expired ? (
                  <XCircle className={`h-4 w-4 shrink-0 ${colors.icon}`} />
                ) : (
                  <Clock className={`h-4 w-4 shrink-0 ${colors.icon}`} />
                )}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {expired
                      ? `EXPIRED — ${d.label}`
                      : d.daysLeft === 0
                      ? `${d.label} — due today`
                      : `${d.label} — ${d.daysLeft} day${d.daysLeft !== 1 ? 's' : ''} remaining`}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    ({expired ? 'expired' : 'due'} {formatDate(d.due.toISOString())})
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Off-spec alert banner ── */}
      {showOffSpecBanner && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-sm font-semibold text-amber-800">
              Off-Spec / Quality Dispute — Fuel Safety Actions
            </span>
          </div>
          <div className="space-y-1.5 ml-6">
            {case_.fuel_use_stopped === true ? (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-600" />
                <span>
                  Fuel use stopped
                  {case_.fuel_use_stopped_at
                    ? ` — ${formatDate(case_.fuel_use_stopped_at)}`
                    : ''}
                </span>
              </div>
            ) : (
              isOffSpec && (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Action required: Consider stopping fuel use pending quality analysis</span>
                </div>
              )
            )}
            {case_.fuel_segregated === true ? (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-600" />
                <span>Fuel segregated in dedicated tank</span>
              </div>
            ) : (
              case_.fuel_use_stopped === true && (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Segregate suspect fuel to prevent commingling</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ── Quantity summary metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="BDN Quantity"
          value={case_.bdn_quantity ? formatMT(case_.bdn_quantity) : '—'}
          icon={<Package className="h-4 w-4" />}
        />
        <MetricCard
          label="Vessel Received Qty"
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

      {/* ── Two-column detail grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Case details */}
        <Card>
          <CardHeader title="Case Details" />
          <dl className="space-y-3">
            <DetailRow
              label="Reference"
              value={
                <span className="font-mono font-semibold text-slate-700">{case_.reference}</span>
              }
            />
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
                    <div className="text-xs text-slate-400">
                      IMO {case_.vessel?.imo} · {case_.vessel?.flag}
                    </div>
                  </div>
                </div>
              }
            />
            <DetailRow
              label="Port"
              value={
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {case_.port?.name}, {case_.port?.country}
                  </span>
                </div>
              }
            />
            <DetailRow label="Supplier" value={case_.supplier?.name ?? '—'} />
            <DetailRow
              label="Delivery Date"
              value={
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatDate(case_.delivery?.delivery_date ?? case_.opened_at)}
                </div>
              }
            />
            <DetailRow label="BDN Number" value={case_.delivery?.bdn_number ?? '—'} />
          </dl>
        </Card>
      </div>

      {/* ── BDN Signing & Legal card ── */}
      <Card>
        <CardHeader title="BDN Signing & Legal Position" />
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          <DetailRow
            label="BDN Signed Status"
            value={
              case_.bdn_signed_status ? (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                    bdnSigningStatusColor(case_.bdn_signed_status),
                  )}
                >
                  {bdnSigningStatusLabel(case_.bdn_signed_status)}
                </span>
              ) : (
                '—'
              )
            }
          />
          <DetailRow
            label="LOP Attached at Signing"
            value={
              case_.lop_attached_at_signing === undefined ? (
                '—'
              ) : case_.lop_attached_at_signing ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  <CheckCircle className="h-3 w-3" /> Yes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  <AlertTriangle className="h-3 w-3" /> No
                </span>
              )
            }
          />
          <DetailRow label="Signed By" value={case_.bdn_signed_by ?? '—'} />
          <DetailRow label="Charterer" value={case_.charterer?.name ?? '—'} />
          <DetailRow label="Governing Law" value={case_.governing_law ?? '—'} />
          <DetailRow label="Jurisdiction" value={case_.jurisdiction ?? '—'} />
          <DetailRow label="Supplier P&I Insurer" value={case_.supplier_pi_insurer ?? '—'} />
          <DetailRow label="Supplier P&I Ref" value={case_.supplier_pi_reference ?? '—'} />
        </dl>
      </Card>

      {/* ── Joint Survey card ── */}
      <Card>
        <CardHeader title="Joint Survey" />
        <dl className="space-y-3">
          <DetailRow
            label="Status"
            value={
              case_.joint_survey_status ? (
                <div className="space-y-1">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                      jointSurveyColors(case_.joint_survey_status),
                    )}
                  >
                    {jointSurveyStatusLabel(case_.joint_survey_status)}
                  </span>
                  {case_.joint_survey_status === 'requested' &&
                    case_.joint_survey_requested_at && (
                      <div className="text-xs text-slate-500">
                        Requested {formatDate(case_.joint_survey_requested_at)}
                      </div>
                    )}
                  {case_.joint_survey_status === 'refused' && (
                    <div className="text-xs text-amber-600 mt-0.5">
                      Supplier refusal strengthens claimant position
                    </div>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  Not Requested
                </span>
              )
            }
          />
          <DetailRow label="Surveyor" value={case_.joint_survey_surveyor ?? '—'} />
          {case_.joint_survey_outcome && (
            <DetailRow
              label="Outcome"
              value={
                <p className="text-sm text-slate-700 leading-relaxed">
                  {case_.joint_survey_outcome}
                </p>
              }
            />
          )}
        </dl>
      </Card>

      {/* ── Settlement card ── */}
      {(case_.settlement_method || isClosedOrResolved) && (
        <Card>
          <CardHeader title="Settlement" />
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <DetailRow
              label="Method"
              value={
                case_.settlement_method ? settlementMethodLabel(case_.settlement_method) : '—'
              }
            />
            <DetailRow
              label="Amount"
              value={
                case_.settlement_amount && case_.settlement_currency
                  ? `${case_.settlement_currency} ${case_.settlement_amount.toLocaleString('en-US')}`
                  : case_.settlement_amount
                  ? case_.settlement_amount.toLocaleString('en-US')
                  : '—'
              }
            />
            <DetailRow label="Reference" value={case_.settlement_reference ?? '—'} />
            <DetailRow
              label="Date"
              value={case_.settlement_date ? formatDate(case_.settlement_date) : '—'}
            />
          </dl>
        </Card>
      )}

      {/* ── Description ── */}
      <Card>
        <CardHeader title="Case Description" />
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {case_.description}
        </p>
      </Card>

      {/* ── Internal notes ── */}
      {case_.internal_notes && (
        <Card>
          <CardHeader title="Internal Notes" />
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {case_.internal_notes}
          </p>
        </Card>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  valueColor,
}: {
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

// Suppress unused import warnings for icons used only via JSX
void FlaskConical
void Scale
void Shield
void Users
void FileText
