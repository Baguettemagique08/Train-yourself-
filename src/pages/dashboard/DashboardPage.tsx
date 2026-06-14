import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  FolderOpen, AlertTriangle, FileText, FlaskConical, Fuel,
  ArrowUpRight, ArrowDownRight, Minus, ArrowRight, ChevronRight,
  Clock, Upload, Activity as ActivityIcon, Building2, Anchor,
  CircleDot, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatRelative, documentTypeLabel } from '@/lib/utils'
import type {
  DashboardData, DashboardKpi, DashboardActionItem, DueUrgency,
  DashboardCounterpartyRisk, DashboardTrendPoint, RiskLevel, PriorityLevel,
} from '@/types'

// ── Small formatting helpers ─────────────────────────────────────────────────

function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

const PRIORITY_DOT: Record<PriorityLevel, string> = {
  urgent: 'bg-red-500',
  high: 'bg-amber-500',
  normal: 'bg-blue-500',
  low: 'bg-slate-400',
}

const DUE_STYLES: Record<DueUrgency, { label: string; cls: string }> = {
  overdue:   { label: 'Overdue',   cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  today:     { label: 'Due today', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  soon:      { label: 'Due soon',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  scheduled: { label: 'Scheduled', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
}

const RISK_STYLES: Record<RiskLevel, string> = {
  high:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

// ── Layout primitives (dark-mode aware) ──────────────────────────────────────

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function PanelHeader({
  title, subtitle, onAction, actionLabel,
}: { title: string; subtitle?: string; onAction?: () => void; actionLabel?: string }) {
  return (
    <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {actionLabel ?? 'View all'} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

// ── KPI card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  metric: DashboardKpi
  icon: ReactNode
  accent: string      // left border + icon colour token base, e.g. 'blue'
  onClick: () => void
}

function KpiCard({ label, metric, icon, accent, onClick }: KpiCardProps) {
  const { value, delta, trend, higher_is_worse } = metric
  const deltaIsBad = trend === 'up' ? higher_is_worse : trend === 'down' ? !higher_is_worse : false
  const deltaColor =
    trend === 'neutral' ? 'text-slate-400 dark:text-slate-500'
      : deltaIsBad ? 'text-red-600 dark:text-red-400'
        : 'text-green-600 dark:text-green-400'

  const accentMap: Record<string, { bar: string; icon: string }> = {
    blue:   { bar: 'bg-blue-500',   icon: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
    red:    { bar: 'bg-red-500',    icon: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' },
    amber:  { bar: 'bg-amber-500',  icon: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
    violet: { bar: 'bg-violet-500', icon: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20' },
    teal:   { bar: 'bg-teal-500',   icon: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' },
  }
  const a = accentMap[accent] ?? accentMap.blue

  return (
    <button
      onClick={onClick}
      className="group relative text-left overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm px-4 py-3.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all"
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${a.bar}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">{value}</p>
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${deltaColor}`}>
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" />
              : trend === 'down' ? <ArrowDownRight className="h-3 w-3" />
                : <Minus className="h-3 w-3" />}
            <span>{delta > 0 ? '+' : ''}{delta} wk</span>
          </div>
        </div>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${a.icon}`}>
          {icon}
        </div>
      </div>
    </button>
  )
}

// ── Action worklist row ──────────────────────────────────────────────────────

function ActionRow({ item, onClick }: { item: DashboardActionItem; onClick: () => void }) {
  const due = DUE_STYLES[item.due_urgency]
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors flex items-center gap-3"
    >
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[item.priority]}`} title={item.priority} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">{item.reference}</span>
          <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${due.cls}`}>{due.label}</span>
        </div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate mt-0.5">{item.vessel_name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          <span className="text-slate-700 dark:text-slate-300 font-medium">{item.next_action}</span>
          {' · '}{item.port_name} · {item.supplier_name}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{formatUsd(item.exposure_usd)}</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">Due {formatDate(item.due_date)}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
    </button>
  )
}

// ── Dispute trend (inline bars, no chart lib) ────────────────────────────────

function TrendPanel({ points }: { points: DashboardTrendPoint[] }) {
  const max = Math.max(1, ...points.flatMap((p) => [p.opened, p.closed]))
  const totalOpened = points.reduce((s, p) => s + p.opened, 0)
  const totalClosed = points.reduce((s, p) => s + p.closed, 0)
  const net = totalOpened - totalClosed

  return (
    <Panel>
      <PanelHeader title="Dispute Volume" subtitle="Cases opened vs closed · last 8 weeks" />
      <div className="px-5 py-4">
        <div className="flex items-center gap-4 mb-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Opened
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-300 dark:bg-slate-600" /> Closed
          </span>
          <span className={`ml-auto font-semibold ${net > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            Net {net > 0 ? '+' : ''}{net} open
          </span>
        </div>
        <div className="flex items-end justify-between gap-2 h-28">
          {points.map((p) => (
            <div key={p.period_start} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="w-full flex items-end justify-center gap-0.5 h-full">
                <div
                  className="w-1/2 rounded-t bg-blue-500/90 group-hover:bg-blue-500 transition-colors"
                  style={{ height: `${(p.opened / max) * 100}%` }}
                  title={`${p.opened} opened`}
                />
                <div
                  className="w-1/2 rounded-t bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-500 transition-colors"
                  style={{ height: `${(p.closed / max) * 100}%` }}
                  title={`${p.closed} closed`}
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

// ── Counterparty risk ────────────────────────────────────────────────────────

function RiskPanel({ rows, onView }: { rows: DashboardCounterpartyRisk[]; onView: () => void }) {
  return (
    <Panel>
      <PanelHeader title="Counterparty Risk" subtitle="Suppliers by open exposure" onAction={onView} />
      {rows.length === 0 ? (
        <EmptyState title="No counterparty risk" description="Open cases linked to suppliers will appear here." />
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {rows.map((r) => (
            <div key={r.id} className="px-5 py-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                {r.kind === 'supplier'
                  ? <Building2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  : <Anchor className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{r.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {r.open_cases} open · {r.off_spec_cases} off-spec · {r.total_cases} total
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{formatUsd(r.exposure_usd)}</span>
                <span className={`text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 ${RISK_STYLES[r.risk_level]}`}>
                  {r.risk_level}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

// ── Skeleton view ────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12 mt-2" />
            <Skeleton className="h-3 w-14 mt-2" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-52 w-full rounded-lg" />
            <Skeleton className="h-52 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useDashboard()

  if (isLoading) return <DashboardSkeleton />

  if (isError || !data) {
    return (
      <div className="py-20">
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Couldn't load the dashboard"
          description="There was a problem fetching the operations snapshot. Please retry in a moment."
        />
      </div>
    )
  }

  return <DashboardContent data={data} navigate={navigate} />
}

function DashboardContent({ data, navigate }: { data: DashboardData; navigate: (to: string) => void }) {
  const { kpis, action_items, activity, recent_uploads, spec_alerts, readiness_due, counterparty_risk, dispute_trend } = data

  const overdue = action_items.filter((i) => i.due_urgency === 'overdue').length
  const dueToday = action_items.filter((i) => i.due_urgency === 'today').length

  return (
    <div className="space-y-6">
      {/* Header + worklist summary */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Operations Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {new Date(data.generated_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {(overdue > 0 || dueToday > 0) && (
          <button
            onClick={() => navigate('/cases')}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm"
          >
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="font-medium text-red-700 dark:text-red-300">
              {overdue > 0 && `${overdue} overdue`}
              {overdue > 0 && dueToday > 0 && ' · '}
              {dueToday > 0 && `${dueToday} due today`}
            </span>
            <ChevronRight className="h-4 w-4 text-red-400" />
          </button>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Open Cases" metric={kpis.open_cases} accent="blue"
          icon={<FolderOpen className="h-5 w-5" />} onClick={() => navigate('/cases')} />
        <KpiCard label="Urgent Cases" metric={kpis.urgent_cases} accent="red"
          icon={<AlertTriangle className="h-5 w-5" />} onClick={() => navigate('/cases')} />
        <KpiCard label="Pending Drafts" metric={kpis.pending_drafts} accent="amber"
          icon={<FileText className="h-5 w-5" />} onClick={() => navigate('/drafts')} />
        <KpiCard label="Spec Alerts" metric={kpis.spec_alerts} accent="violet"
          icon={<FlaskConical className="h-5 w-5" />} onClick={() => navigate('/specs')} />
        <KpiCard label="Readiness Due" metric={kpis.readiness_reviews_due} accent="teal"
          icon={<Fuel className="h-5 w-5" />} onClick={() => navigate('/fuel-readiness')} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cases requiring action this week */}
          <Panel>
            <PanelHeader
              title="Cases Requiring Action This Week"
              subtitle="Sorted by deadline, then priority and exposure"
              onAction={() => navigate('/cases')}
            />
            {action_items.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-6 w-6" />}
                title="Nothing needs action"
                description="No open cases have a response deadline this week. Newly opened cases will appear here."
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {action_items.map((item) => (
                  <ActionRow key={item.case_id} item={item} onClick={() => navigate(`/cases/${item.case_id}`)} />
                ))}
              </div>
            )}
          </Panel>

          {/* Trend + risk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TrendPanel points={dispute_trend} />
            <RiskPanel rows={counterparty_risk} onView={() => navigate('/counterparties')} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Spec & readiness alerts */}
          <Panel>
            <PanelHeader title="Spec & Readiness Alerts" subtitle="Off-tolerance results and reviews due" />
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Spec results</span>
                <button onClick={() => navigate('/specs')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Open checker</button>
              </div>
              {spec_alerts.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-2">No parameters outside tolerance.</p>
              ) : (
                <div className="space-y-1.5">
                  {spec_alerts.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/cases/${s.case_id}`)}
                      className="w-full text-left flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    >
                      <CircleDot className={`h-3.5 w-3.5 flex-shrink-0 ${s.status === 'off_spec' ? 'text-red-500' : 'text-amber-500'}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{s.parameter_name}</span>
                        <span className="block text-[11px] text-slate-400 dark:text-slate-500 truncate">{s.vessel_name} · {s.case_reference}</span>
                      </span>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 flex-shrink-0">
                        {s.lab_result ?? '—'}{s.unit && ` ${s.unit}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Readiness reviews</span>
                <button onClick={() => navigate('/fuel-readiness')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
              </div>
              {readiness_due.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-2">All vessels certified.</p>
              ) : (
                <div className="space-y-1.5">
                  {readiness_due.slice(0, 3).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => navigate('/fuel-readiness')}
                      className="w-full text-left flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    >
                      <Fuel className="h-3.5 w-3.5 flex-shrink-0 text-teal-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{r.vessel_name}</span>
                        <span className="block text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {r.fuel_type} · {r.open_requirements} open item{r.open_requirements !== 1 ? 's' : ''}
                          {r.target_date && ` · target ${formatDate(r.target_date)}`}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">{r.readiness_score}%</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          {/* Activity feed */}
          <Panel>
            <PanelHeader title="Recent Activity" />
            {activity.length === 0 ? (
              <EmptyState icon={<ActivityIcon className="h-6 w-6" />} title="No recent activity" />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
                {activity.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => navigate(`/cases/${act.case_id}`)}
                    className="w-full text-left px-5 py-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                  >
                    <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ActivityIcon className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{act.description}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        <span className="font-mono">{act.case_reference}</span>
                        {act.user_name && <><span>·</span><span>{act.user_name}</span></>}
                        <span>·</span>
                        <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{formatRelative(act.created_at)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Panel>

          {/* Recent uploads */}
          <Panel>
            <PanelHeader title="Recent Uploads" onAction={() => navigate('/deliveries')} actionLabel="Deliveries" />
            {recent_uploads.length === 0 ? (
              <EmptyState icon={<Upload className="h-6 w-6" />} title="No documents yet"
                description="Uploaded BDNs, lab reports, and MFM logs will appear here." />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {recent_uploads.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => doc.case_id && navigate(`/cases/${doc.case_id}`)}
                    className="w-full text-left px-5 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                  >
                    <div className="h-7 w-7 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <Upload className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{doc.filename}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {documentTypeLabel(doc.document_type)} · {formatRelative(doc.created_at)}
                      </p>
                    </div>
                    <span className={`text-[10px] rounded-full px-1.5 py-0.5 flex-shrink-0 ${
                      doc.status === 'ready' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : doc.status === 'needs_review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : doc.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {doc.status === 'needs_review' ? 'Review' : doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
