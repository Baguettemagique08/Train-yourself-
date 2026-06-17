import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, AlertTriangle, CheckCircle, TrendingUp, XCircle, Clock } from 'lucide-react'
import { caseRegistry, mockVessels, mockPorts, mockSuppliers, mockUsers } from '@/data/mockData'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SelectField, Textarea } from '@/components/ui/FormField'
import { CaseStatusBadge, PriorityBadge, FuelTypeBadge } from '@/components/ui/StatusBadge'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { OverviewTab } from './tabs/OverviewTab'
import { EvidenceTab } from './tabs/EvidenceTab'
import { FiguresTab } from './tabs/FiguresTab'
import { SpecsTab } from './tabs/SpecsTab'
import { DraftsTab } from './tabs/DraftsTab'
import { ActivityTab } from './tabs/ActivityTab'
import { FuelReadinessTab } from './tabs/FuelReadinessTab'
import { SamplesTab } from './tabs/SamplesTab'
import { QuantumTab } from './tabs/QuantumTab'
import { NotesTab } from './tabs/NotesTab'
import { formatDate } from '@/lib/utils'
import {
  FUEL_TYPE_OPTIONS, DISCREPANCY_TYPE_OPTIONS, PRIORITY_OPTIONS,
} from '@/lib/constants'
import type { Case, CaseStatus, TabDefinition } from '@/types'

const STATUS_TRANSITIONS: Record<CaseStatus, { label: string; next: CaseStatus; icon: React.ReactNode; variant: 'primary' | 'secondary' | 'danger' }[]> = {
  open: [
    { label: 'Start Review', next: 'under_review', icon: <TrendingUp className="h-3.5 w-3.5" />, variant: 'primary' },
    { label: 'Escalate', next: 'escalated', icon: <AlertTriangle className="h-3.5 w-3.5" />, variant: 'danger' },
  ],
  under_review: [
    { label: 'Await Response', next: 'pending_response', icon: <Clock className="h-3.5 w-3.5" />, variant: 'secondary' },
    { label: 'Escalate', next: 'escalated', icon: <AlertTriangle className="h-3.5 w-3.5" />, variant: 'danger' },
    { label: 'Resolve', next: 'resolved', icon: <CheckCircle className="h-3.5 w-3.5" />, variant: 'primary' },
  ],
  pending_response: [
    { label: 'Resume Review', next: 'under_review', icon: <TrendingUp className="h-3.5 w-3.5" />, variant: 'secondary' },
    { label: 'Escalate', next: 'escalated', icon: <AlertTriangle className="h-3.5 w-3.5" />, variant: 'danger' },
    { label: 'Resolve', next: 'resolved', icon: <CheckCircle className="h-3.5 w-3.5" />, variant: 'primary' },
  ],
  escalated: [
    { label: 'De-escalate', next: 'under_review', icon: <TrendingUp className="h-3.5 w-3.5" />, variant: 'secondary' },
    { label: 'Resolve', next: 'resolved', icon: <CheckCircle className="h-3.5 w-3.5" />, variant: 'primary' },
  ],
  resolved: [
    { label: 'Close Case', next: 'closed', icon: <XCircle className="h-3.5 w-3.5" />, variant: 'secondary' },
    { label: 'Reopen', next: 'open', icon: <TrendingUp className="h-3.5 w-3.5" />, variant: 'secondary' },
  ],
  closed: [
    { label: 'Reopen', next: 'open', icon: <TrendingUp className="h-3.5 w-3.5" />, variant: 'secondary' },
  ],
}

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [, forceUpdate] = useState(0)
  const [showEdit, setShowEdit] = useState(false)

  const case_ = id ? caseRegistry.get(id) : undefined

  const handleStatusChange = useCallback((next: CaseStatus) => {
    if (!id) return
    const existing = caseRegistry.get(id)
    if (!existing) return
    const updated: Case = {
      ...existing,
      status: next,
      updated_at: new Date().toISOString(),
      ...(next === 'closed' || next === 'resolved' ? { closed_at: new Date().toISOString() } : {}),
    }
    caseRegistry.set(id, updated)
    forceUpdate((n) => n + 1)
  }, [id])

  const handleEdit = useCallback((updates: Partial<Case>) => {
    if (!id) return
    const existing = caseRegistry.get(id)
    if (!existing) return
    caseRegistry.set(id, { ...existing, ...updates, updated_at: new Date().toISOString() })
    forceUpdate((n) => n + 1)
    setShowEdit(false)
  }, [id])

  if (!case_) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Case not found.</p>
        <Button variant="ghost" onClick={() => navigate('/cases')} className="mt-4">
          <ArrowLeft className="h-4 w-4" /> Back to Cases
        </Button>
      </div>
    )
  }

  const transitions = STATUS_TRANSITIONS[case_.status] ?? []

  const tabs: TabDefinition[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'samples', label: 'Samples' },
    { id: 'figures', label: 'Figures' },
    { id: 'specs', label: 'Specs Check' },
    { id: 'quantum', label: 'Quantum' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'activity', label: 'Activity' },
    { id: 'notes', label: 'Notes' },
    { id: 'fuel_readiness', label: 'Fuel Readiness' },
  ]

  return (
    <div className="space-y-5">
      <Breadcrumb items={[
        { label: 'Cases', to: '/cases' },
        { label: case_.reference },
      ]} />

      {/* Case header */}
      <div className="bg-white border border-slate-200 rounded-lg px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate('/cases')}
                className="text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="font-mono text-sm font-semibold text-slate-500">{case_.reference}</span>
              <CaseStatusBadge status={case_.status} />
              <PriorityBadge priority={case_.priority} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">{case_.vessel?.name}</h1>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
              <span>{case_.port?.name}</span>
              <span className="text-slate-300">·</span>
              <span>{case_.supplier?.name}</span>
              <span className="text-slate-300">·</span>
              <FuelTypeBadge fuel={case_.fuel_type} />
              <span className="text-slate-300">·</span>
              <span>{formatDate(case_.delivery?.delivery_date ?? case_.opened_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            <div className="text-right text-xs text-slate-400 hidden sm:block">
              <div>Assigned to</div>
              <div className="font-medium text-slate-700">{case_.assigned_user?.full_name ?? '—'}</div>
            </div>
            {/* Status transition buttons */}
            {transitions.map((t) => (
              <Button
                key={t.next}
                variant={t.variant === 'danger' ? 'secondary' : t.variant}
                size="sm"
                onClick={() => handleStatusChange(t.next)}
                className={t.variant === 'danger' ? 'border-red-200 text-red-600 hover:bg-red-50' : undefined}
              >
                {t.icon} {t.label}
              </Button>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
              <Edit className="h-3.5 w-3.5" /> Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <div className="p-5">
          {activeTab === 'overview' && <OverviewTab case_={case_} />}
          {activeTab === 'evidence' && <EvidenceTab caseId={case_.id} />}
          {activeTab === 'samples' && <SamplesTab caseId={case_.id} />}
          {activeTab === 'figures' && <FiguresTab caseId={case_.id} />}
          {activeTab === 'specs' && <SpecsTab caseId={case_.id} />}
          {activeTab === 'quantum' && <QuantumTab case_={case_} />}
          {activeTab === 'drafts' && <DraftsTab caseId={case_.id} />}
          {activeTab === 'activity' && <ActivityTab caseId={case_.id} />}
          {activeTab === 'notes' && <NotesTab caseId={case_.id} />}
          {activeTab === 'fuel_readiness' && <FuelReadinessTab vesselId={case_.vessel_id} fuelType={case_.fuel_type} />}
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditCaseModal case_={case_} onSave={handleEdit} onClose={() => setShowEdit(false)} />
      )}
    </div>
  )
}

function EditCaseModal({
  case_,
  onSave,
  onClose,
}: {
  case_: Case
  onSave: (updates: Partial<Case>) => void
  onClose: () => void
}) {
  const [vesselId, setVesselId] = useState(case_.vessel_id)
  const [portId, setPortId] = useState(case_.port_id)
  const [supplierId, setSupplierId] = useState(case_.supplier_id)
  const [assignedTo, setAssignedTo] = useState(case_.assigned_to ?? '')
  const [fuelType, setFuelType] = useState(case_.fuel_type)
  const [discrepancyType, setDiscrepancyType] = useState(case_.discrepancy_type)
  const [priority, setPriority] = useState(case_.priority)
  const [description, setDescription] = useState(case_.description)
  const [internalNotes, setInternalNotes] = useState(case_.internal_notes ?? '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const vessel = mockVessels.find((v) => v.id === vesselId)
    const port = mockPorts.find((p) => p.id === portId)
    const supplier = mockSuppliers.find((s) => s.id === supplierId)
    const assignedUser = mockUsers.find((u) => u.id === assignedTo)
    onSave({
      vessel_id: vesselId,
      vessel,
      port_id: portId,
      port,
      supplier_id: supplierId,
      supplier,
      assigned_to: assignedTo,
      assigned_user: assignedUser,
      fuel_type: fuelType as any,
      discrepancy_type: discrepancyType as any,
      priority: priority as any,
      description,
      internal_notes: internalNotes,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit Case — ${case_.reference}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-case-form">Save Changes</Button>
        </>
      }
    >
      <form id="edit-case-form" onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Vessel"
            options={mockVessels.map((v) => ({ value: v.id, label: v.name }))}
            value={vesselId}
            onChange={(e) => setVesselId(e.target.value)}
          />
          <SelectField
            label="Port"
            options={mockPorts.map((p) => ({ value: p.id, label: p.name }))}
            value={portId}
            onChange={(e) => setPortId(e.target.value)}
          />
          <SelectField
            label="Supplier"
            options={mockSuppliers.map((s) => ({ value: s.id, label: s.name }))}
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          />
          <SelectField
            label="Assigned To"
            options={mockUsers.map((u) => ({ value: u.id, label: u.full_name }))}
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
          <SelectField
            label="Fuel Type"
            options={FUEL_TYPE_OPTIONS}
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as any)}
          />
          <SelectField
            label="Discrepancy Type"
            options={DISCREPANCY_TYPE_OPTIONS}
            value={discrepancyType}
            onChange={(e) => setDiscrepancyType(e.target.value as any)}
          />
          <SelectField
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            wrapperClassName="col-span-2"
          />
        </div>
        <Textarea
          label="Case Description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Textarea
          label="Internal Notes"
          rows={3}
          placeholder="Internal team notes (not shared externally)…"
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
        />
      </form>
    </Modal>
  )
}
