import { supabase, unwrap, unwrapMaybe, assertConfigured } from './client'
import type { DraftInsert, DraftUpdate } from './types'
import type { Draft, DraftStatus } from '@/types'

const DRAFT_SELECT = '*, creator:created_by(*), reviewer:reviewed_by(*), approver:approved_by(*)'

export const draftsService = {
  async listByCase(caseId: string): Promise<Draft[]> {
    const res = await supabase
      .from('drafts')
      .select(DRAFT_SELECT)
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
    return unwrap(res) as unknown as Draft[]
  },

  async getById(id: string): Promise<Draft | null> {
    const res = await supabase.from('drafts').select(DRAFT_SELECT).eq('id', id).maybeSingle()
    return unwrapMaybe(res) as unknown as Draft | null
  },

  async create(input: DraftInsert): Promise<Draft> {
    assertConfigured()
    const res = await supabase.from('drafts').insert(input).select(DRAFT_SELECT).single()
    return unwrap(res) as unknown as Draft
  },

  async update(id: string, patch: DraftUpdate): Promise<Draft> {
    assertConfigured()
    const res = await supabase.from('drafts').update(patch).eq('id', id).select(DRAFT_SELECT).single()
    return unwrap(res) as unknown as Draft
  },

  /** Advance the approval workflow, stamping the relevant audit timestamp. */
  async transitionStatus(id: string, status: DraftStatus, userId?: string): Promise<Draft> {
    assertConfigured()
    const now = new Date().toISOString()
    const patch: DraftUpdate = { status }
    if (status === 'under_review') patch.submitted_for_review_at = now
    if (status === 'approved') { patch.approved_at = now; patch.approved_by = userId }
    if (status === 'sent') { patch.sent_at = now; patch.sent_by = userId }
    return this.update(id, patch)
  },

  async remove(id: string): Promise<void> {
    assertConfigured()
    const { error } = await supabase.from('drafts').delete().eq('id', id)
    if (error) throw error
  },
}
