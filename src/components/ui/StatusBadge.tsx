import { Badge } from './Badge'
import {
  caseStatusLabel,
  caseStatusColor,
  specStatusLabel,
  specStatusColor,
  fuelTypeColor,
  priorityColor,
  fuelReadinessColor,
  fuelReadinessLabel,
  draftStatusLabel,
} from '@/lib/utils'
import type { CaseStatus, SpecStatus, FuelType, FuelReadinessStatus, DraftStatus } from '@/types'

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return <Badge className={caseStatusColor(status)}>{caseStatusLabel(status)}</Badge>
}

export function SpecStatusBadge({ status }: { status: SpecStatus }) {
  return <Badge className={specStatusColor(status)}>{specStatusLabel(status)}</Badge>
}

export function FuelTypeBadge({ fuel }: { fuel: FuelType }) {
  return <Badge className={fuelTypeColor(fuel)}>{fuel}</Badge>
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge className={priorityColor(priority)}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>
}

export function FuelReadinessBadge({ status }: { status: FuelReadinessStatus }) {
  return <Badge className={fuelReadinessColor(status)}>{fuelReadinessLabel(status)}</Badge>
}

export function DraftStatusBadge({ status }: { status: DraftStatus }) {
  const colors: Record<DraftStatus, string> = {
    draft: 'bg-slate-100 text-slate-600',
    under_review: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    sent: 'bg-green-100 text-green-700',
  }
  return <Badge className={colors[status]}>{draftStatusLabel(status)}</Badge>
}
