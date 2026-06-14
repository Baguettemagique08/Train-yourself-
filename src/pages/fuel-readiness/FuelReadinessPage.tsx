import { useState, useCallback } from 'react'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Ship,
} from 'lucide-react'
import { mockFuelReadiness, mockVessels } from '@/data/mockData'
import { cn, formatDate, fuelReadinessColor, fuelReadinessLabel } from '@/lib/utils'
import type { FuelReadinessRecord, FuelReadinessStatus, FuelType } from '@/types'

// ── Progress Bar ───────────────────────────────────────────────────────────────
function ProgressBar({ score }: { score: number }) {
  const fillColor =
    score >= 66 ? 'bg-green-500' : score >= 33 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn('h-2 rounded-full transition-all', fillColor)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{score}%</span>
    </div>
  )
}

// ── Status Icon ────────────────────────────────────────────────────────────────
function ReadinessStatusIcon({ status }: { status: FuelReadinessStatus }) {
  if (status === 'certified') return <CheckCircle className="h-4 w-4 text-green-500" />
  if (status === 'ready') return <CheckCircle className="h-4 w-4 text-blue-500" />
  if (status === 'in_progress') return <Clock className="h-4 w-4 text-amber-500" />
  return <XCircle className="h-4 w-4 text-slate-400" />
}

// ── Score Cell (for grid) ──────────────────────────────────────────────────────
function ScoreCell({ score, status }: { score: number; status: FuelReadinessStatus }) {
  if (status === 'not_started') {
    return <span className="text-xs text-slate-400">—</span>
  }
  const bg =
    score >= 80
      ? 'bg-green-100 text-green-700'
      : score >= 50
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-700'
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', bg)}>
      {score}%
    </span>
  )
}

// ── Requirement checklist item ─────────────────────────────────────────────────
function RequirementItem({
  label,
  description,
  completed,
  dueDate,
  docRef,
}: {
  label: string
  description: string
  completed: boolean
  dueDate?: string
  docRef?: string
}) {
  return (
    <div className={cn('flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0')}>
      <div className="mt-0.5 shrink-0">
        {completed ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-slate-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', completed ? 'text-slate-700 line-through decoration-slate-400' : 'text-slate-900')}>
          {label}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {dueDate && (
            <span className="text-xs text-amber-600">
              <Clock className="inline h-3 w-3 mr-0.5" />
              Due {formatDate(dueDate)}
            </span>
          )}
          {docRef && (
            <span className="text-xs text-blue-600 font-mono">{docRef}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Fuel Section ───────────────────────────────────────────────────────────────
interface FuelSectionProps {
  title: string
  fuelType: FuelType
  regulationNote: string
  accentColor: string
  records: FuelReadinessRecord[]
  expandedVessels: Set<string>
  onToggleVessel: (id: string) => void
}

function FuelSection({
  title,
  fuelType,
  regulationNote,
  accentColor,
  records,
  expandedVessels,
  onToggleVessel,
}: FuelSectionProps) {
  const sectionRecords = records.filter((r) => r.fuel_type === fuelType)

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className={cn('px-5 py-4 border-b border-slate-100', accentColor)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{regulationNote}</p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {sectionRecords.filter((r) => r.status === 'ready' || r.status === 'certified').length} / {sectionRecords.length} Ready
          </span>
        </div>
      </div>

      {sectionRecords.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">
          No readiness records for this fuel type
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sectionRecords.map((record) => {
            const vessel = record.vessel
            const isExpanded = expandedVessels.has(record.id)
            const requiredItems = record.requirements
            const completedRequired = requiredItems.filter((r) => r.completed).length

            return (
              <div key={record.id}>
                {/* Row */}
                <div
                  className="px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => onToggleVessel(record.id)}
                >
                  <div className="grid grid-cols-[1fr_auto_180px_160px_120px_80px_80px] items-center gap-4">
                    {/* Vessel */}
                    <div className="flex items-center gap-2 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <Ship className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{vessel?.name ?? '—'}</p>
                        <p className="text-xs text-slate-500">IMO {vessel?.imo ?? '—'}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', fuelReadinessColor(record.status))}>
                      <ReadinessStatusIcon status={record.status} />
                      {fuelReadinessLabel(record.status)}
                    </span>

                    {/* Progress Bar */}
                    <div>
                      <ProgressBar score={record.readiness_score} />
                    </div>

                    {/* Required Items */}
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{completedRequired}</span>
                      <span className="text-slate-400"> / {requiredItems.length} items</span>
                    </div>

                    {/* Deadline */}
                    <div className="text-xs text-slate-500">
                      {record.target_date ? formatDate(record.target_date) : '—'}
                    </div>

                    {/* Certifying Body */}
                    <div className="text-xs text-slate-500">{record.certifying_body ?? '—'}</div>

                    {/* Actions */}
                    <div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleVessel(record.id) }}
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 bg-slate-50 border-t border-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                      {/* Checklist */}
                      <div>
                        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                          Requirements Checklist
                        </h3>
                        <div className="bg-white rounded-lg border border-slate-200 px-4 divide-y divide-slate-100">
                          {record.requirements.map((req) => (
                            <RequirementItem
                              key={req.id}
                              label={req.label}
                              description={req.description}
                              completed={req.completed}
                              dueDate={req.due_date}
                              docRef={req.document_ref}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Notes & Meta */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                            Notes
                          </h3>
                          <div className="bg-white rounded-lg border border-slate-200 p-3">
                            <p className="text-sm text-slate-600">{record.notes ?? 'No notes recorded.'}</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Certifying Body</span>
                            <span className="font-medium text-slate-900">{record.certifying_body ?? '—'}</span>
                          </div>
                          {record.certificate_number && (
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Certificate No.</span>
                              <span className="font-mono text-blue-600">{record.certificate_number}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Target Date</span>
                            <span className="font-medium text-slate-900">
                              {record.target_date ? formatDate(record.target_date) : '—'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Last Updated</span>
                            <span className="text-slate-600">{formatDate(record.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function FuelReadinessPage() {
  const [expandedVessels, setExpandedVessels] = useState<Set<string>>(new Set())

  const toggleVessel = useCallback((id: string) => {
    setExpandedVessels((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // ── KPI calculations ────────────────────────────────────────────────────────
  const methanolReady = mockFuelReadiness.filter(
    (r) => r.fuel_type === 'Methanol' && (r.status === 'ready' || r.status === 'certified')
  ).length

  const biofuelReady = mockFuelReadiness.filter(
    (r) => (r.fuel_type === 'B24' || r.fuel_type === 'Biofuel') &&
      r.readiness_score >= 80
  ).length

  const ammoniaReady = mockFuelReadiness.filter(
    (r) => r.fuel_type === 'Ammonia' && (r.status === 'ready' || r.status === 'certified')
  ).length

  // FuelEU compliance: vessels with score >= 80 across any fuel type
  const totalVessels = mockVessels.length
  const fuelEuCompliant = mockFuelReadiness.filter(
    (r) => r.readiness_score >= 80
  ).length
  const fuelEuPct = totalVessels > 0 ? Math.round((fuelEuCompliant / mockFuelReadiness.length) * 100) : 0

  // ── FuelEU GHG data (simulated per vessel) ──────────────────────────────────
  const fuelEuData = mockVessels.map((vessel) => {
    const records = mockFuelReadiness.filter((r) => r.vessel_id === vessel.id)
    const bestRecord = records.sort((a, b) => b.readiness_score - a.readiness_score)[0]
    const ghgIntensity = bestRecord
      ? bestRecord.fuel_type === 'B24' || bestRecord.fuel_type === 'Biofuel'
        ? 74.5
        : bestRecord.fuel_type === 'Methanol'
        ? 41.2
        : 86.8
      : 91.2
    const target = 89.34
    const compliant = ghgIntensity <= target
    const penaltyRisk = !compliant
      ? 'High'
      : ghgIntensity > target * 0.97
      ? 'Low'
      : 'None'

    return {
      vessel,
      fuelType: bestRecord?.fuel_type ?? 'VLSFO',
      ghgIntensity,
      target,
      compliant,
      penaltyRisk,
    }
  })

  // ── Fleet Readiness Grid ────────────────────────────────────────────────────
  const fuelTypesForGrid: FuelType[] = ['Methanol', 'B24', 'Ammonia']

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alternative Fuel Readiness Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor fleet readiness for alternative and low-carbon fuels per FuelEU Maritime, MARPOL Annex VI, and IGF Code requirements.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Methanol Ready</p>
              <Ship className="h-4 w-4 text-pink-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{methanolReady}</p>
            <p className="text-xs text-slate-500 mt-1">vessels (IGF Code)</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Biofuel B24 Ready</p>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{biofuelReady}</p>
            <p className="text-xs text-slate-500 mt-1">vessels (&gt;80% score)</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ammonia Ready</p>
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{ammoniaReady}</p>
            <p className="text-xs text-slate-500 mt-1">vessels (IGF Code)</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">FuelEU Compliance</p>
              <CheckCircle className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{fuelEuPct}%</p>
            <p className="text-xs text-slate-500 mt-1">fleet GHG target</p>
          </div>
        </div>

        {/* Methanol Section */}
        <FuelSection
          title="Methanol Readiness"
          fuelType="Methanol"
          regulationNote="IGF Code (MSC.1/Circ.1621) · SOLAS II-1/56 · Flag State Approval Required"
          accentColor="bg-pink-50"
          records={mockFuelReadiness}
          expandedVessels={expandedVessels}
          onToggleVessel={toggleVessel}
        />

        {/* Biofuel B24 Section */}
        <FuelSection
          title="Biofuel B24 Readiness"
          fuelType="B24"
          regulationNote="FuelEU Maritime 2025 · ISO 8217:2024 Biofuel Provisions · ISCC Certification"
          accentColor="bg-green-50"
          records={mockFuelReadiness}
          expandedVessels={expandedVessels}
          onToggleVessel={toggleVessel}
        />

        {/* Ammonia Section */}
        <FuelSection
          title="Ammonia Readiness"
          fuelType="Ammonia"
          regulationNote="IMO MSC — Interim Guidelines (Pending) · SOLAS Toxic Gas Provisions · CCS Required"
          accentColor="bg-yellow-50"
          records={mockFuelReadiness}
          expandedVessels={expandedVessels}
          onToggleVessel={toggleVessel}
        />

        {/* FuelEU Tracking Section */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-blue-50">
            <h2 className="text-sm font-bold text-slate-900">FuelEU Maritime GHG Tracking</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Regulation (EU) 2023/1805 · GHG intensity target: 89.34 gCO₂eq/MJ (2025 baseline)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  {['Vessel', 'Best Fuel Type', 'GHG Intensity (gCO₂eq/MJ)', 'Target', 'Compliance', 'Penalty Risk'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap border-b border-slate-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fuelEuData.map(({ vessel, fuelType, ghgIntensity, target, compliant, penaltyRisk }) => (
                  <tr key={vessel.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{vessel.name}</p>
                      <p className="text-xs text-slate-500">IMO {vessel.imo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">{fuelType}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      <span className={cn(compliant ? 'text-green-700' : 'text-red-600 font-semibold')}>
                        {ghgIntensity.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-500">
                      {target.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {compliant ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          <CheckCircle className="h-3 w-3" /> Compliant
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          <XCircle className="h-3 w-3" /> Non-Compliant
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                        penaltyRisk === 'None' ? 'bg-green-100 text-green-700' :
                        penaltyRisk === 'Low' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {penaltyRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Readiness Summary Grid */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Fleet Readiness Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">Readiness score by vessel and fuel type</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200">
                    Vessel
                  </th>
                  {fuelTypesForGrid.map((ft) => (
                    <th key={ft} className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200">
                      {ft}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockVessels.map((vessel) => (
                  <tr key={vessel.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{vessel.name}</p>
                      <p className="text-xs text-slate-500">IMO {vessel.imo}</p>
                    </td>
                    {fuelTypesForGrid.map((ft) => {
                      const record = mockFuelReadiness.find(
                        (r) => r.vessel_id === vessel.id && r.fuel_type === ft
                      )
                      return (
                        <td key={ft} className="px-4 py-3">
                          {record ? (
                            <ScoreCell score={record.readiness_score} status={record.status} />
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
