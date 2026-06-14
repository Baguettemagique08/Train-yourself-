import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Ship, CalendarClock, Plus, SlidersHorizontal, Anchor, Info,
} from 'lucide-react'
import { useReadinessRecord } from '@/hooks/useFuelReadiness'
import { mockPortCapabilities } from '@/data/fuelReadinessData'
import { mockPorts } from '@/data/mockData'
import {
  CATEGORY_META, CATEGORY_ORDER, categoryScore, scoreBand,
  type ReadinessCategoryKey, type ActionStatus, type ActionPriority,
} from '@/lib/fuelReadiness'
import { FuelReadinessBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn, formatDate } from '@/lib/utils'

const BAND_TEXT: Record<string, string> = {
  high: 'text-green-600 dark:text-green-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-red-600 dark:text-red-400',
}
const ACTION_STYLE: Record<ActionStatus, string> = {
  open: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function ReadinessDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const r = useReadinessRecord(id)

  if (!r.record) {
    return (
      <div className="py-16">
        <EmptyState icon={<Ship className="h-6 w-6" />} title="Programme not found"
          description="This readiness programme does not exist or has been removed."
          action={<button onClick={() => navigate('/fuel-readiness')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Back to tracker</button>} />
      </div>
    )
  }

  const rec = r.record
  const contribByCat = new Map(r.contributions.map((c) => [c.category, c]))

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <button onClick={() => navigate('/fuel-readiness')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Readiness tracker
      </button>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Ship className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{rec.vessel?.name} · {rec.fuel_type}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                IMO {rec.vessel?.imo} · {rec.certifying_body ?? 'No certifying body'} · assessed by {rec.assessed_by ?? '—'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <FuelReadinessBadge status={r.status} />
                {rec.certificate_ref && <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{rec.certificate_ref}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={cn('text-4xl font-bold tabular-nums', BAND_TEXT[scoreBand(r.score)])}>{r.score}%</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">overall readiness</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs border-t border-slate-100 dark:border-slate-700 pt-3">
          <Meta label="Target date" value={rec.target_date ? formatDate(rec.target_date) : '—'} />
          <label className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> Next review</span>
            <input
              type="date"
              value={rec.next_review_date ?? ''}
              onChange={(e) => r.setNextReview(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <Meta label="Primary ports" value={rec.primary_port_ids.map((pid) => mockPorts.find((p) => p.id === pid)?.name ?? pid).join(', ')} />
        </div>
        {rec.notes && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 rounded-md px-3 py-2">{rec.notes}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Category breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Gap Categories</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">— toggle criteria or set a manual score; weights are editable</span>
          </div>
          {CATEGORY_ORDER.map((key) => {
            const cat = rec.categories.find((c) => c.category === key)
            if (!cat) return null
            return (
              <CategoryCard
                key={key}
                categoryKey={key}
                catScore={categoryScore(cat)}
                weight={r.config.weights[key] ?? cat.weight}
                contributionPct={(contribByCat.get(key)?.weight ?? 0) * 100}
                manual={typeof cat.manual_score === 'number'}
                criteria={cat.criteria}
                onToggle={(cid) => r.toggleCriterion(key, cid)}
                onWeight={(w) => r.setWeight(key, w)}
                onManual={(v) => r.setManualScore(key, v)}
              />
            )
          })}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <ScoringConfigPanel readyThreshold={r.config.readyThreshold} onThreshold={r.setReadyThreshold} status={r.status} score={r.score} />
          <ActionListPanel
            actions={rec.actions}
            onStatus={r.setActionStatus}
            onAdd={(title, category, priority) => r.addAction({ title, category, status: 'open', priority })}
          />
          <PortPanel fuelType={rec.fuel_type} portIds={rec.primary_port_ids} />
        </div>
      </div>
    </div>
  )
}

// ── Category card ─────────────────────────────────────────────────────────────

function CategoryCard({
  categoryKey, catScore, weight, contributionPct, manual, criteria, onToggle, onWeight, onManual,
}: {
  categoryKey: ReadinessCategoryKey
  catScore: number
  weight: number
  contributionPct: number
  manual: boolean
  criteria: { id: string; label: string; met: boolean }[]
  onToggle: (id: string) => void
  onWeight: (w: number) => void
  onManual: (v: number | undefined) => void
}) {
  const meta = CATEGORY_META[categoryKey]
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{meta.label}</h4>
              {manual && <span className="text-[9px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 rounded px-1.5 py-0.5">Manual</span>}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{meta.description}</p>
          </div>
          <span className={cn('text-lg font-bold tabular-nums', BAND_TEXT[scoreBand(catScore)])}>{catScore}%</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          <label className="flex items-center gap-1.5">
            Weight
            <input type="number" step="0.05" min="0" value={weight}
              onChange={(e) => onWeight(parseFloat(e.target.value) || 0)}
              className="w-16 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-right text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none" />
          </label>
          <span>Contributes <span className="font-semibold text-slate-700 dark:text-slate-200">{contributionPct.toFixed(0)}%</span> of overall</span>
          <label className="flex items-center gap-1.5 ml-auto">
            Manual score
            <input type="number" min="0" max="100" placeholder="—"
              value={manual ? catScore : ''}
              onChange={(e) => onManual(e.target.value === '' ? undefined : Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)))}
              className="w-16 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-right text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none" />
          </label>
        </div>
      </div>
      <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-700">
        {criteria.map((cr) => (
          <label key={cr.id} className={cn('flex items-center gap-2.5 py-2 cursor-pointer', manual && 'opacity-50')}>
            <input type="checkbox" checked={cr.met} disabled={manual} onChange={() => onToggle(cr.id)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-green-600 focus:ring-green-500" />
            <span className={cn('text-sm', cr.met ? 'text-slate-500 dark:text-slate-400 line-through decoration-slate-300' : 'text-slate-800 dark:text-slate-200')}>{cr.label}</span>
          </label>
        ))}
        {criteria.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500 py-2">No criteria defined.</p>}
      </div>
    </div>
  )
}

// ── Scoring config ────────────────────────────────────────────────────────────

function ScoringConfigPanel({
  readyThreshold, onThreshold, status, score,
}: { readyThreshold: number; onThreshold: (v: number) => void; status: string; score: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Scoring</h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <p>Overall = weighted average of category scores. A category score is the share of its criteria met, unless a manual score is set.</p>
        </div>
        <label className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-300">“Ready” at or above</span>
          <span className="flex items-center gap-1.5">
            <input type="number" min="1" max="100" value={readyThreshold}
              onChange={(e) => onThreshold(parseInt(e.target.value, 10) || 1)}
              className="w-16 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-1.5 py-1 text-right text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none" />
            <span className="text-slate-400">%</span>
          </span>
        </label>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
          <span className="text-slate-500 dark:text-slate-400">Current</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">{score}% · {status.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  )
}

// ── Action list ───────────────────────────────────────────────────────────────

function ActionListPanel({
  actions, onStatus, onAdd,
}: {
  actions: { id: string; title: string; category: ReadinessCategoryKey; owner?: string; due_date?: string; status: ActionStatus; priority: ActionPriority }[]
  onStatus: (id: string, s: ActionStatus) => void
  onAdd: (title: string, category: ReadinessCategoryKey, priority: ActionPriority) => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ReadinessCategoryKey>('documentation')
  const [priority, setPriority] = useState<ActionPriority>('normal')

  const submit = () => { if (!title.trim()) return; onAdd(title.trim(), category, priority); setTitle('') }
  const openCount = actions.filter((a) => a.status !== 'done').length

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Action List</h3>
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{openCount} open</span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
        {actions.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No actions yet.</p>
        ) : actions.map((a) => (
          <div key={a.id} className="px-4 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className={cn('text-sm', a.status === 'done' ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200')}>{a.title}</p>
              <select value={a.status} onChange={(e) => onStatus(a.id, e.target.value as ActionStatus)}
                className={cn('flex-shrink-0 rounded text-[10px] font-semibold px-1.5 py-0.5 border-0 focus:outline-none cursor-pointer', ACTION_STYLE[a.status])}>
                <option value="open">open</option>
                <option value="in_progress">in progress</option>
                <option value="done">done</option>
                <option value="blocked">blocked</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {CATEGORY_META[a.category].short}{a.owner && ` · ${a.owner}`}{a.due_date && ` · due ${formatDate(a.due_date)}`} · {a.priority}
            </p>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New action…"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none" />
        <div className="flex gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value as ReadinessCategoryKey)}
            className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none">
            {CATEGORY_ORDER.map((k) => <option key={k} value={k}>{CATEGORY_META[k].short}</option>)}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as ActionPriority)}
            className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none">
            <option value="low">low</option>
            <option value="normal">normal</option>
            <option value="high">high</option>
          </select>
          <button onClick={submit} className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Port capability for this fuel ─────────────────────────────────────────────

function PortPanel({ fuelType, portIds }: { fuelType: string; portIds: string[] }) {
  const caps = mockPortCapabilities.filter((c) => c.fuel_type === fuelType && portIds.includes(c.port_id))
  const STYLE: Record<string, string> = {
    available: 'text-green-600 dark:text-green-400',
    planned: 'text-amber-600 dark:text-amber-400',
    unavailable: 'text-slate-400 dark:text-slate-500',
  }
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <Anchor className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Port Capability — {fuelType}</h3>
      </div>
      {caps.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No port capability recorded for the primary ports.</p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {caps.map((c) => (
            <div key={c.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.port?.name}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {c.bunkering_method ?? 'Method TBC'}{c.earliest_date ? ` · from ${formatDate(c.earliest_date)}` : ''}
                </p>
              </div>
              <span className={cn('text-xs font-semibold capitalize', STYLE[c.status])}>{c.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-slate-400 dark:text-slate-500">{label}:</span>
      <span className="font-medium text-slate-700 dark:text-slate-200">{value}</span>
    </span>
  )
}
