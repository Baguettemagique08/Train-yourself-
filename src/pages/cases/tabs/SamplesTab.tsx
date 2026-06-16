import { useState, useCallback } from 'react'
import { mockBunkerSamples } from '@/data/mockData'
import type { BunkerSample, BunkerSampleType, BunkerSampleStatus } from '@/types'
import { formatDate, formatDateTime, bunkerSampleTypeLabel, bunkerSampleStatusLabel, cn } from '@/lib/utils'
import { FlaskConical, Plus, ChevronDown } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'

const SAMPLE_TYPE_COLORS: Record<BunkerSampleType, string> = {
  marpol: 'bg-purple-100 text-purple-700',
  vessel: 'bg-blue-100 text-blue-700',
  joint_drip: 'bg-teal-100 text-teal-700',
  other: 'bg-slate-100 text-slate-600',
}

const SAMPLE_STATUS_COLORS: Record<BunkerSampleStatus, string> = {
  sealed: 'bg-slate-100 text-slate-600',
  in_transit: 'bg-amber-100 text-amber-700',
  at_lab: 'bg-blue-100 text-blue-700',
  results_received: 'bg-green-100 text-green-700',
  disputed: 'bg-red-100 text-red-700',
}

const IMPORTANCE: Record<BunkerSampleType, string> = {
  marpol: 'Legally mandated. Held by supplier for 12 months. Primary evidence in quality disputes.',
  vessel: 'Retained by vessel. Critical if MARPOL sample is disputed or unavailable.',
  joint_drip: 'Strongest evidence — taken jointly. Both parties signed. Preferred by arbitrators.',
  other: '',
}

interface SamplesTabProps {
  caseId: string
}

export function SamplesTab({ caseId }: SamplesTabProps) {
  const [samples, setSamples] = useState<BunkerSample[]>(
    mockBunkerSamples.filter((s) => s.case_id === caseId),
  )
  const [showAdd, setShowAdd] = useState(false)
  const [newSample, setNewSample] = useState<Partial<BunkerSample>>({
    sample_type: 'marpol',
    status: 'sealed',
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const addSample = useCallback(() => {
    const now = new Date().toISOString()
    const s: BunkerSample = {
      id: `bs-${Date.now()}`,
      case_id: caseId,
      sample_type: newSample.sample_type ?? 'marpol',
      status: newSample.status ?? 'sealed',
      seal_number: newSample.seal_number,
      sealed_by: newSample.sealed_by,
      sealed_at: newSample.sealed_at,
      lab_name: newSample.lab_name,
      lab_reference: newSample.lab_reference,
      notes: newSample.notes,
      created_at: now,
      updated_at: now,
    }
    setSamples((prev) => [...prev, s])
    setNewSample({ sample_type: 'marpol', status: 'sealed' })
    setShowAdd(false)
  }, [caseId, newSample])

  const updateStatus = useCallback((id: string, status: BunkerSampleStatus) => {
    setSamples((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status, updated_at: new Date().toISOString() } : s,
      ),
    )
  }, [])

  const REQUIRED_TYPES: BunkerSampleType[] = ['marpol', 'vessel', 'joint_drip']
  const presentTypes = new Set(samples.map((s) => s.sample_type))

  return (
    <div className="space-y-5">
      {/* Coverage check */}
      <div className="grid grid-cols-3 gap-3">
        {REQUIRED_TYPES.map((t) => {
          const has = presentTypes.has(t)
          return (
            <div
              key={t}
              className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${
                has ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
              }`}
            >
              <FlaskConical
                className={`h-4 w-4 shrink-0 ${has ? 'text-green-600' : 'text-amber-500'}`}
              />
              <div>
                <div
                  className={`text-xs font-semibold ${has ? 'text-green-700' : 'text-amber-700'}`}
                >
                  {bunkerSampleTypeLabel(t)}
                </div>
                <div className={`text-xs ${has ? 'text-green-600' : 'text-amber-600'}`}>
                  {has
                    ? `${samples.filter((s) => s.sample_type === t).length} sample(s) logged`
                    : 'Not yet recorded'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sample list */}
      <Card>
        <CardHeader
          title={`Bunker Samples (${samples.length})`}
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Sample
            </button>
          }
        />

        {samples.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400">
            No samples recorded. Add sample chain-of-custody information as soon as possible.
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {samples.map((sample) => (
            <div key={sample.id} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FlaskConical className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                          SAMPLE_TYPE_COLORS[sample.sample_type],
                        )}
                      >
                        {bunkerSampleTypeLabel(sample.sample_type)}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          SAMPLE_STATUS_COLORS[sample.status],
                        )}
                      >
                        {bunkerSampleStatusLabel(sample.status)}
                      </span>
                      {sample.seal_number && (
                        <span className="font-mono text-xs text-slate-500">
                          Seal: {sample.seal_number}
                        </span>
                      )}
                    </div>
                    {IMPORTANCE[sample.sample_type] && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {IMPORTANCE[sample.sample_type]}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                    value={sample.status}
                    onChange={(e) => updateStatus(sample.id, e.target.value as BunkerSampleStatus)}
                  >
                    {(
                      [
                        'sealed',
                        'in_transit',
                        'at_lab',
                        'results_received',
                        'disputed',
                      ] as BunkerSampleStatus[]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {bunkerSampleStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setExpandedId(expandedId === sample.id ? null : sample.id)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        expandedId === sample.id && 'rotate-180',
                      )}
                    />
                  </button>
                </div>
              </div>

              {expandedId === sample.id && (
                <div className="mt-3 ml-7 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  {sample.sealed_by && (
                    <DetailLine label="Sealed by" value={sample.sealed_by} />
                  )}
                  {sample.sealed_at && (
                    <DetailLine label="Sealed at" value={formatDateTime(sample.sealed_at)} />
                  )}
                  {sample.lab_name && (
                    <DetailLine label="Laboratory" value={sample.lab_name} />
                  )}
                  {sample.lab_reference && (
                    <DetailLine label="Lab reference" value={sample.lab_reference} />
                  )}
                  {sample.analysis_date && (
                    <DetailLine label="Analysis date" value={formatDate(sample.analysis_date)} />
                  )}
                  {sample.notes && (
                    <div className="col-span-2 mt-1">
                      <span className="text-slate-500">Notes: </span>
                      <span className="text-slate-700">{sample.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add sample form */}
        {showAdd && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <p className="text-xs font-semibold text-slate-700">New Sample</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Sample Type</label>
                <select
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  value={newSample.sample_type}
                  onChange={(e) =>
                    setNewSample((p) => ({
                      ...p,
                      sample_type: e.target.value as BunkerSampleType,
                    }))
                  }
                >
                  {(['marpol', 'vessel', 'joint_drip', 'other'] as BunkerSampleType[]).map((t) => (
                    <option key={t} value={t}>
                      {bunkerSampleTypeLabel(t)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Status</label>
                <select
                  className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  value={newSample.status}
                  onChange={(e) =>
                    setNewSample((p) => ({
                      ...p,
                      status: e.target.value as BunkerSampleStatus,
                    }))
                  }
                >
                  {(
                    [
                      'sealed',
                      'in_transit',
                      'at_lab',
                      'results_received',
                      'disputed',
                    ] as BunkerSampleStatus[]
                  ).map((s) => (
                    <option key={s} value={s}>
                      {bunkerSampleStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Seal Number</label>
                <input
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  value={newSample.seal_number ?? ''}
                  onChange={(e) => setNewSample((p) => ({ ...p, seal_number: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Sealed By</label>
                <input
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  value={newSample.sealed_by ?? ''}
                  onChange={(e) => setNewSample((p) => ({ ...p, sealed_by: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Laboratory</label>
                <input
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  value={newSample.lab_name ?? ''}
                  onChange={(e) => setNewSample((p) => ({ ...p, lab_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Lab Reference</label>
                <input
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  value={newSample.lab_reference ?? ''}
                  onChange={(e) => setNewSample((p) => ({ ...p, lab_reference: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Notes</label>
                <textarea
                  rows={2}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  value={newSample.notes ?? ''}
                  onChange={(e) => setNewSample((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addSample}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Add Sample
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      <p className="text-xs text-slate-400">
        Bunker samples are the primary evidence in quality disputes. The MARPOL retained sample
        (held by supplier, sealed at manifold) is legally mandated under MARPOL Annex VI. Request
        analysis of the MARPOL sample in any quality claim.
      </p>
    </div>
  )
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-slate-500">{label}: </span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  )
}
