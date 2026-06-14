import { useNavigate } from 'react-router-dom'
import {
  Leaf, Ship, CalendarClock, Gauge, Info, ChevronRight, Filter, X, Anchor,
} from 'lucide-react'
import { useFuelReadiness, reviewDue, reviewOverdue } from '@/hooks/useFuelReadiness'
import { CATEGORY_META, ALT_FUEL_TYPES, topGaps, scoreBand } from '@/lib/fuelReadiness'
import { FuelReadinessBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn, formatDate } from '@/lib/utils'
import type { FuelType } from '@/types'
import type { PortFuelCapability, VesselFuelReadiness } from '@/lib/fuelReadiness'

const BAND_BAR: Record<string, string> = { high: 'bg-green-500', medium: 'bg-amber-500', low: 'bg-red-500' }

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={cn('h-full rounded-full', BAND_BAR[scoreBand(score)])} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200 w-8 text-right">{score}%</span>
    </div>
  )
}

export default function FuelReadinessPage() {
  const navigate = useNavigate()
  const f = useFuelReadiness()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
          <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Alternative Fuel Readiness</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track vessel and port readiness for future-fuel operations and FuelEU-related planning.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
        <Info className="h-4 w-4 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold">Operational readiness tracker.</span> Scores are a transparent weighted average of
          category assessments and are editable on each record. This is a planning aid, not a regulatory compliance determination.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Programmes" value={f.kpis.programmes} icon={<Ship className="h-5 w-5" />} accent="blue" />
        <Kpi label="Ready / Certified" value={f.kpis.ready} icon={<Leaf className="h-5 w-5" />} accent="green" />
        <Kpi label="Reviews Due" value={f.kpis.reviewsDue} icon={<CalendarClock className="h-5 w-5" />} accent="amber" />
        <Kpi label="Avg Readiness" value={`${f.kpis.avgScore}%`} icon={<Gauge className="h-5 w-5" />} accent="violet" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-3 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400 ml-1" />
        <FilterSelect label="Vessel" value={f.filters.vessel} onChange={(v) => f.setFilter('vessel', v)}
          options={f.vessels.map((v) => ({ value: v.id, label: v.name }))} />
        <FilterSelect label="Port" value={f.filters.port} onChange={(v) => f.setFilter('port', v)}
          options={f.ports.map((p) => ({ value: p.id, label: p.name }))} />
        <FilterSelect label="Fuel" value={f.filters.fuel} onChange={(v) => f.setFilter('fuel', v)}
          options={f.fuelOptions.map((ft) => ({ value: ft, label: ft }))} />
        <FilterSelect label="Status" value={f.filters.status} onChange={(v) => f.setFilter('status', v)}
          options={[
            { value: 'not_started', label: 'Not started' },
            { value: 'in_progress', label: 'In progress' },
            { value: 'ready', label: 'Ready' },
            { value: 'certified', label: 'Certified' },
          ]} />
        {f.hasFilters && (
          <button onClick={f.clearFilters} className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1">
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{f.records.length} programme{f.records.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Programme list */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Readiness Programmes</h3>
        </div>
        {f.records.length === 0 ? (
          <EmptyState icon={<Leaf className="h-6 w-6" />} title="No programmes match" description="Adjust the filters to see vessel-fuel readiness programmes." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {f.records.map((r) => <ProgrammeRow key={r.id} r={r} onOpen={() => navigate(`/fuel-readiness/${r.id}`)} />)}
          </div>
        )}
      </div>

      {/* Fleet matrix + port capability */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <FleetMatrix records={f.records.length ? f.records : []} allRecords={f.records} navigate={navigate} vessels={f.vessels} />
        <PortCapabilityMatrix capabilities={f.portCapabilities} ports={f.ports} />
      </div>
    </div>
  )
}

// ── Programme row ─────────────────────────────────────────────────────────────

function ProgrammeRow({ r, onOpen }: { r: VesselFuelReadiness; onOpen: () => void }) {
  const gaps = topGaps(r.categories, 3)
  const openActions = r.actions.filter((a) => a.status !== 'done').length
  const due = reviewDue(r)
  const overdue = reviewOverdue(r)

  return (
    <button onClick={onOpen} className="w-full text-left px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex items-center gap-4">
      <Ship className="h-4 w-4 text-slate-400 flex-shrink-0" />
      <div className="min-w-0 w-48">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{r.vessel?.name}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">IMO {r.vessel?.imo} · {r.fuel_type}</p>
      </div>
      <FuelReadinessBadge status={r.status} />
      <div className="hidden md:block"><ScoreBar score={r.readiness_score} /></div>
      <div className="hidden lg:flex flex-wrap gap-1 flex-1 min-w-0">
        {gaps.map((g) => (
          <span key={g.category} className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
            {CATEGORY_META[g.category].short} {g.score}%
          </span>
        ))}
      </div>
      <div className="text-right flex-shrink-0 w-28">
        <p className={cn('text-xs font-medium', overdue ? 'text-red-600 dark:text-red-400' : due ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400')}>
          {r.next_review_date ? formatDate(r.next_review_date) : '—'}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{openActions} open action{openActions !== 1 ? 's' : ''}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
    </button>
  )
}

// ── Fleet matrix (vessel × fuel) ──────────────────────────────────────────────

function FleetMatrix({
  allRecords, navigate, vessels,
}: { records: VesselFuelReadiness[]; allRecords: VesselFuelReadiness[]; navigate: (to: string) => void; vessels: { id: string; name: string }[] }) {
  const fuels = ALT_FUEL_TYPES.filter((ft) => allRecords.some((r) => r.fuel_type === ft))
  const fuelsToShow = fuels.length ? fuels : (['Methanol', 'B24', 'Ammonia', 'LNG'] as FuelType[])
  const vesselsToShow = vessels.filter((v) => allRecords.some((r) => r.vessel_id === v.id))

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Fleet Readiness Matrix</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Score by vessel and fuel — click a cell to open</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/40">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vessel</th>
              {fuelsToShow.map((ft) => (
                <th key={ft} className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{ft}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {vesselsToShow.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{v.name}</td>
                {fuelsToShow.map((ft) => {
                  const rec = allRecords.find((r) => r.vessel_id === v.id && r.fuel_type === ft)
                  if (!rec) return <td key={ft} className="px-3 py-2.5 text-center text-slate-300 dark:text-slate-600">—</td>
                  const band = scoreBand(rec.readiness_score)
                  return (
                    <td key={ft} className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => navigate(`/fuel-readiness/${rec.id}`)}
                        className={cn(
                          'inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-semibold tabular-nums hover:ring-2 hover:ring-offset-1 dark:hover:ring-offset-slate-800 transition-all',
                          band === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:ring-green-400'
                            : band === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:ring-amber-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:ring-red-400',
                        )}
                      >
                        {rec.readiness_score}%
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Port capability matrix (fuel × port) ──────────────────────────────────────

const PORT_STATUS_STYLE: Record<string, string> = {
  available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  planned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  unavailable: 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500',
}

function PortCapabilityMatrix({
  capabilities, ports,
}: { capabilities: PortFuelCapability[]; ports: { id: string; name: string }[] }) {
  const fuels = Array.from(new Set(capabilities.map((c) => c.fuel_type)))

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <Anchor className="h-4 w-4 text-slate-400" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Port Bunkering Capability</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Fuel availability at primary ports</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/40">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fuel</th>
              {ports.map((p) => (
                <th key={p.id} className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {fuels.map((ft) => (
              <tr key={ft}>
                <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{ft}</td>
                {ports.map((p) => {
                  const cap = capabilities.find((c) => c.port_id === p.id && c.fuel_type === ft)
                  if (!cap) return <td key={p.id} className="px-3 py-2.5 text-center text-slate-300 dark:text-slate-600">—</td>
                  return (
                    <td key={p.id} className="px-3 py-2.5 text-center">
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', PORT_STATUS_STYLE[cap.status])}
                        title={cap.bunkering_method ? `${cap.bunkering_method}${cap.earliest_date ? ` · from ${formatDate(cap.earliest_date)}` : ''}` : undefined}>
                        {cap.status}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Small UI bits ─────────────────────────────────────────────────────────────

function Kpi({ label, value, icon, accent }: { label: string; value: number | string; icon: React.ReactNode; accent: string }) {
  const map: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    violet: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20',
  }
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm px-4 py-3.5 flex items-start justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">{value}</p>
      </div>
      <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', map[accent])}>{icon}</div>
    </div>
  )
}

function FilterSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
    >
      <option value="">{label}: All</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
