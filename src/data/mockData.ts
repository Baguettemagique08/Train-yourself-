import type {
  User, Company, Contact, Vessel, Port, Supplier, Delivery, Case, Document,
  Measurement, SpecsCheck, Draft, Activity, FuelReadinessRecord, Threshold, Template
} from '@/types'

// ── Users ────────────────────────────────────────────────────────────────────

export const mockUsers: User[] = [
  {
    id: 'u1',
    email: 'james.hargreaves@copemer.com',
    full_name: 'James Hargreaves',
    role: 'senior_broker',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'u2',
    email: 'sophie.lindqvist@copemer.com',
    full_name: 'Sophie Lindqvist',
    role: 'broker',
    created_at: '2024-02-15T08:00:00Z',
    updated_at: '2024-02-15T08:00:00Z',
  },
  {
    id: 'u3',
    email: 'rajan.mehta@copemer.com',
    full_name: 'Rajan Mehta',
    role: 'analyst',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: 'u4',
    email: 'olivia.leblond@copemer.com',
    full_name: 'Olivia Leblond',
    role: 'admin',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
  },
]

// ── Companies ────────────────────────────────────────────────────────────────

export const mockCompanies: Company[] = [
  {
    id: 'co1',
    name: 'Nordic Tankers A/S',
    type: 'shipowner',
    country: 'Denmark',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'co2',
    name: 'Pacific Chartering Ltd',
    type: 'charterer',
    country: 'Singapore',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'co3',
    name: 'Atlantic Bulk Carriers',
    type: 'shipowner',
    country: 'Greece',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
]

// ── Vessels ──────────────────────────────────────────────────────────────────

export const mockVessels: Vessel[] = [
  {
    id: 'v1',
    name: 'MV Nordic Star',
    imo: '9412345',
    flag: 'Marshall Islands',
    type: 'Chemical Tanker',
    dwt: 37500,
    owner_id: 'co1',
    owner: mockCompanies[0],
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'v2',
    name: 'MV Pacific Horizon',
    imo: '9523671',
    flag: 'Panama',
    type: 'Bulk Carrier',
    dwt: 82000,
    owner_id: 'co2',
    owner: mockCompanies[1],
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'v3',
    name: 'MV Atlantic Carrier',
    imo: '9634789',
    flag: 'Liberia',
    type: 'General Cargo',
    dwt: 28000,
    owner_id: 'co3',
    owner: mockCompanies[2],
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'v4',
    name: 'MV Global Trader',
    imo: '9745902',
    flag: 'Bahamas',
    type: 'Container Feeder',
    dwt: 14500,
    owner_id: 'co1',
    owner: mockCompanies[0],
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
]

// ── Ports ─────────────────────────────────────────────────────────────────────

export const mockPorts: Port[] = [
  {
    id: 'p1',
    name: 'Rotterdam',
    country: 'Netherlands',
    unlocode: 'NLRTM',
    timezone: 'Europe/Amsterdam',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'p2',
    name: 'Singapore',
    country: 'Singapore',
    unlocode: 'SGSIN',
    timezone: 'Asia/Singapore',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'p3',
    name: 'Fujairah',
    country: 'UAE',
    unlocode: 'AEFJR',
    timezone: 'Asia/Dubai',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
]

// ── Suppliers ─────────────────────────────────────────────────────────────────

export const mockSuppliers: Supplier[] = [
  {
    id: 's1',
    name: 'Peninsula Petroleum',
    country: 'Gibraltar',
    contact_email: 'ops@peninsula.com',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 's2',
    name: 'Chemoil Energy',
    country: 'Singapore',
    contact_email: 'bunkers@chemoil.com',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 's3',
    name: 'Minerva Bunkering',
    country: 'Greece',
    contact_email: 'ops@minervabunkering.com',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
]

// ── Cases ─────────────────────────────────────────────────────────────────────

export const mockCases: Case[] = [
  {
    id: 'c1',
    reference: 'CPM-2026-0042',
    vessel_id: 'v1',
    vessel: mockVessels[0],
    port_id: 'p1',
    port: mockPorts[0],
    supplier_id: 's1',
    supplier: mockSuppliers[0],
    fuel_type: 'VLSFO',
    discrepancy_type: 'quantity_short',
    claimed_quantity: 487.2,
    bdn_quantity: 500.0,
    status: 'escalated',
    priority: 'urgent',
    assigned_to: 'u1',
    assigned_user: mockUsers[0],
    description: 'Vessel figures indicate 487.2 MT received against BDN quantity of 500.0 MT. MFM log records 495.1 MT. Discrepancy of 12.8 MT (2.56%) requires formal investigation and LOP issuance.',
    delivery_date: '2026-06-01T14:30:00Z',
    created_at: '2026-06-02T09:00:00Z',
    updated_at: '2026-06-10T14:22:00Z',
  },
  {
    id: 'c2',
    reference: 'CPM-2026-0039',
    vessel_id: 'v2',
    vessel: mockVessels[1],
    port_id: 'p2',
    port: mockPorts[1],
    supplier_id: 's2',
    supplier: mockSuppliers[1],
    fuel_type: 'VLSFO',
    discrepancy_type: 'off_spec',
    claimed_quantity: 1200.0,
    bdn_quantity: 1200.0,
    status: 'under_review',
    priority: 'high',
    assigned_to: 'u2',
    assigned_user: mockUsers[1],
    description: 'Lab analysis of delivered VLSFO shows flash point of 58°C against minimum specification of 60°C. Aluminium + Silicon at 42 mg/kg exceeds 25 mg/kg limit. Fuel may cause engine damage.',
    delivery_date: '2026-05-28T08:00:00Z',
    created_at: '2026-05-30T10:15:00Z',
    updated_at: '2026-06-09T16:45:00Z',
  },
  {
    id: 'c3',
    reference: 'CPM-2026-0035',
    vessel_id: 'v3',
    vessel: mockVessels[2],
    port_id: 'p3',
    port: mockPorts[2],
    supplier_id: 's3',
    supplier: mockSuppliers[2],
    fuel_type: 'MGO',
    discrepancy_type: 'mfm_dispute',
    claimed_quantity: 320.5,
    bdn_quantity: 342.0,
    status: 'open',
    priority: 'high',
    assigned_to: 'u1',
    assigned_user: mockUsers[0],
    description: 'Mass flow meter (MFM) reading of 320.5 MT contradicts barge sounding figure of 342.0 MT. Supplier disputes MFM calibration. Shore tank ullage confirms approximately 325 MT supplied.',
    delivery_date: '2026-05-20T22:00:00Z',
    created_at: '2026-05-22T08:30:00Z',
    updated_at: '2026-06-08T11:00:00Z',
  },
  {
    id: 'c4',
    reference: 'CPM-2026-0031',
    vessel_id: 'v4',
    vessel: mockVessels[3],
    port_id: 'p1',
    port: mockPorts[0],
    supplier_id: 's1',
    supplier: mockSuppliers[0],
    fuel_type: 'LSMGO',
    discrepancy_type: 'quantity_short',
    claimed_quantity: 78.3,
    bdn_quantity: 85.0,
    status: 'pending_response',
    priority: 'normal',
    assigned_to: 'u2',
    assigned_user: mockUsers[1],
    description: 'Vessel ullage measurement post-bunkering indicates 78.3 MT received. BDN states 85.0 MT. Shortage of 6.7 MT (7.9%). Barge ullage report pending from supplier.',
    delivery_date: '2026-05-15T10:00:00Z',
    created_at: '2026-05-16T09:00:00Z',
    updated_at: '2026-06-05T13:30:00Z',
  },
  {
    id: 'c5',
    reference: 'CPM-2026-0028',
    vessel_id: 'v1',
    vessel: mockVessels[0],
    port_id: 'p2',
    port: mockPorts[1],
    supplier_id: 's2',
    supplier: mockSuppliers[1],
    fuel_type: 'VLSFO',
    discrepancy_type: 'off_spec',
    claimed_quantity: 750.0,
    bdn_quantity: 750.0,
    status: 'resolved',
    priority: 'normal',
    assigned_to: 'u3',
    assigned_user: mockUsers[2],
    description: 'Sulphur content measured at 0.52% m/m against 0.50% maximum limit. Supplier acknowledged out-of-spec delivery. Claim settled by credit note of USD 18,500.',
    delivery_date: '2026-04-30T16:00:00Z',
    created_at: '2026-05-02T10:00:00Z',
    updated_at: '2026-05-28T09:00:00Z',
  },
  {
    id: 'c6',
    reference: 'CPM-2026-0024',
    vessel_id: 'v2',
    vessel: mockVessels[1],
    port_id: 'p3',
    port: mockPorts[2],
    supplier_id: 's3',
    supplier: mockSuppliers[2],
    fuel_type: 'HSFO',
    discrepancy_type: 'quantity_short',
    claimed_quantity: 1850.0,
    bdn_quantity: 1900.0,
    status: 'closed',
    priority: 'normal',
    assigned_to: 'u1',
    assigned_user: mockUsers[0],
    description: 'Quantity short of 50 MT resolved by supplementary delivery. Case closed following confirmation of corrected BDN.',
    delivery_date: '2026-04-10T20:00:00Z',
    created_at: '2026-04-12T08:00:00Z',
    updated_at: '2026-04-25T17:00:00Z',
  },
]

// ── Documents ─────────────────────────────────────────────────────────────────

export const mockDocuments: Document[] = [
  {
    id: 'd1',
    case_id: 'c1',
    type: 'BDN',
    filename: 'BDN_CPM2026_0042_Peninsula_Rotterdam.pdf',
    file_size: 284320,
    status: 'ready',
    uploaded_by: 'u1',
    uploader: mockUsers[0],
    notes: 'Original BDN signed by vessel master and barge captain',
    extracted_fields: [
      { id: 'ef1', document_id: 'd1', field_name: 'BDN Number', field_value: 'PEN-RTM-2026-8821', confidence: 0.97, needs_review: false, created_at: '2026-06-02T09:05:00Z', updated_at: '2026-06-02T09:05:00Z' },
      { id: 'ef2', document_id: 'd1', field_name: 'Gross Quantity', field_value: '500.000 MT', confidence: 0.99, needs_review: false, created_at: '2026-06-02T09:05:00Z', updated_at: '2026-06-02T09:05:00Z' },
      { id: 'ef3', document_id: 'd1', field_name: 'Net Quantity', field_value: '498.750 MT', confidence: 0.98, needs_review: false, created_at: '2026-06-02T09:05:00Z', updated_at: '2026-06-02T09:05:00Z' },
      { id: 'ef4', document_id: 'd1', field_name: 'Density at 15°C', field_value: '0.9823 kg/m³', confidence: 0.96, needs_review: false, created_at: '2026-06-02T09:05:00Z', updated_at: '2026-06-02T09:05:00Z' },
    ],
    created_at: '2026-06-02T09:05:00Z',
    updated_at: '2026-06-02T09:05:00Z',
  },
  {
    id: 'd2',
    case_id: 'c1',
    type: 'LOP',
    filename: 'LOP_Nordic_Star_Rotterdam_01062026.pdf',
    file_size: 145680,
    status: 'ready',
    uploaded_by: 'u1',
    uploader: mockUsers[0],
    notes: 'Letter of Protest signed by vessel master on completion of bunkering',
    extracted_fields: [],
    created_at: '2026-06-02T10:30:00Z',
    updated_at: '2026-06-02T10:30:00Z',
  },
  {
    id: 'd3',
    case_id: 'c1',
    type: 'Ullage_Report',
    filename: 'Ullage_Report_Nordic_Star_011.pdf',
    file_size: 98240,
    status: 'needs_review',
    uploaded_by: 'u1',
    uploader: mockUsers[0],
    notes: 'Pre and post bunkering ullage measurements — witness signature missing',
    extracted_fields: [
      { id: 'ef5', document_id: 'd3', field_name: 'Pre-bunkering ROB', field_value: '42.3 MT', confidence: 0.85, needs_review: true, created_at: '2026-06-03T08:00:00Z', updated_at: '2026-06-03T08:00:00Z' },
      { id: 'ef6', document_id: 'd3', field_name: 'Post-bunkering ROB', field_value: '529.5 MT', confidence: 0.87, needs_review: true, created_at: '2026-06-03T08:00:00Z', updated_at: '2026-06-03T08:00:00Z' },
    ],
    created_at: '2026-06-03T08:00:00Z',
    updated_at: '2026-06-03T08:00:00Z',
  },
  {
    id: 'd4',
    case_id: 'c2',
    type: 'Lab_Report',
    filename: 'Lab_Analysis_PacificHorizon_VLSFO_Singapore.pdf',
    file_size: 412500,
    status: 'ready',
    uploaded_by: 'u2',
    uploader: mockUsers[1],
    notes: 'Bureau Veritas independent lab analysis — retained sample #SG-2026-44821',
    extracted_fields: [
      { id: 'ef7', document_id: 'd4', field_name: 'Flash Point', field_value: '58°C', confidence: 0.99, needs_review: false, created_at: '2026-05-31T14:00:00Z', updated_at: '2026-05-31T14:00:00Z' },
      { id: 'ef8', document_id: 'd4', field_name: 'Aluminium + Silicon', field_value: '42 mg/kg', confidence: 0.99, needs_review: false, created_at: '2026-05-31T14:00:00Z', updated_at: '2026-05-31T14:00:00Z' },
      { id: 'ef9', document_id: 'd4', field_name: 'Sulphur Content', field_value: '0.48% m/m', confidence: 0.99, needs_review: false, created_at: '2026-05-31T14:00:00Z', updated_at: '2026-05-31T14:00:00Z' },
      { id: 'ef10', document_id: 'd4', field_name: 'Density at 15°C', field_value: '0.9914 kg/m³', confidence: 0.98, needs_review: false, created_at: '2026-05-31T14:00:00Z', updated_at: '2026-05-31T14:00:00Z' },
    ],
    created_at: '2026-05-31T14:00:00Z',
    updated_at: '2026-05-31T14:00:00Z',
  },
]

// ── Measurements ──────────────────────────────────────────────────────────────

export const mockMeasurements: Measurement[] = [
  // Case c1 — Quantity short
  {
    id: 'm1',
    case_id: 'c1',
    source: 'vessel',
    fuel_type: 'VLSFO',
    gross_quantity: 490.1,
    net_quantity: 487.2,
    temperature: 51.2,
    density: 0.9823,
    vcf: 0.9943,
    trim_correction: -1.5,
    measured_by: 'Chief Officer',
    measured_at: '2026-06-01T17:00:00Z',
    notes: 'Post-bunkering tank measurement, all tanks sounded by chief officer',
    created_at: '2026-06-02T09:00:00Z',
    updated_at: '2026-06-02T09:00:00Z',
  },
  {
    id: 'm2',
    case_id: 'c1',
    source: 'barge',
    fuel_type: 'VLSFO',
    gross_quantity: 502.4,
    net_quantity: 500.0,
    temperature: 52.0,
    density: 0.9820,
    vcf: 0.9941,
    trim_correction: 0,
    measured_by: 'Barge Master',
    measured_at: '2026-06-01T17:15:00Z',
    notes: 'Barge departure soundings per BDN',
    created_at: '2026-06-02T09:00:00Z',
    updated_at: '2026-06-02T09:00:00Z',
  },
  {
    id: 'm3',
    case_id: 'c1',
    source: 'mfm',
    fuel_type: 'VLSFO',
    gross_quantity: 497.3,
    net_quantity: 495.1,
    temperature: 51.6,
    density: 0.9821,
    measured_by: 'MFM System (Auto)',
    measured_at: '2026-06-01T17:10:00Z',
    notes: 'MFM serial #PEN-MFM-0021, last calibrated 2026-03-15',
    created_at: '2026-06-02T09:00:00Z',
    updated_at: '2026-06-02T09:00:00Z',
  },
  // Case c3 — MFM dispute
  {
    id: 'm4',
    case_id: 'c3',
    source: 'mfm',
    fuel_type: 'MGO',
    gross_quantity: 321.8,
    net_quantity: 320.5,
    temperature: 28.5,
    density: 0.8342,
    measured_by: 'MFM System (Auto)',
    measured_at: '2026-05-21T01:30:00Z',
    notes: 'MFM #MIN-FUJ-0088, calibration certificate valid until 2026-12-01',
    created_at: '2026-05-22T08:30:00Z',
    updated_at: '2026-05-22T08:30:00Z',
  },
  {
    id: 'm5',
    case_id: 'c3',
    source: 'barge',
    fuel_type: 'MGO',
    gross_quantity: 343.2,
    net_quantity: 342.0,
    temperature: 28.0,
    density: 0.8345,
    measured_by: 'Barge Master',
    measured_at: '2026-05-21T01:45:00Z',
    notes: 'Barge soundings — departure figures from barge ullage report',
    created_at: '2026-05-22T08:30:00Z',
    updated_at: '2026-05-22T08:30:00Z',
  },
  {
    id: 'm6',
    case_id: 'c3',
    source: 'shore',
    fuel_type: 'MGO',
    gross_quantity: 326.5,
    net_quantity: 325.1,
    temperature: 28.2,
    density: 0.8343,
    measured_by: 'Shore Terminal Inspector',
    measured_at: '2026-05-20T22:30:00Z',
    notes: 'Shore tank before/after comparison, Fujairah Oil Terminal #3',
    created_at: '2026-05-22T08:30:00Z',
    updated_at: '2026-05-22T08:30:00Z',
  },
]

// ── Specs Checks ─────────────────────────────────────────────────────────────

export const mockSpecsChecks: SpecsCheck[] = [
  // Case c2 — Off-spec VLSFO
  { id: 'sc1', case_id: 'c2', parameter: 'Density at 15°C', unit: 'kg/m³', bdn_value: 0.9912, contract_min: null, contract_max: 0.9910, lab_result: 0.9914, status: 'warning', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc2', case_id: 'c2', parameter: 'Kinematic Viscosity at 50°C', unit: 'cSt', bdn_value: 380.2, contract_min: null, contract_max: 380.0, lab_result: 375.4, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc3', case_id: 'c2', parameter: 'Flash Point', unit: '°C', bdn_value: 63.0, contract_min: 60.0, contract_max: null, lab_result: 58.0, status: 'off_spec', notes: 'Flash point below minimum 60°C — ISO 8217 requirement violated', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc4', case_id: 'c2', parameter: 'Sulphur Content', unit: '% m/m', bdn_value: 0.48, contract_min: null, contract_max: 0.50, lab_result: 0.48, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc5', case_id: 'c2', parameter: 'Water Content', unit: '% v/v', bdn_value: null, contract_min: null, contract_max: 0.50, lab_result: 0.12, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc6', case_id: 'c2', parameter: 'Ash Content', unit: '% m/m', bdn_value: null, contract_min: null, contract_max: 0.10, lab_result: 0.08, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc7', case_id: 'c2', parameter: 'CCAI', unit: '', bdn_value: null, contract_min: null, contract_max: 870.0, lab_result: 858.0, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc8', case_id: 'c2', parameter: 'Aluminium + Silicon', unit: 'mg/kg', bdn_value: null, contract_min: null, contract_max: 25.0, lab_result: 42.0, status: 'off_spec', notes: 'Al+Si exceeds catalytic fines limit — potential engine abrasion risk', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc9', case_id: 'c2', parameter: 'Vanadium', unit: 'mg/kg', bdn_value: null, contract_min: null, contract_max: 150.0, lab_result: 112.0, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
]

// ── Drafts ───────────────────────────────────────────────────────────────────

export const mockDrafts: Draft[] = [
  {
    id: 'dr1',
    case_id: 'c1',
    type: 'LOP_Response',
    title: 'LOP Response — MV Nordic Star — Rotterdam 01 June 2026',
    content: `Without Prejudice

To: Peninsula Petroleum Ltd
Attn: Bunker Operations Department

Re: MV Nordic Star / IMO 9412345
    Delivery Date: 01 June 2026, Port of Rotterdam
    BDN Reference: PEN-RTM-2026-8821
    Fuel Grade: VLSFO

Dear Sirs,

We write in response to your Letter of Protest dated 01 June 2026 and wish to record our position as follows.

Our client's vessel, MV Nordic Star, received bunkers from your barge in Rotterdam on 01 June 2026. Post-bunkering ullage measurements conducted by the Chief Officer indicate a net quantity of 487.2 MT received against your stated BDN quantity of 500.0 MT. The independent mass flow meter recorded 495.1 MT.

The discrepancy of 12.8 MT (2.56% of BDN quantity) is outside the commercially acceptable tolerance of ±0.5% and requires formal investigation.

We hereby formally request:
1. Full barge ullage report (departure soundings) duly signed
2. MFM calibration certificate (serial #PEN-MFM-0021)
3. Shore tank reconciliation figures for the relevant parcel

All our client's rights remain fully reserved.

Yours faithfully,
Copemer Ltd — Disputes & Claims Department`,
    status: 'under_review',
    version: 2,
    created_by: 'u1',
    creator: mockUsers[0],
    notes: 'v2 — updated MFM figure following receipt of barge log',
    created_at: '2026-06-03T10:00:00Z',
    updated_at: '2026-06-05T14:30:00Z',
  },
  {
    id: 'dr2',
    case_id: 'c2',
    type: 'Owner_Update',
    title: 'Owner Update — MV Pacific Horizon — Off-Spec VLSFO',
    content: `CONFIDENTIAL — OWNER COMMUNICATION

To: Nordic Tankers A/S — Technical Department
From: Copemer Ltd — Bunker Operations
Date: 30 May 2026
Re: MV Pacific Horizon — Off-Spec Bunker Delivery — Singapore

Dear Team,

Please be advised of the following bunker quality issue affecting MV Pacific Horizon.

DELIVERY DETAILS
Vessel: MV Pacific Horizon (IMO 9523671)
Port: Singapore
Delivery Date: 28 May 2026
Supplier: Chemoil Energy
Quantity: 1,200 MT VLSFO
BDN Reference: CHE-SIN-2026-4492

QUALITY FINDINGS
Bureau Veritas laboratory analysis of the retained sample (Ref: SG-2026-44821) has identified the following non-conformances against ISO 8217:2017 RMG380:

1. Flash Point: 58°C (Minimum: 60°C) — NON-CONFORMING
2. Aluminium + Silicon: 42 mg/kg (Maximum: 25 mg/kg) — NON-CONFORMING

The flash point result presents a statutory safety concern. The elevated Al+Si content poses a risk of accelerated wear to fuel injection equipment and cylinder liners.

RECOMMENDED IMMEDIATE ACTIONS
• Cease use of this fuel in main engine until technical assessment completed
• Purge fuel from service tanks where operationally feasible
• Ensure fuel treatment system (separator) is operating at maximum efficiency
• Retain all fuel samples

We are pursuing a formal off-spec claim against the supplier. Estimated exposure: USD 85,000–120,000.

Please confirm your instructions.

Copemer Ltd`,
    status: 'approved',
    version: 1,
    created_by: 'u2',
    creator: mockUsers[1],
    sent_at: '2026-05-31T08:00:00Z',
    sent_to: ['technical@nordictankers.dk'],
    created_at: '2026-05-30T16:00:00Z',
    updated_at: '2026-05-31T08:00:00Z',
  },
  {
    id: 'dr3',
    case_id: 'c3',
    type: 'Internal_Memo',
    title: 'Internal Memo — MFM Dispute Analysis — MV Atlantic Carrier',
    content: `INTERNAL — NOT FOR EXTERNAL DISTRIBUTION

Subject: MFM Dispute — MV Atlantic Carrier / Minerva Bunkering — Fujairah
Prepared by: Rajan Mehta (Analyst)
Date: 22 May 2026

SUMMARY OF DISPUTE
Three measurement sources show significant divergence:
• MFM: 320.5 MT
• Barge soundings: 342.0 MT
• Shore tank ullage: 325.1 MT

ANALYSIS
The spread between barge soundings and the other two sources (MFM and shore tank) suggests the barge figure is likely overstated. Both MFM and shore tank independently indicate approximately 320–325 MT, creating a consistent picture.

The supplier has challenged MFM calibration; however, MFM calibration certificate is current (valid 2026-12-01) and the MFM reading is consistent with the shore tank difference of 325 MT vs. pre/post comparison.

RECOMMENDATION
• Accept MFM figure as primary reference quantity
• Raise formal deduction claim for 21.5 MT (342.0 – 320.5) against BDN
• Request barge port log and consumption records to further challenge barge figures
• Estimated claim value at current MGO price (~USD 650/MT): approx. USD 13,975

Next steps: Sophie to draft claim letter to Minerva.`,
    status: 'draft',
    version: 1,
    created_by: 'u3',
    creator: mockUsers[2],
    created_at: '2026-05-22T14:00:00Z',
    updated_at: '2026-05-22T14:00:00Z',
  },
]

// ── Activities ────────────────────────────────────────────────────────────────

export const mockActivities: Activity[] = [
  { id: 'a1', case_id: 'c1', user_id: 'u1', user: mockUsers[0], action: 'case_created', description: 'Case CPM-2026-0042 created following post-bunkering ullage discrepancy.', created_at: '2026-06-02T09:00:00Z' },
  { id: 'a2', case_id: 'c1', user_id: 'u1', user: mockUsers[0], action: 'document_uploaded', description: 'Uploaded BDN (PEN-RTM-2026-8821) and Letter of Protest.', created_at: '2026-06-02T09:30:00Z' },
  { id: 'a3', case_id: 'c1', user_id: 'u1', user: mockUsers[0], action: 'measurements_entered', description: 'Vessel, barge, and MFM figures entered. Discrepancy flagged: 12.8 MT / 2.56%.', created_at: '2026-06-02T10:15:00Z' },
  { id: 'a4', case_id: 'c1', user_id: 'u1', user: mockUsers[0], action: 'draft_created', description: 'LOP Response draft created (v1).', created_at: '2026-06-03T10:00:00Z' },
  { id: 'a5', case_id: 'c1', user_id: 'u4', user: mockUsers[3], action: 'status_changed', description: 'Status escalated to Urgent following supplier non-response.', created_at: '2026-06-05T11:00:00Z' },
  { id: 'a6', case_id: 'c1', user_id: 'u1', user: mockUsers[0], action: 'draft_updated', description: 'LOP Response updated to v2 following receipt of barge ullage log.', created_at: '2026-06-05T14:30:00Z' },
  { id: 'a7', case_id: 'c1', user_id: 'u4', user: mockUsers[3], action: 'document_uploaded', description: 'Ullage report uploaded — pending review (witness signature missing).', created_at: '2026-06-06T09:00:00Z' },
  { id: 'a8', case_id: 'c1', user_id: 'u1', user: mockUsers[0], action: 'note_added', description: 'Supplier requested 5 working days to investigate. Chasing barge ullage report.', created_at: '2026-06-10T14:22:00Z' },
]

// ── Fuel Readiness ────────────────────────────────────────────────────────────

export const mockFuelReadiness: FuelReadinessRecord[] = [
  {
    id: 'fr1',
    vessel_id: 'v1',
    vessel: mockVessels[0],
    fuel_type: 'Methanol',
    status: 'in_progress',
    readiness_score: 45,
    requirements: [
      { id: 'r1', label: 'IMO IGF Code assessment', description: 'Structural and systems assessment against IGF Code requirements', completed: true, document_ref: 'ABS-2026-IGF-0441' },
      { id: 'r2', label: 'Flag State approval', description: 'Flag State (Marshall Islands) approval of methanol fuel systems', completed: false, due_date: '2026-09-30' },
      { id: 'r3', label: 'Class society survey', description: 'ABS survey of fuel containment, piping, and safety systems', completed: false, due_date: '2026-08-15' },
      { id: 'r4', label: 'Crew training — methanol', description: 'All officers to complete methanol handling and emergency response training', completed: true },
      { id: 'r5', label: 'Supplier agreements', description: 'Methanol supply agreements at primary ports (Rotterdam, Singapore)', completed: false, due_date: '2026-10-01' },
      { id: 'r6', label: 'Insurance endorsement', description: 'P&I Club and H&M insurance endorsement for methanol operations', completed: false },
    ],
    target_date: '2026-12-01',
    certifying_body: 'ABS',
    notes: 'Conversion project underway. Flag State approval is critical path item.',
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-06-10T10:00:00Z',
  },
  {
    id: 'fr2',
    vessel_id: 'v2',
    vessel: mockVessels[1],
    fuel_type: 'B24',
    status: 'ready',
    readiness_score: 92,
    requirements: [
      { id: 'r7', label: 'Engine compatibility check', description: 'MAN B&W engine compatibility with B24 biofuel blend', completed: true },
      { id: 'r8', label: 'Fuel system inspection', description: 'Seals, gaskets, and elastomers compatibility with FAME content', completed: true },
      { id: 'r9', label: 'Supplier qualification', description: 'Biofuel supplier quality certification (ISCC)', completed: true, document_ref: 'ISCC-2026-0882' },
      { id: 'r10', label: 'FuelEU compliance check', description: 'Verify GHG intensity meets FuelEU Maritime 2025 requirements', completed: true },
      { id: 'r11', label: 'Operations procedure update', description: 'Update SMS for biofuel handling and blending procedures', completed: false, due_date: '2026-07-01' },
    ],
    target_date: '2026-07-15',
    certifying_body: 'DNV',
    notes: 'Awaiting SMS update before first B24 bunker call scheduled for Singapore July 2026.',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-06-08T14:00:00Z',
  },
  {
    id: 'fr3',
    vessel_id: 'v3',
    vessel: mockVessels[2],
    fuel_type: 'Ammonia',
    status: 'not_started',
    readiness_score: 0,
    requirements: [
      { id: 'r12', label: 'Feasibility study', description: 'Technical and commercial feasibility assessment for ammonia conversion', completed: false, due_date: '2027-01-01' },
      { id: 'r13', label: 'Class notation application', description: 'Apply for ammonia-ready class notation', completed: false },
      { id: 'r14', label: 'Port availability survey', description: 'Survey ammonia bunkering infrastructure at primary ports', completed: false },
      { id: 'r15', label: 'Crew training programme', description: 'Toxic gas handling, emergency response, PPE requirements', completed: false },
    ],
    target_date: '2028-01-01',
    notes: 'Deferred pending regulatory clarity on SOLAS ammonia provisions. Monitor IMO MSC developments.',
    created_at: '2026-05-01T08:00:00Z',
    updated_at: '2026-05-01T08:00:00Z',
  },
  {
    id: 'fr4',
    vessel_id: 'v4',
    vessel: mockVessels[3],
    fuel_type: 'B24',
    status: 'certified',
    readiness_score: 100,
    requirements: [
      { id: 'r16', label: 'Engine compatibility check', description: 'Wärtsilä engine compatibility with B24', completed: true },
      { id: 'r17', label: 'Supplier qualification', description: 'ISCC-certified biofuel supplier', completed: true, document_ref: 'ISCC-2025-0334' },
      { id: 'r18', label: 'Class certificate', description: 'DNV biofuel-ready certificate issued', completed: true, document_ref: 'DNV-BF-2025-7721' },
      { id: 'r19', label: 'SMS update', description: 'Safety Management System updated for biofuel operations', completed: true },
      { id: 'r20', label: 'FuelEU compliance', description: 'GHG intensity verified meets FuelEU 2025 requirements', completed: true, document_ref: 'FEU-2025-GT-008' },
    ],
    certifying_body: 'DNV',
    certificate_number: 'DNV-BF-2025-7721',
    notes: 'Fully certified. First B24 delivery completed Singapore October 2025.',
    created_at: '2025-06-01T08:00:00Z',
    updated_at: '2025-10-15T10:00:00Z',
  },
]

// ── Thresholds ────────────────────────────────────────────────────────────────

export const mockThresholds: Threshold[] = [
  { id: 't1', parameter: 'Quantity Variance (Vessel vs BDN)', unit: '%', warning_threshold: 0.3, critical_threshold: 0.5 },
  { id: 't2', parameter: 'Quantity Variance (MFM vs BDN)', unit: '%', warning_threshold: 0.3, critical_threshold: 0.5 },
  { id: 't3', parameter: 'Flash Point', unit: '°C below min', warning_threshold: 2, critical_threshold: 5 },
  { id: 't4', parameter: 'Sulphur Content', unit: '% m/m above max', warning_threshold: 0.01, critical_threshold: 0.05 },
  { id: 't5', parameter: 'Aluminium + Silicon', unit: 'mg/kg above max', warning_threshold: 5, critical_threshold: 15 },
  { id: 't6', parameter: 'Density', unit: 'kg/m³ above max', warning_threshold: 0.0002, critical_threshold: 0.001 },
  { id: 't7', parameter: 'Viscosity at 50°C', unit: 'cSt above max', warning_threshold: 5, critical_threshold: 20 },
]

// ── Templates ─────────────────────────────────────────────────────────────────

export const mockTemplates: Template[] = [
  {
    id: 'tmpl1',
    type: 'LOP_Response',
    name: 'Standard LOP Response',
    content: `Without Prejudice

To: [Supplier Name]
Attn: Bunker Operations Department

Re: [Vessel Name] / IMO [IMO Number]
    Delivery Date: [Delivery Date], Port of [Port]
    BDN Reference: [BDN Number]
    Fuel Grade: [Fuel Type]

Dear Sirs,

We write further to the Letter of Protest submitted in connection with the above delivery and wish to record our position as follows.

[Describe discrepancy and supporting measurements]

We hereby formally request:
1. [Request 1]
2. [Request 2]
3. [Request 3]

All our client's rights remain fully reserved without prejudice to the above.

Yours faithfully,
Copemer Ltd — Disputes & Claims Department`,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tmpl2',
    type: 'Owner_Update',
    name: 'Standard Owner Update',
    content: `CONFIDENTIAL — OWNER COMMUNICATION

To: [Owner/Technical Manager]
From: Copemer Ltd — Bunker Operations
Date: [Date]
Re: [Vessel Name] — [Issue Type]

Dear Team,

Please be advised of the following bunker issue affecting [Vessel Name].

DELIVERY DETAILS
Vessel: [Vessel Name] (IMO [IMO Number])
Port: [Port]
Delivery Date: [Date]
Supplier: [Supplier]
Quantity: [Quantity] MT [Fuel Type]
BDN Reference: [BDN Number]

SUMMARY OF ISSUE
[Describe issue]

RECOMMENDED ACTIONS
[List actions]

We will keep you updated as the matter progresses.

Copemer Ltd`,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tmpl3',
    type: 'Claim_Letter',
    name: 'Standard Claim Letter',
    content: `Without Prejudice — Subject to Contract

To: [Supplier Name] — Legal/Claims Department
From: Copemer Ltd
Date: [Date]
Re: Formal Claim — [Vessel Name] — [Port] — [Date]

Dear Sirs,

FORMAL NOTICE OF CLAIM

We write on behalf of our principal, [Owner/Charterer Name], to formally notify you of a claim arising from the bunker delivery described below.

DELIVERY REFERENCE
Vessel: [Vessel Name] (IMO [IMO Number])
Port: [Port]
Delivery Date: [Date]
BDN Number: [BDN Number]
Fuel Grade: [Fuel Type]
BDN Quantity: [BDN Quantity] MT

NATURE OF CLAIM
[Quantity Short / Off-Spec / MFM Dispute]

[Describe claim basis with supporting evidence]

QUANTUM
[Calculate and state claim value]

We require your response within [X] business days.

All rights reserved.

Copemer Ltd`,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]

// ── Dashboard KPI data ────────────────────────────────────────────────────────

export const mockKPIs = {
  openCases: { value: 4, delta: 2, trend: 'up' as const },
  pendingDrafts: { value: 1, delta: -1, trend: 'down' as const },
  unresolvedDiscrepancies: { value: 3, delta: 1, trend: 'up' as const },
  escalatedCases: { value: 1, delta: 1, trend: 'up' as const },
}

// ── Contacts ──────────────────────────────────────────────────────────────────

export const mockContacts: Contact[] = [
  {
    id: 'ct1',
    company_id: 'co1',
    company: mockCompanies[0],
    full_name: 'Michael Andersen',
    email: 'm.andersen@nordicshipping.com',
    phone: '+47 91 23 45 67',
    role: 'Fleet Manager',
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
  },
  {
    id: 'ct2',
    company_id: 'co1',
    company: mockCompanies[0],
    full_name: 'Ingrid Larsen',
    email: 'i.larsen@nordicshipping.com',
    phone: '+47 91 87 65 43',
    role: 'Operations Director',
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
  },
  {
    id: 'ct3',
    company_id: 'co2',
    company: mockCompanies[1],
    full_name: 'Chen Wei',
    email: 'c.wei@pacificcharter.com.sg',
    phone: '+65 9123 4567',
    role: 'Chartering Manager',
    created_at: '2025-04-10T00:00:00Z',
    updated_at: '2025-04-10T00:00:00Z',
  },
  {
    id: 'ct4',
    company_id: 'co3',
    company: mockCompanies[2],
    full_name: 'Rajiv Mehta',
    email: 'r.mehta@atlanticbulk.com',
    phone: '+44 20 7946 0123',
    role: 'Technical Superintendent',
    created_at: '2025-02-15T00:00:00Z',
    updated_at: '2025-02-15T00:00:00Z',
  },
]

// ── Deliveries ────────────────────────────────────────────────────────────────

export const mockDeliveries: (Delivery & { vessel_quantity: number; status: string })[] = [
  {
    id: 'del1',
    vessel_id: 'v1',
    vessel: mockVessels[0],
    port_id: 'p1',
    port: mockPorts[0],
    supplier_id: 's1',
    supplier: mockSuppliers[0],
    fuel_type: 'VLSFO',
    bdn_quantity: 500.0,
    vessel_quantity: 481.3,
    delivery_date: '2026-06-01T06:00:00Z',
    bdn_number: 'BDN-RTM-2026-0441',
    case_id: 'c1',
    status: 'disputed',
    created_at: '2026-06-01T12:00:00Z',
    updated_at: '2026-06-01T12:00:00Z',
  },
  {
    id: 'del2',
    vessel_id: 'v2',
    vessel: mockVessels[1],
    port_id: 'p2',
    port: mockPorts[1],
    supplier_id: 's2',
    supplier: mockSuppliers[1],
    fuel_type: 'VLSFO',
    bdn_quantity: 750.0,
    vessel_quantity: 748.2,
    delivery_date: '2026-05-28T08:00:00Z',
    bdn_number: 'BDN-SIN-2026-0382',
    case_id: 'c2',
    status: 'disputed',
    created_at: '2026-05-28T16:00:00Z',
    updated_at: '2026-05-28T16:00:00Z',
  },
  {
    id: 'del3',
    vessel_id: 'v3',
    vessel: mockVessels[2],
    port_id: 'p3',
    port: mockPorts[2],
    supplier_id: 's3',
    supplier: mockSuppliers[2],
    fuel_type: 'MGO',
    bdn_quantity: 120.0,
    vessel_quantity: 119.5,
    delivery_date: '2026-05-20T10:00:00Z',
    bdn_number: 'BDN-FUJ-2026-0291',
    status: 'confirmed',
    created_at: '2026-05-20T18:00:00Z',
    updated_at: '2026-05-20T18:00:00Z',
  },
  {
    id: 'del4',
    vessel_id: 'v4',
    vessel: mockVessels[3],
    port_id: 'p1',
    port: mockPorts[0],
    supplier_id: 's1',
    supplier: mockSuppliers[0],
    fuel_type: 'HSFO',
    bdn_quantity: 320.0,
    vessel_quantity: 318.7,
    delivery_date: '2026-06-05T14:00:00Z',
    bdn_number: 'BDN-RTM-2026-0459',
    status: 'confirmed',
    created_at: '2026-06-05T20:00:00Z',
    updated_at: '2026-06-05T20:00:00Z',
  },
  {
    id: 'del5',
    vessel_id: 'v1',
    vessel: mockVessels[0],
    port_id: 'p2',
    port: mockPorts[1],
    supplier_id: 's2',
    supplier: mockSuppliers[1],
    fuel_type: 'LSMGO',
    bdn_quantity: 45.0,
    vessel_quantity: 44.8,
    delivery_date: '2026-06-10T07:00:00Z',
    bdn_number: 'BDN-SIN-2026-0401',
    status: 'pending',
    created_at: '2026-06-10T14:00:00Z',
    updated_at: '2026-06-10T14:00:00Z',
  },
]
