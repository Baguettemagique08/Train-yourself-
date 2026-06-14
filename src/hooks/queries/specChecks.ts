import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { specChecksService, isSupabaseConfigured } from '@/services'
import type { SpecCheckInsert, SpecCheckUpdate } from '@/services'
import { mockSpecsChecks } from '@/data/mockData'
import { qk } from './keys'

export function useSpecChecks(caseId: string) {
  return useQuery({
    queryKey: qk.specChecks.byCase(caseId),
    enabled: !!caseId,
    queryFn: () => (isSupabaseConfigured
      ? specChecksService.listByCase(caseId)
      : Promise.resolve(mockSpecsChecks.filter((s) => s.case_id === caseId))),
  })
}

export function useCreateSpecCheck(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SpecCheckInsert) => specChecksService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.specChecks.byCase(caseId) }),
  })
}

export function useUpdateSpecCheck(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: SpecCheckUpdate }) => specChecksService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.specChecks.byCase(caseId) }),
  })
}

export function useDeleteSpecCheck(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => specChecksService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.specChecks.byCase(caseId) }),
  })
}
