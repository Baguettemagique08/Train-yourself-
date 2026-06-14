import { supabase, unwrap, unwrapMaybe, assertConfigured } from './client'
import type { CaseInsert, CaseUpdate } from './types'
import type { Case, FilterState } from '@/types'

// Embed related rows by their foreign-key column. Adjust the alias targets if
// your FK names differ.
const CASE_LIST_SELECT =
  '*, vessel:vessel_id(*), port:port_id(*), supplier:supplier_id(*), assigned_user:assigned_to(*)'

const CASE_DETAIL_SELECT = `
  *,
  vessel:vessel_id(*),
  port:port_id(*),
  supplier:supplier_id(*),
  delivery:delivery_id(*),
  assigned_user:assigned_to(*),
  documents:documents(*),
  measurements:measurements(*),
  spec_checks:spec_checks(*),
  drafts:drafts(*),
  activities:activities(*)
`

export const casesService = {
  /** List cases (excludes soft-deleted), newest first, with optional filters. */
  async list(filters: Partial<FilterState> = {}): Promise<Case[]> {
    let q = supabase
      .from('cases')
      .select(CASE_LIST_SELECT)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters.status) q = q.eq('status', filters.status)
    if (filters.priority) q = q.eq('priority', filters.priority)
    if (filters.fuel_type) q = q.eq('fuel_type', filters.fuel_type)
    if (filters.vessel) q = q.eq('vessel_id', filters.vessel)
    if (filters.supplier) q = q.eq('supplier_id', filters.supplier)
    if (filters.port) q = q.eq('port_id', filters.port)
    if (filters.assigned_to) q = q.eq('assigned_to', filters.assigned_to)
    if (filters.search) {
      const s = filters.search.replace(/[%,]/g, '')
      q = q.or(`reference.ilike.%${s}%,description.ilike.%${s}%`)
    }

    return unwrap(await q) as unknown as Case[]
  },

  /** Single case with all related children for the detail page. */
  async getById(id: string): Promise<Case | null> {
    const res = await supabase.from('cases').select(CASE_DETAIL_SELECT).eq('id', id).maybeSingle()
    return unwrapMaybe(res) as unknown as Case | null
  },

  async create(input: CaseInsert): Promise<Case> {
    assertConfigured()
    const res = await supabase.from('cases').insert(input).select(CASE_LIST_SELECT).single()
    return unwrap(res) as unknown as Case
  },

  async update(id: string, patch: CaseUpdate): Promise<Case> {
    assertConfigured()
    const res = await supabase.from('cases').update(patch).eq('id', id).select(CASE_LIST_SELECT).single()
    return unwrap(res) as unknown as Case
  },

  /** Soft delete — sets deleted_at so history is preserved. */
  async remove(id: string): Promise<void> {
    assertConfigured()
    const { error } = await supabase.from('cases').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
  },
}
