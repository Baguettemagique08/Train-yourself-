import { supabase, unwrap, assertConfigured } from './client'
import type { MeasurementInsert, MeasurementUpdate } from './types'
import type { Measurement } from '@/types'

export const measurementsService = {
  async listByCase(caseId: string): Promise<Measurement[]> {
    const res = await supabase
      .from('measurements')
      .select('*')
      .eq('case_id', caseId)
      .order('timestamp_utc', { ascending: true })
    return unwrap(res) as unknown as Measurement[]
  },

  async create(input: MeasurementInsert): Promise<Measurement> {
    assertConfigured()
    const res = await supabase.from('measurements').insert(input).select('*').single()
    return unwrap(res) as unknown as Measurement
  },

  async update(id: string, patch: MeasurementUpdate): Promise<Measurement> {
    assertConfigured()
    const res = await supabase.from('measurements').update(patch).eq('id', id).select('*').single()
    return unwrap(res) as unknown as Measurement
  },

  async remove(id: string): Promise<void> {
    assertConfigured()
    const { error } = await supabase.from('measurements').delete().eq('id', id)
    if (error) throw error
  },
}
