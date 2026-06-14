-- ============================================================
-- Copemer Disputes & Compliance Platform — Seed Data
-- ============================================================
-- Note: Profiles require real auth.users entries.
-- Run this seed for reference/lookup data only in production.
-- Use mock data in the frontend for demo without Supabase.
-- ============================================================

-- ── Companies ─────────────────────────────────────────────────────────────────

INSERT INTO companies (id, name, type, country) VALUES
  ('co1a0000-0000-0000-0000-000000000001', 'Nordic Tankers A/S',        'shipowner',  'Denmark'),
  ('co2a0000-0000-0000-0000-000000000002', 'Pacific Chartering Ltd',     'charterer',  'Singapore'),
  ('co3a0000-0000-0000-0000-000000000003', 'Atlantic Bulk Carriers',     'shipowner',  'Greece')
ON CONFLICT DO NOTHING;

-- ── Ports ─────────────────────────────────────────────────────────────────────

INSERT INTO ports (id, name, country, unlocode, timezone) VALUES
  ('p001a000-0000-0000-0000-000000000001', 'Rotterdam', 'Netherlands', 'NLRTM', 'Europe/Amsterdam'),
  ('p002a000-0000-0000-0000-000000000002', 'Singapore', 'Singapore',   'SGSIN', 'Asia/Singapore'),
  ('p003a000-0000-0000-0000-000000000003', 'Fujairah',  'UAE',         'AEFJR', 'Asia/Dubai')
ON CONFLICT DO NOTHING;

-- ── Suppliers ─────────────────────────────────────────────────────────────────

INSERT INTO suppliers (id, name, country, contact_email) VALUES
  ('s001a000-0000-0000-0000-000000000001', 'Peninsula Petroleum',  'Gibraltar',  'ops@peninsula.com'),
  ('s002a000-0000-0000-0000-000000000002', 'Chemoil Energy',       'Singapore',  'bunkers@chemoil.com'),
  ('s003a000-0000-0000-0000-000000000003', 'Minerva Bunkering',    'Greece',     'ops@minervabunkering.com')
ON CONFLICT DO NOTHING;

-- ── Vessels ───────────────────────────────────────────────────────────────────

INSERT INTO vessels (id, name, imo, flag, type, dwt, owner_id) VALUES
  ('v001a000-0000-0000-0000-000000000001', 'MV Nordic Star',    '9412345', 'Marshall Islands', 'Chemical Tanker',   37500, 'co1a0000-0000-0000-0000-000000000001'),
  ('v002a000-0000-0000-0000-000000000002', 'MV Pacific Horizon','9523671', 'Panama',            'Bulk Carrier',      82000, 'co2a0000-0000-0000-0000-000000000002'),
  ('v003a000-0000-0000-0000-000000000003', 'MV Atlantic Carrier','9634789','Liberia',            'General Cargo',     28000, 'co3a0000-0000-0000-0000-000000000003'),
  ('v004a000-0000-0000-0000-000000000004', 'MV Global Trader',  '9745902', 'Bahamas',           'Container Feeder',  14500, 'co1a0000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ── Cases ─────────────────────────────────────────────────────────────────────

INSERT INTO cases (id, reference, vessel_id, port_id, supplier_id, fuel_type, discrepancy_type,
                   claimed_quantity, bdn_quantity, status, priority, description, delivery_date) VALUES
  (
    'c001a000-0000-0000-0000-000000000001',
    'CPM-2026-0042',
    'v001a000-0000-0000-0000-000000000001',
    'p001a000-0000-0000-0000-000000000001',
    's001a000-0000-0000-0000-000000000001',
    'VLSFO', 'quantity_short', 487.2, 500.0, 'escalated', 'urgent',
    'Vessel figures indicate 487.2 MT received against BDN quantity of 500.0 MT. MFM log records 495.1 MT. Discrepancy of 12.8 MT (2.56%).',
    '2026-06-01T14:30:00Z'
  ),
  (
    'c002a000-0000-0000-0000-000000000002',
    'CPM-2026-0039',
    'v002a000-0000-0000-0000-000000000002',
    'p002a000-0000-0000-0000-000000000002',
    's002a000-0000-0000-0000-000000000002',
    'VLSFO', 'off_spec', 1200.0, 1200.0, 'under_review', 'high',
    'Lab analysis shows flash point 58C (min 60C) and Al+Si 42 mg/kg (max 25 mg/kg). Fuel may cause engine damage.',
    '2026-05-28T08:00:00Z'
  ),
  (
    'c003a000-0000-0000-0000-000000000003',
    'CPM-2026-0035',
    'v003a000-0000-0000-0000-000000000003',
    'p003a000-0000-0000-0000-000000000003',
    's003a000-0000-0000-0000-000000000003',
    'MGO', 'mfm_dispute', 320.5, 342.0, 'open', 'high',
    'MFM reading 320.5 MT contradicts barge figure 342.0 MT. Shore tank confirms approx 325 MT.',
    '2026-05-20T22:00:00Z'
  ),
  (
    'c004a000-0000-0000-0000-000000000004',
    'CPM-2026-0031',
    'v004a000-0000-0000-0000-000000000004',
    'p001a000-0000-0000-0000-000000000001',
    's001a000-0000-0000-0000-000000000001',
    'LSMGO', 'quantity_short', 78.3, 85.0, 'pending_response', 'normal',
    'Post-bunkering ullage shows 78.3 MT received vs BDN 85.0 MT. Shortage 6.7 MT (7.9%).',
    '2026-05-15T10:00:00Z'
  ),
  (
    'c005a000-0000-0000-0000-000000000005',
    'CPM-2026-0028',
    'v001a000-0000-0000-0000-000000000001',
    'p002a000-0000-0000-0000-000000000002',
    's002a000-0000-0000-0000-000000000002',
    'VLSFO', 'off_spec', 750.0, 750.0, 'resolved', 'normal',
    'Sulphur 0.52% m/m vs 0.50% max. Claim settled by credit note USD 18,500.',
    '2026-04-30T16:00:00Z'
  )
ON CONFLICT DO NOTHING;

-- ── Measurements ──────────────────────────────────────────────────────────────

INSERT INTO measurements (id, case_id, source, fuel_type, gross_quantity, net_quantity,
                          temperature, density, vcf, measured_by, measured_at) VALUES
  ('m001a000-0000-0000-0000-000000000001',
   'c001a000-0000-0000-0000-000000000001',
   'vessel', 'VLSFO', 490.1, 487.2, 51.2, 0.9823, 0.9943,
   'Chief Officer', '2026-06-01T17:00:00Z'),
  ('m002a000-0000-0000-0000-000000000002',
   'c001a000-0000-0000-0000-000000000001',
   'barge', 'VLSFO', 502.4, 500.0, 52.0, 0.9820, 0.9941,
   'Barge Master', '2026-06-01T17:15:00Z'),
  ('m003a000-0000-0000-0000-000000000003',
   'c001a000-0000-0000-0000-000000000001',
   'mfm', 'VLSFO', 497.3, 495.1, 51.6, 0.9821, NULL,
   'MFM System (Auto)', '2026-06-01T17:10:00Z'),
  ('m004a000-0000-0000-0000-000000000004',
   'c003a000-0000-0000-0000-000000000003',
   'mfm', 'MGO', 321.8, 320.5, 28.5, 0.8342, NULL,
   'MFM System (Auto)', '2026-05-21T01:30:00Z'),
  ('m005a000-0000-0000-0000-000000000005',
   'c003a000-0000-0000-0000-000000000003',
   'barge', 'MGO', 343.2, 342.0, 28.0, 0.8345, NULL,
   'Barge Master', '2026-05-21T01:45:00Z'),
  ('m006a000-0000-0000-0000-000000000006',
   'c003a000-0000-0000-0000-000000000003',
   'shore', 'MGO', 326.5, 325.1, 28.2, 0.8343, NULL,
   'Shore Terminal Inspector', '2026-05-20T22:30:00Z')
ON CONFLICT DO NOTHING;

-- ── Specs Checks ─────────────────────────────────────────────────────────────

INSERT INTO specs_checks (id, case_id, parameter, unit, bdn_value, contract_min, contract_max, lab_result, status, notes) VALUES
  ('sc01a000-0000-0000-0000-000000000001', 'c002a000-0000-0000-0000-000000000002', 'Density at 15°C',            'kg/m³',   0.9912, NULL, 0.9910, 0.9914, 'warning',  NULL),
  ('sc02a000-0000-0000-0000-000000000002', 'c002a000-0000-0000-0000-000000000002', 'Kinematic Viscosity at 50°C', 'cSt',     380.2,  NULL, 380.0,  375.4,  'ok',       NULL),
  ('sc03a000-0000-0000-0000-000000000003', 'c002a000-0000-0000-0000-000000000002', 'Flash Point',                 '°C',      63.0,   60.0, NULL,   58.0,   'off_spec', 'Flash point below ISO 8217 minimum 60°C'),
  ('sc04a000-0000-0000-0000-000000000004', 'c002a000-0000-0000-0000-000000000002', 'Sulphur Content',             '% m/m',   0.48,   NULL, 0.50,   0.48,   'ok',       NULL),
  ('sc05a000-0000-0000-0000-000000000005', 'c002a000-0000-0000-0000-000000000002', 'Water Content',               '% v/v',   NULL,   NULL, 0.50,   0.12,   'ok',       NULL),
  ('sc06a000-0000-0000-0000-000000000006', 'c002a000-0000-0000-0000-000000000002', 'CCAI',                        '',        NULL,   NULL, 870.0,  858.0,  'ok',       NULL),
  ('sc07a000-0000-0000-0000-000000000007', 'c002a000-0000-0000-0000-000000000002', 'Aluminium + Silicon',         'mg/kg',   NULL,   NULL, 25.0,   42.0,   'off_spec', 'Catalytic fines above limit — engine abrasion risk')
ON CONFLICT DO NOTHING;

-- ── Thresholds ────────────────────────────────────────────────────────────────

INSERT INTO thresholds (id, parameter, unit, warning_threshold, critical_threshold) VALUES
  ('th01a000-0000-0000-0000-000000000001', 'Quantity Variance (Vessel vs BDN)', '%',               0.3,   0.5),
  ('th02a000-0000-0000-0000-000000000002', 'Quantity Variance (MFM vs BDN)',    '%',               0.3,   0.5),
  ('th03a000-0000-0000-0000-000000000003', 'Flash Point',                       '°C below min',   2.0,   5.0),
  ('th04a000-0000-0000-0000-000000000004', 'Sulphur Content',                   '% m/m above max',0.01,  0.05),
  ('th05a000-0000-0000-0000-000000000005', 'Aluminium + Silicon',               'mg/kg above max', 5.0,  15.0),
  ('th06a000-0000-0000-0000-000000000006', 'Density',                           'kg/m³ above max', 0.0002, 0.001),
  ('th07a000-0000-0000-0000-000000000007', 'Viscosity at 50°C',                 'cSt above max',   5.0,  20.0)
ON CONFLICT DO NOTHING;

-- ── Templates ─────────────────────────────────────────────────────────────────

INSERT INTO templates (id, type, name, content) VALUES
  (
    'tmpl0001-0000-0000-0000-000000000001',
    'LOP_Response',
    'Standard LOP Response',
    'Without Prejudice

To: [Supplier Name]
Attn: Bunker Operations Department

Re: [Vessel Name] / IMO [IMO Number]
    Delivery Date: [Delivery Date], Port of [Port]
    BDN Reference: [BDN Number]
    Fuel Grade: [Fuel Type]

Dear Sirs,

We write further to the Letter of Protest submitted in connection with the above delivery.

[Describe discrepancy with supporting measurement detail]

We formally request:
1. [Request 1]
2. [Request 2]
3. [Request 3]

All rights reserved without prejudice.

Copemer Ltd — Disputes & Claims Department'
  ),
  (
    'tmpl0002-0000-0000-0000-000000000002',
    'Claim_Letter',
    'Standard Claim Letter',
    'Without Prejudice — Subject to Contract

To: [Supplier Name] — Claims Department
From: Copemer Ltd
Date: [Date]
Re: Formal Claim — [Vessel Name] — [Port] — [Date]

Dear Sirs,

FORMAL NOTICE OF CLAIM

We write on behalf of [Owner/Charterer] to formally notify you of a claim arising from the delivery below.

DELIVERY REFERENCE
Vessel: [Vessel Name] (IMO [IMO])
Port: [Port] — [Date]
BDN Number: [BDN Number] — [Quantity] MT [Fuel]

NATURE OF CLAIM
[Describe claim basis]

QUANTUM
[Claim value and basis of calculation]

Response required within [X] business days. All rights reserved.

Copemer Ltd'
  )
ON CONFLICT DO NOTHING;

-- ── Fuel Readiness Records ────────────────────────────────────────────────────

INSERT INTO fuel_readiness_records
  (id, vessel_id, fuel_type, status, readiness_score, requirements, target_date, certifying_body, notes)
VALUES
  (
    'fr01a000-0000-0000-0000-000000000001',
    'v001a000-0000-0000-0000-000000000001',
    'Methanol', 'in_progress', 45,
    '[
      {"id":"r1","label":"IMO IGF Code assessment","description":"Structural and systems assessment against IGF Code","completed":true,"document_ref":"ABS-2026-IGF-0441"},
      {"id":"r2","label":"Flag State approval","description":"Flag State approval of methanol fuel systems","completed":false,"due_date":"2026-09-30"},
      {"id":"r3","label":"Class society survey","description":"ABS survey of fuel containment and piping","completed":false,"due_date":"2026-08-15"},
      {"id":"r4","label":"Crew training — methanol","description":"All officers to complete methanol handling training","completed":true},
      {"id":"r5","label":"Supplier agreements","description":"Methanol supply agreements at primary ports","completed":false,"due_date":"2026-10-01"},
      {"id":"r6","label":"Insurance endorsement","description":"P&I and H&M endorsement for methanol operations","completed":false}
    ]',
    '2026-12-01', 'ABS',
    'Conversion underway. Flag State approval is critical path item.'
  ),
  (
    'fr02a000-0000-0000-0000-000000000002',
    'v002a000-0000-0000-0000-000000000002',
    'B24', 'ready', 92,
    '[
      {"id":"r7","label":"Engine compatibility check","description":"MAN B&W engine compatibility with B24","completed":true},
      {"id":"r8","label":"Fuel system inspection","description":"Seals and gaskets compatibility with FAME","completed":true},
      {"id":"r9","label":"Supplier qualification","description":"ISCC certified biofuel supplier","completed":true,"document_ref":"ISCC-2026-0882"},
      {"id":"r10","label":"FuelEU compliance check","description":"GHG intensity meets FuelEU 2025 requirements","completed":true},
      {"id":"r11","label":"Operations procedure update","description":"Update SMS for biofuel handling","completed":false,"due_date":"2026-07-01"}
    ]',
    '2026-07-15', 'DNV',
    'Awaiting SMS update before first B24 call July 2026.'
  )
ON CONFLICT DO NOTHING;
