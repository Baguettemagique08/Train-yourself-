import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Eye, ChevronDown, ChevronRight } from 'lucide-react'
import type { Document } from '@/types'
import { mockDocuments } from '@/data/mockData'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { documentTypeLabel, formatDateTime, fileSizeLabel } from '@/lib/utils'

interface EvidenceTabProps {
  caseId: string
}

export function EvidenceTab({ caseId }: EvidenceTabProps) {
  const [expanded, setExpanded] = useState<string[]>([])
  const documents = mockDocuments.filter((d) => d.case_id === caseId)

  function toggleExpand(id: string) {
    setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const statusConfig: Record<Document['status'], { icon: React.ReactNode; label: string; color: string }> = {
    ready: { icon: <CheckCircle className="h-4 w-4" />, label: 'Ready', color: 'text-green-600' },
    needs_review: { icon: <AlertCircle className="h-4 w-4" />, label: 'Needs Review', color: 'text-amber-600' },
    processing: { icon: <Clock className="h-4 w-4 animate-pulse" />, label: 'Processing', color: 'text-blue-600' },
    failed: { icon: <AlertCircle className="h-4 w-4" />, label: 'Failed', color: 'text-red-600' },
  }

  return (
    <div className="space-y-5">
      {/* Upload area */}
      <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer group">
        <Upload className="h-8 w-8 text-slate-300 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
        <p className="text-sm font-medium text-slate-600">Drop documents here or click to upload</p>
        <p className="text-xs text-slate-400 mt-1">
          BDN, NOR, LOP, Lab Reports, MFM Logs, Ullage Reports — PDF, XLSX, DOCX
        </p>
        <Button variant="secondary" size="sm" className="mt-4">
          Select Files
        </Button>
      </div>

      {/* Documents list */}
      {documents.length === 0 ? (
        <EmptyState
          title="No documents uploaded"
          description="Upload BDNs, lab reports, MFM logs, and other supporting documents to build the evidence record."
        />
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const isExpanded = expanded.includes(doc.id)
            const status = statusConfig[doc.status]

            return (
              <div key={doc.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleExpand(doc.id)}
                >
                  <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.filename}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {documentTypeLabel(doc.type)} · {fileSizeLabel(doc.file_size)} · Uploaded {formatDateTime(doc.created_at)}
                    </p>
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </div>

                  <Button variant="ghost" size="sm">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>

                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50">
                    {doc.notes && (
                      <p className="text-xs text-slate-600 mb-3 italic">{doc.notes}</p>
                    )}

                    {doc.extracted_fields && doc.extracted_fields.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                          Extracted Fields
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {doc.extracted_fields.map((field) => (
                            <div
                              key={field.id}
                              className={`px-3 py-2 rounded-md border text-xs ${
                                field.needs_review
                                  ? 'border-amber-200 bg-amber-50'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="font-medium text-slate-500 truncate">{field.field_name}</div>
                              <div className="font-semibold text-slate-900 mt-0.5">{field.field_value}</div>
                              {field.confidence !== undefined && (
                                <div className="text-slate-400 mt-0.5">
                                  Confidence: {(field.confidence * 100).toFixed(0)}%
                                  {field.needs_review && (
                                    <span className="ml-2 text-amber-600 font-medium">· Review required</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No fields extracted for this document.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
