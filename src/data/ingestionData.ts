import type { IngestDocument, IngestField } from '@/lib/ingestion'

// Mutable registry for uploaded documents so useDocumentReview can find them
// even though they only exist in useIngestionInbox's local React state.
export const ingestDocRegistry = new Map<string, IngestDocument>()

// Helper to keep field definitions terse.
let fid = 0
function f(
  name: string, value: string, confidence: number,
  source: { page: number; section: string; snippet: string },
  target_kind: IngestField['target_kind'], target_field?: string, unit?: string,
): IngestField {
  fid += 1
  return {
    id: `if-${fid}`, name, value, unit, confidence, source,
    target_kind, target_field, status: 'unreviewed', original_value: value, applied: false,
  }
}

export const mockIngestDocuments: IngestDocument[] = [
  // 1 — BDN, ready, high confidence
  {
    id: 'doc-bdn-1',
    filename: 'BDN_PEN-RTM-2026-8821_Nordic_Star.pdf',
    doc_type: 'BDN', channel: 'upload', status: 'ready', extraction_status: 'complete',
    classification_confidence: 0.97,
    case_id: 'c1', case_reference: 'CPM-2026-0042',
    uploaded_by: 'Olivia Le Blond', uploaded_at: '2026-06-02T09:05:00Z',
    size_bytes: 284_320, page_count: 2,
    notes: 'Original BDN signed by vessel master and barge captain.',
    fields: [
      f('BDN Number', 'PEN-RTM-2026-8821', 0.98, { page: 1, section: 'Header block', snippet: 'BUNKER DELIVERY NOTE  No. PEN-RTM-2026-8821' }, 'case', 'bdn_number'),
      f('Vessel', 'MV Nordic Star', 0.96, { page: 1, section: 'Header block', snippet: 'Receiving Vessel: MV NORDIC STAR  IMO 9412345' }, 'case', 'vessel'),
      f('Fuel Grade', 'VLSFO', 0.95, { page: 1, section: 'Product block', snippet: 'Product: VLSFO RMG380  Max S 0.50%' }, 'case', 'fuel_grade'),
      f('BDN Quantity', '500.000', 0.99, { page: 1, section: 'Quantity block', snippet: 'Quantity delivered: 500.000 MT (in vacuum)' }, 'measurement', 'barge_quantity_mt', 'MT'),
      f('Density @ 15°C', '0.9823', 0.94, { page: 1, section: 'Quantity block', snippet: 'Density @15°C: 0.9823 kg/L' }, 'measurement', 'density_at_obs', 'kg/m³'),
      f('Temperature', '52.0', 0.9, { page: 1, section: 'Quantity block', snippet: 'Delivery temperature: 52.0 °C' }, 'measurement', 'temperature_c', '°C'),
      f('Delivery date', '2026-06-01', 0.93, { page: 1, section: 'Header block', snippet: 'Date of delivery: 01 JUN 2026' }, 'case', 'delivery_date'),
    ],
  },

  // 2 — Lab report, needs review (some low-confidence values)
  {
    id: 'doc-lab-1',
    filename: 'BV_Lab_Analysis_PacificHorizon_VLSFO.pdf',
    doc_type: 'Lab_Report', channel: 'upload', status: 'needs_review', extraction_status: 'partial',
    classification_confidence: 0.91,
    case_id: 'c2', case_reference: 'CPM-2026-0039',
    uploaded_by: 'Sofia Marchetti', uploaded_at: '2026-05-31T14:00:00Z',
    size_bytes: 412_500, page_count: 3,
    notes: 'Bureau Veritas — retained sample #SG-2026-44821.',
    fields: [
      f('Flash Point', '58', 0.97, { page: 2, section: 'Results table', snippet: 'Flash Point (PMCC)  58 °C   [min 60.0]' }, 'spec', 'Flash Point', '°C'),
      f('Aluminium + Silicon', '42', 0.95, { page: 2, section: 'Results table', snippet: 'Al + Si  42 mg/kg   [max 25]' }, 'spec', 'Aluminium + Silicon', 'mg/kg'),
      f('Sulphur Content', '0.48', 0.92, { page: 2, section: 'Results table', snippet: 'Sulphur  0.48 % m/m   [max 0.50]' }, 'spec', 'Sulphur Content', '% m/m'),
      f('Density @ 15°C', '0.9914', 0.66, { page: 2, section: 'Results table', snippet: 'Density @15C  0.99l4 kg/m3' }, 'spec', 'Density at 15°C', 'kg/m³'),
      f('Lab reference', 'SG-2026-44821', 0.58, { page: 1, section: 'Certificate header', snippet: 'Certificate / retained sample: SG-2O26-44821' }, 'spec', 'lab_reference'),
      f('Sample date', '2026-05-29', 0.74, { page: 1, section: 'Certificate header', snippet: 'Date sampled: 29 May 2026' }, 'spec', 'lab_date'),
    ],
  },

  // 3 — Survey report, processing (no fields yet)
  {
    id: 'doc-survey-1',
    filename: 'Joint_Bunker_Survey_Atlantic_Carrier_Fujairah.pdf',
    doc_type: 'Survey_Report', channel: 'upload', status: 'processing', extraction_status: 'processing',
    classification_confidence: 0.86,
    case_id: 'c3', case_reference: 'CPM-2026-0035',
    uploaded_by: 'Rajan Mehta', uploaded_at: '2026-06-14T07:40:00Z',
    size_bytes: 196_400, page_count: 4,
    fields: [],
  },

  // 4 — Forwarded email (supplier response), ready
  {
    id: 'doc-email-1',
    filename: 'FWD_Minerva_response_re_MFM_dispute.eml',
    doc_type: 'Email', channel: 'email', status: 'ready', extraction_status: 'complete',
    classification_confidence: 0.82,
    case_id: 'c3', case_reference: 'CPM-2026-0035',
    uploaded_by: 'Mailbox (ops@copemer.com)', uploaded_at: '2026-06-12T11:20:00Z',
    size_bytes: 38_900, page_count: 1,
    notes: 'Forwarded from supplier; body parsed from email content.',
    fields: [
      f('Sender', 'claims@minervabunkering.com', 0.95, { page: 1, section: 'Email headers', snippet: 'From: Claims <claims@minervabunkering.com>' }, 'draft', 'recipient_email'),
      f('Supplier position', 'MFM calibration valid; dispute rejected', 0.71, { page: 1, section: 'Email body', snippet: '…our MFM was calibrated 2026-03-15 and we therefore reject the shortage claim…' }, 'case', 'internal_notes'),
      f('Response deadline referenced', '2026-06-20', 0.69, { page: 1, section: 'Email body', snippet: '…we will revert with the barge ullage log by 20 June…' }, 'draft', 'response_deadline'),
    ],
  },

  // 5 — Vessel protest letter, ready
  {
    id: 'doc-protest-1',
    filename: 'LOP_Nordic_Star_Rotterdam_01062026.pdf',
    doc_type: 'Protest', channel: 'upload', status: 'ready', extraction_status: 'complete',
    classification_confidence: 0.9,
    case_id: 'c1', case_reference: 'CPM-2026-0042',
    uploaded_by: 'Olivia Le Blond', uploaded_at: '2026-06-02T10:30:00Z',
    size_bytes: 145_680, page_count: 1,
    fields: [
      f('Protest issued by', 'Master, MV Nordic Star', 0.93, { page: 1, section: 'Signature block', snippet: 'Issued by: Master, MV Nordic Star' }, 'case', 'none'),
      f('Quantity claimed received', '487.2', 0.88, { page: 1, section: 'Body', snippet: '…vessel established only 487.2 MT on board against BDN 500 MT…' }, 'measurement', 'vessel_quantity_mt', 'MT'),
      f('Protest time', '2026-06-01T17:30:00Z', 0.8, { page: 1, section: 'Body', snippet: 'Protest lodged at completion of bunkering, 1730 LT 01 Jun' }, 'case', 'none'),
    ],
  },

  // 6 — Delivery receipt, needs review
  {
    id: 'doc-receipt-1',
    filename: 'Delivery_receipt_Global_Trader_RTM.pdf',
    doc_type: 'Delivery_Receipt', channel: 'upload', status: 'needs_review', extraction_status: 'partial',
    classification_confidence: 0.78,
    case_id: 'c4', case_reference: 'CPM-2026-0031',
    uploaded_by: 'Olivia Le Blond', uploaded_at: '2026-06-05T19:55:00Z',
    size_bytes: 92_140, page_count: 1,
    fields: [
      f('Receipt number', 'RCT-RTM-0459', 0.84, { page: 1, section: 'Header', snippet: 'Receipt No: RCT-RTM-0459' }, 'case', 'none'),
      f('Quantity', '85.0', 0.62, { page: 1, section: 'Body', snippet: 'Qty: 85.O MT LSMGO (handwritten)' }, 'measurement', 'barge_quantity_mt', 'MT'),
      f('Counter-signature present', 'No', 0.55, { page: 1, section: 'Signature block', snippet: 'Receiver signature: [illegible / blank]' }, 'none'),
    ],
  },

  // 7 — Photo / scanned note, failed OCR (low quality)
  {
    id: 'doc-photo-1',
    filename: 'IMG_2284_barge_ullage_whiteboard.jpg',
    doc_type: 'Photo_Scan', channel: 'scan', status: 'failed', extraction_status: 'failed',
    classification_confidence: 0.7,
    case_id: 'c1', case_reference: 'CPM-2026-0042',
    uploaded_by: 'Rajan Mehta', uploaded_at: '2026-06-03T08:10:00Z',
    size_bytes: 2_640_000, page_count: 1,
    error: 'OCR confidence below threshold (image blur / glare). Manual transcription required.',
    fields: [],
  },
]

// Pre-populate registry with static mock documents so the lookup always works.
mockIngestDocuments.forEach((d) => ingestDocRegistry.set(d.id, d))
