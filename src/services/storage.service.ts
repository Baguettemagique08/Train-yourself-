import { supabase, STORAGE_BUCKET, ServiceError, unwrap, assertConfigured } from './client'
import type { Document, DocumentType } from '@/types'

export interface UploadResult {
  /** Path within the bucket (store this in documents.storage_path). */
  path: string
  bucket: string
}

/** Build a deterministic, collision-resistant object path for a case file. */
export function buildDocumentPath(caseId: string, filename: string): string {
  const safe = filename.replace(/[^\w.\-]+/g, '_')
  return `cases/${caseId}/${Date.now()}_${safe}`
}

export const storageService = {
  /** Upload a file to the documents bucket. Returns its storage path. */
  async upload(caseId: string, file: File): Promise<UploadResult> {
    assertConfigured()
    const path = buildDocumentPath(caseId, file.name)
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })
    if (error) throw new ServiceError(error.message, { code: 'STORAGE_UPLOAD' })
    return { path, bucket: STORAGE_BUCKET }
  },

  /** Time-limited signed URL for a private object (bucket is not public). */
  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, expiresInSeconds)
    if (error) throw new ServiceError(error.message, { code: 'STORAGE_SIGN' })
    return data.signedUrl
  },

  async remove(paths: string[]): Promise<void> {
    assertConfigured()
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths)
    if (error) throw new ServiceError(error.message, { code: 'STORAGE_REMOVE' })
  },

  /**
   * Upload a file and create the matching `documents` row in one call —
   * the typical "attach evidence to a case" operation.
   */
  async uploadAndRegister(args: {
    caseId: string
    file: File
    documentType: DocumentType
    uploadedBy?: string
  }): Promise<Document> {
    assertConfigured()
    const { path } = await this.upload(args.caseId, args.file)
    const res = await supabase
      .from('documents')
      .insert({
        case_id: args.caseId,
        document_type: args.documentType,
        filename: args.file.name,
        storage_path: path,
        file_size_bytes: args.file.size,
        mime_type: args.file.type || null,
        status: 'processing',
        extraction_status: 'pending',
        uploaded_by: args.uploadedBy ?? null,
      })
      .select('*')
      .single()
    return unwrap(res) as unknown as Document
  },
}
