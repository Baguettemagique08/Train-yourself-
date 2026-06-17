import type {
  User, Company, Contact, Vessel, Port, Supplier, Delivery, Case, Document,
  Measurement, SpecsCheck, Draft, Activity, FuelReadinessRecord, Threshold, Template, BunkerSample
} from '@/types'

// ── Users ────────────────────────────────────────────────────────────────────

export const mockUsers: User[] = [
  {
    id: 'u1',
    email: 'james.hargreaves@copemer.com',
    full_name: 'James Hargreaves',
    role: 'senior_broker', is_active: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'u2',
    email: 'sophie.lindqvist@copemer.com',
    full_name: 'Sophie Lindqvist',
    role: 'broker', is_active: true,
    created_at: '2024-02-15T08:00:00Z',
    updated_at: '2024-02-15T08:00:00Z',
  },
  {
    id: 'u3',
    email: 'rajan.mehta@copemer.com',
    full_name: 'Rajan Mehta',
    role: 'analyst', is_active: true,
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-01T08:00:00Z',
  },
  {
    id: 'u4',
    email: 'olivia.leblond@copemer.com',
    full_name: 'Olivia Leblond',
    role: 'admin', is_active: true,
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
    vessel_type: 'Chemical Tanker',
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
    vessel_type: 'Bulk Carrier',
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
    vessel_type: 'General Cargo',
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
    vessel_type: 'Container Feeder',
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
    contact_email: 'ops@peninsula.com', is_approved: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 's2',
    name: 'Chemoil Energy',
    country: 'Singapore',
    contact_email: 'bunkers@chemoil.com', is_approved: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 's3',
    name: 'Minerva Bunkering',
    country: 'Greece',
    contact_email: 'ops@minervabunkering.com', is_approved: true,
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
    delivery_id: 'del1',
    opened_at: '2026-06-02T09:00:00Z',
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
    bdn_signed_status: 'under_protest' as const,
    lop_attached_at_signing: true,
    bdn_signed_by: 'Capt. M. Andersen, Master',
    governing_law: 'English Law',
    jurisdiction: 'LMAA London Arbitration',
    supplier_pi_insurer: 'UK P&I Club',
    claim_notice_deadline: '2026-06-30T23:59:59Z',
    claim_time_bar: '2027-05-30T23:59:59Z',
    joint_survey_status: 'completed' as const,
    joint_survey_requested_at: '2026-06-02T10:00:00Z',
    joint_survey_surveyor: 'Brookes Bell Rotterdam',
    joint_survey_outcome: 'Survey confirms 488.9 MT received. Barge meter certified accurate.',
    fuel_use_stopped: false,
    fuel_segregated: false,
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
    delivery_id: 'del2',
    opened_at: '2026-05-30T10:15:00Z',
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
    bdn_signed_status: 'under_protest' as const,
    lop_attached_at_signing: true,
    bdn_signed_by: 'Capt. L. Svensson, Master',
    governing_law: 'Singapore Law',
    jurisdiction: 'SCMA Singapore Arbitration',
    supplier_pi_insurer: 'Gard P&I',
    claim_notice_deadline: '2026-06-29T23:59:59Z',
    claim_time_bar: '2027-05-12T23:59:59Z',
    joint_survey_status: 'requested' as const,
    joint_survey_requested_at: '2026-05-30T14:00:00Z',
    fuel_use_stopped: true,
    fuel_use_stopped_at: '2026-05-30T16:00:00Z',
    fuel_segregated: true,
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
    delivery_id: 'del3',
    opened_at: '2026-05-22T08:30:00Z',
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
    delivery_id: 'del3',
    opened_at: '2026-05-10T11:00:00Z',
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
    delivery_id: 'del1',
    opened_at: '2026-04-28T09:30:00Z',
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
    bdn_signed_status: 'clean' as const,
    governing_law: 'English Law',
    settlement_method: 'credit_note' as const,
    settlement_amount: 18500,
    settlement_currency: 'USD',
    settlement_reference: 'CHM-CN-2026-0441',
    settlement_date: '2026-05-25T00:00:00Z',
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
    delivery_id: 'del2',
    opened_at: '2026-06-08T15:00:00Z',
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
    bdn_signed_status: 'clean' as const,
    governing_law: 'English Law',
    settlement_method: 'supplementary_delivery' as const,
    settlement_amount: 50,
    settlement_reference: 'MIN-SUPP-2026-0088',
    settlement_date: '2026-04-22T00:00:00Z',
    created_at: '2026-04-12T08:00:00Z',
    updated_at: '2026-04-25T17:00:00Z',
  },
]

// Module-level registry so mutations (create/update) survive navigation.
export const caseRegistry = new Map<string, Case>()
mockCases.forEach((c) => caseRegistry.set(c.id, c))

// ── Bunker Samples ────────────────────────────────────────────────────────────

export const mockBunkerSamples: BunkerSample[] = [
  {
    id: 'bs1',
    case_id: 'c1',
    sample_type: 'marpol',
    seal_number: 'PEN-RTM-2026-8821-M',
    sealed_by: 'Peninsula Petroleum — Rotterdam',
    sealed_at: '2026-05-30T14:30:00Z',
    lab_reference: 'IACS-2026-44721',
    lab_name: 'Intertek Rotterdam',
    status: 'at_lab',
    notes: 'MARPOL retained sample held by Peninsula Petroleum. Requested testing 2026-06-05.',
    created_at: '2026-06-02T09:05:00Z',
    updated_at: '2026-06-05T10:00:00Z',
  },
  {
    id: 'bs2',
    case_id: 'c1',
    sample_type: 'vessel',
    seal_number: 'NS-RTM-001',
    sealed_by: 'Chief Engineer — MV Nordic Star',
    sealed_at: '2026-05-30T14:30:00Z',
    status: 'sealed',
    notes: "Vessel's retained sample secured in bond store.",
    created_at: '2026-06-02T09:05:00Z',
    updated_at: '2026-06-02T09:05:00Z',
  },
  {
    id: 'bs3',
    case_id: 'c1',
    sample_type: 'joint_drip',
    seal_number: 'NS-RTM-JD-001',
    sealed_by: 'Joint — Peninsula / MV Nordic Star',
    sealed_at: '2026-05-30T13:00:00Z',
    status: 'sealed',
    notes: 'Joint drip sample taken during delivery. Both parties signed seal record.',
    created_at: '2026-06-02T09:05:00Z',
    updated_at: '2026-06-02T09:05:00Z',
  },
  {
    id: 'bs4',
    case_id: 'c2',
    sample_type: 'marpol',
    seal_number: 'CHM-SIN-2026-3341-M',
    sealed_by: 'Chemoil Energy — Singapore',
    sealed_at: '2026-05-12T09:00:00Z',
    lab_reference: 'SGS-SIN-2026-88123',
    lab_name: 'SGS Singapore',
    analysis_date: '2026-05-28T00:00:00Z',
    status: 'results_received',
    notes: 'MARPOL sample tested. Flash point confirmed 58°C. Al+Si confirmed 42 mg/kg.',
    created_at: '2026-05-30T10:15:00Z',
    updated_at: '2026-05-28T12:00:00Z',
  },
  {
    id: 'bs5',
    case_id: 'c2',
    sample_type: 'vessel',
    seal_number: 'PH-SIN-VS-002',
    sealed_by: 'Chief Engineer — MV Pacific Horizon',
    sealed_at: '2026-05-12T09:00:00Z',
    status: 'sealed',
    notes: "Vessel sample retained on board. Not yet sent for testing.",
    created_at: '2026-05-30T10:15:00Z',
    updated_at: '2026-05-30T10:15:00Z',
  },
]

// ── Documents ─────────────────────────────────────────────────────────────────

export const mockDocuments: Document[] = [
  {
    id: 'd1',
    case_id: 'c1',
    document_type: 'BDN', storage_path: 'cases/c1/d1.pdf', extraction_status: 'complete' as const,
    filename: 'BDN_CPM2026_0042_Peninsula_Rotterdam.pdf',
    file_size_bytes: 284320,
    status: 'ready',
    uploaded_by: 'u1',
    uploader: mockUsers[0],
    notes: 'Original BDN signed by vessel master and barge captain',
    extracted_fields: [
      { id: 'ef1', document_id: 'd1', field_name: 'BDN Number', field_value: 'PEN-RTM-2026-8821', confidence_score: 0.97, is_verified: true, created_at: '2026-06-02T09:05:00Z', updated_at: '2026-06-02T09:05:00Z' },
      { id: 'ef2', document_id: 'd1', field_name: 'Gross Quantity', field_value: '500.000 MT', confidence_score: 0.99, is_verified: true, created_at: '2026-06-02T09:05:00Z', updated_at: '2026-06-02T09:05:00Z' },
      { id: 'ef3', document_id: 'd1', field_name: 'Net Quantity', field_value: '498.750 MT', confidence_score: 0.98, is_verified: true, created_at: '2026-06-02T09:05:00Z', updated_at: '2026-06-02T09:05:00Z' },
      { id: 'ef4', document_id: 'd1', field_name: 'Density at 15°C', field_value: '0.9823 kg/m³', confidence_score: 0.96, is_verified: true, created_at: '2026-06-02T09:05:00Z', updated_at: '2026-06-02T09:05:00Z' },
    ],
    created_at: '2026-06-02T09:05:00Z',
    updated_at: '2026-06-02T09:05:00Z',
  },
  {
    id: 'd2',
    case_id: 'c1',
    document_type: 'LOP', storage_path: 'cases/c1/d2.pdf', extraction_status: 'not_applicable' as const,
    filename: 'LOP_Nordic_Star_Rotterdam_01062026.pdf',
    file_size_bytes: 145680,
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
    document_type: 'Ullage_Report', storage_path: 'cases/c1/d3.pdf', extraction_status: 'complete' as const,
    filename: 'Ullage_Report_Nordic_Star_011.pdf',
    file_size_bytes: 98240,
    status: 'needs_review',
    uploaded_by: 'u1',
    uploader: mockUsers[0],
    notes: 'Pre and post bunkering ullage measurements — witness signature missing',
    extracted_fields: [
      { id: 'ef5', document_id: 'd3', field_name: 'Pre-bunkering ROB', field_value: '42.3 MT', confidence_score: 0.85, is_verified: false, created_at: '2026-06-03T08:00:00Z', updated_at: '2026-06-03T08:00:00Z' },
      { id: 'ef6', document_id: 'd3', field_name: 'Post-bunkering ROB', field_value: '529.5 MT', confidence_score: 0.87, is_verified: false, created_at: '2026-06-03T08:00:00Z', updated_at: '2026-06-03T08:00:00Z' },
    ],
    created_at: '2026-06-03T08:00:00Z',
    updated_at: '2026-06-03T08:00:00Z',
  },
  {
    id: 'd4',
    case_id: 'c2',
    document_type: 'Lab_Report', storage_path: 'cases/c2/d4.pdf', extraction_status: 'complete' as const,
    filename: 'Lab_Analysis_PacificHorizon_VLSFO_Singapore.pdf',
    file_size_bytes: 412500,
    status: 'ready',
    uploaded_by: 'u2',
    uploader: mockUsers[1],
    notes: 'Bureau Veritas independent lab analysis — retained sample #SG-2026-44821',
    extracted_fields: [
      { id: 'ef7', document_id: 'd4', field_name: 'Flash Point', field_value: '58°C', confidence_score: 0.99, is_verified: true, created_at: '2026-05-31T14:00:00Z', updated_at: '2026-05-31T14:00:00Z' },
      { id: 'ef8', document_id: 'd4', field_name: 'Aluminium + Silicon', field_value: '42 mg/kg', confidence_score: 0.99, is_verified: true, created_at: '2026-05-31T14:00:00Z', updated_at: '2026-05-31T14:00:00Z' },
      { id: 'ef9', document_id: 'd4', field_name: 'Sulphur Content', field_value: '0.48% m/m', confidence_score: 0.99, is_verified: true, created_at: '2026-05-31T14:00:00Z', updated_at: '2026-05-31T14:00:00Z' },
      { id: 'ef10', document_id: 'd4', field_name: 'Density at 15°C', field_value: '0.9914 kg/m³', confidence_score: 0.98, is_verified: true, created_at: '2026-05-31T14:00:00Z', updated_at: '2026-05-31T14:00:00Z' },
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
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 490.1,
    observed_volume_m3: 500.5,
    temperature_c: 51.2,
    density_at_obs_kgm3: 0.9823,
    density_at_15c_kgm3: 0.9879,
    vcf: 0.9943,
    trim_correction_m3: -1.5,
    surveyor_name: 'Chief Officer',
    timestamp_utc: '2026-06-01T17:00:00Z',
    notes: 'Post-bunkering tank measurement, all tanks sounded by chief officer',
    created_at: '2026-06-02T09:00:00Z',
    updated_at: '2026-06-02T09:00:00Z',
  },
  {
    id: 'm2',
    case_id: 'c1',
    source: 'barge',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 502.4,
    observed_volume_m3: 511.7,
    temperature_c: 52.0,
    density_at_obs_kgm3: 0.9820,
    density_at_15c_kgm3: 0.9878,
    vcf: 0.9941,
    trim_correction_m3: 0,
    surveyor_name: 'Barge Master',
    timestamp_utc: '2026-06-01T17:15:00Z',
    notes: 'Barge departure soundings per BDN',
    created_at: '2026-06-02T09:00:00Z',
    updated_at: '2026-06-02T09:00:00Z',
  },
  {
    id: 'm3',
    case_id: 'c1',
    source: 'mfm',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 497.3,
    observed_volume_m3: 506.3,
    temperature_c: 51.6,
    density_at_obs_kgm3: 0.9821,
    density_at_15c_kgm3: 0.9876,
    vcf: 0.9944,
    trim_correction_m3: 0,
    surveyor_name: 'MFM System (Auto)',
    timestamp_utc: '2026-06-01T17:10:00Z',
    notes: 'MFM serial #PEN-MFM-0021, last calibrated 2026-03-15',
    created_at: '2026-06-02T09:00:00Z',
    updated_at: '2026-06-02T09:00:00Z',
  },
  // Case c3 — MFM dispute
  {
    id: 'm4',
    case_id: 'c3',
    source: 'mfm',
    fuel_grade: 'MGO',
    is_disputed: false,
    quantity_mt: 321.8,
    observed_volume_m3: 385.7,
    temperature_c: 28.5,
    density_at_obs_kgm3: 0.8342,
    density_at_15c_kgm3: 0.8354,
    vcf: 0.9986,
    trim_correction_m3: 0,
    surveyor_name: 'MFM System (Auto)',
    timestamp_utc: '2026-05-21T01:30:00Z',
    notes: 'MFM #MIN-FUJ-0088, calibration certificate valid until 2026-12-01',
    created_at: '2026-05-22T08:30:00Z',
    updated_at: '2026-05-22T08:30:00Z',
  },
  {
    id: 'm5',
    case_id: 'c3',
    source: 'barge',
    fuel_grade: 'MGO',
    is_disputed: false,
    quantity_mt: 343.2,
    observed_volume_m3: 410.9,
    temperature_c: 28.0,
    density_at_obs_kgm3: 0.8345,
    density_at_15c_kgm3: 0.8356,
    vcf: 0.9987,
    trim_correction_m3: 0.3,
    surveyor_name: 'Barge Master',
    timestamp_utc: '2026-05-21T01:45:00Z',
    notes: 'Barge soundings — departure figures from barge ullage report',
    created_at: '2026-05-22T08:30:00Z',
    updated_at: '2026-05-22T08:30:00Z',
  },
  {
    id: 'm6',
    case_id: 'c3',
    source: 'manual',
    fuel_grade: 'MGO',
    is_disputed: false,
    quantity_mt: 326.5,
    observed_volume_m3: 391.2,
    temperature_c: 28.2,
    density_at_obs_kgm3: 0.8343,
    density_at_15c_kgm3: 0.8356,
    vcf: 0.9985,
    trim_correction_m3: 0,
    surveyor_name: 'Shore Terminal Inspector',
    timestamp_utc: '2026-05-20T22:30:00Z',
    notes: 'Shore tank before/after comparison, Fujairah Oil Terminal #3',
    created_at: '2026-05-22T08:30:00Z',
    updated_at: '2026-05-22T08:30:00Z',
  },
]

// ── Specs Checks ─────────────────────────────────────────────────────────────

export const mockSpecsChecks: SpecsCheck[] = [
  // Case c2 — Off-spec VLSFO
  { id: 'sc1', case_id: 'c2', fuel_grade: 'VLSFO', parameter_name: 'Density at 15°C', unit: 'kg/m³', bdn_value: 0.9912, contract_min: null, contract_max: 0.9910, lab_result: 0.9914, status: 'warning', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc2', case_id: 'c2', fuel_grade: 'VLSFO', parameter_name: 'Kinematic Viscosity at 50°C', unit: 'cSt', bdn_value: 380.2, contract_min: null, contract_max: 380.0, lab_result: 375.4, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc3', case_id: 'c2', fuel_grade: 'VLSFO', parameter_name: 'Flash Point', unit: '°C', bdn_value: 63.0, contract_min: 60.0, contract_max: null, lab_result: 58.0, status: 'off_spec', notes: 'Flash point below minimum 60°C — ISO 8217 requirement violated', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc4', case_id: 'c2', fuel_grade: 'VLSFO', parameter_name: 'Sulphur Content', unit: '% m/m', bdn_value: 0.48, contract_min: null, contract_max: 0.50, lab_result: 0.48, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc5', case_id: 'c2', fuel_grade: 'VLSFO', parameter_name: 'Water Content', unit: '% v/v', bdn_value: null, contract_min: null, contract_max: 0.50, lab_result: 0.12, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc6', case_id: 'c2', fuel_grade: 'VLSFO', parameter_name: 'Ash Content', unit: '% m/m', bdn_value: null, contract_min: null, contract_max: 0.10, lab_result: 0.08, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc7', case_id: 'c2', fuel_grade: 'VLSFO', parameter_name: 'CCAI', unit: '', bdn_value: null, contract_min: null, contract_max: 870.0, lab_result: 858.0, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc8', case_id: 'c2', fuel_grade: 'VLSFO', parameter_name: 'Aluminium + Silicon', unit: 'mg/kg', bdn_value: null, contract_min: null, contract_max: 25.0, lab_result: 42.0, status: 'off_spec', notes: 'Al+Si exceeds catalytic fines limit — potential engine abrasion risk', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'sc9', case_id: 'c2', fuel_grade: 'VLSFO', parameter_name: 'Vanadium', unit: 'mg/kg', bdn_value: null, contract_min: null, contract_max: 150.0, lab_result: 112.0, status: 'ok', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
]

// ── Drafts ───────────────────────────────────────────────────────────────────

export const mockDrafts: Draft[] = [
  {
    id: 'dr1',
    case_id: 'c1',
    draft_type: 'LOP_Response',
    title: 'LOP Response — MV Nordic Star — Rotterdam 01 June 2026',
    body: `Without Prejudice

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
    draft_type: 'Owner_Update',
    title: 'Owner Update — MV Pacific Horizon — Off-Spec VLSFO',
    body: `CONFIDENTIAL — OWNER COMMUNICATION

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
    created_at: '2026-05-30T16:00:00Z',
    updated_at: '2026-05-31T08:00:00Z',
  },
  {
    id: 'dr3',
    case_id: 'c3',
    draft_type: 'Internal_Memo',
    title: 'Internal Memo — MFM Dispute Analysis — MV Atlantic Carrier',
    body: `INTERNAL — NOT FOR EXTERNAL DISTRIBUTION

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
  { id: 'a1', case_id: 'c1', user_id: 'u1', user: mockUsers[0], activity_type: 'case_created', description: 'Case CPM-2026-0042 created following post-bunkering ullage discrepancy.', created_at: '2026-06-02T09:00:00Z' },
  { id: 'a2', case_id: 'c1', user_id: 'u1', user: mockUsers[0], activity_type: 'document_uploaded', description: 'Uploaded BDN (PEN-RTM-2026-8821) and Letter of Protest.', created_at: '2026-06-02T09:30:00Z' },
  { id: 'a3', case_id: 'c1', user_id: 'u1', user: mockUsers[0], activity_type: 'measurement_added', description: 'Vessel, barge, and MFM figures entered. Discrepancy flagged: 12.8 MT / 2.56%.', created_at: '2026-06-02T10:15:00Z' },
  { id: 'a4', case_id: 'c1', user_id: 'u1', user: mockUsers[0], activity_type: 'draft_created', description: 'LOP Response draft created (v1).', created_at: '2026-06-03T10:00:00Z' },
  { id: 'a5', case_id: 'c1', user_id: 'u4', user: mockUsers[3], activity_type: 'case_status_changed', description: 'Status escalated to Urgent following supplier non-response.', created_at: '2026-06-05T11:00:00Z' },
  { id: 'a6', case_id: 'c1', user_id: 'u1', user: mockUsers[0], activity_type: 'draft_superseded', description: 'LOP Response updated to v2 following receipt of barge ullage log.', created_at: '2026-06-05T14:30:00Z' },
  { id: 'a7', case_id: 'c1', user_id: 'u4', user: mockUsers[3], activity_type: 'document_uploaded', description: 'Ullage report uploaded — pending review (witness signature missing).', created_at: '2026-06-06T09:00:00Z' },
  { id: 'a8', case_id: 'c1', user_id: 'u1', user: mockUsers[0], activity_type: 'note_added', description: 'Supplier requested 5 working days to investigate. Chasing barge ullage report.', created_at: '2026-06-10T14:22:00Z' },
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
      { id: 'r1', label: 'IMO IGF Code assessment', description: 'Structural and systems assessment against IGF Code requirements', completed: true, doc_ref: 'ABS-2026-IGF-0441' },
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
      { id: 'r9', label: 'Supplier qualification', description: 'Biofuel supplier quality certification (ISCC)', completed: true, doc_ref: 'ISCC-2026-0882' },
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
      { id: 'r17', label: 'Supplier qualification', description: 'ISCC-certified biofuel supplier', completed: true, doc_ref: 'ISCC-2025-0334' },
      { id: 'r18', label: 'Class certificate', description: 'DNV biofuel-ready certificate issued', completed: true, doc_ref: 'DNV-BF-2025-7721' },
      { id: 'r19', label: 'SMS update', description: 'Safety Management System updated for biofuel operations', completed: true },
      { id: 'r20', label: 'FuelEU compliance', description: 'GHG intensity verified meets FuelEU 2025 requirements', completed: true, doc_ref: 'FEU-2025-GT-008' },
    ],
    certifying_body: 'DNV',
    certificate_ref: 'DNV-BF-2025-7721',
    notes: 'Fully certified. First B24 delivery completed Singapore October 2025.',
    created_at: '2025-06-01T08:00:00Z',
    updated_at: '2025-10-15T10:00:00Z',
  },
]

// ── Thresholds ────────────────────────────────────────────────────────────────

export const mockThresholds: Threshold[] = [
  { id: 't1', category: 'spec' as const, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', parameter: 'Quantity Variance (Vessel vs BDN)', unit: '%', warning_threshold: 0.3, critical_threshold: 0.5 },
  { id: 't2', category: 'spec' as const, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', parameter: 'Quantity Variance (MFM vs BDN)', unit: '%', warning_threshold: 0.3, critical_threshold: 0.5 },
  { id: 't3', category: 'spec' as const, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', parameter: 'Flash Point', unit: '°C below min', warning_threshold: 2, critical_threshold: 5 },
  { id: 't4', category: 'quantity' as const, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', parameter: 'Sulphur Content', unit: '% m/m above max', warning_threshold: 0.01, critical_threshold: 0.05 },
  { id: 't5', category: 'spec' as const, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', parameter: 'Aluminium + Silicon', unit: 'mg/kg above max', warning_threshold: 5, critical_threshold: 15 },
  { id: 't6', category: 'spec' as const, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', parameter: 'Density', unit: 'kg/m³ above max', warning_threshold: 0.0002, critical_threshold: 0.001 },
  { id: 't7', category: 'spec' as const, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', parameter: 'Viscosity at 50°C', unit: 'cSt above max', warning_threshold: 5, critical_threshold: 20 },
]

// ── Templates ─────────────────────────────────────────────────────────────────

export const mockTemplates: Template[] = [
  {
    id: 'tmpl1',
    draft_type: 'LOP_Response',
    name: 'Standard LOP Response',
    is_active: true,
    body: `Without Prejudice

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
    draft_type: 'Owner_Update',
    name: 'Standard Owner Update',
    is_active: true,
    body: `CONFIDENTIAL — OWNER COMMUNICATION

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
    draft_type: 'Claim_Letter',
    name: 'Standard Claim Letter',
    is_active: true,
    body: `Without Prejudice — Subject to Contract

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

// ── Dispute volume trend (last 8 ISO weeks) ─────────────────────────────────────
// Cases opened vs closed per week — used by the Dashboard trend panel.

export const mockDisputeTrend = [
  { period_start: '2026-04-20', label: 'W17', opened: 2, closed: 1 },
  { period_start: '2026-04-27', label: 'W18', opened: 1, closed: 2 },
  { period_start: '2026-05-04', label: 'W19', opened: 3, closed: 1 },
  { period_start: '2026-05-11', label: 'W20', opened: 2, closed: 3 },
  { period_start: '2026-05-18', label: 'W21', opened: 4, closed: 2 },
  { period_start: '2026-05-25', label: 'W22', opened: 3, closed: 1 },
  { period_start: '2026-06-01', label: 'W23', opened: 5, closed: 2 },
  { period_start: '2026-06-08', label: 'W24', opened: 3, closed: 1 },
]

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
    is_primary: false,
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
    is_primary: false,
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
    is_primary: false,
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
    is_primary: false,
    created_at: '2025-02-15T00:00:00Z',
    updated_at: '2025-02-15T00:00:00Z',
  },
]

// ── Deliveries ────────────────────────────────────────────────────────────────

export const mockDeliveries: (Delivery & { vessel_quantity: number; status: string })[] = [
  {
    id: 'del1',
    reference: 'DEL-2026-0441',
    delivery_date: '2026-06-01T06:00:00Z',
    vessel_id: 'v1',
    vessel: mockVessels[0],
    port_id: 'p1',
    port: mockPorts[0],
    supplier_id: 's1',
    supplier: mockSuppliers[0],
    fuel_type: 'VLSFO',
    bdn_quantity: 500.0,
    vessel_quantity: 481.3,
    
    bdn_number: 'BDN-RTM-2026-0441',
    status: 'disputed',
    created_at: '2026-06-01T12:00:00Z',
    updated_at: '2026-06-01T12:00:00Z',
  },
  {
    id: 'del2',
    reference: 'DEL-2026-0382',
    delivery_date: '2026-05-28T08:00:00Z',
    vessel_id: 'v2',
    vessel: mockVessels[1],
    port_id: 'p2',
    port: mockPorts[1],
    supplier_id: 's2',
    supplier: mockSuppliers[1],
    fuel_type: 'VLSFO',
    bdn_quantity: 750.0,
    vessel_quantity: 748.2,
    
    bdn_number: 'BDN-SIN-2026-0382',
    status: 'disputed',
    created_at: '2026-05-28T16:00:00Z',
    updated_at: '2026-05-28T16:00:00Z',
  },
  {
    id: 'del3',
    reference: 'DEL-2026-0291',
    delivery_date: '2026-05-20T10:00:00Z',
    vessel_id: 'v3',
    vessel: mockVessels[2],
    port_id: 'p3',
    port: mockPorts[2],
    supplier_id: 's3',
    supplier: mockSuppliers[2],
    fuel_type: 'MGO',
    bdn_quantity: 120.0,
    vessel_quantity: 119.5,

    bdn_number: 'BDN-FUJ-2026-0291',
    status: 'confirmed',
    created_at: '2026-05-20T18:00:00Z',
    updated_at: '2026-05-20T18:00:00Z',
  },
  {
    id: 'del4',
    reference: 'DEL-2026-0459',
    delivery_date: '2026-06-05T14:00:00Z',
    vessel_id: 'v4',
    vessel: mockVessels[3],
    port_id: 'p1',
    port: mockPorts[0],
    supplier_id: 's1',
    supplier: mockSuppliers[0],
    fuel_type: 'HSFO',
    bdn_quantity: 320.0,
    vessel_quantity: 318.7,
    
    bdn_number: 'BDN-RTM-2026-0459',
    status: 'confirmed',
    created_at: '2026-06-05T20:00:00Z',
    updated_at: '2026-06-05T20:00:00Z',
  },
  {
    id: 'del5',
    reference: 'DEL-2026-0401',
    delivery_date: '2026-06-10T07:00:00Z',
    vessel_id: 'v1',
    vessel: mockVessels[0],
    port_id: 'p2',
    port: mockPorts[1],
    supplier_id: 's2',
    supplier: mockSuppliers[1],
    fuel_type: 'LSMGO',
    bdn_quantity: 45.0,
    vessel_quantity: 44.8,
    
    bdn_number: 'BDN-SIN-2026-0401',
    status: 'in_progress',
    created_at: '2026-06-10T14:00:00Z',
    updated_at: '2026-06-10T14:00:00Z',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// NEW ENTITIES — Companies co4, co5, co6
// ─────────────────────────────────────────────────────────────────────────────

const co4: Company = {
  id: 'co4',
  name: 'Olympus Shipping SA',
  type: 'shipowner',
  country: 'Greece',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const co5: Company = {
  id: 'co5',
  name: 'Levante Maritime BV',
  type: 'shipowner',
  country: 'Netherlands',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const co6: Company = {
  id: 'co6',
  name: 'Blue Shore Carriers Ltd',
  type: 'shipowner',
  country: 'Cyprus',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

mockCompanies.push(co4, co5, co6)

// ─────────────────────────────────────────────────────────────────────────────
// NEW ENTITIES — Vessels v5–v11
// ─────────────────────────────────────────────────────────────────────────────

const v5: Vessel = {
  id: 'v5',
  name: 'MV Elara Spirit',
  imo: '9856341',
  flag: 'Liberia',
  vessel_type: 'Aframax Tanker',
  dwt: 115000,
  owner_id: 'co4',
  owner: co4,
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const v6: Vessel = {
  id: 'v6',
  name: 'MV Poseidon Bay',
  imo: '9901127',
  flag: 'Malta',
  vessel_type: 'VLCC',
  dwt: 298000,
  owner_id: 'co4',
  owner: co4,
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const v7: Vessel = {
  id: 'v7',
  name: 'MV Thalassa Wind',
  imo: '9742118',
  flag: 'Marshall Islands',
  vessel_type: 'Product Tanker',
  dwt: 48000,
  owner_id: 'co5',
  owner: co5,
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const v8: Vessel = {
  id: 'v8',
  name: 'MV Hercules Merchant',
  imo: '9623405',
  flag: 'Greece',
  vessel_type: 'Bulk Carrier',
  dwt: 75000,
  owner_id: 'co4',
  owner: co4,
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const v9: Vessel = {
  id: 'v9',
  name: 'MV Cerulean Grace',
  imo: '9788234',
  flag: 'Bahamas',
  vessel_type: 'Container Feeder',
  dwt: 12000,
  owner_id: 'co6',
  owner: co6,
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const v10: Vessel = {
  id: 'v10',
  name: 'MV Byzantium Star',
  imo: '9834567',
  flag: 'Cyprus',
  vessel_type: 'Handy Tanker',
  dwt: 35000,
  owner_id: 'co6',
  owner: co6,
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const v11: Vessel = {
  id: 'v11',
  name: 'MV Celtic Horizon',
  imo: '9912006',
  flag: 'Isle of Man',
  vessel_type: 'Product Tanker',
  dwt: 40000,
  owner_id: 'co5',
  owner: co5,
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

mockVessels.push(v5, v6, v7, v8, v9, v10, v11)

// ─────────────────────────────────────────────────────────────────────────────
// NEW ENTITIES — Ports p4–p12
// ─────────────────────────────────────────────────────────────────────────────

const p4: Port = {
  id: 'p4',
  name: 'Antwerp',
  country: 'Belgium',
  unlocode: 'BEANR',
  region: 'ARA',
  timezone: 'Europe/Brussels',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const p5: Port = {
  id: 'p5',
  name: 'Amsterdam',
  country: 'Netherlands',
  unlocode: 'NLAMS',
  region: 'ARA',
  timezone: 'Europe/Amsterdam',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const p6: Port = {
  id: 'p6',
  name: 'Le Havre',
  country: 'France',
  unlocode: 'FRLEH',
  region: 'France',
  timezone: 'Europe/Paris',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const p7: Port = {
  id: 'p7',
  name: 'Marseille',
  country: 'France',
  unlocode: 'FRMRS',
  region: 'Mediterranean',
  timezone: 'Europe/Paris',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const p8: Port = {
  id: 'p8',
  name: 'Gibraltar',
  country: 'Gibraltar',
  unlocode: 'GIGIB',
  region: 'Atlantic Hub',
  timezone: 'Europe/Gibraltar',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const p9: Port = {
  id: 'p9',
  name: 'Marsaxlokk',
  country: 'Malta',
  unlocode: 'MTMLA',
  region: 'Mediterranean',
  timezone: 'Europe/Malta',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const p10: Port = {
  id: 'p10',
  name: 'Piraeus',
  country: 'Greece',
  unlocode: 'GRPIR',
  region: 'Mediterranean',
  timezone: 'Europe/Athens',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const p11: Port = {
  id: 'p11',
  name: 'Genoa',
  country: 'Italy',
  unlocode: 'ITGOA',
  region: 'Mediterranean',
  timezone: 'Europe/Rome',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const p12: Port = {
  id: 'p12',
  name: 'Las Palmas',
  country: 'Spain',
  unlocode: 'ESLPA',
  region: 'Atlantic Hub',
  timezone: 'Atlantic/Canary',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

mockPorts.push(p4, p5, p6, p7, p8, p9, p10, p11, p12)

// ─────────────────────────────────────────────────────────────────────────────
// NEW ENTITIES — Suppliers s4, s5
// ─────────────────────────────────────────────────────────────────────────────

const s4: Supplier = {
  id: 's4',
  name: 'World Fuel Services',
  country: 'USA',
  contact_email: 'bunkers@wfscorp.com',
  is_approved: true,
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

const s5: Supplier = {
  id: 's5',
  name: 'Bunker One',
  country: 'Denmark',
  contact_email: 'ops@bunker-one.com',
  is_approved: true,
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-01-10T08:00:00Z',
}

mockSuppliers.push(s4, s5)

// ─────────────────────────────────────────────────────────────────────────────
// NEW DELIVERIES — del6 through del14 (those linked to cases c6–c14)
// ─────────────────────────────────────────────────────────────────────────────

mockDeliveries.push(
  // del6: v2/p3/s3, HSFO, confirmed — linked to c6
  {
    id: 'del6',
    reference: 'DEL-2026-0198',
    delivery_date: '2026-04-12T06:00:00Z',
    vessel_id: 'v2',
    vessel: mockVessels[1],
    port_id: 'p3',
    port: mockPorts[2],
    supplier_id: 's3',
    supplier: mockSuppliers[2],
    fuel_type: 'HSFO',
    bdn_quantity: 1900.0,
    vessel_quantity: 1850.0,
    bdn_number: 'MIN-FUJ-2026-2201',
    status: 'confirmed',
    created_at: '2026-04-12T14:00:00Z',
    updated_at: '2026-04-12T14:00:00Z',
  },
  // del7: v5/p4/s4, VLSFO, disputed — linked to c7
  {
    id: 'del7',
    reference: 'DEL-2026-0461',
    delivery_date: '2026-06-03T14:00:00Z',
    vessel_id: 'v5',
    vessel: v5,
    port_id: 'p4',
    port: p4,
    supplier_id: 's4',
    supplier: s4,
    fuel_type: 'VLSFO',
    bdn_quantity: 800.0,
    vessel_quantity: 795.8,
    bdn_number: 'WFS-ANT-2026-3841',
    status: 'disputed',
    created_at: '2026-06-03T20:00:00Z',
    updated_at: '2026-06-03T20:00:00Z',
  },
  // del8: v6/p9/s5, HSFO, disputed — linked to c8
  {
    id: 'del8',
    reference: 'DEL-2026-0447',
    delivery_date: '2026-05-25T06:00:00Z',
    vessel_id: 'v6',
    vessel: v6,
    port_id: 'p9',
    port: p9,
    supplier_id: 's5',
    supplier: s5,
    fuel_type: 'HSFO',
    bdn_quantity: 1800.0,
    vessel_quantity: 1778.5,
    bdn_number: 'BO-MLT-2026-1182',
    status: 'disputed',
    created_at: '2026-05-25T14:00:00Z',
    updated_at: '2026-05-25T14:00:00Z',
  },
  // del9: v7/p8/s1, MGO, disputed — linked to c9
  {
    id: 'del9',
    reference: 'DEL-2026-0479',
    delivery_date: '2026-06-06T12:00:00Z',
    vessel_id: 'v7',
    vessel: v7,
    port_id: 'p8',
    port: p8,
    supplier_id: 's1',
    supplier: mockSuppliers[0],
    fuel_type: 'MGO',
    bdn_quantity: 65.0,
    vessel_quantity: 64.8,
    bdn_number: 'PEN-GIB-2026-0884',
    status: 'disputed',
    created_at: '2026-06-06T18:00:00Z',
    updated_at: '2026-06-06T18:00:00Z',
  },
  // del10: v8/p10/s3, VLSFO, disputed — linked to c10
  {
    id: 'del10',
    reference: 'DEL-2026-0452',
    delivery_date: '2026-06-01T18:00:00Z',
    vessel_id: 'v8',
    vessel: v8,
    port_id: 'p10',
    port: p10,
    supplier_id: 's3',
    supplier: mockSuppliers[2],
    fuel_type: 'VLSFO',
    bdn_quantity: 650.0,
    vessel_quantity: 648.3,
    bdn_number: 'MIN-PIR-2026-6634',
    status: 'disputed',
    created_at: '2026-06-02T08:00:00Z',
    updated_at: '2026-06-02T08:00:00Z',
  },
  // del11: v9/p12/s2, VLSFO, confirmed — linked to c11
  {
    id: 'del11',
    reference: 'DEL-2026-0388',
    delivery_date: '2026-05-05T08:00:00Z',
    vessel_id: 'v9',
    vessel: v9,
    port_id: 'p12',
    port: p12,
    supplier_id: 's2',
    supplier: mockSuppliers[1],
    fuel_type: 'VLSFO',
    bdn_quantity: 320.0,
    vessel_quantity: 328.4,
    bdn_number: 'CHE-LPA-2026-2211',
    status: 'confirmed',
    created_at: '2026-05-05T16:00:00Z',
    updated_at: '2026-05-05T16:00:00Z',
  },
  // del12: v10/p6/s4, LSMGO, disputed — linked to c12
  {
    id: 'del12',
    reference: 'DEL-2026-0488',
    delivery_date: '2026-06-08T09:00:00Z',
    vessel_id: 'v10',
    vessel: v10,
    port_id: 'p6',
    port: p6,
    supplier_id: 's4',
    supplier: s4,
    fuel_type: 'LSMGO',
    bdn_quantity: 180.0,
    vessel_quantity: 167.8,
    bdn_number: 'WFS-LH-2026-5129',
    status: 'disputed',
    created_at: '2026-06-08T16:00:00Z',
    updated_at: '2026-06-08T16:00:00Z',
  },
  // del13: v3/p11/s3, B24, disputed — linked to c13
  {
    id: 'del13',
    reference: 'DEL-2026-0472',
    delivery_date: '2026-06-04T14:00:00Z',
    vessel_id: 'v3',
    vessel: mockVessels[2],
    port_id: 'p11',
    port: p11,
    supplier_id: 's3',
    supplier: mockSuppliers[2],
    fuel_type: 'B24',
    bdn_quantity: 420.0,
    vessel_quantity: 419.1,
    bdn_number: 'MIN-GEN-2026-2219',
    status: 'disputed',
    created_at: '2026-06-04T20:00:00Z',
    updated_at: '2026-06-04T20:00:00Z',
  },
  // del14: v11/p5/s5, VLSFO, disputed — linked to c14
  {
    id: 'del14',
    reference: 'DEL-2026-0501',
    delivery_date: '2026-06-11T07:00:00Z',
    vessel_id: 'v11',
    vessel: v11,
    port_id: 'p5',
    port: p5,
    supplier_id: 's5',
    supplier: s5,
    fuel_type: 'VLSFO',
    bdn_quantity: 950.0,
    vessel_quantity: 934.2,
    bdn_number: 'BO-AMS-2026-7741',
    status: 'disputed',
    created_at: '2026-06-11T14:00:00Z',
    updated_at: '2026-06-11T14:00:00Z',
  },
)

// ─────────────────────────────────────────────────────────────────────────────
// NEW CASES — c7 through c14
// ─────────────────────────────────────────────────────────────────────────────

// Retrieve the delivery objects we just pushed for use in cases
const _del7  = mockDeliveries.find(d => d.id === 'del7')!
const _del8  = mockDeliveries.find(d => d.id === 'del8')!
const _del9  = mockDeliveries.find(d => d.id === 'del9')!
const _del10 = mockDeliveries.find(d => d.id === 'del10')!
const _del11 = mockDeliveries.find(d => d.id === 'del11')!
const _del12 = mockDeliveries.find(d => d.id === 'del12')!
const _del13 = mockDeliveries.find(d => d.id === 'del13')!
const _del14 = mockDeliveries.find(d => d.id === 'del14')!

mockCases.push(
  // c7: Antwerp VLSFO off-spec
  {
    id: 'c7',
    reference: 'CPM-2026-0048',
    delivery_id: 'del7',
    delivery: _del7,
    vessel_id: 'v5',
    vessel: v5,
    port_id: 'p4',
    port: p4,
    supplier_id: 's4',
    supplier: s4,
    fuel_type: 'VLSFO',
    discrepancy_type: 'off_spec',
    claimed_quantity: 800.0,
    bdn_quantity: 800.0,
    status: 'open',
    priority: 'high',
    assigned_to: 'u2',
    assigned_user: mockUsers[1],
    opened_at: '2026-06-05T09:00:00Z',
    description: 'Independent lab analysis (SGS Antwerp lab ref ANT-2026-18842) reveals sulphur 0.53% m/m exceeding 0.50% MARPOL limit and kinematic viscosity 395 cSt exceeding 380 cSt ISO 8217 maximum. BDN values did not disclose deviation.',
    created_at: '2026-06-05T09:00:00Z',
    updated_at: '2026-06-11T15:00:00Z',
  },
  // c8: Marsaxlokk HSFO quantity short
  {
    id: 'c8',
    reference: 'CPM-2026-0045',
    delivery_id: 'del8',
    delivery: _del8,
    vessel_id: 'v6',
    vessel: v6,
    port_id: 'p9',
    port: p9,
    supplier_id: 's5',
    supplier: s5,
    fuel_type: 'HSFO',
    discrepancy_type: 'quantity_short',
    claimed_quantity: 1778.5,
    bdn_quantity: 1800.0,
    status: 'under_review',
    priority: 'high',
    assigned_to: 'u2',
    assigned_user: mockUsers[1],
    opened_at: '2026-05-27T08:00:00Z',
    description: 'Three independent measurement sources — vessel ullage 1778.5 MT, MFM 1789.4 MT, and independent surveyor 1782.1 MT — all fall below BDN figure of 1800 MT. Only barge figure at 1803.2 MT exceeds BDN. Barge figures disputed. Estimated shortage 18-22 MT.',
    created_at: '2026-05-27T08:00:00Z',
    updated_at: '2026-06-10T11:00:00Z',
  },
  // c9: Gibraltar MGO documentation dispute
  {
    id: 'c9',
    reference: 'CPM-2026-0052',
    delivery_id: 'del9',
    delivery: _del9,
    vessel_id: 'v7',
    vessel: v7,
    port_id: 'p8',
    port: p8,
    supplier_id: 's1',
    supplier: mockSuppliers[0],
    fuel_type: 'MGO',
    discrepancy_type: 'documentation',
    claimed_quantity: 65.0,
    bdn_quantity: 65.0,
    status: 'open',
    priority: 'normal',
    assigned_to: 'u3',
    assigned_user: mockUsers[2],
    opened_at: '2026-06-07T10:00:00Z',
    description: 'BDN signed by unidentified crew member, not vessel master as required. Delivery commencement time on BDN (14:30 LT) conflicts with vessel engine room log (15:15 LT). Chief Engineer disputes attendance at commencement. BDN validity under review; quantity figures within tolerance.',
    created_at: '2026-06-07T10:00:00Z',
    updated_at: '2026-06-07T10:00:00Z',
  },
  // c10: Piraeus VLSFO contamination
  {
    id: 'c10',
    reference: 'CPM-2026-0056',
    delivery_id: 'del10',
    delivery: _del10,
    vessel_id: 'v8',
    vessel: v8,
    port_id: 'p10',
    port: p10,
    supplier_id: 's3',
    supplier: mockSuppliers[2],
    fuel_type: 'VLSFO',
    discrepancy_type: 'contamination',
    claimed_quantity: 650.0,
    bdn_quantity: 650.0,
    status: 'escalated',
    priority: 'urgent',
    assigned_to: 'u1',
    assigned_user: mockUsers[0],
    opened_at: '2026-06-03T14:00:00Z',
    description: 'Vessel reports abnormal dark sludge in HFO settling tank 24hrs post-delivery. Independent lab analysis (Intertek Piraeus ref PIR-2026-7741) detects chlorinated solvents: toluene 85 ppm, xylene 32 ppm. Waste/other compounds 0.15% v/v (ISO 8217 max 0.10%). Vessel slow-steaming pending full investigation. Off-hire and fuel disposal costs accumulating.',
    created_at: '2026-06-03T14:00:00Z',
    updated_at: '2026-06-12T09:00:00Z',
  },
  // c11: Las Palmas VLSFO quantity over
  {
    id: 'c11',
    reference: 'CPM-2026-0033',
    delivery_id: 'del11',
    delivery: _del11,
    vessel_id: 'v9',
    vessel: v9,
    port_id: 'p12',
    port: p12,
    supplier_id: 's2',
    supplier: mockSuppliers[1],
    fuel_type: 'VLSFO',
    discrepancy_type: 'quantity_over',
    claimed_quantity: 328.4,
    bdn_quantity: 320.0,
    status: 'resolved',
    priority: 'low',
    assigned_to: 'u3',
    assigned_user: mockUsers[2],
    opened_at: '2026-05-07T09:00:00Z',
    description: 'Post-bunkering ullage 328.4 MT vs BDN 320 MT. Over-delivery 8.4 MT (2.6%). Supplier confirmed inadvertent over-delivery. Revised BDN 328.4 MT issued. Invoice adjusted. Case resolved.',
    created_at: '2026-05-07T09:00:00Z',
    updated_at: '2026-05-15T11:00:00Z',
  },
  // c12: Le Havre LSMGO MFM dispute
  {
    id: 'c12',
    reference: 'CPM-2026-0059',
    delivery_id: 'del12',
    delivery: _del12,
    vessel_id: 'v10',
    vessel: v10,
    port_id: 'p6',
    port: p6,
    supplier_id: 's4',
    supplier: s4,
    fuel_type: 'LSMGO',
    discrepancy_type: 'mfm_dispute',
    claimed_quantity: 163.5,
    bdn_quantity: 180.0,
    status: 'open',
    priority: 'high',
    assigned_to: 'u2',
    assigned_user: mockUsers[1],
    opened_at: '2026-06-09T09:00:00Z',
    description: 'MFM record 163.5 MT significantly below BDN 180 MT and barge soundings 180.2 MT. Vessel ullage measurement 167.8 MT. Shore tank before/after comparison at Le Havre Oil Terminal indicates approx 169 MT delivered. Supplier disputes MFM; claims calibration drift. Discrepancy 16.5 MT (9.2%).',
    created_at: '2026-06-09T09:00:00Z',
    updated_at: '2026-06-09T09:00:00Z',
  },
  // c13: Genoa B24 off-spec
  {
    id: 'c13',
    reference: 'CPM-2026-0061',
    delivery_id: 'del13',
    delivery: _del13,
    vessel_id: 'v3',
    vessel: mockVessels[2],
    port_id: 'p11',
    port: p11,
    supplier_id: 's3',
    supplier: mockSuppliers[2],
    fuel_type: 'B24',
    discrepancy_type: 'off_spec',
    claimed_quantity: 420.0,
    bdn_quantity: 420.0,
    status: 'under_review',
    priority: 'normal',
    assigned_to: 'u1',
    assigned_user: mockUsers[0],
    opened_at: '2026-06-05T11:00:00Z',
    description: 'B24 biofuel blend delivered with FAME content 27.2% v/v against maximum 24% declared in supply nomination and ISO 8217 FAME limit. Oxidation stability 4.2 hours against minimum 6 hours for FAME blends. Acid number borderline at 0.42 mg KOH/g. FuelEU compliance impact requires assessment.',
    created_at: '2026-06-05T11:00:00Z',
    updated_at: '2026-06-11T14:00:00Z',
  },
  // c14: Amsterdam VLSFO quantity short
  {
    id: 'c14',
    reference: 'CPM-2026-0064',
    delivery_id: 'del14',
    delivery: _del14,
    vessel_id: 'v11',
    vessel: v11,
    port_id: 'p5',
    port: p5,
    supplier_id: 's5',
    supplier: s5,
    fuel_type: 'VLSFO',
    discrepancy_type: 'quantity_short',
    claimed_quantity: 934.2,
    bdn_quantity: 950.0,
    status: 'pending_response',
    priority: 'normal',
    assigned_to: 'u2',
    assigned_user: mockUsers[1],
    opened_at: '2026-06-12T09:00:00Z',
    description: 'Vessel ullage post-bunkering indicates 934.2 MT received vs BDN 950 MT. Independent surveyor (Bureau Veritas) figure 941.8 MT also below BDN. Barge departure soundings 952.7 MT. Three-way shortfall against BDN. Shortage approximately 15.8 MT. Formal response requested from Bunker One within 5 business days.',
    created_at: '2026-06-12T09:00:00Z',
    updated_at: '2026-06-12T09:00:00Z',
  },
)

// ─────────────────────────────────────────────────────────────────────────────
// NEW MEASUREMENTS — for cases c7–c14
// ─────────────────────────────────────────────────────────────────────────────

mockMeasurements.push(
  // c7: Antwerp VLSFO off-spec — vessel, barge
  {
    id: 'm7',
    case_id: 'c7',
    source: 'vessel',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 795.8,
    observed_volume_m3: 805.5,
    temperature_c: 47.2,
    density_at_obs_kgm3: 0.9881,
    density_at_15c_kgm3: 0.9925,
    vcf: 0.9956,
    trim_correction_m3: 0,
    surveyor_name: 'Chief Officer',
    timestamp_utc: '2026-06-03T19:30:00Z',
    notes: 'Post-bunkering tank measurement',
    created_at: '2026-06-05T09:00:00Z',
    updated_at: '2026-06-05T09:00:00Z',
  },
  {
    id: 'm8',
    case_id: 'c7',
    source: 'barge',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 802.1,
    observed_volume_m3: 811.5,
    temperature_c: 48.5,
    density_at_obs_kgm3: 0.9884,
    density_at_15c_kgm3: 0.9934,
    vcf: 0.9950,
    trim_correction_m3: 0,
    surveyor_name: 'Barge Master',
    timestamp_utc: '2026-06-03T19:45:00Z',
    notes: 'Barge departure soundings per BDN WFS-ANT-2026-3841',
    created_at: '2026-06-05T09:00:00Z',
    updated_at: '2026-06-05T09:00:00Z',
  },
  // c8: Marsaxlokk HSFO quantity short — vessel, barge (disputed), mfm, surveyor
  {
    id: 'm9',
    case_id: 'c8',
    source: 'vessel',
    fuel_grade: 'HSFO',
    is_disputed: false,
    quantity_mt: 1778.5,
    observed_volume_m3: 1818.9,
    temperature_c: 44.8,
    density_at_obs_kgm3: 0.9778,
    density_at_15c_kgm3: 0.9822,
    vcf: 0.9955,
    trim_correction_m3: 0,
    surveyor_name: 'Chief Officer',
    timestamp_utc: '2026-05-25T08:30:00Z',
    notes: 'Post-bunkering ullage measurement',
    created_at: '2026-05-27T08:00:00Z',
    updated_at: '2026-05-27T08:00:00Z',
  },
  {
    id: 'm10',
    case_id: 'c8',
    source: 'barge',
    fuel_grade: 'HSFO',
    is_disputed: true,
    quantity_mt: 1803.2,
    observed_volume_m3: 1844.5,
    temperature_c: 45.5,
    density_at_obs_kgm3: 0.9781,
    density_at_15c_kgm3: 0.9826,
    vcf: 0.9954,
    trim_correction_m3: 0,
    surveyor_name: 'Barge Master',
    timestamp_utc: '2026-05-25T08:45:00Z',
    notes: 'Barge departure soundings — sole outlier above BDN; barge meter accuracy disputed',
    dispute_reason: 'Barge departure soundings inconsistent with three independent measurement sources',
    created_at: '2026-05-27T08:00:00Z',
    updated_at: '2026-05-27T08:00:00Z',
  },
  {
    id: 'm11',
    case_id: 'c8',
    source: 'mfm',
    fuel_grade: 'HSFO',
    is_disputed: false,
    quantity_mt: 1789.4,
    observed_volume_m3: 1829.8,
    temperature_c: 44.9,
    density_at_obs_kgm3: 0.9779,
    density_at_15c_kgm3: 0.9825,
    vcf: 0.9955,
    trim_correction_m3: 0,
    surveyor_name: 'MFM System',
    timestamp_utc: '2026-05-25T08:35:00Z',
    notes: 'Inline MFM reading during delivery',
    created_at: '2026-05-27T08:00:00Z',
    updated_at: '2026-05-27T08:00:00Z',
  },
  {
    id: 'm12',
    case_id: 'c8',
    source: 'surveyor',
    fuel_grade: 'HSFO',
    is_disputed: false,
    quantity_mt: 1782.1,
    observed_volume_m3: 1822.2,
    temperature_c: 45.0,
    density_at_obs_kgm3: 0.9780,
    density_at_15c_kgm3: 0.9825,
    vcf: 0.9955,
    trim_correction_m3: 0,
    surveyor_name: 'SGS Maritime Services',
    timestamp_utc: '2026-05-25T09:15:00Z',
    notes: 'Independent surveyor measurement — converges with vessel and MFM figures',
    created_at: '2026-05-27T08:00:00Z',
    updated_at: '2026-05-27T08:00:00Z',
  },
  // c9: Gibraltar MGO documentation — vessel only
  {
    id: 'm13',
    case_id: 'c9',
    source: 'vessel',
    fuel_grade: 'MGO',
    is_disputed: false,
    quantity_mt: 64.8,
    observed_volume_m3: 77.8,
    temperature_c: 22.1,
    density_at_obs_kgm3: 0.8331,
    density_at_15c_kgm3: 0.8338,
    vcf: 0.9992,
    trim_correction_m3: 0,
    surveyor_name: 'Chief Engineer',
    timestamp_utc: '2026-06-06T14:30:00Z',
    notes: 'Post-bunkering tank measurement; quantity within tolerance',
    created_at: '2026-06-07T10:00:00Z',
    updated_at: '2026-06-07T10:00:00Z',
  },
  // c10: Piraeus VLSFO contamination — vessel, barge
  {
    id: 'm14',
    case_id: 'c10',
    source: 'vessel',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 648.3,
    observed_volume_m3: 655.5,
    temperature_c: 46.1,
    density_at_obs_kgm3: 0.9891,
    density_at_15c_kgm3: 0.9932,
    vcf: 0.9959,
    trim_correction_m3: 0,
    surveyor_name: 'Chief Officer',
    timestamp_utc: '2026-06-01T21:45:00Z',
    notes: 'Post-bunkering tank measurement',
    created_at: '2026-06-03T14:00:00Z',
    updated_at: '2026-06-03T14:00:00Z',
  },
  {
    id: 'm15',
    case_id: 'c10',
    source: 'barge',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 651.7,
    observed_volume_m3: 658.8,
    temperature_c: 46.8,
    density_at_obs_kgm3: 0.9893,
    density_at_15c_kgm3: 0.9941,
    vcf: 0.9952,
    trim_correction_m3: 0,
    surveyor_name: 'Barge Master',
    timestamp_utc: '2026-06-01T22:00:00Z',
    notes: 'Barge departure soundings per BDN MIN-PIR-2026-6634',
    created_at: '2026-06-03T14:00:00Z',
    updated_at: '2026-06-03T14:00:00Z',
  },
  // c11: Las Palmas VLSFO quantity over — vessel, barge, mfm
  {
    id: 'm16',
    case_id: 'c11',
    source: 'vessel',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 328.4,
    observed_volume_m3: 333.7,
    temperature_c: 49.2,
    density_at_obs_kgm3: 0.9842,
    density_at_15c_kgm3: 0.9895,
    vcf: 0.9947,
    trim_correction_m3: 0,
    surveyor_name: 'Chief Officer',
    timestamp_utc: '2026-05-05T10:30:00Z',
    notes: 'Post-bunkering ullage — over-delivery confirmed',
    created_at: '2026-05-07T09:00:00Z',
    updated_at: '2026-05-07T09:00:00Z',
  },
  {
    id: 'm17',
    case_id: 'c11',
    source: 'barge',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 328.9,
    observed_volume_m3: 334.1,
    temperature_c: 49.8,
    density_at_obs_kgm3: 0.9844,
    density_at_15c_kgm3: 0.9895,
    vcf: 0.9948,
    trim_correction_m3: 0,
    surveyor_name: 'Barge Master',
    timestamp_utc: '2026-05-05T10:45:00Z',
    notes: 'Barge departure soundings',
    created_at: '2026-05-07T09:00:00Z',
    updated_at: '2026-05-07T09:00:00Z',
  },
  {
    id: 'm18',
    case_id: 'c11',
    source: 'mfm',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 327.1,
    observed_volume_m3: 332.4,
    temperature_c: 49.1,
    density_at_obs_kgm3: 0.9841,
    density_at_15c_kgm3: 0.9892,
    vcf: 0.9949,
    trim_correction_m3: 0,
    surveyor_name: 'MFM System',
    timestamp_utc: '2026-05-05T10:35:00Z',
    notes: 'Inline MFM reading',
    created_at: '2026-05-07T09:00:00Z',
    updated_at: '2026-05-07T09:00:00Z',
  },
  // c12: Le Havre LSMGO MFM dispute — mfm (disputed by supplier), barge, vessel, manual
  {
    id: 'm19',
    case_id: 'c12',
    source: 'mfm',
    fuel_grade: 'LSMGO',
    is_disputed: true,
    quantity_mt: 163.5,
    observed_volume_m3: 193.5,
    temperature_c: 21.4,
    density_at_obs_kgm3: 0.8448,
    density_at_15c_kgm3: 0.8454,
    vcf: 0.9993,
    trim_correction_m3: 0,
    surveyor_name: 'MFM #WFS-LH-0042',
    timestamp_utc: '2026-06-08T11:20:00Z',
    notes: 'MFM reading disputed by supplier; calibration valid until December 2026',
    dispute_reason: 'Supplier claims MFM calibration drift; calibration certificate valid until 2026-12',
    created_at: '2026-06-09T09:00:00Z',
    updated_at: '2026-06-09T09:00:00Z',
  },
  {
    id: 'm20',
    case_id: 'c12',
    source: 'barge',
    fuel_grade: 'LSMGO',
    is_disputed: false,
    quantity_mt: 180.2,
    observed_volume_m3: 213.3,
    temperature_c: 22.1,
    density_at_obs_kgm3: 0.8451,
    density_at_15c_kgm3: 0.8458,
    vcf: 0.9992,
    trim_correction_m3: 0,
    surveyor_name: 'Barge Master',
    timestamp_utc: '2026-06-08T11:35:00Z',
    notes: 'Barge departure soundings per BDN WFS-LH-2026-5129',
    created_at: '2026-06-09T09:00:00Z',
    updated_at: '2026-06-09T09:00:00Z',
  },
  {
    id: 'm21',
    case_id: 'c12',
    source: 'vessel',
    fuel_grade: 'LSMGO',
    is_disputed: false,
    quantity_mt: 167.8,
    observed_volume_m3: 198.6,
    temperature_c: 21.8,
    density_at_obs_kgm3: 0.8449,
    density_at_15c_kgm3: 0.8455,
    vcf: 0.9993,
    trim_correction_m3: 0,
    surveyor_name: 'Chief Engineer',
    timestamp_utc: '2026-06-08T11:15:00Z',
    notes: 'Post-bunkering tank measurement',
    created_at: '2026-06-09T09:00:00Z',
    updated_at: '2026-06-09T09:00:00Z',
  },
  {
    id: 'm22',
    case_id: 'c12',
    source: 'manual',
    fuel_grade: 'LSMGO',
    is_disputed: false,
    quantity_mt: 169.4,
    surveyor_name: 'Le Havre Oil Terminal',
    timestamp_utc: '2026-06-08T08:00:00Z',
    notes: 'Shore tank before/after comparison — Le Havre Oil Terminal',
    created_at: '2026-06-09T09:00:00Z',
    updated_at: '2026-06-09T09:00:00Z',
  },
  // c13: Genoa B24 off-spec — vessel, barge
  {
    id: 'm23',
    case_id: 'c13',
    source: 'vessel',
    fuel_grade: 'B24',
    is_disputed: false,
    quantity_mt: 419.1,
    observed_volume_m3: 469.2,
    temperature_c: 42.5,
    density_at_obs_kgm3: 0.8934,
    density_at_15c_kgm3: 0.9105,
    vcf: 0.9812,
    trim_correction_m3: 0,
    surveyor_name: 'Chief Officer',
    timestamp_utc: '2026-06-04T16:30:00Z',
    notes: 'Post-bunkering tank measurement',
    created_at: '2026-06-05T11:00:00Z',
    updated_at: '2026-06-05T11:00:00Z',
  },
  {
    id: 'm24',
    case_id: 'c13',
    source: 'barge',
    fuel_grade: 'B24',
    is_disputed: false,
    quantity_mt: 421.8,
    observed_volume_m3: 471.9,
    temperature_c: 43.1,
    density_at_obs_kgm3: 0.8937,
    density_at_15c_kgm3: 0.9112,
    vcf: 0.9808,
    trim_correction_m3: 0,
    surveyor_name: 'Barge Master',
    timestamp_utc: '2026-06-04T16:45:00Z',
    notes: 'Barge departure soundings per BDN MIN-GEN-2026-2219',
    created_at: '2026-06-05T11:00:00Z',
    updated_at: '2026-06-05T11:00:00Z',
  },
  // c14: Amsterdam VLSFO quantity short — vessel, barge, surveyor
  {
    id: 'm25',
    case_id: 'c14',
    source: 'vessel',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 934.2,
    observed_volume_m3: 946.7,
    temperature_c: 48.6,
    density_at_obs_kgm3: 0.9867,
    density_at_15c_kgm3: 0.9915,
    vcf: 0.9952,
    trim_correction_m3: 0,
    surveyor_name: 'Chief Officer',
    timestamp_utc: '2026-06-11T09:15:00Z',
    notes: 'Post-bunkering ullage measurement',
    created_at: '2026-06-12T09:00:00Z',
    updated_at: '2026-06-12T09:00:00Z',
  },
  {
    id: 'm26',
    case_id: 'c14',
    source: 'barge',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 952.7,
    observed_volume_m3: 965.3,
    temperature_c: 49.1,
    density_at_obs_kgm3: 0.9869,
    density_at_15c_kgm3: 0.9920,
    vcf: 0.9949,
    trim_correction_m3: 0,
    surveyor_name: 'Barge Master',
    timestamp_utc: '2026-06-11T09:30:00Z',
    notes: 'Barge departure soundings per BDN BO-AMS-2026-7741',
    created_at: '2026-06-12T09:00:00Z',
    updated_at: '2026-06-12T09:00:00Z',
  },
  {
    id: 'm27',
    case_id: 'c14',
    source: 'surveyor',
    fuel_grade: 'VLSFO',
    is_disputed: false,
    quantity_mt: 941.8,
    observed_volume_m3: 954.2,
    temperature_c: 48.8,
    density_at_obs_kgm3: 0.9868,
    density_at_15c_kgm3: 0.9919,
    vcf: 0.9949,
    trim_correction_m3: 0,
    surveyor_name: 'Bureau Veritas Amsterdam',
    timestamp_utc: '2026-06-11T10:00:00Z',
    notes: 'Independent surveyor measurement — below BDN and barge figure',
    created_at: '2026-06-12T09:00:00Z',
    updated_at: '2026-06-12T09:00:00Z',
  },
)

// ─────────────────────────────────────────────────────────────────────────────
// NEW SPEC CHECKS — for cases c7, c10, c13
// ─────────────────────────────────────────────────────────────────────────────

mockSpecsChecks.push(
  // c7: Antwerp VLSFO off-spec (SGS Antwerp)
  { id: 'sc10', case_id: 'c7', fuel_grade: 'VLSFO', parameter_name: 'Density at 15°C', unit: 'kg/m³', bdn_value: 0.9881, contract_min: null, contract_max: 0.9910, lab_result: 0.9887, status: 'ok', lab_reference: 'SGS-ANT-2026-18842', lab_date: '2026-06-10', lab_name: 'SGS Antwerp', created_at: '2026-06-11T09:00:00Z', updated_at: '2026-06-11T09:00:00Z' },
  { id: 'sc11', case_id: 'c7', fuel_grade: 'VLSFO', parameter_name: 'Flash Point', unit: '°C', bdn_value: 63.0, contract_min: 60.0, contract_max: null, lab_result: 64.0, status: 'ok', lab_reference: 'SGS-ANT-2026-18842', lab_date: '2026-06-10', lab_name: 'SGS Antwerp', created_at: '2026-06-11T09:00:00Z', updated_at: '2026-06-11T09:00:00Z' },
  { id: 'sc12', case_id: 'c7', fuel_grade: 'VLSFO', parameter_name: 'Sulphur Content', unit: '% m/m', bdn_value: 0.47, contract_min: null, contract_max: 0.50, lab_result: 0.53, status: 'off_spec', notes: 'MARPOL SECA violation', lab_reference: 'SGS-ANT-2026-18842', lab_date: '2026-06-10', lab_name: 'SGS Antwerp', created_at: '2026-06-11T09:00:00Z', updated_at: '2026-06-11T09:00:00Z' },
  { id: 'sc13', case_id: 'c7', fuel_grade: 'VLSFO', parameter_name: 'Kinematic Viscosity at 50°C', unit: 'cSt', bdn_value: 372.0, contract_min: null, contract_max: 380.0, lab_result: 395.0, status: 'off_spec', notes: 'Risk of pump cavitation at elevated viscosity', lab_reference: 'SGS-ANT-2026-18842', lab_date: '2026-06-10', lab_name: 'SGS Antwerp', created_at: '2026-06-11T09:00:00Z', updated_at: '2026-06-11T09:00:00Z' },
  { id: 'sc14', case_id: 'c7', fuel_grade: 'VLSFO', parameter_name: 'Aluminium + Silicon', unit: 'mg/kg', bdn_value: null, contract_min: null, contract_max: 25.0, lab_result: 18.0, status: 'ok', lab_reference: 'SGS-ANT-2026-18842', lab_date: '2026-06-10', lab_name: 'SGS Antwerp', created_at: '2026-06-11T09:00:00Z', updated_at: '2026-06-11T09:00:00Z' },
  { id: 'sc15', case_id: 'c7', fuel_grade: 'VLSFO', parameter_name: 'CCAI', unit: '', bdn_value: null, contract_min: null, contract_max: 870.0, lab_result: 848.0, status: 'ok', lab_reference: 'SGS-ANT-2026-18842', lab_date: '2026-06-10', lab_name: 'SGS Antwerp', created_at: '2026-06-11T09:00:00Z', updated_at: '2026-06-11T09:00:00Z' },
  { id: 'sc16', case_id: 'c7', fuel_grade: 'VLSFO', parameter_name: 'Water Content', unit: '% v/v', bdn_value: null, contract_min: null, contract_max: 0.50, lab_result: 0.08, status: 'ok', lab_reference: 'SGS-ANT-2026-18842', lab_date: '2026-06-10', lab_name: 'SGS Antwerp', created_at: '2026-06-11T09:00:00Z', updated_at: '2026-06-11T09:00:00Z' },
  // c10: Piraeus VLSFO contamination (Intertek Piraeus)
  { id: 'sc17', case_id: 'c10', fuel_grade: 'VLSFO', parameter_name: 'Chlorinated Solvents (toluene+xylene)', unit: 'ppm', bdn_value: null, contract_min: null, contract_max: 5.0, lab_result: 117.0, status: 'off_spec', notes: 'Toluene 85ppm, xylene 32ppm detected. Potential engine damage and regulatory violation.', lab_reference: 'ITEK-PIR-2026-7741', lab_date: '2026-06-05', lab_name: 'Intertek Piraeus', created_at: '2026-06-06T09:00:00Z', updated_at: '2026-06-06T09:00:00Z' },
  { id: 'sc18', case_id: 'c10', fuel_grade: 'VLSFO', parameter_name: 'Waste/Other Compounds', unit: '% v/v', bdn_value: null, contract_min: null, contract_max: 0.10, lab_result: 0.15, status: 'off_spec', notes: 'ISO 8217 prohibits waste oil contamination', lab_reference: 'ITEK-PIR-2026-7741', lab_date: '2026-06-05', lab_name: 'Intertek Piraeus', created_at: '2026-06-06T09:00:00Z', updated_at: '2026-06-06T09:00:00Z' },
  { id: 'sc19', case_id: 'c10', fuel_grade: 'VLSFO', parameter_name: 'Density at 15°C', unit: 'kg/m³', bdn_value: 0.9889, contract_min: null, contract_max: 0.9910, lab_result: 0.9895, status: 'ok', lab_reference: 'ITEK-PIR-2026-7741', lab_date: '2026-06-05', lab_name: 'Intertek Piraeus', created_at: '2026-06-06T09:00:00Z', updated_at: '2026-06-06T09:00:00Z' },
  { id: 'sc20', case_id: 'c10', fuel_grade: 'VLSFO', parameter_name: 'Flash Point', unit: '°C', bdn_value: 62.0, contract_min: 60.0, contract_max: null, lab_result: 62.0, status: 'ok', lab_reference: 'ITEK-PIR-2026-7741', lab_date: '2026-06-05', lab_name: 'Intertek Piraeus', created_at: '2026-06-06T09:00:00Z', updated_at: '2026-06-06T09:00:00Z' },
  { id: 'sc21', case_id: 'c10', fuel_grade: 'VLSFO', parameter_name: 'Sulphur Content', unit: '% m/m', bdn_value: 0.44, contract_min: null, contract_max: 0.50, lab_result: 0.45, status: 'ok', lab_reference: 'ITEK-PIR-2026-7741', lab_date: '2026-06-05', lab_name: 'Intertek Piraeus', created_at: '2026-06-06T09:00:00Z', updated_at: '2026-06-06T09:00:00Z' },
  // c13: Genoa B24 off-spec (DNV Maritime Advisory Genoa)
  { id: 'sc22', case_id: 'c13', fuel_grade: 'B24', parameter_name: 'FAME Content', unit: '% v/v', bdn_value: 24.0, contract_min: null, contract_max: 24.0, lab_result: 27.2, status: 'off_spec', notes: 'Exceeds ISO 8217:2017 FAME limit and supply nomination specification', lab_reference: 'DNV-GEN-2026-9921', lab_date: '2026-06-08', lab_name: 'DNV Maritime Advisory Genoa', created_at: '2026-06-09T10:00:00Z', updated_at: '2026-06-09T10:00:00Z' },
  { id: 'sc23', case_id: 'c13', fuel_grade: 'B24', parameter_name: 'Oxidation Stability (Rancimat)', unit: 'hours', bdn_value: null, contract_min: 6.0, contract_max: null, lab_result: 4.2, status: 'off_spec', notes: 'FAME blend must meet minimum 6h oxidation stability per ISO 8217', lab_reference: 'DNV-GEN-2026-9921', lab_date: '2026-06-08', lab_name: 'DNV Maritime Advisory Genoa', created_at: '2026-06-09T10:00:00Z', updated_at: '2026-06-09T10:00:00Z' },
  { id: 'sc24', case_id: 'c13', fuel_grade: 'B24', parameter_name: 'Acid Number', unit: 'mg KOH/g', bdn_value: null, contract_min: null, contract_max: 0.50, lab_result: 0.42, status: 'warning', notes: 'Approaching limit; trend risk in storage', lab_reference: 'DNV-GEN-2026-9921', lab_date: '2026-06-08', lab_name: 'DNV Maritime Advisory Genoa', created_at: '2026-06-09T10:00:00Z', updated_at: '2026-06-09T10:00:00Z' },
  { id: 'sc25', case_id: 'c13', fuel_grade: 'B24', parameter_name: 'Sulphur Content', unit: '% m/m', bdn_value: 0.12, contract_min: null, contract_max: 0.50, lab_result: 0.11, status: 'ok', lab_reference: 'DNV-GEN-2026-9921', lab_date: '2026-06-08', lab_name: 'DNV Maritime Advisory Genoa', created_at: '2026-06-09T10:00:00Z', updated_at: '2026-06-09T10:00:00Z' },
  { id: 'sc26', case_id: 'c13', fuel_grade: 'B24', parameter_name: 'Flash Point', unit: '°C', bdn_value: null, contract_min: 60.0, contract_max: null, lab_result: 67.0, status: 'ok', lab_reference: 'DNV-GEN-2026-9921', lab_date: '2026-06-08', lab_name: 'DNV Maritime Advisory Genoa', created_at: '2026-06-09T10:00:00Z', updated_at: '2026-06-09T10:00:00Z' },
  { id: 'sc27', case_id: 'c13', fuel_grade: 'B24', parameter_name: 'Water Content', unit: 'mg/kg', bdn_value: null, contract_min: null, contract_max: 500.0, lab_result: 210.0, status: 'ok', lab_reference: 'DNV-GEN-2026-9921', lab_date: '2026-06-08', lab_name: 'DNV Maritime Advisory Genoa', created_at: '2026-06-09T10:00:00Z', updated_at: '2026-06-09T10:00:00Z' },
)

// ─────────────────────────────────────────────────────────────────────────────
// NEW DRAFTS — dr4 through dr9
// ─────────────────────────────────────────────────────────────────────────────

mockDrafts.push(
  // dr4: c7, Claim_Letter, sent
  {
    id: 'dr4',
    case_id: 'c7',
    draft_type: 'Claim_Letter',
    title: 'Claim Letter — MV Elara Spirit — Antwerp — Off-Spec VLSFO',
    body: `Without Prejudice — Subject to Contract

To: World Fuel Services Corp — Claims Department
From: Copemer Ltd
Date: 11 June 2026
Re: Formal Claim — MV Elara Spirit (IMO 9856341) — Antwerp — 03 June 2026

We write on behalf of the owners of MV Elara Spirit to formally notify World Fuel Services Corp of a claim arising from the bunker delivery of 03 June 2026 at the Port of Antwerp.

DELIVERY DETAILS
Vessel: MV Elara Spirit (IMO 9856341)
Port: Antwerp (BEANR)
Delivery Date: 03 June 2026
BDN Reference: WFS-ANT-2026-3841
Fuel Grade: VLSFO
BDN Quantity: 800 MT

NATURE OF CLAIM — OFF-SPEC FUEL
Independent analysis by SGS Antwerp (Report ANT-2026-18842, dated 10 June 2026) of the retained representative sample confirms two parameters in non-conformance with ISO 8217:2017 RMG380:
(1) Sulphur Content: 0.53% m/m — EXCEEDS MARPOL Annex VI SECA limit of 0.50% m/m
(2) Kinematic Viscosity at 50°C: 395 cSt — exceeds ISO 8217 maximum of 380 cSt

QUANTUM
Estimated claim value USD 42,000–58,000 including cost of segregation, off-loading, and replacement fuel premium. Full quantum to be confirmed on completion of operational assessment.

We require your substantive written response within 7 business days. All rights reserved without prejudice.

Copemer Ltd`,
    status: 'sent',
    version: 1,
    created_by: 'u2',
    creator: mockUsers[1],
    sent_at: '2026-06-11T10:00:00Z',
    created_at: '2026-06-11T09:00:00Z',
    updated_at: '2026-06-11T10:00:00Z',
  },
  // dr5: c8, Internal_Memo, draft
  {
    id: 'dr5',
    case_id: 'c8',
    draft_type: 'Internal_Memo',
    title: 'Internal Analysis — MV Poseidon Bay — Marsaxlokk Quantity Short',
    body: `INTERNAL — NOT FOR EXTERNAL DISTRIBUTION

Subject: Quantity Short — MV Poseidon Bay / Bunker One — Marsaxlokk
Date: 28 May 2026
Prepared by: Sophie Lindqvist

MEASUREMENT SUMMARY
Vessel ullage: 1,778.5 MT
MFM (inline): 1,789.4 MT
Independent surveyor (SGS): 1,782.1 MT
Barge (BDN source): 1,803.2 MT
BDN Quantity: 1,800 MT

ANALYSIS
Three independent measurement sources converge in a range of 1,778–1,789 MT. The barge figure of 1,803.2 MT is the sole outlier, exceeding the BDN by 3.2 MT. This pattern is consistent with barge meter inaccuracy or trim error at departure soundings.

RECOMMENDATION
Challenge barge departure soundings; request barge tank calibration tables and trim log. Accept independent surveyor figure as primary reference. Estimated shortage claim: approximately 18–22 MT at ~USD 480/MT = USD 8,640–10,560.`,
    status: 'draft',
    version: 1,
    created_by: 'u2',
    creator: mockUsers[1],
    created_at: '2026-05-28T14:00:00Z',
    updated_at: '2026-05-28T14:00:00Z',
  },
  // dr6: c10, Protest_Letter, approved
  {
    id: 'dr6',
    case_id: 'c10',
    draft_type: 'Protest_Letter',
    title: 'Vessel Protest — MV Hercules Merchant — Contaminated VLSFO — Piraeus',
    body: `WITHOUT PREJUDICE

NOTICE OF VESSEL PROTEST

To: Minerva Bunkering S.A.
Date: 04 June 2026
Re: MV Hercules Merchant (IMO 9623405) — Piraeus — Delivery 01 June 2026 — BDN: MIN-PIR-2026-6634

We hereby formally protest the quality of the bunker delivery described above. Within 24 hours of delivery, the vessel reported abnormal dark sludge accumulation in the HFO settling tank, with associated pressure differential increase across the purifier. Independent laboratory analysis (Intertek Piraeus, Report PIR-2026-7741) of the retained representative sample confirms:

CHLORINATED SOLVENTS DETECTED
Toluene: 85 mg/kg
Xylene: 32 mg/kg

WASTE COMPOUNDS: 0.15% v/v (ISO 8217:2017 maximum: 0.10% v/v)

The presence of chlorinated solvents in marine fuel oil constitutes a serious breach of ISO 8217:2017 and MARPOL Annex VI. The vessel has been ordered to slow steam pending technical assessment. Off-hire is accruing.

We hold you responsible for all losses, costs and expenses arising from this delivery, including off-hire, fuel disposal, tank cleaning, and replacement fuel costs. Formal claim to follow.

All rights reserved without prejudice.
Copemer Ltd`,
    status: 'approved',
    version: 1,
    created_by: 'u1',
    creator: mockUsers[0],
    created_at: '2026-06-04T10:00:00Z',
    updated_at: '2026-06-04T14:00:00Z',
  },
  // dr7: c12, LOP_Response, draft
  {
    id: 'dr7',
    case_id: 'c12',
    draft_type: 'LOP_Response',
    title: 'LOP Response — MV Byzantium Star — Le Havre — MFM Dispute',
    body: `Without Prejudice

To: World Fuel Services Corp
Attn: Bunker Operations
Re: MV Byzantium Star (IMO 9834567) — Le Havre — 08 June 2026 — BDN Ref: WFS-LH-2026-5129

We refer to your Letter of Protest and record our position as follows. MFM reading of 163.5 MT at the time of delivery is supported by:
(1) Vessel ullage measurement: 167.8 MT
(2) Shore tank before/after comparison: approximately 169 MT

These three sources consistently indicate delivery of approximately 163–170 MT against your stated BDN figure of 180 MT.

The discrepancy of 16.5 MT (9.2%) is significantly outside commercial tolerance and is not explained by the MFM calibration argument advanced by your operations team. MFM #WFS-LH-0042 calibration certificate is valid until December 2026.

We formally request:
(1) Barge departure soundings signed by barge master
(2) MFM calibration certificate
(3) Shore tank gauge records from Le Havre Oil Terminal

All rights reserved.
Copemer Ltd`,
    status: 'draft',
    version: 1,
    created_by: 'u2',
    creator: mockUsers[1],
    created_at: '2026-06-09T14:00:00Z',
    updated_at: '2026-06-09T14:00:00Z',
  },
  // dr8: c13, Supplier_Challenge, under_review
  {
    id: 'dr8',
    case_id: 'c13',
    draft_type: 'Supplier_Challenge',
    title: 'Supplier Quality Challenge — MV Atlantic Carrier — Genoa — B24 Off-Spec',
    body: `Without Prejudice

To: Minerva Bunkering S.A. — Quality Department
Re: MV Atlantic Carrier (IMO 9634789) — Genoa — B24 Delivery 04 June 2026 — BDN: MIN-GEN-2026-2219

We write to formally challenge the quality of the B24 biofuel blend supplied under the above delivery.

QUALITY NON-CONFORMANCES
Laboratory analysis (DNV Maritime Advisory, Report DNV-GEN-2026-9921, dated 08 June 2026) confirms:
(1) FAME Content: 27.2% v/v — EXCEEDS 24.0% v/v declared in supply nomination and ISO 8217:2017 limit
(2) Oxidation Stability (Rancimat method): 4.2 hours — below minimum 6.0 hours required for FAME blends per EN 14112

These non-conformances affect:
(a) regulatory compliance under FuelEU Maritime
(b) fuel storage stability and engine deposit risk

We require your written response within 5 business days confirming:
(1) Source of the out-of-specification FAME content
(2) Quality control records for this parcel
(3) Your proposed remedy

All rights reserved.
Copemer Ltd`,
    status: 'under_review',
    version: 1,
    created_by: 'u1',
    creator: mockUsers[0],
    created_at: '2026-06-09T10:00:00Z',
    updated_at: '2026-06-11T14:00:00Z',
  },
  // dr9: c14, Reservation_of_Rights, sent
  {
    id: 'dr9',
    case_id: 'c14',
    draft_type: 'Reservation_of_Rights',
    title: 'Reservation of Rights — MV Celtic Horizon — Amsterdam — Quantity Short',
    body: `Without Prejudice

To: Bunker One A/S
Attn: Operations Department
Re: MV Celtic Horizon (IMO 9912006) — Amsterdam — 11 June 2026 — BDN Ref: BO-AMS-2026-7741

We write on behalf of the owners of MV Celtic Horizon to formally reserve all rights in connection with the above delivery.

Post-bunkering measurement shows the following:
Vessel ullage: 934.2 MT
Independent surveyor (Bureau Veritas): 941.8 MT
Barge departure soundings: 952.7 MT
BDN Quantity: 950 MT

Vessel and surveyor figures indicate a shortfall of approximately 8–16 MT against the BDN quantity. All measurement records are being preserved. We formally request the following documents within 5 business days:
(1) Barge departure ullage report signed by barge master
(2) Barge calibration certificate
(3) BDN co-signed by surveyor (if applicable)

Until the above are received and reviewed, all our client's rights are expressly reserved, including rights of deduction and claim. This communication is written without prejudice.

Copemer Ltd — Disputes & Claims Department`,
    status: 'sent',
    version: 1,
    created_by: 'u2',
    creator: mockUsers[1],
    sent_at: '2026-06-12T11:00:00Z',
    created_at: '2026-06-12T09:00:00Z',
    updated_at: '2026-06-12T11:00:00Z',
  },
)

// ─────────────────────────────────────────────────────────────────────────────
// NEW FUEL READINESS RECORDS — fr5 through fr10
// ─────────────────────────────────────────────────────────────────────────────

mockFuelReadiness.push(
  // fr5: v5 (Elara Spirit) — Methanol, in_progress, score 35
  {
    id: 'fr5',
    vessel_id: 'v5',
    vessel: v5,
    fuel_type: 'Methanol',
    status: 'in_progress',
    readiness_score: 35,
    requirements: [
      { id: 'r21', label: 'Feasibility study', description: 'Methanol conversion feasibility study for Aframax tanker', completed: true },
      { id: 'r22', label: 'IGF Code pre-assessment', description: 'Pre-assessment against IMO IGF Code requirements', completed: false, due_date: '2026-12-01' },
      { id: 'r23', label: 'Flag state notification', description: 'Liberia flag state notification and approval process', completed: false },
      { id: 'r24', label: 'Crew training', description: 'All officers methanol handling and emergency response training', completed: false, due_date: '2027-01-01' },
      { id: 'r25', label: 'Fuel system engineering study', description: 'Engineering study for methanol fuel system adaptation', completed: false, due_date: '2026-11-01' },
      { id: 'r26', label: 'Insurance review', description: 'P&I and H&M insurance review for methanol operations', completed: false },
    ],
    target_date: '2027-06-01',
    certifying_body: "Lloyd's Register",
    notes: 'Aframax conversion study commissioned. Longer timeline due to vessel age and flag state process.',
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  // fr6: v6 (Poseidon Bay) — LNG, in_progress, score 55
  {
    id: 'fr6',
    vessel_id: 'v6',
    vessel: v6,
    fuel_type: 'LNG',
    status: 'in_progress',
    readiness_score: 55,
    requirements: [
      { id: 'r27', label: 'IGF Code design review', description: 'Class design review against IMO IGF Code for LNG systems', completed: true },
      { id: 'r28', label: 'Class notation application', description: 'DNV LNG-ready class notation application submitted', completed: true },
      { id: 'r29', label: 'LNG fuel containment system approved', description: 'Class approval of LNG containment system design', completed: false, due_date: '2026-09-30' },
      { id: 'r30', label: 'Dual-fuel engine order placed', description: 'MAN ME-GI dual-fuel engine order confirmed', completed: true },
      { id: 'r31', label: 'Crew training programme', description: 'LNG handling, cryogenic safety, and emergency response', completed: true },
      { id: 'r32', label: 'Port availability survey', description: 'LNG bunkering availability at primary VLCC ports', completed: false, due_date: '2026-08-01' },
      { id: 'r33', label: 'First bunkering SOP', description: 'Standard operating procedure for first LNG bunkering', completed: false, due_date: '2026-10-01' },
    ],
    target_date: '2027-01-01',
    certifying_body: 'DNV',
    notes: 'Engine order confirmed MAN ME-GI. LNG containment system design under class review.',
    created_at: '2025-10-01T08:00:00Z',
    updated_at: '2026-06-08T14:00:00Z',
  },
  // fr7: v7 (Thalassa Wind) — B24, ready, score 89
  {
    id: 'fr7',
    vessel_id: 'v7',
    vessel: v7,
    fuel_type: 'B24',
    status: 'ready',
    readiness_score: 89,
    requirements: [
      { id: 'r34', label: 'Engine compatibility confirmed', description: 'Wärtsilä engine compatibility with B24 biofuel blend confirmed', completed: true },
      { id: 'r35', label: 'ISCC supplier qualification', description: 'ISCC-certified biofuel supplier qualified', completed: true },
      { id: 'r36', label: 'Fuel system seals inspection', description: 'Seals and elastomers compatibility inspection completed', completed: true },
      { id: 'r37', label: 'SMS update for biofuel', description: 'Safety Management System updated for biofuel handling', completed: true },
      { id: 'r38', label: 'FuelEU GHG check', description: 'GHG intensity verification against FuelEU 2025 requirements', completed: true },
      { id: 'r39', label: 'First delivery SOP signed', description: 'Standard operating procedure for B24 delivery signed by master', completed: false, due_date: '2026-07-15' },
    ],
    target_date: '2026-08-01',
    certifying_body: 'Bureau Veritas',
    notes: 'SMS update pending master signature. All technical checks complete for Wärtsilä engine.',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-06-10T10:00:00Z',
  },
  // fr8: v8 (Hercules Merchant) — Ammonia, not_started, score 0
  {
    id: 'fr8',
    vessel_id: 'v8',
    vessel: v8,
    fuel_type: 'Ammonia',
    status: 'not_started',
    readiness_score: 0,
    requirements: [
      { id: 'r40', label: 'Commercial viability study', description: 'Assessment of ammonia as fuel commercial viability for bulk carrier trading pattern', completed: false },
      { id: 'r41', label: 'Class notation pre-assessment', description: 'Preliminary assessment for ammonia-ready class notation', completed: false },
      { id: 'r42', label: 'SOLAS amendment review', description: 'Review of SOLAS amendments for ammonia as fuel', completed: false },
      { id: 'r43', label: 'Port infrastructure survey', description: 'Survey of ammonia bunkering infrastructure at primary ports', completed: false },
    ],
    target_date: '2029-01-01',
    notes: 'Deferred pending IMO MSC ammonia-as-fuel regulatory framework. Monitor developments.',
    created_at: '2026-05-01T08:00:00Z',
    updated_at: '2026-05-01T08:00:00Z',
  },
  // fr9: v11 (Celtic Horizon) — Methanol, in_progress, score 28
  {
    id: 'fr9',
    vessel_id: 'v11',
    vessel: v11,
    fuel_type: 'Methanol',
    status: 'in_progress',
    readiness_score: 28,
    requirements: [
      { id: 'r44', label: 'Feasibility study', description: 'Methanol conversion feasibility study completed', completed: true },
      { id: 'r45', label: 'IGF pre-assessment', description: 'IGF Code pre-assessment by DNV', completed: false, due_date: '2026-12-01' },
      { id: 'r46', label: 'Flag state letter of intent', description: 'Isle of Man flag state letter of intent submitted', completed: false, due_date: '2026-10-01' },
      { id: 'r47', label: 'Class notation application', description: 'DNV class notation application for methanol', completed: false },
      { id: 'r48', label: 'Crew training', description: 'All officers methanol handling and safety training', completed: false, due_date: '2027-03-01' },
      { id: 'r49', label: 'Insurance endorsement', description: 'P&I and H&M insurance endorsement for methanol operations', completed: false },
      { id: 'r50', label: 'Shore supply SOP', description: 'Shore supply standard operating procedure for methanol', completed: false },
    ],
    target_date: '2027-09-01',
    certifying_body: 'DNV',
    notes: 'Isle of Man flag state process commenced. Engine room layout assessment complete.',
    created_at: '2026-04-01T08:00:00Z',
    updated_at: '2026-06-05T10:00:00Z',
  },
  // fr10: v9 (Cerulean Grace) — B24, certified, score 100
  {
    id: 'fr10',
    vessel_id: 'v9',
    vessel: v9,
    fuel_type: 'B24',
    status: 'certified',
    readiness_score: 100,
    requirements: [
      { id: 'r51', label: 'Engine compatibility check', description: 'Engine compatibility with B24 biofuel blend confirmed', completed: true },
      { id: 'r52', label: 'Fuel system inspection', description: 'Seals and elastomers compatibility verified', completed: true },
      { id: 'r53', label: 'ISCC supplier qualification', description: 'ISCC-certified biofuel supplier qualified', completed: true },
      { id: 'r54', label: 'Class certificate', description: 'Bureau Veritas biofuel-ready certificate issued', completed: true, doc_ref: 'BV-BF-2025-4412' },
      { id: 'r55', label: 'SMS update', description: 'Safety Management System updated for biofuel operations', completed: true },
      { id: 'r56', label: 'FuelEU compliance', description: 'GHG intensity verified meets FuelEU 2025 requirements', completed: true },
    ],
    certifying_body: 'Bureau Veritas',
    certificate_ref: 'BV-BF-2025-4412',
    notes: 'Certified November 2025. Operating B24 on Rotterdam and Antwerp calls.',
    created_at: '2025-06-01T08:00:00Z',
    updated_at: '2025-11-15T10:00:00Z',
  },
)

// ── Draft registry (mirrors mockDrafts, allows mutation to reflect in dashboard) ─
export const draftRegistry = new Map<string, import('@/types').Draft>()
mockDrafts.forEach((d) => draftRegistry.set(d.id, d))

// ── Per-case activity registry (holds broker-added log entries) ───────────────
export const caseActivityRegistry = new Map<string, import('@/types').Activity[]>()

// ── Per-case notes registry ───────────────────────────────────────────────────
export const caseNotesRegistry = new Map<string, string>()
