import { supabase, unwrap, assertConfigured } from './client'
import type { SpecCheckInsert, SpecCheckUpdate } from './types'
import type { SpecCheck } from '@/types'

export const specChecksService = {
  async listByCase(caseId: string): Promise<SpecCheck[]> {
    const res = await supabase
      .from('spec_checks')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })
    return unwrap(res) as unknown as SpecCheck[]
  },

  async create(input: SpecCheckInsert): Promise<SpecCheck> {
    assertConfigured()
    const res = await supabase.from('spec_checks').insert(input).select('*').single()
    return unwrap(res) as unknown as SpecCheck
  },

  async update(id: string, patch: SpecCheckUpdate): Promise<SpecCheck> {
    assertConfigured()
    const res = await supabase.from('spec_checks').update(patch).eq('id', id).select('*').single()
    return unwrap(res) as unknown as SpecCheck
  },

  async remove(id: string): Promise<void> {
    assertConfigured()
    const { error } = await supabase.from('spec_checks').delete().eq('id', id)
    if (error) throw error
  },
}
