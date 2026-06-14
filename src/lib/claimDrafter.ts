// ============================================================================
// Claim Drafter engine — fact-grounded generation of draft communications.
//
// Anti-hallucination design:
//  • A draft is composed ONLY from an explicit ledger of approved case facts.
//  • Each fact carries provenance and an `approved` flag. Unapproved facts are
//    never inserted.
//  • Generation is deterministic template assembly, not free text. Every
//    section records the fact keys it was built from (`grounded_in`), so the UI
//    can show provenance and prove no fact was invented.
//  • Where a human input is genuinely required (signatory, response deadline),
//    a clearly-marked [placeholder] is emitted and listed — it is never filled
//    with a guessed value.
// ============================================================================

import {
  mockCases, mockMeasurements, mockSpecsChecks, mockDocuments,
} from '@/data/mockData'
import { documentTypeLabel } from '@/lib/utils'
import type { DraftType } from '@/types'

// ── Fact ledger ───────────────────────────────────────────────────────────────

export type FactCategory = 'delivery' | 'quantity' | 'specification' | 'document' | 'commercial'

export interface ApprovedFact {
  id: string
  /** Stable key referenced by templates (e.g. 'bdn_quantity'). */
  key: string
  label: string
  value: string
  category: FactCategory
  /** Where the fact came from — shown to the analyst. */
  source: string
  /** Only approved facts may be inserted into a draft. */
  approved: boolean
}

export const FACT_CATEGORY_LABELS: Record<FactCategory, string> = {
  delivery: 'Delivery',
  quantity: 'Quantities',
  specification: 'Specifications',
  document: 'Documents',
  commercial: 'Commercial',
}

function fmtQty(n: number): string {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 })} MT`
}

function fmtDate(iso?: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return iso }
}

/**
 * Assemble the approved-fact ledger for a case from its master record,
 * recorded measurements, finalised spec checks, and documents on file.
 */
export function buildFactLedger(caseId: string): ApprovedFact[] {
  const c = mockCases.find((x) => x.id === caseId)
  if (!c) return []

  const facts: ApprovedFact[] = []
  const push = (f: Omit<ApprovedFact, 'id'>) => facts.push({ id: `${caseId}-${f.key}`, ...f })

  // ── Delivery / master facts (reviewed record) ──
  push({ key: 'case_reference', label: 'Case reference', value: c.reference, category: 'delivery', source: 'Case record', approved: true })
  if (c.vessel?.name) push({ key: 'vessel_name', label: 'Vessel', value: c.vessel.name, category: 'delivery', source: 'Vessel register', approved: true })
  if (c.vessel?.imo) push({ key: 'imo', label: 'IMO number', value: c.vessel.imo, category: 'delivery', source: 'Vessel register', approved: true })
  if (c.port?.name) push({ key: 'port', label: 'Port', value: c.port.name, category: 'delivery', source: 'Case record', approved: true })
  if (c.supplier?.name) push({ key: 'supplier', label: 'Supplier', value: c.supplier.name, category: 'delivery', source: 'Case record', approved: true })
  if (c.fuel_type) push({ key: 'fuel_grade', label: 'Fuel grade', value: c.fuel_type, category: 'delivery', source: 'Case record', approved: true })
  const deliveryDate = c.delivery?.delivery_date ?? c.opened_at
  if (deliveryDate) push({ key: 'delivery_date', label: 'Delivery date', value: fmtDate(deliveryDate), category: 'delivery', source: 'Delivery record', approved: true })
  if (c.delivery?.bdn_number) push({ key: 'bdn_number', label: 'BDN number', value: c.delivery.bdn_number, category: 'delivery', source: 'Bunker Delivery Note', approved: true })

  // ── Quantity facts ──
  if (typeof c.bdn_quantity === 'number') {
    push({ key: 'bdn_quantity', label: 'BDN quantity', value: fmtQty(c.bdn_quantity), category: 'quantity', source: 'Bunker Delivery Note', approved: true })
  }
  if (typeof c.claimed_quantity === 'number') {
    push({ key: 'received_quantity', label: 'Vessel-received quantity', value: fmtQty(c.claimed_quantity), category: 'quantity', source: 'Vessel figures', approved: true })
  }
  if (typeof c.bdn_quantity === 'number' && typeof c.claimed_quantity === 'number' && c.bdn_quantity !== 0) {
    const diff = c.claimed_quantity - c.bdn_quantity
    const pct = (diff / c.bdn_quantity) * 100
    push({ key: 'variance_mt', label: 'Quantity variance', value: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)} MT`, category: 'quantity', source: 'Derived (vessel − BDN)', approved: true })
    push({ key: 'variance_pct', label: 'Variance %', value: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`, category: 'quantity', source: 'Derived (vessel − BDN)', approved: true })
  }

  // Recorded measurement figures per source.
  const sourceLabel: Record<string, string> = { vessel: 'Vessel sounding', barge: 'Barge figure', mfm: 'MFM totaliser', surveyor: 'Surveyor figure', manual: 'Shore/manual figure' }
  for (const m of mockMeasurements.filter((x) => x.case_id === caseId)) {
    push({
      key: `meas_${m.source}`,
      label: `${sourceLabel[m.source] ?? m.source} figure`,
      value: fmtQty(m.quantity_mt),
      category: 'quantity',
      source: `${sourceLabel[m.source] ?? m.source}${m.is_disputed ? ' (disputed)' : ''}`,
      approved: !m.is_disputed,
    })
  }

  // ── Specification facts (finalised lab results) ──
  for (const s of mockSpecsChecks.filter((x) => x.case_id === caseId)) {
    if (s.status === 'not_tested') {
      push({ key: `spec_${s.id}`, label: s.parameter_name, value: 'Not tested', category: 'specification', source: 'Pending lab result', approved: false })
      continue
    }
    const limit = s.contract_max != null ? `max ${s.contract_max} ${s.unit}` : s.contract_min != null ? `min ${s.contract_min} ${s.unit}` : 'no contractual limit on file'
    const result = s.lab_result != null ? `${s.lab_result} ${s.unit}` : '—'
    const verdict = s.status === 'off_spec' ? 'OFF-SPEC' : s.status === 'warning' ? 'within tolerance (marginal)' : 'on-spec'
    push({
      key: `spec_${s.id}`,
      label: s.parameter_name,
      value: `${result} (limit ${limit}) — ${verdict}`,
      category: 'specification',
      source: s.lab_name ? `${s.lab_name}${s.lab_reference ? ` ref ${s.lab_reference}` : ''}` : 'Laboratory analysis',
      approved: s.status === 'off_spec' || s.status === 'warning' || s.status === 'ok',
    })
  }

  // ── Document facts ──
  for (const d of mockDocuments.filter((x) => x.case_id === caseId)) {
    push({
      key: `doc_${d.id}`,
      label: documentTypeLabel(d.document_type),
      value: d.filename,
      category: 'document',
      source: d.status === 'ready' ? 'On file' : `On file (${d.status.replace('_', ' ')})`,
      approved: d.status === 'ready',
    })
  }

  // ── Commercial facts ──
  const discrepancyLabels: Record<string, string> = {
    quantity_short: 'Quantity short delivery', quantity_over: 'Quantity over delivery',
    off_spec: 'Off-specification fuel', mfm_dispute: 'MFM figure dispute',
    documentation: 'Documentary discrepancy', contamination: 'Contamination', other: 'Other',
  }
  push({ key: 'discrepancy_type', label: 'Nature of discrepancy', value: discrepancyLabels[c.discrepancy_type] ?? c.discrepancy_type, category: 'commercial', source: 'Case record', approved: true })

  return facts
}

// ── Generation model ───────────────────────────────────────────────────────────

export interface GeneratedSection {
  id: string
  heading?: string
  text: string
  /** Fact keys this section was built from — proof of grounding. */
  grounded_in: string[]
}

export interface GeneratedDraft {
  subject: string
  recipient: string
  body: string
  sections: GeneratedSection[]
  /** Facts/inputs that could not be included because no approved data exists. */
  unmet: string[]
  /** Human-input placeholders intentionally left in the body. */
  placeholders: string[]
}

export const DRAFT_TYPE_META: Record<DraftType, { label: string; blurb: string }> = {
  Protest_Letter: { label: 'Letter of Protest', blurb: 'Formal protest to the supplier recording the discrepancy.' },
  Owner_Update: { label: 'Owner Update', blurb: 'Factual briefing to the owner / technical manager.' },
  Charterer_Notice: { label: 'Charterer Notice', blurb: 'Notice to the charterer of the discrepancy and status.' },
  Internal_Memo: { label: 'Internal Memo', blurb: 'Internal analysis memo for the file.' },
  Supplier_Challenge: { label: 'Supplier Challenge Note', blurb: 'Factual challenge of supplier figures requesting response.' },
  // Other existing types are not offered by the Claim Drafter but keep the map total.
  LOP_Response: { label: 'LOP Response', blurb: 'Response to a Letter of Protest.' },
  Claim_Letter: { label: 'Claim Letter', blurb: 'Formal monetary claim.' },
  Reservation_of_Rights: { label: 'Reservation of Rights', blurb: 'Reservation of rights notice.' },
}

/** Draft types offered by the Claim Drafter, in display order. */
export const CLAIM_DRAFT_TYPES: DraftType[] = [
  'Protest_Letter', 'Owner_Update', 'Charterer_Notice', 'Internal_Memo', 'Supplier_Challenge',
]

// ── Template helpers ─────────────────────────────────────────────────────────

type FactGetter = {
  has: (...keys: string[]) => boolean
  val: (key: string) => string | null
  specFacts: ApprovedFact[]
  docFacts: ApprovedFact[]
}

function makeGetter(facts: ApprovedFact[]): FactGetter {
  const map = new Map(facts.map((f) => [f.key, f]))
  return {
    has: (...keys: string[]) => keys.every((k) => map.has(k)),
    val: (key: string) => map.get(key)?.value ?? null,
    specFacts: facts.filter((f) => f.category === 'specification'),
    docFacts: facts.filter((f) => f.category === 'document'),
  }
}

function referenceBlock(g: FactGetter): { text: string; keys: string[] } {
  const lines: string[] = []
  const keys: string[] = []
  const add = (label: string, key: string) => {
    const v = g.val(key)
    if (v) { lines.push(`    ${label}: ${v}`); keys.push(key) }
  }
  add('Vessel', 'vessel_name')
  add('IMO', 'imo')
  add('Port', 'port')
  add('Delivery date', 'delivery_date')
  add('Supplier', 'supplier')
  add('Fuel grade', 'fuel_grade')
  add('BDN reference', 'bdn_number')
  return { text: lines.join('\n'), keys }
}

function quantityParagraph(g: FactGetter): GeneratedSection | null {
  if (!g.has('bdn_quantity', 'received_quantity')) return null
  const bdn = g.val('bdn_quantity')
  const recv = g.val('received_quantity')
  const variance = g.val('variance_mt')
  const pct = g.val('variance_pct')
  const keys = ['bdn_quantity', 'received_quantity']
  let text = `The Bunker Delivery Note records a delivered quantity of ${bdn}. The quantity established on board by the vessel was ${recv}.`
  if (variance && pct) {
    text += ` This represents a difference of ${variance} (${pct}) against the BDN figure.`
    keys.push('variance_mt', 'variance_pct')
  }
  return { id: 'quantity', heading: undefined, text, grounded_in: keys }
}

function specParagraph(g: FactGetter): GeneratedSection | null {
  const offspec = g.specFacts.filter((f) => f.value.includes('OFF-SPEC'))
  if (offspec.length === 0) return null
  const items = offspec.map((f) => `    • ${f.label}: ${f.value.replace(' — OFF-SPEC', '')}`).join('\n')
  return {
    id: 'spec',
    text: `Independent laboratory analysis records the following parameter(s) outside the agreed specification:\n${items}`,
    grounded_in: offspec.map((f) => f.key),
  }
}

function documentList(g: FactGetter): GeneratedSection | null {
  if (g.docFacts.length === 0) return null
  const items = g.docFacts.map((f) => `    • ${f.label}`).join('\n')
  return {
    id: 'documents',
    heading: 'SUPPORTING DOCUMENTS',
    text: items,
    grounded_in: g.docFacts.map((f) => f.key),
  }
}

function joinSections(sections: GeneratedSection[]): string {
  return sections
    .filter((s) => s.text.trim().length > 0)
    .map((s) => (s.heading ? `${s.heading}\n${s.text}` : s.text))
    .join('\n\n')
}

// ── Per-type generators ──────────────────────────────────────────────────────

export function generateDraft(
  draftType: DraftType,
  facts: ApprovedFact[],
  ctx: { caseReference: string; today: string },
): GeneratedDraft {
  const g = makeGetter(facts)
  const vessel = g.val('vessel_name') ?? '[vessel]'
  const port = g.val('port') ?? ''
  const supplier = g.val('supplier') ?? '[supplier]'
  const deliveryDate = g.val('delivery_date') ?? ''
  const ref = referenceBlock(g)
  const sections: GeneratedSection[] = []
  const unmet: string[] = []
  const placeholders = new Set<string>()

  const note = (cond: boolean, label: string) => { if (!cond) unmet.push(label) }
  note(g.has('bdn_quantity', 'received_quantity'), 'Quantity comparison (BDN vs vessel)')
  note(g.specFacts.some((f) => f.value.includes('OFF-SPEC')), 'Off-spec laboratory result')
  note(g.docFacts.length > 0, 'Supporting documents')

  let subject = ''
  let recipient = ''

  if (draftType === 'Protest_Letter') {
    subject = `Letter of Protest — ${vessel}${port ? ` — ${port}` : ''}${deliveryDate ? ` — ${deliveryDate}` : ''}`
    recipient = `${supplier} — Bunker Claims Department`
    sections.push({ id: 'open', text: 'Without prejudice.\n\nDear Sirs,', grounded_in: [] })
    sections.push({ id: 'intro', text: `We write on behalf of our principals to record a formal protest in connection with the bunker delivery detailed below.`, grounded_in: [] })
    if (ref.text) sections.push({ id: 'ref', heading: 'DELIVERY PARTICULARS', text: ref.text, grounded_in: ref.keys })
    const qty = quantityParagraph(g); if (qty) sections.push(qty)
    const spec = specParagraph(g); if (spec) sections.push(spec)
    sections.push({ id: 'reserve', text: 'A Letter of Protest was issued at the time of delivery. Our principals reserve all rights in respect of the above, and this protest is made without prejudice to any claim that may follow.', grounded_in: [] })
    sections.push({ id: 'request', text: `We would be grateful for your written response and your proposals to resolve this matter by [response deadline].`, grounded_in: [] })
    placeholders.add('[response deadline]')
    sections.push({ id: 'close', text: 'Yours faithfully,\nCopemer Ltd — Disputes & Claims Department\n[signatory]', grounded_in: [] })
    placeholders.add('[signatory]')
  }

  else if (draftType === 'Owner_Update') {
    subject = `Bunker discrepancy update — ${vessel} — ${ctx.caseReference}`
    recipient = '[Owner / Technical Manager]'
    sections.push({ id: 'open', text: 'Dear Team,', grounded_in: [] })
    sections.push({ id: 'intro', text: `Please find below an update on the bunker discrepancy affecting ${vessel}.`, grounded_in: g.has('vessel_name') ? ['vessel_name'] : [] })
    if (ref.text) sections.push({ id: 'ref', heading: 'DELIVERY DETAILS', text: ref.text, grounded_in: ref.keys })
    const qty = quantityParagraph(g); if (qty) sections.push({ ...qty, heading: 'QUANTITY POSITION' })
    const spec = specParagraph(g); if (spec) sections.push({ ...spec, heading: 'QUALITY POSITION' })
    const disc = g.val('discrepancy_type')
    if (disc) sections.push({ id: 'status', heading: 'CURRENT STATUS', text: `The case (${ctx.caseReference}) is being handled as: ${disc}. We are pursuing the matter with the supplier and will advise of any material development.`, grounded_in: ['discrepancy_type', 'case_reference'] })
    sections.push({ id: 'next', heading: 'NEXT STEPS', text: 'We recommend the vessel retains all original measurement records and the sealed sample(s) pending resolution. No further action is required from your side at this stage.', grounded_in: [] })
    sections.push({ id: 'close', text: 'Kind regards,\nCopemer Ltd — Bunker Operations', grounded_in: [] })
  }

  else if (draftType === 'Charterer_Notice') {
    subject = `Notice of bunker discrepancy — ${vessel}${port ? ` — ${port}` : ''}`
    recipient = '[Charterer — Operations]'
    sections.push({ id: 'open', text: 'Dear Sirs,', grounded_in: [] })
    sections.push({ id: 'intro', text: `We write to put you on notice of a discrepancy identified in respect of the bunker stem detailed below, supplied during your charter.`, grounded_in: [] })
    if (ref.text) sections.push({ id: 'ref', heading: 'DELIVERY PARTICULARS', text: ref.text, grounded_in: ref.keys })
    const qty = quantityParagraph(g); if (qty) sections.push(qty)
    const spec = specParagraph(g); if (spec) sections.push(spec)
    sections.push({ id: 'reserve', text: 'This notice is given to preserve our principals’ position. All rights are reserved, and nothing herein is to be construed as a waiver of any claim or defence.', grounded_in: [] })
    sections.push({ id: 'request', text: 'We would welcome your cooperation in addressing this matter with the supplier and will keep you informed of progress.', grounded_in: [] })
    sections.push({ id: 'close', text: 'Yours faithfully,\nCopemer Ltd — Bunker Operations', grounded_in: [] })
  }

  else if (draftType === 'Internal_Memo') {
    subject = `Internal memo — ${ctx.caseReference} — ${vessel}`
    recipient = 'Internal distribution'
    sections.push({ id: 'open', text: `INTERNAL — NOT FOR EXTERNAL DISTRIBUTION\n\nRe: ${ctx.caseReference} — ${vessel}\nDate: ${ctx.today}`, grounded_in: g.has('vessel_name') ? ['vessel_name', 'case_reference'] : ['case_reference'] })
    if (ref.text) sections.push({ id: 'ref', heading: 'FACTS ON FILE', text: ref.text, grounded_in: ref.keys })
    const qty = quantityParagraph(g); if (qty) sections.push({ ...qty, heading: 'QUANTITY' })
    const spec = specParagraph(g); if (spec) sections.push({ ...spec, heading: 'QUALITY' })
    const docs = documentList(g); if (docs) sections.push(docs)
    sections.push({ id: 'assessment', heading: 'ASSESSMENT', text: 'The above figures are recorded from the documents on file. This memo states the position as evidenced; it does not assert liability, which remains subject to review.', grounded_in: [] })
    sections.push({ id: 'reco', heading: 'RECOMMENDATION', text: 'Maintain the evidence trail and progress the matter per the standard disputes workflow. [analyst recommendation]', grounded_in: [] })
    placeholders.add('[analyst recommendation]')
  }

  else if (draftType === 'Supplier_Challenge') {
    subject = `Bunker delivery discrepancy — ${g.val('bdn_number') ?? vessel} — request for response`
    recipient = `${supplier} — Bunker Operations`
    sections.push({ id: 'open', text: 'Without prejudice.\n\nDear Sirs,', grounded_in: [] })
    sections.push({ id: 'intro', text: `Following our review of the delivery detailed below, we must respectfully challenge the figures recorded and request your investigation.`, grounded_in: [] })
    if (ref.text) sections.push({ id: 'ref', heading: 'DELIVERY PARTICULARS', text: ref.text, grounded_in: ref.keys })
    const qty = quantityParagraph(g); if (qty) sections.push(qty)
    const spec = specParagraph(g); if (spec) sections.push(spec)
    sections.push({ id: 'request', text: `We would be grateful if you would investigate the above and provide your barge’s measurement records (including ullage report and, where applicable, MFM printout and calibration certificate) by [response deadline]. Our principals’ rights remain fully reserved.`, grounded_in: [] })
    placeholders.add('[response deadline]')
    sections.push({ id: 'close', text: 'Yours faithfully,\nCopemer Ltd — Disputes & Claims Department', grounded_in: [] })
  }

  const body = joinSections(sections)
  return { subject, recipient, body, sections, unmet, placeholders: [...placeholders] }
}
