import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertTriangle, Download, Printer, Save, MessageSquarePlus, Scale, Info,
  Hash, ChevronDown,
} from 'lucide-react'
import { useReconciler } from '@/hooks/useReconciler'
import { QuantityTable } from './components/QuantityTable'
import { BasisMatrix } from './components/BasisMatrix'
import { EvidenceGapPanel, LikelyCausesPanel } from './components/AnalysisPanels'
import { EmptyState } from '@/components/ui/EmptyState'
import { DEFAULT_THRESHOLDS } from '@/lib/reconciler'
import { mockCases, mockMeasurements } from '@/data/mockData'
import { formatDate, formatRelative, initials, cn } from '@/lib/utils'

export default function ReconcilerPage() {
  const [searchParams] = useSearchParams()
  const rec = useReconciler(searchParams.get('caseId') ?? undefined)
  const { analysis, selectedCase } = rec
  const [saved, setSaved] = useState(false)
  const [showVcf, setShowVcf] = useState(false)

  // Measurements for the selected case + effective grade (for VCF chain)
  const vcfMeasurements = mockMeasurements.filter(
    (m) => m.case_id === rec.caseId && (!rec.effectiveGrade || m.fuel_grade === rec.effectiveGrade),
  )

  const handleExportCSV = useCallback(() => {
    const headers = ['Source', 'Reading time', 'Measured MT', 'Adjustment MT', 'Net MT', 'Delta vs base MT', 'Delta %', 'Flag']
    const lines = analysis.quantity_rows.map((r) => [
      r.label,
      r.timestamp ?? '',
      r.raw_qty ?? '',
      r.adjustment || '',
      r.adjusted_qty ?? '',
      r.delta_vs_base_mt ?? '',
      r.delta_vs_base_pct !== null ? r.delta_vs_base_pct.toFixed(2) + '%' : '',
      r.is_base ? 'baseline' : r.severity,
    ].join(','))
    const csv = [headers.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reconciliation-${selectedCase?.reference ?? 'export'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [analysis, selectedCase])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
          <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Barge vs Vessel Reconciler</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Compare vessel, barge, MFM, surveyor and ROB figures across quantity and measurement basis.
          </p>
        </div>
      </div>

      {/* Operations-tool disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-300 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/15 px-4 py-3">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Operations analysis only.</span> This tool highlights variances and surfaces
          structured observations for review. It does not determine liability or replace a qualified marine surveyor’s assessment.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Case</span>
          <select
            value={rec.caseId}
            onChange={(e) => rec.selectCase(e.target.value)}
            className="min-w-[280px] rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
          >
            {mockCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.reference} — {c.vessel?.name} — {c.port?.name} ({c.fuel_type})
              </option>
            ))}
          </select>
        </label>

        {rec.fuelGrades.length > 1 && (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Fuel grade</span>
            <select
              value={rec.effectiveGrade ?? ''}
              onChange={(e) => rec.setFuelGrade(e.target.value as typeof rec.effectiveGrade)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              {rec.fuelGrades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        )}

        {selectedCase && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 ml-auto text-xs">
            <ContextItem label="Vessel" value={selectedCase.vessel?.name} />
            <ContextItem label="Port" value={selectedCase.port?.name} />
            <ContextItem label="Supplier" value={selectedCase.supplier?.name} />
            <ContextItem label="Delivery" value={formatDate(selectedCase.delivery?.delivery_date ?? selectedCase.opened_at)} />
            <ContextItem label="Grade" value={rec.effectiveGrade ?? selectedCase.fuel_type} />
          </div>
        )}
      </div>

      {!rec.hasMeasurements ? (
        <EmptyState
          icon={<Scale className="h-6 w-6" />}
          title="No measurements recorded for this case"
          description="Add vessel, barge, MFM, or surveyor figures to this case to run a reconciliation."
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Left: tables */}
          <div className="xl:col-span-2 space-y-5">
            <QuantityTable
              rows={analysis.quantity_rows}
              summary={analysis.summary}
              baseSource={rec.baseSource}
              presentSources={analysis.present_sources}
              adjustments={rec.adjustments}
              onChangeBase={rec.setBaseSource}
              onSetAdjustment={rec.setAdjustment}
              onClearAdjustment={rec.clearAdjustment}
              rob={rec.rob}
              onSetRob={rec.setRobValue}
            />

            <BasisMatrix rows={analysis.basis_rows} presentSources={analysis.present_sources} />

            {/* VCF Calculation Chain */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
              <button
                onClick={() => setShowVcf((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Hash className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  VCF Calculation Chain (ASTM D1250)
                </span>
                <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', showVcf && 'rotate-180')} />
              </button>

              {showVcf && vcfMeasurements.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-700 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50 text-left">
                        {['Source', 'Obs. Vol. (m³)', 'Temp (°C)', 'Density@Obs (t/m³)', 'VCF', 'Vol@15°C (m³)', 'Density@15°C (t/m³)', 'Trim Corr. (m³)', 'Mass (MT)'].map((h) => (
                          <th key={h} className="px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {vcfMeasurements.map((m) => {
                        const volAt15 = m.observed_volume_m3 != null && m.vcf != null
                          ? m.observed_volume_m3 * m.vcf
                          : null
                        const massCalc = volAt15 != null && m.density_at_15c_kgm3 != null
                          ? (volAt15 + (m.trim_correction_m3 ?? 0)) * m.density_at_15c_kgm3
                          : null
                        return (
                          <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100 capitalize">{m.source}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{m.observed_volume_m3 != null ? m.observed_volume_m3.toFixed(2) : '—'}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{m.temperature_c != null ? m.temperature_c.toFixed(1) : '—'}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{m.density_at_obs_kgm3 != null ? m.density_at_obs_kgm3.toFixed(4) : '—'}</td>
                            <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-300">{m.vcf != null ? m.vcf.toFixed(4) : '—'}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{volAt15 != null ? volAt15.toFixed(2) : '—'}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{m.density_at_15c_kgm3 != null ? m.density_at_15c_kgm3.toFixed(4) : '—'}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{m.trim_correction_m3 != null ? m.trim_correction_m3.toFixed(2) : '—'}</td>
                            <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">
                              {massCalc != null ? massCalc.toFixed(3) : m.quantity_mt.toFixed(3)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Mass (MT) = (Observed Volume × VCF + Trim Correction) × Density@15°C. Density in t/m³; calculation per ASTM D1250 tables.
                      Fields showing "—" were not recorded for this measurement source.
                    </p>
                  </div>
                </div>
              )}

              {showVcf && vcfMeasurements.length === 0 && (
                <div className="border-t border-slate-100 dark:border-slate-700 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  No measurement data with VCF chain available for this case.
                </div>
              )}
            </div>

            {/* Actions + threshold legend */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSaved(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
                >
                  <Save className="h-4 w-4" /> {saved ? 'Saved to case' : 'Save to case'}
                </button>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Download className="h-4 w-4" /> Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                <span className="font-medium text-slate-600 dark:text-slate-300">Quantity thresholds:</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Within tolerance (&lt;{DEFAULT_THRESHOLDS.quantityPctWarn}%)</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Warning (≥{DEFAULT_THRESHOLDS.quantityPctWarn}%)</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical (≥{DEFAULT_THRESHOLDS.quantityPctCrit}%)</span>
              </div>
            </div>
          </div>

          {/* Right: analysis + comments */}
          <div className="space-y-5">
            <EvidenceGapPanel gaps={analysis.evidence_gaps} />
            <LikelyCausesPanel causes={analysis.likely_causes} />
            <CommentsPanel comments={rec.comments} onAdd={rec.addComment} />
          </div>
        </div>
      )}
    </div>
  )
}

function ContextItem({ label, value }: { label: string; value?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-slate-400 dark:text-slate-500">{label}:</span>
      <span className="font-medium text-slate-700 dark:text-slate-200">{value ?? '—'}</span>
    </span>
  )
}

function CommentsPanel({
  comments, onAdd,
}: { comments: { id: string; author: string; body: string; created_at: string }[]; onAdd: (body: string) => void }) {
  const [draft, setDraft] = useState('')
  const submit = () => { onAdd(draft); setDraft('') }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <MessageSquarePlus className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Analyst Notes</h3>
        {comments.length > 0 && (
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{comments.length}</span>
        )}
      </div>

      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 px-2 py-4 text-center">
            No notes yet. Record observations or rationale for adjustments here.
          </p>
        ) : comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300">{initials(c.author)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{c.body}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{c.author} · {formatRelative(c.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-slate-700">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
          rows={2}
          placeholder="Add a note… (⌘/Ctrl + Enter)"
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={submit}
            disabled={!draft.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" /> Add note
          </button>
        </div>
      </div>
    </div>
  )
}
