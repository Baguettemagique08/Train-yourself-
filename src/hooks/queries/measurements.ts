import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { measurementsService, isSupabaseConfigured } from '@/services'
import type { MeasurementInsert, MeasurementUpdate } from '@/services'
import { mockMeasurements } from '@/data/mockData'
import { qk } from './keys'

export function useMeasurements(caseId: string) {
  return useQuery({
    queryKey: qk.measurements.byCase(caseId),
    enabled: !!caseId,
    queryFn: () => (isSupabaseConfigured
      ? measurementsService.listByCase(caseId)
      : Promise.resolve(mockMeasurements.filter((m) => m.case_id === caseId))),
  })
}

export function useCreateMeasurement(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: MeasurementInsert) => measurementsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.measurements.byCase(caseId) }),
  })
}

export function useUpdateMeasurement(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: MeasurementUpdate }) => measurementsService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.measurements.byCase(caseId) }),
  })
}

export function useDeleteMeasurement(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => measurementsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.measurements.byCase(caseId) }),
  })
}
