import { PenLine, Info } from 'lucide-react'
import { useClaimDrafter } from '@/hooks/useClaimDrafter'
import { FactLedger } from './components/FactLedger'
import { DraftEditor } from './components/DraftEditor'
import { VersionHistory } from './components/VersionHistory'
import { CLAIM_DRAFT_TYPES, DRAFT_TYPE_META } from '@/lib/claimDrafter'
import { mockCases } from '@/data/mockData'
import { cn } from '@/lib/utils'

export default function ClaimDrafterPage() {
  const d = useClaimDrafter()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
          <PenLine className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Claim Drafter</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Generate editable draft communications from approved case facts.
          </p>
        </div>
      </div>

      {/* Grounding disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/15 px-4 py-3">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <span className="font-semibold">Fact-grounded drafting.</span> Every paragraph is composed only from approved
          case facts shown on the left. The drafter never adds facts that are not on file. Review and edit before sending.
        </p>
      </div>

      {/* Controls: case + draft type */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Case</span>
            <select
              value={d.caseId}
              onChange={(e) => d.selectCase(e.target.value)}
              className="min-w-[300px] rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              {mockCases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.reference} — {c.vessel?.name} — {c.port?.name} ({c.fuel_type})
                </option>
              ))}
            </select>
          </label>
          {d.selectedCase && (
            <p className="text-xs text-slate-400 dark:text-slate-500 pb-2">
              {d.selectedCase.supplier?.name} · {d.selectedCase.discrepancy_type.replace(/_/g, ' ')}
            </p>
          )}
        </div>

        {/* Draft type selector */}
        <div className="flex flex-wrap gap-2">
          {CLAIM_DRAFT_TYPES.map((t) => {
            const active = d.draftType === t
            return (
              <button
                key={t}
                onClick={() => d.setDraftType(t)}
                title={DRAFT_TYPE_META[t].blurb}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
                )}
              >
                {DRAFT_TYPE_META[t].label}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">{DRAFT_TYPE_META[d.draftType].blurb}</p>
      </div>

      {/* Workspace: facts left, draft right */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
        <div className="space-y-5">
          <FactLedger facts={d.facts} includedIds={d.includedIds} onToggle={d.toggleFact} />
          <VersionHistory versions={d.versions} onRestore={d.restoreVersion} />
        </div>

        <DraftEditor
          subject={d.subject}
          recipient={d.recipient}
          recipientEmail={d.recipientEmail}
          body={d.body}
          status={d.status}
          version={d.version}
          dirty={d.dirty}
          generation={d.generation}
          includedFacts={d.includedFacts}
          nextStatus={d.nextStatus}
          onSubject={d.editSubject}
          onRecipient={d.editRecipient}
          onRecipientEmail={d.setRecipientEmail}
          onBody={d.editBody}
          onRegenerate={d.regenerate}
          onSave={() => d.saveVersion()}
          onTransition={d.transition}
        />
      </div>
    </div>
  )
}
