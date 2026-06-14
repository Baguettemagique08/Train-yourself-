import { useState } from 'react'
import {
  RefreshCw, Save, Send, Check, Copy, AlertTriangle, Link2, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_FLOW, STATUS_LABELS } from '@/hooks/useClaimDrafter'
import type { ApprovedFact, GeneratedDraft } from '@/lib/claimDrafter'
import type { DraftStatus } from '@/types'

interface Props {
  subject: string
  recipient: string
  recipientEmail: string
  body: string
  status: DraftStatus
  version: number
  dirty: boolean
  generation: GeneratedDraft
  includedFacts: ApprovedFact[]
  nextStatus: DraftStatus | null
  onSubject: (v: string) => void
  onRecipient: (v: string) => void
  onRecipientEmail: (v: string) => void
  onBody: (v: string) => void
  onRegenerate: () => void
  onSave: () => void
  onTransition: (s: DraftStatus) => void
}

export function DraftEditor(p: Props) {
  const [copied, setCopied] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)

  const labelByKey = new Map(p.includedFacts.map((f) => [f.key, f.label]))
  const wordCount = p.body.trim() ? p.body.trim().split(/\s+/).length : 0

  const handleCopy = () => {
    const full = `To: ${p.recipient}\nSubject: ${p.subject}\n\n${p.body}`
    navigator.clipboard?.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleRegen = () => {
    if (p.dirty && !confirmRegen) { setConfirmRegen(true); return }
    p.onRegenerate()
    setConfirmRegen(false)
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Status stepper */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          {STATUS_FLOW.map((s, i) => {
            const activeIdx = STATUS_FLOW.indexOf(p.status)
            const done = i < activeIdx
            const current = i === activeIdx
            return (
              <div key={s} className="flex items-center">
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  current ? 'bg-blue-600 text-white'
                    : done ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500',
                )}>
                  {done && <Check className="h-2.5 w-2.5" />}
                  {STATUS_LABELS[s]}
                </span>
                {i < STATUS_FLOW.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600 mx-0.5" />}
              </div>
            )
          })}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          v{p.version}{p.dirty && <span className="text-amber-600 dark:text-amber-400"> · unsaved</span>}
        </span>
      </div>

      {/* Recipient / subject */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Field label="Recipient" value={p.recipient} onChange={p.onRecipient} placeholder="[Recipient name / department]" />
          <Field label="Recipient email" value={p.recipientEmail} onChange={p.onRecipientEmail} placeholder="name@company.com" type="email" />
        </div>
        <Field label="Subject" value={p.subject} onChange={p.onSubject} placeholder="[Subject line]" />
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-2">
        <button
          onClick={handleRegen}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
            confirmRegen
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
              : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700',
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {confirmRegen ? 'Overwrite edits?' : 'Regenerate from facts'}
        </button>
        <button onClick={p.onSave} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
          <Save className="h-3.5 w-3.5" /> Save version
        </button>
        <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
          <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy'}
        </button>
        {p.nextStatus && (
          <button
            onClick={() => p.onTransition(p.nextStatus!)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            {p.nextStatus === 'sent' ? <Send className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            Advance to {STATUS_LABELS[p.nextStatus]}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <textarea
          value={p.body}
          onChange={(e) => p.onBody(e.target.value)}
          rows={Math.max(18, p.body.split('\n').length + 2)}
          spellCheck
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>{wordCount.toLocaleString()} words</span>
          <span>·</span>
          <span>{p.body.length.toLocaleString()} characters</span>
        </div>
      </div>

      {/* Unmet facts & placeholders */}
      {(p.generation.unmet.length > 0 || p.generation.placeholders.length > 0) && (
        <div className="px-4 pb-3 space-y-2">
          {p.generation.unmet.length > 0 && (
            <div className="rounded-md border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-900/10 px-3 py-2">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" /> Not included — no approved data
              </p>
              <ul className="mt-1 text-[11px] text-amber-700/90 dark:text-amber-300/90 list-disc list-inside">
                {p.generation.unmet.map((u) => <li key={u}>{u}</li>)}
              </ul>
            </div>
          )}
          {p.generation.placeholders.length > 0 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-medium">Placeholders to complete:</span> {p.generation.placeholders.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Grounding */}
      <div className="px-4 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
          <Link2 className="h-3 w-3" /> Paragraph grounding
        </p>
        <div className="space-y-1">
          {p.generation.sections.filter((s) => s.grounded_in.length > 0).map((s) => (
            <div key={s.id} className="text-[11px] flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{s.heading ?? s.id}:</span>
              {s.grounded_in.map((k) => (
                <span key={k} className="inline-flex rounded bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 text-slate-600 dark:text-slate-300">
                  {labelByKey.get(k) ?? k}
                </span>
              ))}
            </div>
          ))}
          {p.generation.sections.every((s) => s.grounded_in.length === 0) && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Standard letter framing only — no case facts inserted yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-0.5 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
      />
    </label>
  )
}
