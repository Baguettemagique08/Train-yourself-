import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storageService } from '@/services'
import { qk } from './keys'
import type { DocumentType } from '@/types'

export interface UploadDocumentVars {
  caseId: string
  file: File
  documentType: DocumentType
  uploadedBy?: string
}

/**
 * Upload a file to Supabase Storage and create its `documents` row. Exposes the
 * mutation's `isPending` / `error` so the UI can show progress and failures.
 */
export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: UploadDocumentVars) =>
      storageService.uploadAndRegister({
        caseId: vars.caseId,
        file: vars.file,
        documentType: vars.documentType,
        uploadedBy: vars.uploadedBy,
      }),
    onSuccess: (_doc, vars) => qc.invalidateQueries({ queryKey: qk.cases.detail(vars.caseId) }),
  })
}
