import { useState } from 'react'
import type { Case } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/FormField'
import { formatQuantity } from '@/lib/utils'
import { DollarSign, AlertTriangle, Scale, TrendingDown, FileText } from 'lucide-react'

interface QuantumTabProps {
  case_: Case
}

const FUEL_PRICE_DEFAULTS: Record<string, number> = {
  VLSFO: 600, ULSFO: 650, HSFO: 480, MGO: 720, LSMGO: 740, LNG: 820,
  LPG: 700, Methanol: 760, Ammonia: 800, Biofuel: 900, B24: 690, B100: 1100,
  HVO: 1300, Other: 700,
}

interface LineItem {
  label: string
  basis: string
  amount: number
  note?: string
  isSubtotal?: boolean
}

function buildQuantityLines(case_: Case, unitPrice: number): LineItem[] {
  const bdn = case_.bdn_quantity ?? 0
  const vessel = case_.claimed_quantity ?? bdn
  const shortage = bdn - vessel

  if (Math.abs(shortage) < 0.01) return []

  const isShort = shortage > 0
  const lines: LineItem[] = [
    {
      label: isShort ? 'Quantity Short' : 'Quantity Over',
      basis: `${formatQuantity(Math.abs(shortage))} MT × USD ${formatQuantity(unitPrice, 0)}/MT`,
      amount: Math.abs(shortage) * unitPrice,
      note: isShort
        ? 'Gross shortfall per BDN vs vessel figures'
        : 'Over-delivery per vessel vs BDN figures',
    },
  ]

  if (isShort) {
    lines.push({
      label: 'Interest (LIBOR + 2% p.a. est.)',
      basis: `6 months on principal`,
      amount: Math.round(Math.abs(shortage) * unitPrice * 0.035),
      note: 'Indicative only — depends on contract rate',
    })
  }

  lines.push({
    label: 'Subtotal — Quantity Claim',
    basis: '',
    amount: lines.reduce((s, l) => s + l.amount, 0),
    isSubtotal: true,
  })

  return lines
}

function buildQualityLines(case_: Case, unitPrice: number): LineItem[] {
  if (case_.discrepancy_type !== 'off_spec' && case_.discrepancy_type !== 'contamination') return []

  const parcel = case_.bdn_quantity ?? case_.claimed_quantity ?? 0
  if (parcel <= 0) return []

  const isContam = case_.discrepancy_type === 'contamination'
  const declassFactor = isContam ? 0.30 : 0.10
  const remediationEst = isContam ? 25000 : 8000
  const engineRisk = isContam ? 40000 : 0

  const parcelValue = parcel * unitPrice
  const devaluation = parcelValue * declassFactor

  const lines: LineItem[] = [
    {
      label: 'Fuel Devaluation / Declassification',
      basis: `${formatQuantity(parcel)} MT × USD ${formatQuantity(unitPrice, 0)} × ${(declassFactor * 100).toFixed(0)}%`,
      amount: Math.round(devaluation),
      note: isContam
        ? 'Estimated loss of value due to contamination'
        : 'Off-spec fuel devalued to lower grade',
    },
    {
      label: 'Remediation / Off-loading Cost (est.)',
      basis: 'Shore reception, debunkering, disposal',
      amount: remediationEst,
      note: 'Subject to actual disposal cost at port',
    },
  ]

  if (engineRisk > 0) {
    lines.push({
      label: 'Engine / Equipment Risk Provision',
      basis: 'Inspection, cleaning, potential repair',
      amount: engineRisk,
      note: 'Contingency — actual costs TBD post-inspection',
    })
  }

  lines.push({
    label: `Subtotal — ${isContam ? 'Contamination' : 'Off-Spec'} Claim`,
    basis: '',
    amount: lines.reduce((s, l) => s + l.amount, 0),
    isSubtotal: true,
  })

  return lines
}

function buildCostLines(): LineItem[] {
  return [
    {
      label: 'Third-Party Survey Fee',
      basis: 'Independent surveyor attendance + report',
      amount: 3500,
      note: 'Estimated based on port; actual invoice required',
    },
    {
      label: 'Lab Analysis Cost',
      basis: 'Full ISO 8217 suite (1 sample)',
      amount: 1200,
      note: 'Commercial lab rate',
    },
    {
      label: 'Legal Advisory Cost (est.)',
      basis: 'Claim preparation, correspondence review',
      amount: 5000,
      note: 'Indicative; depends on complexity and counsel',
    },
    {
      label: 'Subtotal — Costs & Expenses',
      basis: '',
      amount: 9700,
      isSubtotal: true,
    },
  ]
}

interface ManualHeads {
  demurrage: number
  bdnRectification: number
  offHire: number
  otherDirect: number
}

const MANUAL_HEAD_LABELS: Record<keyof ManualHeads, { label: string; basis: string }> = {
  demurrage:        { label: 'Demurrage / Detention',         basis: 'Delay arising directly from the dispute' },
  bdnRectification: { label: 'BDN Rectification / Re-issue',  basis: 'Cost to obtain corrected documentation' },
  offHire:          { label: 'Off-Hire / Loss of Time',       basis: 'Vessel earnings lost while dispute unresolved' },
  otherDirect:      { label: 'Other Direct Losses',           basis: 'Any other quantifiable head (specify in notes)' },
}

function buildManualLines(heads: ManualHeads): LineItem[] {
  const lines: LineItem[] = (Object.keys(heads) as (keyof ManualHeads)[])
    .filter((k) => heads[k] > 0)
    .map((k) => ({
      label: MANUAL_HEAD_LABELS[k].label,
      basis: MANUAL_HEAD_LABELS[k].basis,
      amount: heads[k],
    }))
  if (lines.length === 0) return []
  lines.push({
    label: 'Subtotal — Manual Claim Heads',
    basis: '',
    amount: lines.reduce((s, l) => s + l.amount, 0),
    isSubtotal: true,
  })
  return lines
}

export function QuantumTab({ case_ }: QuantumTabProps) {
  const defaultPrice = FUEL_PRICE_DEFAULTS[case_.fuel_type] ?? 650
  const [unitPrice, setUnitPrice] = useState(defaultPrice)
  const [manualHeads, setManualHeads] = useState<ManualHeads>({
    demurrage: 0,
    bdnRectification: 0,
    offHire: 0,
    otherDirect: 0,
  })

  const bdn = case_.bdn_quantity ?? 0
  const vessel = case_.claimed_quantity ?? bdn
  const shortage = bdn - vessel

  const quantityLines = buildQuantityLines(case_, unitPrice)
  const qualityLines = buildQualityLines(case_, unitPrice)
  const manualLines = buildManualLines(manualHeads)
  const costLines = buildCostLines()

  const isQuantity = ['quantity_short', 'quantity_over', 'mfm_dispute'].includes(case_.discrepancy_type)
  const isQuality = ['off_spec', 'contamination'].includes(case_.discrepancy_type)
  const showManual = !isQuantity && !isQuality

  const allLines = [...quantityLines, ...qualityLines, ...manualLines, ...costLines]
  const subtotals = allLines.filter((l) => l.isSubtotal).map((l) => l.amount)
  const grandTotal = subtotals.reduce((s, v) => s + v, 0)

  const conservativeTotal = Math.round(grandTotal * 0.6)

  const sections: { title: string; icon: React.ReactNode; lines: LineItem[] }[] = []
  if (isQuantity && quantityLines.length > 0) {
    sections.push({ title: 'Quantity Claim', icon: <TrendingDown className="h-4 w-4 text-amber-500" />, lines: quantityLines })
  }
  if (isQuality && qualityLines.length > 0) {
    sections.push({ title: 'Quality / Spec Claim', icon: <AlertTriangle className="h-4 w-4 text-red-500" />, lines: qualityLines })
  }
  if (showManual && manualLines.length > 0) {
    sections.push({ title: 'Manual Claim Heads', icon: <FileText className="h-4 w-4 text-indigo-500" />, lines: manualLines })
  }
  sections.push({ title: 'Costs & Expenses', icon: <Scale className="h-4 w-4 text-blue-500" />, lines: costLines })

  return (
    <div className="space-y-5">
      {/* Disclaimer */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
        <strong>Indicative only.</strong> Figures are estimates for internal claim management purposes.
        Actual quantum depends on contract terms, governing law, and final evidence. Consult legal counsel
        before submitting any formal claim.
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="BDN Quantity"
          value={bdn ? `${formatQuantity(bdn)} MT` : '—'}
          sub="Per bunker delivery note"
        />
        <KpiCard
          label="Vessel Figure"
          value={vessel ? `${formatQuantity(vessel)} MT` : '—'}
          sub="Post-bunkering measurement"
        />
        {Math.abs(shortage) > 0.01 && (
          <KpiCard
            label={shortage > 0 ? 'Shortage' : 'Over-delivery'}
            value={`${formatQuantity(Math.abs(shortage))} MT`}
            sub={`${Math.abs((shortage / bdn) * 100).toFixed(2)}% variance`}
            highlight={shortage > 0 ? 'red' : 'amber'}
          />
        )}
        <KpiCard
          label="Market Price"
          value={`USD ${formatQuantity(unitPrice, 0)}/MT`}
          sub={`${case_.fuel_type} indicative`}
        />
      </div>

      {/* Price input */}
      <Card>
        <CardHeader title="Assumptions" />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={`${case_.fuel_type} Unit Price (USD/MT)`}
            type="number"
            min={0}
            step={10}
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            hint="Adjust to reflect actual contracted or market price"
          />
          <div className="flex flex-col gap-1">
            <label className="form-label">Currency</label>
            <div className="form-input bg-slate-50 text-slate-500 cursor-not-allowed">USD</div>
            <p className="text-xs text-slate-400">Multi-currency conversion not yet implemented</p>
          </div>
        </div>
      </Card>

      {/* Manual claim heads — shown for documentation/other dispute types */}
      {showManual && (
        <Card>
          <CardHeader
            title="Manual Claim Heads"
            subtitle="Enter amounts for applicable heads of claim (leave 0 to exclude)"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(manualHeads) as (keyof ManualHeads)[]).map((k) => (
              <Input
                key={k}
                label={MANUAL_HEAD_LABELS[k].label}
                type="number"
                min={0}
                step={100}
                value={manualHeads[k]}
                onChange={(e) => setManualHeads((prev) => ({ ...prev, [k]: Number(e.target.value) }))}
                hint={MANUAL_HEAD_LABELS[k].basis}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Claim sections */}
      {sections.map((sec) => (
        <Card key={sec.title}>
          <CardHeader
            title={sec.title}
            action={<span className="flex items-center gap-1">{sec.icon}</span>}
          />
          <LineTable lines={sec.lines} />
        </Card>
      ))}

      {/* Grand total */}
      {grandTotal > 0 && (
        <Card>
          <CardHeader title="Total Claim Position" action={<DollarSign className="h-4 w-4 text-green-600" />} />
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Conservative Estimate (60%)</span>
              <span className="text-lg font-semibold text-slate-700">
                USD {formatQuantity(conservativeTotal, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-base font-semibold text-slate-900">Full Quantum Estimate</span>
              <span className="text-2xl font-bold text-slate-900">
                USD {formatQuantity(grandTotal, 0)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conservative estimate reflects typical settlement discount and litigation risk.
              Full quantum assumes all heads of claim are fully established and recoverable.
            </p>
          </div>
        </Card>
      )}

      {/* Settlement recorded */}
      {case_.settlement_amount && (
        <Card>
          <CardHeader title="Actual Settlement" />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">Settlement Amount</span>
            <span className="text-xl font-bold text-green-700">
              {case_.settlement_currency ?? 'USD'} {formatQuantity(case_.settlement_amount, 0)}
            </span>
          </div>
          {grandTotal > 0 && (
            <div className="text-xs text-slate-400 mt-1">
              Recovery rate: {((case_.settlement_amount / grandTotal) * 100).toFixed(0)}% of full quantum
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

function KpiCard({
  label, value, sub, highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: 'red' | 'amber'
}) {
  const valueColor = highlight === 'red'
    ? 'text-red-600'
    : highlight === 'amber'
    ? 'text-amber-600'
    : 'text-slate-900'
  return (
    <Card className="py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </Card>
  )
}

function LineTable({ lines }: { lines: LineItem[] }) {
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-slate-100">
        {lines.map((line, i) => (
          <tr
            key={i}
            className={line.isSubtotal ? 'bg-slate-50' : 'hover:bg-slate-50/50'}
          >
            <td className={`py-2.5 pr-4 ${line.isSubtotal ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>
              {line.label}
              {line.note && !line.isSubtotal && (
                <p className="text-xs text-slate-400 font-normal mt-0.5">{line.note}</p>
              )}
            </td>
            <td className="py-2.5 px-4 text-xs text-slate-500 hidden sm:table-cell">
              {line.basis}
            </td>
            <td className={`py-2.5 pl-4 text-right whitespace-nowrap ${line.isSubtotal ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
              USD {formatQuantity(line.amount, 0)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
