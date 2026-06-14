import { useNavigate } from 'react-router-dom'
import {
  FolderOpen, FileText, AlertTriangle, TrendingUp, TrendingDown, Minus,
  Clock, Upload, Activity, ArrowRight,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { CaseStatusBadge, FuelTypeBadge, PriorityBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import {
  mockCases, mockDocuments, mockActivities, mockKPIs,
} from '@/data/mockData'
import { formatDate, formatRelative, formatMT } from '@/lib/utils'

export function DashboardPage() {
  const navigate = useNavigate()

  const urgentCases = mockCases.filter((c) => c.priority === 'urgent' || c.status === 'escalated')
  const recentCases = [...mockCases].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ).slice(0, 6)
  const recentDocs = [...mockDocuments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ).slice(0, 5)
  const recentActivity = [...mockActivities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ).slice(0, 8)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Operations Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Open Cases"
          value={mockKPIs.openCases.value}
          delta={mockKPIs.openCases.delta}
          trend={mockKPIs.openCases.trend}
          icon={<FolderOpen className="h-5 w-5" />}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KPICard
          label="Pending Drafts"
          value={mockKPIs.pendingDrafts.value}
          delta={mockKPIs.pendingDrafts.delta}
          trend={mockKPIs.pendingDrafts.trend}
          icon={<FileText className="h-5 w-5" />}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <KPICard
          label="Open Discrepancies"
          value={mockKPIs.unresolvedDiscrepancies.value}
          delta={mockKPIs.unresolvedDiscrepancies.delta}
          trend={mockKPIs.unresolvedDiscrepancies.trend}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <KPICard
          label="Escalated"
          value={mockKPIs.escalatedCases.value}
          delta={mockKPIs.escalatedCases.delta}
          trend={mockKPIs.escalatedCases.trend}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Cases */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Urgent &amp; Escalated Cases</h3>
                <p className="text-xs text-slate-400 mt-0.5">Requires immediate attention</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            {urgentCases.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">No urgent cases</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {urgentCases.map((c) => (
                  <div
                    key={c.id}
                    className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-semibold text-slate-500">{c.reference}</span>
                          <PriorityBadge priority={c.priority} />
                        </div>
                        <div className="text-sm font-medium text-slate-900 truncate">{c.vessel?.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {c.port?.name} · {c.supplier?.name} · {formatDate(c.delivery_date)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <CaseStatusBadge status={c.status} />
                        <FuelTypeBadge fuel={c.fuel_type} />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{c.description}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Cases Table */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Recent Cases</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
                All cases <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="table-th">Reference</th>
                    <th className="table-th">Vessel</th>
                    <th className="table-th">Port</th>
                    <th className="table-th">Fuel</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentCases.map((c) => (
                    <tr
                      key={c.id}
                      className="table-row cursor-pointer"
                      onClick={() => navigate(`/cases/${c.id}`)}
                    >
                      <td className="table-td font-mono text-xs font-semibold text-slate-600">{c.reference}</td>
                      <td className="table-td font-medium">{c.vessel?.name}</td>
                      <td className="table-td text-slate-500">{c.port?.name}</td>
                      <td className="table-td"><FuelTypeBadge fuel={c.fuel_type} /></td>
                      <td className="table-td"><CaseStatusBadge status={c.status} /></td>
                      <td className="table-td text-slate-400">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent Uploads */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-100">
              <CardHeader title="Recent Uploads" />
            </div>
            <div className="divide-y divide-slate-100">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="h-7 w-7 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Upload className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{doc.filename}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{doc.type} · {formatRelative(doc.created_at)}</p>
                  </div>
                  <span className={`text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ${
                    doc.status === 'ready' ? 'bg-green-100 text-green-700'
                    : doc.status === 'needs_review' ? 'bg-amber-100 text-amber-700'
                    : doc.status === 'processing' ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                    {doc.status === 'needs_review' ? 'Review' : doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity Feed */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Activity Feed</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {recentActivity.map((act) => (
                <div key={act.id} className="px-5 py-3 flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="h-3 w-3 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-700 leading-snug">{act.description}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-slate-400">{act.user?.full_name}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400 flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatRelative(act.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface KPICardProps {
  label: string
  value: number
  delta?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  iconColor: string
  iconBg: string
}

function KPICard({ label, value, delta, trend, icon, iconColor, iconBg }: KPICardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {delta !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
              trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-slate-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" />
                : trend === 'down' ? <TrendingDown className="h-3 w-3" />
                : <Minus className="h-3 w-3" />}
              {delta > 0 ? '+' : ''}{delta} this week
            </div>
          )}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
