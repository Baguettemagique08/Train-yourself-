import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { draftsService, isSupabaseConfigured } from '@/services'
import type { DraftInsert, DraftUpdate } from '@/services'
import { mockDrafts } from '@/data/mockData'
import { qk } from './keys'
import type { DraftStatus } from '@/types'

export function useDrafts(caseId: string) {
  return useQuery({
    queryKey: qk.drafts.byCase(caseId),
    enabled: !!caseId,
    queryFn: () => (isSupabaseConfigured
      ? draftsService.listByCase(caseId)
      : Promise.resolve(mockDrafts.filter((d) => d.case_id === caseId))),
  })
}

export function useCreateDraft(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: DraftInsert) => draftsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.drafts.byCase(caseId) }),
  })
}

export function useUpdateDraft(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DraftUpdate }) => draftsService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.drafts.byCase(caseId) }),
  })
}

export function useTransitionDraft(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, userId }: { id: string; status: DraftStatus; userId?: string }) =>
      draftsService.transitionStatus(id, status, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.drafts.byCase(caseId) }),
  })
}
