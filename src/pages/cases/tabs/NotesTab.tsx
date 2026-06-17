import { useState, useCallback } from 'react'
import { caseNotesRegistry } from '@/data/mockData'
import { formatDateTime } from '@/lib/utils'
import { Save, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface NotesTabProps {
  caseId: string
}

export function NotesTab({ caseId }: NotesTabProps) {
  const [text, setText] = useState(() => caseNotesRegistry.get(caseId) ?? '')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setDirty(true)
  }

  const handleSave = useCallback(() => {
    caseNotesRegistry.set(caseId, text)
    const now = new Date().toISOString()
    setSavedAt(now)
    setDirty(false)
  }, [caseId, text])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <StickyNote className="h-4 w-4" />
          <span className="text-sm font-medium">Internal Case Notes</span>
          <span className="text-xs text-slate-400">(not shared externally)</span>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && !dirty && (
            <span className="text-xs text-slate-400">
              Saved {formatDateTime(savedAt)}
            </span>
          )}
          {dirty && (
            <span className="text-xs text-amber-500">Unsaved changes</span>
          )}
          <Button size="sm" variant={dirty ? 'primary' : 'secondary'} onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            {dirty ? 'Save' : 'Saved'}
          </Button>
        </div>
      </div>

      <textarea
        className="w-full min-h-[420px] rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono leading-relaxed"
        placeholder={`Use this space for internal notes, call summaries, and reminders.\n\nExamples:\n• Called James @ supplier 14 Jun — disputes MFM figures, claims calibration certificate not valid\n• Waiting for SGS counter-analysis expected 20 Jun\n• Owner asked for weekly update — next call Friday 21 Jun 14:00 UTC\n• Check charter party clause 42 re: time bar extension`}
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault()
            handleSave()
          }
        }}
      />
      <p className="text-xs text-slate-400">
        Tip: Press <kbd className="px-1 py-0.5 rounded border border-slate-200 bg-slate-50 font-mono text-xs">⌘S</kbd> / <kbd className="px-1 py-0.5 rounded border border-slate-200 bg-slate-50 font-mono text-xs">Ctrl+S</kbd> to save.
        Notes are session-only in demo mode.
      </p>
    </div>
  )
}
