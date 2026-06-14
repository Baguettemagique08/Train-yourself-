import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { CaseStatusBadge, FuelTypeBadge, PriorityBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { Input, SelectField, Textarea } from '@/components/ui/FormField'
import { mockCases, mockVessels, mockPorts, mockSuppliers } from '@/data/mockData'
import type { Case, FilterState } from '@/types'
import { formatDate, formatMT, discrepancyLabel, generateCaseRef } from '@/lib/utils'
import {
  CASE_STATUS_OPTIONS, FUEL_TYPE_OPTIONS, DISCREPANCY_TYPE_OPTIONS, PRIORITY_OPTIONS,
} from '@/lib/constants'

export function CasesListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<FilterState>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showNewCase, setShowNewCase] = useState(false)

  const filtered = mockCases.filter((c) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !c.reference.toLowerCase().includes(q) &&
        !c.vessel?.name.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q)
      ) return false
    }
    if (filters.status && c.status !== filters.status) return false
    if (filters.fuel_type && c.fuel_type !== filters.fuel_type) return false
    if (filters.vessel && c.vessel_id !== filters.vessel) return false
    if (filters.supplier && c.supplier_id !== filters.supplier) return false
    if (filters.port && c.port_id !== filters.port) return false
    return true
  })

  const columns: Column<Case>[] = [
    {
      key: 'reference',
      header: 'Reference',
      sortable: true,
      width: '140px',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-600">{row.reference}</span>
      ),
    },
    {
      key: 'vessel',
      header: 'Vessel',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.vessel?.name}</div>
          <div className="text-xs text-slate-400">IMO {row.vessel?.imo}</div>
        </div>
      ),
    },
    {
      key: 'port',
      header: 'Port',
      cell: (row) => row.port?.name,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      cell: (row) => row.supplier?.name,
    },
    {
      key: 'fuel_type',
      header: 'Fuel',
      cell: (row) => <FuelTypeBadge fuel={row.fuel_type} />,
    },
    {
      key: 'discrepancy',
      header: 'Discrepancy Type',
      cell: (row) => (
        <span className="text-slate-600">{discrepancyLabel(row.discrepancy_type)}</span>
      ),
    },
    {
      key: 'quantity',
      header: 'Claimed (MT)',
      align: 'right',
      cell: (row) => row.claimed_quantity ? formatMT(row.claimed_quantity) : '—',
    },
    {
      key: 'priority',
      header: 'Priority',
      cell: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <CaseStatusBadge status={row.status} />,
    },
    {
      key: 'delivery_date',
      header: 'Delivery',
      sortable: true,
      cell: (row) => <span className="text-slate-500">{formatDate(row.delivery?.delivery_date ?? row.opened_at)}</span>,
    },
    {
      key: 'assigned_to',
      header: 'Assigned To',
      cell: (row) => row.assigned_user?.full_name ?? '—',
    },
  ]

  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Bunker Dispute Cases</h2>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} cases</p>
        </div>
        <Button onClick={() => setShowNewCase(true)}>
          <Plus className="h-4 w-4" /> New Case
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="form-input pl-9"
            placeholder="Search cases, vessels, references…"
            value={filters.search ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          />
        </div>
        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          onClick={() => setShowFilters((s) => !s)}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="ml-1 h-4 w-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
              {Object.values(filters).filter((v) => v !== undefined && v !== '').length}
            </span>
          )}
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <SelectField
            label="Status"
            options={CASE_STATUS_OPTIONS}
            placeholder="All statuses"
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as Case['status'] || undefined }))}
          />
          <SelectField
            label="Fuel Type"
            options={FUEL_TYPE_OPTIONS}
            placeholder="All fuels"
            value={filters.fuel_type ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, fuel_type: e.target.value as Case['fuel_type'] || undefined }))}
          />
          <SelectField
            label="Vessel"
            options={mockVessels.map((v) => ({ value: v.id, label: v.name }))}
            placeholder="All vessels"
            value={filters.vessel ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, vessel: e.target.value || undefined }))}
          />
          <SelectField
            label="Supplier"
            options={mockSuppliers.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="All suppliers"
            value={filters.supplier ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, supplier: e.target.value || undefined }))}
          />
          <SelectField
            label="Port"
            options={mockPorts.map((p) => ({ value: p.id, label: p.name }))}
            placeholder="All ports"
            value={filters.port ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, port: e.target.value || undefined }))}
          />
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/cases/${row.id}`)}
        emptyTitle="No cases match your filters"
        emptyDescription="Try adjusting your search criteria or create a new case."
      />

      {/* New Case Modal */}
      <NewCaseModal open={showNewCase} onClose={() => setShowNewCase(false)} />
    </div>
  )
}

function NewCaseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production: create case via Supabase, then navigate to new case
    alert(`Case ${generateCaseRef()} created (demo — not persisted)`)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Bunker Dispute Case"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="new-case-form">Create Case</Button>
        </>
      }
    >
      <form id="new-case-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Vessel"
            required
            options={mockVessels.map((v) => ({ value: v.id, label: v.name }))}
            placeholder="Select vessel"
          />
          <SelectField
            label="Port"
            required
            options={mockPorts.map((p) => ({ value: p.id, label: p.name }))}
            placeholder="Select port"
          />
          <SelectField
            label="Supplier"
            required
            options={mockSuppliers.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Select supplier"
          />
          <SelectField
            label="Fuel Type"
            required
            options={FUEL_TYPE_OPTIONS}
            placeholder="Select fuel"
          />
          <SelectField
            label="Discrepancy Type"
            required
            options={DISCREPANCY_TYPE_OPTIONS}
            placeholder="Select type"
          />
          <SelectField
            label="Priority"
            required
            options={PRIORITY_OPTIONS}
            placeholder="Select priority"
          />
          <Input
            label="BDN Quantity (MT)"
            type="number"
            step="0.001"
            placeholder="0.000"
          />
          <Input
            label="Claimed Quantity (MT)"
            type="number"
            step="0.001"
            placeholder="0.000"
          />
          <Input
            label="Delivery Date"
            type="datetime-local"
            required
            wrapperClassName="col-span-2"
          />
        </div>
        <Textarea
          label="Case Description"
          required
          rows={4}
          placeholder="Describe the discrepancy, circumstances, and initial findings…"
        />
      </form>
    </Modal>
  )
}
