import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { mockCases } from '@/data/mockData'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { CaseStatusBadge, PriorityBadge, FuelTypeBadge } from '@/components/ui/StatusBadge'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { OverviewTab } from './tabs/OverviewTab'
import { EvidenceTab } from './tabs/EvidenceTab'
import { FiguresTab } from './tabs/FiguresTab'
import { SpecsTab } from './tabs/SpecsTab'
import { DraftsTab } from './tabs/DraftsTab'
import { ActivityTab } from './tabs/ActivityTab'
import { FuelReadinessTab } from './tabs/FuelReadinessTab'
import { formatDate } from '@/lib/utils'
import type { TabDefinition } from '@/types'

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const case_ = mockCases.find((c) => c.id === id)

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

  const tabs: TabDefinition[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'figures', label: 'Figures' },
    { id: 'specs', label: 'Specs Check' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'activity', label: 'Activity' },
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
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right text-xs text-slate-400 hidden sm:block">
              <div>Assigned to</div>
              <div className="font-medium text-slate-700">{case_.assigned_user?.full_name ?? '—'}</div>
            </div>
            <Button variant="secondary" size="sm">
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
          {activeTab === 'figures' && <FiguresTab caseId={case_.id} />}
          {activeTab === 'specs' && <SpecsTab caseId={case_.id} />}
          {activeTab === 'drafts' && <DraftsTab caseId={case_.id} />}
          {activeTab === 'activity' && <ActivityTab caseId={case_.id} />}
          {activeTab === 'fuel_readiness' && <FuelReadinessTab vesselId={case_.vessel_id} />}
        </div>
      </div>
    </div>
  )
}
