-- ============================================================
-- Copemer Disputes & Compliance Platform — Seed Data
-- ============================================================
-- Note: Profiles require real auth.users entries.
-- Run this seed for reference/lookup data only in production.
-- Use mock data in the frontend for demo without Supabase.
-- ============================================================

-- ── Companies ─────────────────────────────────────────────────────────────────

INSERT INTO companies (id, name, type, country) VALUES
  ('co1a0000-0000-0000-0000-000000000001', 'Nordic Tankers A/S',       'shipowner',  'Denmark'),
  ('co2a0000-0000-0000-0000-000000000002', 'Pacific Chartering Ltd',    'charterer',  'Singapore'),
  ('co3a0000-0000-0000-0000-000000000003', 'Atlantic Bulk Carriers',    'shipowner',  'Greece'),
  ('co4a0000-0000-0000-0000-000000000004', 'Olympus Shipping SA',       'shipowner',  'Greece'),
  ('co5a0000-0000-0000-0000-000000000005', 'Levante Maritime BV',       'shipowner',  'Netherlands'),
  ('co6a0000-0000-0000-0000-000000000006', 'Blue Shore Carriers Ltd',   'shipowner',  'Cyprus')
ON CONFLICT DO NOTHING;

-- ── Ports ─────────────────────────────────────────────────────────────────────

INSERT INTO ports (id, name, country, unlocode, region, timezone) VALUES
  ('p001a000-0000-0000-0000-000000000001', 'Rotterdam',    'Netherlands', 'NLRTM', 'ARA',          'Europe/Amsterdam'),
  ('p002a000-0000-0000-0000-000000000002', 'Singapore',    'Singapore',   'SGSIN', 'Asia Pacific',  'Asia/Singapore'),
  ('p003a000-0000-0000-0000-000000000003', 'Fujairah',     'UAE',         'AEFJR', 'Gulf',          'Asia/Dubai'),
  ('p004a000-0000-0000-0000-000000000004', 'Antwerp',      'Belgium',     'BEANR', 'ARA',           'Europe/Brussels'),
  ('p005a000-0000-0000-0000-000000000005', 'Amsterdam',    'Netherlands', 'NLAMS', 'ARA',           'Europe/Amsterdam'),
  ('p006a000-0000-0000-0000-000000000006', 'Le Havre',     'France',      'FRLEH', 'France',        'Europe/Paris'),
  ('p007a000-0000-0000-0000-000000000007', 'Marseille',    'France',      'FRMRS', 'Mediterranean', 'Europe/Paris'),
  ('p008a000-0000-0000-0000-000000000008', 'Gibraltar',    'Gibraltar',   'GIGIB', 'Atlantic Hub',  'Europe/Gibraltar'),
  ('p009a000-0000-0000-0000-000000000009', 'Marsaxlokk',   'Malta',       'MTMLA', 'Mediterranean', 'Europe/Malta'),
  ('p010a000-0000-0000-0000-000000000010', 'Piraeus',      'Greece',      'GRPIR', 'Mediterranean', 'Europe/Athens'),
  ('p011a000-0000-0000-0000-000000000011', 'Genoa',        'Italy',       'ITGOA', 'Mediterranean', 'Europe/Rome'),
  ('p012a000-0000-0000-0000-000000000012', 'Las Palmas',   'Spain',       'ESLPA', 'Atlantic Hub',  'Atlantic/Canary')
ON CONFLICT DO NOTHING;

-- ── Suppliers ─────────────────────────────────────────────────────────────────

INSERT INTO suppliers (id, name, country, contact_email) VALUES
  ('s001a000-0000-0000-0000-000000000001', 'Peninsula Petroleum',  'Gibraltar',  'ops@peninsula.com'),
  ('s002a000-0000-0000-0000-000000000002', 'Chemoil Energy',       'Singapore',  'bunkers@chemoil.com'),
  ('s003a000-0000-0000-0000-000000000003', 'Minerva Bunkering',    'Greece',     'ops@minervabunkering.com'),
  ('s004a000-0000-0000-0000-000000000004', 'World Fuel Services',  'USA',        'bunkers@wfscorp.com'),
  ('s005a000-0000-0000-0000-000000000005', 'Bunker One',           'Denmark',    'ops@bunker-one.com')
ON CONFLICT DO NOTHING;

-- ── Vessels ───────────────────────────────────────────────────────────────────

INSERT INTO vessels (id, name, imo, flag, vessel_type, dwt, owner_id) VALUES
  ('v001a000-0000-0000-0000-000000000001', 'MV Nordic Star',       '9412345', 'Marshall Islands', 'Chemical Tanker',   37500, 'co1a0000-0000-0000-0000-000000000001'),
  ('v002a000-0000-0000-0000-000000000002', 'MV Pacific Horizon',   '9523671', 'Panama',            'Bulk Carrier',      82000, 'co2a0000-0000-0000-0000-000000000002'),
  ('v003a000-0000-0000-0000-000000000003', 'MV Atlantic Carrier',  '9634789', 'Liberia',           'General Cargo',     28000, 'co3a0000-0000-0000-0000-000000000003'),
  ('v004a000-0000-0000-0000-000000000004', 'MV Global Trader',     '9745902', 'Bahamas',           'Container Feeder',  14500, 'co1a0000-0000-0000-0000-000000000001'),
  ('v005a000-0000-0000-0000-000000000005', 'MV Elara Spirit',      '9856341', 'Liberia',           'Aframax Tanker',   115000, 'co4a0000-0000-0000-0000-000000000004'),
  ('v006a000-0000-0000-0000-000000000006', 'MV Poseidon Bay',      '9901127', 'Malta',             'VLCC',             298000, 'co4a0000-0000-0000-0000-000000000004'),
  ('v007a000-0000-0000-0000-000000000007', 'MV Thalassa Wind',     '9742118', 'Marshall Islands',  'Product Tanker',    48000, 'co5a0000-0000-0000-0000-000000000005'),
  ('v008a000-0000-0000-0000-000000000008', 'MV Hercules Merchant', '9623405', 'Greece',            'Bulk Carrier',      75000, 'co4a0000-0000-0000-0000-000000000004'),
  ('v009a000-0000-0000-0000-000000000009', 'MV Cerulean Grace',    '9788234', 'Bahamas',           'Container Feeder',  12000, 'co6a0000-0000-0000-0000-000000000006'),
  ('v010a000-0000-0000-0000-000000000010', 'MV Byzantium Star',    '9834567', 'Cyprus',            'Handy Tanker',      35000, 'co6a0000-0000-0000-0000-000000000006'),
  ('v011a000-0000-0000-0000-000000000011', 'MV Celtic Horizon',    '9912006', 'Isle of Man',       'Product Tanker',    40000, 'co5a0000-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;

-- ── Deliveries ────────────────────────────────────────────────────────────────

INSERT INTO deliveries (id, reference, vessel_id, port_id, supplier_id, fuel_type, status,
                        bdn_number, bdn_quantity, bdn_density, vessel_quantity, mfm_quantity, delivery_date) VALUES
  -- del1: v1/p1/s1, VLSFO, disputed
  (
    'del1a000-0000-0000-0000-000000000001',
    'DEL-2026-0441',
    'v001a000-0000-0000-0000-000000000001',
    'p001a000-0000-0000-0000-000000000001',
    's001a000-0000-0000-0000-000000000001',
    'VLSFO', 'disputed', 'PEN-RTM-2026-8821', 500.0, 0.9823, 487.2, 495.1,
    '2026-06-01'
  ),
  -- del2: v2/p2/s2, VLSFO, disputed
  (
    'del2a000-0000-0000-0000-000000000002',
    'DEL-2026-0382',
    'v002a000-0000-0000-0000-000000000002',
    'p002a000-0000-0000-0000-000000000002',
    's002a000-0000-0000-0000-000000000002',
    'VLSFO', 'disputed', 'CHE-SIN-2026-4492', 1200.0, 0.9881, 1198.5, NULL,
    '2026-05-28'
  ),
  -- del3: v3/p3/s3, MGO, disputed
  (
    'del3a000-0000-0000-0000-000000000003',
    'DEL-2026-0291',
    'v003a000-0000-0000-0000-000000000003',
    'p003a000-0000-0000-0000-000000000003',
    's003a000-0000-0000-0000-000000000003',
    'MGO', 'disputed', 'MIN-FUJ-2026-3301', 342.0, 0.8345, 320.5, 320.5,
    '2026-05-20'
  ),
  -- del4: v4/p1/s1, LSMGO, disputed
  (
    'del4a000-0000-0000-0000-000000000004',
    'DEL-2026-0318',
    'v004a000-0000-0000-0000-000000000004',
    'p001a000-0000-0000-0000-000000000001',
    's001a000-0000-0000-0000-000000000001',
    'LSMGO', 'disputed', 'PEN-RTM-2026-6614', 85.0, 0.8491, 78.3, NULL,
    '2026-05-15'
  ),
  -- del5: v1/p2/s2, VLSFO, confirmed
  (
    'del5a000-0000-0000-0000-000000000005',
    'DEL-2026-0271',
    'v001a000-0000-0000-0000-000000000001',
    'p002a000-0000-0000-0000-000000000002',
    's002a000-0000-0000-0000-000000000002',
    'VLSFO', 'confirmed', 'CHE-SIN-2026-3318', 750.0, 0.9834, 750.0, NULL,
    '2026-04-30'
  ),
  -- del6: v2/p3/s3, HSFO, confirmed
  (
    'del6a000-0000-0000-0000-000000000006',
    'DEL-2026-0198',
    'v002a000-0000-0000-0000-000000000002',
    'p003a000-0000-0000-0000-000000000003',
    's003a000-0000-0000-0000-000000000003',
    'HSFO', 'confirmed', 'MIN-FUJ-2026-2201', 1900.0, 0.9889, 1850.0, NULL,
    '2026-04-12'
  ),
  -- del7: v5/p4/s4, VLSFO, disputed
  (
    'del7a000-0000-0000-0000-000000000007',
    'DEL-2026-0461',
    'v005a000-0000-0000-0000-000000000005',
    'p004a000-0000-0000-0000-000000000004',
    's004a000-0000-0000-0000-000000000004',
    'VLSFO', 'disputed', 'WFS-ANT-2026-3841', 800.0, 0.9881, 795.8, NULL,
    '2026-06-03'
  ),
  -- del8: v6/p9/s5, HSFO, disputed
  (
    'del8a000-0000-0000-0000-000000000008',
    'DEL-2026-0447',
    'v006a000-0000-0000-0000-000000000006',
    'p009a000-0000-0000-0000-000000000009',
    's005a000-0000-0000-0000-000000000005',
    'HSFO', 'disputed', 'BO-MLT-2026-1182', 1800.0, 0.9778, 1778.5, 1789.4,
    '2026-05-25'
  ),
  -- del9: v7/p8/s1, MGO, disputed
  (
    'del9a000-0000-0000-0000-000000000009',
    'DEL-2026-0479',
    'v007a000-0000-0000-0000-000000000007',
    'p008a000-0000-0000-0000-000000000008',
    's001a000-0000-0000-0000-000000000001',
    'MGO', 'disputed', 'PEN-GIB-2026-0884', 65.0, 0.8331, 64.8, NULL,
    '2026-06-06'
  ),
  -- del10: v8/p10/s3, VLSFO, disputed
  (
    'del10a00-0000-0000-0000-000000000010',
    'DEL-2026-0452',
    'v008a000-0000-0000-0000-000000000008',
    'p010a000-0000-0000-0000-000000000010',
    's003a000-0000-0000-0000-000000000003',
    'VLSFO', 'disputed', 'MIN-PIR-2026-6634', 650.0, 0.9891, 648.3, NULL,
    '2026-06-01'
  ),
  -- del11: v9/p12/s2, VLSFO, confirmed
  (
    'del11a00-0000-0000-0000-000000000011',
    'DEL-2026-0388',
    'v009a000-0000-0000-0000-000000000009',
    'p012a000-0000-0000-0000-000000000012',
    's002a000-0000-0000-0000-000000000002',
    'VLSFO', 'confirmed', 'CHE-LPA-2026-2211', 320.0, 0.9842, 328.4, NULL,
    '2026-05-05'
  ),
  -- del12: v10/p6/s4, LSMGO, disputed
  (
    'del12a00-0000-0000-0000-000000000012',
    'DEL-2026-0488',
    'v010a000-0000-0000-0000-000000000010',
    'p006a000-0000-0000-0000-000000000006',
    's004a000-0000-0000-0000-000000000004',
    'LSMGO', 'disputed', 'WFS-LH-2026-5129', 180.0, 0.8451, 167.8, 163.5,
    '2026-06-08'
  ),
  -- del13: v3/p11/s3, B24, disputed
  (
    'del13a00-0000-0000-0000-000000000013',
    'DEL-2026-0472',
    'v003a000-0000-0000-0000-000000000003',
    'p011a000-0000-0000-0000-000000000011',
    's003a000-0000-0000-0000-000000000003',
    'B24', 'disputed', 'MIN-GEN-2026-2219', 420.0, 0.8937, 419.1, NULL,
    '2026-06-04'
  ),
  -- del14: v11/p5/s5, VLSFO, disputed
  (
    'del14a00-0000-0000-0000-000000000014',
    'DEL-2026-0501',
    'v011a000-0000-0000-0000-000000000011',
    'p005a000-0000-0000-0000-000000000005',
    's005a000-0000-0000-0000-000000000005',
    'VLSFO', 'disputed', 'BO-AMS-2026-7741', 950.0, 0.9867, 934.2, NULL,
    '2026-06-11'
  ),
  -- del15: v1/p3/s2, VLSFO, confirmed (clean)
  (
    'del15a00-0000-0000-0000-000000000015',
    'DEL-2026-0221',
    'v001a000-0000-0000-0000-000000000001',
    'p003a000-0000-0000-0000-000000000003',
    's002a000-0000-0000-0000-000000000002',
    'VLSFO', 'confirmed', 'CHE-FUJ-2026-1108', 620.0, 0.9841, 618.8, NULL,
    '2026-04-15'
  ),
  -- del16: v2/p1/s1, VLSFO, confirmed (clean)
  (
    'del16a00-0000-0000-0000-000000000016',
    'DEL-2026-0238',
    'v002a000-0000-0000-0000-000000000002',
    'p001a000-0000-0000-0000-000000000001',
    's001a000-0000-0000-0000-000000000001',
    'VLSFO', 'confirmed', 'PEN-RTM-2026-4412', 1100.0, 0.9878, 1099.2, NULL,
    '2026-04-20'
  ),
  -- del17: v4/p2/s2, MGO, confirmed (clean)
  (
    'del17a00-0000-0000-0000-000000000017',
    'DEL-2026-0299',
    'v004a000-0000-0000-0000-000000000004',
    'p002a000-0000-0000-0000-000000000002',
    's002a000-0000-0000-0000-000000000002',
    'MGO', 'confirmed', 'CHE-SIN-2026-3741', 55.0, 0.8338, 54.8, NULL,
    '2026-05-01'
  ),
  -- del18: v5/p1/s5, VLSFO, confirmed (clean)
  (
    'del18a00-0000-0000-0000-000000000018',
    'DEL-2026-0341',
    'v005a000-0000-0000-0000-000000000005',
    'p001a000-0000-0000-0000-000000000001',
    's005a000-0000-0000-0000-000000000005',
    'VLSFO', 'confirmed', 'BO-RTM-2026-2218', 850.0, 0.9877, 849.1, NULL,
    '2026-05-10'
  ),
  -- del19: v6/p2/s2, HSFO, confirmed (clean)
  (
    'del19a00-0000-0000-0000-000000000019',
    'DEL-2026-0365',
    'v006a000-0000-0000-0000-000000000006',
    'p002a000-0000-0000-0000-000000000002',
    's002a000-0000-0000-0000-000000000002',
    'HSFO', 'confirmed', 'CHE-SIN-2026-4109', 2100.0, 0.9891, 2099.5, NULL,
    '2026-05-18'
  ),
  -- del20: v7/p1/s4, LSMGO, confirmed (clean)
  (
    'del20a00-0000-0000-0000-000000000020',
    'DEL-2026-0408',
    'v007a000-0000-0000-0000-000000000007',
    'p001a000-0000-0000-0000-000000000001',
    's004a000-0000-0000-0000-000000000004',
    'LSMGO', 'confirmed', 'WFS-RTM-2026-4481', 90.0, 0.8462, 89.9, NULL,
    '2026-05-28'
  ),
  -- del21: v11/p1/s1, VLSFO, confirmed (clean)
  (
    'del21a00-0000-0000-0000-000000000021',
    'DEL-2026-0431',
    'v011a000-0000-0000-0000-000000000011',
    'p001a000-0000-0000-0000-000000000001',
    's001a000-0000-0000-0000-000000000001',
    'VLSFO', 'confirmed', 'PEN-RTM-2026-7714', 780.0, 0.9861, 779.4, NULL,
    '2026-06-01'
  ),
  -- del22: v8/p2/s2, VLSFO, confirmed (clean)
  (
    'del22a00-0000-0000-0000-000000000022',
    'DEL-2026-0278',
    'v008a000-0000-0000-0000-000000000008',
    'p002a000-0000-0000-0000-000000000002',
    's002a000-0000-0000-0000-000000000002',
    'VLSFO', 'confirmed', 'CHE-SIN-2026-3881', 700.0, 0.9868, 699.8, NULL,
    '2026-04-28'
  ),
  -- del23: v9/p1/s5, VLSFO, confirmed (clean)
  (
    'del23a00-0000-0000-0000-000000000023',
    'DEL-2026-0391',
    'v009a000-0000-0000-0000-000000000009',
    'p001a000-0000-0000-0000-000000000001',
    's005a000-0000-0000-0000-000000000005',
    'VLSFO', 'confirmed', 'BO-RTM-2026-3319', 280.0, 0.9843, 280.2, NULL,
    '2026-05-22'
  ),
  -- del24: v10/p8/s1, MGO, confirmed (clean)
  (
    'del24a00-0000-0000-0000-000000000024',
    'DEL-2026-0419',
    'v010a000-0000-0000-0000-000000000010',
    'p008a000-0000-0000-0000-000000000008',
    's001a000-0000-0000-0000-000000000001',
    'MGO', 'confirmed', 'PEN-GIB-2026-0771', 40.0, 0.8332, 39.9, NULL,
    '2026-05-30'
  )
ON CONFLICT DO NOTHING;

-- ── Cases ─────────────────────────────────────────────────────────────────────

INSERT INTO cases (id, reference, delivery_id, vessel_id, port_id, supplier_id,
                   fuel_type, discrepancy_type, claimed_quantity, bdn_quantity,
                   status, priority, description, opened_at) VALUES
  (
    'c001a000-0000-0000-0000-000000000001',
    'CPM-2026-0042',
    'del1a000-0000-0000-0000-000000000001',
    'v001a000-0000-0000-0000-000000000001',
    'p001a000-0000-0000-0000-000000000001',
    's001a000-0000-0000-0000-000000000001',
    'VLSFO', 'quantity_short', 487.2, 500.0, 'escalated', 'urgent',
    'Vessel figures indicate 487.2 MT received against BDN 500.0 MT. MFM records 495.1 MT. Discrepancy 12.8 MT (2.56%) requires formal investigation and LOP issuance.',
    '2026-06-02T09:00:00Z'
  ),
  (
    'c002a000-0000-0000-0000-000000000002',
    'CPM-2026-0039',
    'del2a000-0000-0000-0000-000000000002',
    'v002a000-0000-0000-0000-000000000002',
    'p002a000-0000-0000-0000-000000000002',
    's002a000-0000-0000-0000-000000000002',
    'VLSFO', 'off_spec', 1200.0, 1200.0, 'under_review', 'high',
    'Lab analysis shows flash point 58°C (min 60°C) and Al+Si 42 mg/kg (max 25 mg/kg). Fuel may cause engine damage.',
    '2026-05-30T10:15:00Z'
  ),
  (
    'c003a000-0000-0000-0000-000000000003',
    'CPM-2026-0035',
    'del3a000-0000-0000-0000-000000000003',
    'v003a000-0000-0000-0000-000000000003',
    'p003a000-0000-0000-0000-000000000003',
    's003a000-0000-0000-0000-000000000003',
    'MGO', 'mfm_dispute', 320.5, 342.0, 'open', 'high',
    'MFM reading 320.5 MT contradicts barge sounding 342.0 MT. Shore tank confirms approx 325 MT. Supplier disputes MFM calibration.',
    '2026-05-22T08:30:00Z'
  ),
  (
    'c004a000-0000-0000-0000-000000000004',
    'CPM-2026-0031',
    'del4a000-0000-0000-0000-000000000004',
    'v004a000-0000-0000-0000-000000000004',
    'p001a000-0000-0000-0000-000000000001',
    's001a000-0000-0000-0000-000000000001',
    'LSMGO', 'quantity_short', 78.3, 85.0, 'pending_response', 'normal',
    'Post-bunkering ullage shows 78.3 MT received vs BDN 85.0 MT. Shortage 6.7 MT (7.9%). Barge ullage report pending from supplier.',
    '2026-05-16T09:00:00Z'
  ),
  (
    'c005a000-0000-0000-0000-000000000005',
    'CPM-2026-0028',
    'del5a000-0000-0000-0000-000000000005',
    'v001a000-0000-0000-0000-000000000001',
    'p002a000-0000-0000-0000-000000000002',
    's002a000-0000-0000-0000-000000000002',
    'VLSFO', 'off_spec', 750.0, 750.0, 'resolved', 'normal',
    'Sulphur 0.52% m/m vs 0.50% max. Supplier acknowledged. Claim settled by credit note USD 18,500.',
    '2026-05-02T10:00:00Z'
  ),
  (
    'c006a000-0000-0000-0000-000000000006',
    'CPM-2026-0024',
    'del6a000-0000-0000-0000-000000000006',
    'v002a000-0000-0000-0000-000000000002',
    'p003a000-0000-0000-0000-000000000003',
    's003a000-0000-0000-0000-000000000003',
    'HSFO', 'quantity_short', 1850.0, 1900.0, 'closed', 'normal',
    'Quantity short 50 MT resolved by supplementary delivery. Corrected BDN issued. Case closed.',
    '2026-04-12T08:00:00Z'
  ),
  (
    'c007a000-0000-0000-0000-000000000007',
    'CPM-2026-0048',
    'del7a000-0000-0000-0000-000000000007',
    'v005a000-0000-0000-0000-000000000005',
    'p004a000-0000-0000-0000-000000000004',
    's004a000-0000-0000-0000-000000000004',
    'VLSFO', 'off_spec', 800.0, 800.0, 'open', 'high',
    'Independent lab analysis (SGS Antwerp lab ref ANT-2026-18842) reveals sulphur 0.53% m/m exceeding 0.50% MARPOL limit and kinematic viscosity 395 cSt exceeding 380 cSt ISO 8217 maximum. BDN values did not disclose deviation.',
    '2026-06-05T09:00:00Z'
  ),
  (
    'c008a000-0000-0000-0000-000000000008',
    'CPM-2026-0045',
    'del8a000-0000-0000-0000-000000000008',
    'v006a000-0000-0000-0000-000000000006',
    'p009a000-0000-0000-0000-000000000009',
    's005a000-0000-0000-0000-000000000005',
    'HSFO', 'quantity_short', 1778.5, 1800.0, 'under_review', 'high',
    'Three independent measurement sources — vessel ullage 1778.5 MT, MFM 1789.4 MT, and independent surveyor 1782.1 MT — all fall below BDN figure of 1800 MT. Only barge figure at 1803.2 MT exceeds BDN. Barge figures disputed. Estimated shortage 18-22 MT.',
    '2026-05-27T08:00:00Z'
  ),
  (
    'c009a000-0000-0000-0000-000000000009',
    'CPM-2026-0052',
    'del9a000-0000-0000-0000-000000000009',
    'v007a000-0000-0000-0000-000000000007',
    'p008a000-0000-0000-0000-000000000008',
    's001a000-0000-0000-0000-000000000001',
    'MGO', 'documentation', 65.0, 65.0, 'open', 'normal',
    'BDN signed by unidentified crew member, not vessel master as required. Delivery commencement time on BDN (14:30 LT) conflicts with vessel engine room log (15:15 LT). Chief Engineer disputes attendance at commencement. BDN validity under review; quantity figures within tolerance.',
    '2026-06-07T10:00:00Z'
  ),
  (
    'c010a000-0000-0000-0000-000000000010',
    'CPM-2026-0056',
    'del10a00-0000-0000-0000-000000000010',
    'v008a000-0000-0000-0000-000000000008',
    'p010a000-0000-0000-0000-000000000010',
    's003a000-0000-0000-0000-000000000003',
    'VLSFO', 'contamination', 650.0, 650.0, 'escalated', 'urgent',
    'Vessel reports abnormal dark sludge in HFO settling tank 24hrs post-delivery. Independent lab analysis (Intertek Piraeus ref PIR-2026-7741) detects chlorinated solvents: toluene 85 ppm, xylene 32 ppm. Waste/other compounds 0.15% v/v (ISO 8217 max 0.10%). Vessel slow-steaming pending full investigation. Off-hire and fuel disposal costs accumulating.',
    '2026-06-03T14:00:00Z'
  ),
  (
    'c011a000-0000-0000-0000-000000000011',
    'CPM-2026-0033',
    'del11a00-0000-0000-0000-000000000011',
    'v009a000-0000-0000-0000-000000000009',
    'p012a000-0000-0000-0000-000000000012',
    's002a000-0000-0000-0000-000000000002',
    'VLSFO', 'quantity_over', 328.4, 320.0, 'resolved', 'low',
    'Post-bunkering ullage 328.4 MT vs BDN 320 MT. Over-delivery 8.4 MT (2.6%). Supplier confirmed inadvertent over-delivery. Revised BDN 328.4 MT issued. Invoice adjusted. Case resolved.',
    '2026-05-07T09:00:00Z'
  ),
  (
    'c012a000-0000-0000-0000-000000000012',
    'CPM-2026-0059',
    'del12a00-0000-0000-0000-000000000012',
    'v010a000-0000-0000-0000-000000000010',
    'p006a000-0000-0000-0000-000000000006',
    's004a000-0000-0000-0000-000000000004',
    'LSMGO', 'mfm_dispute', 163.5, 180.0, 'open', 'high',
    'MFM record 163.5 MT significantly below BDN 180 MT and barge soundings 180.2 MT. Vessel ullage measurement 167.8 MT. Shore tank before/after comparison at Le Havre Oil Terminal indicates approx 169 MT delivered. Supplier disputes MFM; claims calibration drift. Discrepancy 16.5 MT (9.2%).',
    '2026-06-09T09:00:00Z'
  ),
  (
    'c013a000-0000-0000-0000-000000000013',
    'CPM-2026-0061',
    'del13a00-0000-0000-0000-000000000013',
    'v003a000-0000-0000-0000-000000000003',
    'p011a000-0000-0000-0000-000000000011',
    's003a000-0000-0000-0000-000000000003',
    'B24', 'off_spec', 420.0, 420.0, 'under_review', 'normal',
    'B24 biofuel blend delivered with FAME content 27.2% v/v against maximum 24% declared in supply nomination and ISO 8217 FAME limit. Oxidation stability 4.2 hours against minimum 6 hours for FAME blends. Acid number borderline at 0.42 mg KOH/g. FuelEU compliance impact requires assessment.',
    '2026-06-05T11:00:00Z'
  ),
  (
    'c014a000-0000-0000-0000-000000000014',
    'CPM-2026-0064',
    'del14a00-0000-0000-0000-000000000014',
    'v011a000-0000-0000-0000-000000000011',
    'p005a000-0000-0000-0000-000000000005',
    's005a000-0000-0000-0000-000000000005',
    'VLSFO', 'quantity_short', 934.2, 950.0, 'pending_response', 'normal',
    'Vessel ullage post-bunkering indicates 934.2 MT received vs BDN 950 MT. Independent surveyor (Bureau Veritas) figure 941.8 MT also below BDN. Barge departure soundings 952.7 MT. Three-way shortfall against BDN. Shortage approximately 15.8 MT. Formal response requested from Bunker One within 5 business days.',
    '2026-06-12T09:00:00Z'
  )
ON CONFLICT DO NOTHING;

-- ── Measurements ──────────────────────────────────────────────────────────────

INSERT INTO measurements (id, case_id, source, fuel_grade, quantity_mt, temperature_c,
                          density_at_obs_kgm3, vcf, timestamp_utc, surveyor_name, is_disputed, notes) VALUES
  -- c1: quantity_short — vessel, barge, mfm
  ('m001a000-0000-0000-0000-000000000001',
   'c001a000-0000-0000-0000-000000000001',
   'vessel', 'VLSFO', 487.2, 51.2, 0.9823, 0.9943,
   '2026-06-01T17:00:00Z', 'Chief Officer', false,
   'Post-bunkering tank measurement, all tanks sounded by chief officer'),

  ('m002a000-0000-0000-0000-000000000002',
   'c001a000-0000-0000-0000-000000000001',
   'barge', 'VLSFO', 502.4, 52.0, 0.9820, NULL,
   '2026-06-01T17:15:00Z', 'Barge Master', false,
   'Barge departure soundings per BDN'),

  ('m003a000-0000-0000-0000-000000000003',
   'c001a000-0000-0000-0000-000000000001',
   'mfm', 'VLSFO', 495.1, 51.6, 0.9821, NULL,
   '2026-06-01T17:10:00Z', 'MFM System', false,
   'MFM serial #PEN-MFM-0021, last calibrated 2026-03-15'),

  -- c3: mfm_dispute — mfm, barge (disputed), manual
  ('m004a000-0000-0000-0000-000000000004',
   'c003a000-0000-0000-0000-000000000003',
   'mfm', 'MGO', 320.5, 28.5, 0.8342, NULL,
   '2026-05-21T01:30:00Z', 'MFM System', false,
   'MFM #MIN-FUJ-0088, calibration certificate valid until 2026-12-01'),

  ('m005a000-0000-0000-0000-000000000005',
   'c003a000-0000-0000-0000-000000000003',
   'barge', 'MGO', 342.0, 28.0, 0.8345, NULL,
   '2026-05-21T01:45:00Z', 'Barge Master', true,
   'Barge figures inconsistent with MFM and shore tank'),

  ('m006a000-0000-0000-0000-000000000006',
   'c003a000-0000-0000-0000-000000000003',
   'manual', 'MGO', 325.1, 28.2, 0.8343, NULL,
   '2026-05-20T22:30:00Z', 'Shore Terminal Inspector', false,
   'Shore tank before/after comparison, Fujairah Oil Terminal #3'),

  -- c7: off_spec — vessel, barge
  ('m007a000-0000-0000-0000-000000000007',
   'c007a000-0000-0000-0000-000000000007',
   'vessel', 'VLSFO', 795.8, 47.2, 0.9881, 0.9956,
   '2026-06-03T19:30:00Z', 'Chief Officer', false,
   'Post-bunkering tank measurement'),

  ('m008a000-0000-0000-0000-000000000008',
   'c007a000-0000-0000-0000-000000000007',
   'barge', 'VLSFO', 802.1, 48.5, 0.9884, NULL,
   '2026-06-03T19:45:00Z', 'Barge Master', false,
   'Barge departure soundings per BDN WFS-ANT-2026-3841'),

  -- c8: quantity_short — vessel, barge (disputed), mfm, surveyor
  ('m009a000-0000-0000-0000-000000000009',
   'c008a000-0000-0000-0000-000000000008',
   'vessel', 'HSFO', 1778.5, 44.8, 0.9778, NULL,
   '2026-05-25T08:30:00Z', 'Chief Officer', false,
   'Post-bunkering ullage measurement'),

  ('m010a000-0000-0000-0000-000000000010',
   'c008a000-0000-0000-0000-000000000008',
   'barge', 'HSFO', 1803.2, 45.5, 0.9781, NULL,
   '2026-05-25T08:45:00Z', 'Barge Master', true,
   'Barge departure soundings — sole outlier above BDN; barge meter accuracy disputed'),

  ('m011a000-0000-0000-0000-000000000011',
   'c008a000-0000-0000-0000-000000000008',
   'mfm', 'HSFO', 1789.4, 44.9, 0.9779, NULL,
   '2026-05-25T08:35:00Z', 'MFM System', false,
   'Inline MFM reading during delivery'),

  ('m012a000-0000-0000-0000-000000000012',
   'c008a000-0000-0000-0000-000000000008',
   'surveyor', 'HSFO', 1782.1, 45.0, 0.9780, NULL,
   '2026-05-25T09:15:00Z', 'SGS Maritime Services', false,
   'Independent surveyor measurement — converges with vessel and MFM figures'),

  -- c9: documentation — vessel only
  ('m013a000-0000-0000-0000-000000000013',
   'c009a000-0000-0000-0000-000000000009',
   'vessel', 'MGO', 64.8, 22.1, 0.8331, 0.9992,
   '2026-06-06T14:30:00Z', 'Chief Engineer', false,
   'Post-bunkering tank measurement; quantity within tolerance'),

  -- c10: contamination — vessel, barge
  ('m014a000-0000-0000-0000-000000000014',
   'c010a000-0000-0000-0000-000000000010',
   'vessel', 'VLSFO', 648.3, 46.1, 0.9891, 0.9959,
   '2026-06-01T21:45:00Z', 'Chief Officer', false,
   'Post-bunkering tank measurement'),

  ('m015a000-0000-0000-0000-000000000015',
   'c010a000-0000-0000-0000-000000000010',
   'barge', 'VLSFO', 651.7, 46.8, 0.9893, NULL,
   '2026-06-01T22:00:00Z', 'Barge Master', false,
   'Barge departure soundings per BDN MIN-PIR-2026-6634'),

  -- c11: quantity_over — vessel, barge, mfm
  ('m016a000-0000-0000-0000-000000000016',
   'c011a000-0000-0000-0000-000000000011',
   'vessel', 'VLSFO', 328.4, 49.2, 0.9842, 0.9947,
   '2026-05-05T10:30:00Z', 'Chief Officer', false,
   'Post-bunkering ullage — over-delivery confirmed'),

  ('m017a000-0000-0000-0000-000000000017',
   'c011a000-0000-0000-0000-000000000011',
   'barge', 'VLSFO', 328.9, 49.8, 0.9844, NULL,
   '2026-05-05T10:45:00Z', 'Barge Master', false,
   'Barge departure soundings'),

  ('m018a000-0000-0000-0000-000000000018',
   'c011a000-0000-0000-0000-000000000011',
   'mfm', 'VLSFO', 327.1, 49.1, 0.9841, NULL,
   '2026-05-05T10:35:00Z', 'MFM System', false,
   'Inline MFM reading'),

  -- c12: mfm_dispute — mfm (disputed by supplier), barge, vessel, manual
  ('m019a000-0000-0000-0000-000000000019',
   'c012a000-0000-0000-0000-000000000012',
   'mfm', 'LSMGO', 163.5, 21.4, 0.8448, NULL,
   '2026-06-08T11:20:00Z', 'MFM #WFS-LH-0042', true,
   'MFM reading disputed by supplier; calibration valid until December 2026'),

  ('m020a000-0000-0000-0000-000000000020',
   'c012a000-0000-0000-0000-000000000012',
   'barge', 'LSMGO', 180.2, 22.1, 0.8451, NULL,
   '2026-06-08T11:35:00Z', 'Barge Master', false,
   'Barge departure soundings per BDN WFS-LH-2026-5129'),

  ('m021a000-0000-0000-0000-000000000021',
   'c012a000-0000-0000-0000-000000000012',
   'vessel', 'LSMGO', 167.8, 21.8, 0.8449, NULL,
   '2026-06-08T11:15:00Z', 'Chief Engineer', false,
   'Post-bunkering tank measurement'),

  ('m022a000-0000-0000-0000-000000000022',
   'c012a000-0000-0000-0000-000000000012',
   'manual', 'LSMGO', 169.4, NULL, NULL, NULL,
   '2026-06-08T08:00:00Z', 'Le Havre Oil Terminal', false,
   'Shore tank before/after comparison — Le Havre Oil Terminal'),

  -- c13: off_spec B24 — vessel, barge
  ('m023a000-0000-0000-0000-000000000023',
   'c013a000-0000-0000-0000-000000000013',
   'vessel', 'B24', 419.1, 42.5, 0.8934, 0.9812,
   '2026-06-04T16:30:00Z', 'Chief Officer', false,
   'Post-bunkering tank measurement'),

  ('m024a000-0000-0000-0000-000000000024',
   'c013a000-0000-0000-0000-000000000013',
   'barge', 'B24', 421.8, 43.1, 0.8937, NULL,
   '2026-06-04T16:45:00Z', 'Barge Master', false,
   'Barge departure soundings per BDN MIN-GEN-2026-2219'),

  -- c14: quantity_short — vessel, barge, surveyor
  ('m025a000-0000-0000-0000-000000000025',
   'c014a000-0000-0000-0000-000000000014',
   'vessel', 'VLSFO', 934.2, 48.6, 0.9867, 0.9952,
   '2026-06-11T09:15:00Z', 'Chief Officer', false,
   'Post-bunkering ullage measurement'),

  ('m026a000-0000-0000-0000-000000000026',
   'c014a000-0000-0000-0000-000000000014',
   'barge', 'VLSFO', 952.7, 49.1, 0.9869, NULL,
   '2026-06-11T09:30:00Z', 'Barge Master', false,
   'Barge departure soundings per BDN BO-AMS-2026-7741'),

  ('m027a000-0000-0000-0000-000000000027',
   'c014a000-0000-0000-0000-000000000014',
   'surveyor', 'VLSFO', 941.8, 48.8, 0.9868, NULL,
   '2026-06-11T10:00:00Z', 'Bureau Veritas Amsterdam', false,
   'Independent surveyor measurement — below BDN and barge figure')
ON CONFLICT DO NOTHING;

-- ── Spec Checks ───────────────────────────────────────────────────────────────

INSERT INTO spec_checks (id, case_id, fuel_grade, parameter_name, unit,
                         bdn_value, contract_min, contract_max, lab_result,
                         status, notes, lab_reference, lab_date, lab_name) VALUES
  -- c2: Singapore VLSFO off-spec (sc1–sc8, corrected column names)
  ('sc01a000-0000-0000-0000-000000000001',
   'c002a000-0000-0000-0000-000000000002',
   'VLSFO', 'Density at 15°C', 'kg/m³',
   0.9912, NULL, 0.9910, 0.9914, 'warning', NULL, NULL, NULL, NULL),

  ('sc02a000-0000-0000-0000-000000000002',
   'c002a000-0000-0000-0000-000000000002',
   'VLSFO', 'Kinematic Viscosity at 50°C', 'cSt',
   380.2, NULL, 380.0, 375.4, 'ok', NULL, NULL, NULL, NULL),

  ('sc03a000-0000-0000-0000-000000000003',
   'c002a000-0000-0000-0000-000000000002',
   'VLSFO', 'Flash Point', '°C',
   63.0, 60.0, NULL, 58.0, 'off_spec',
   'Flash point below ISO 8217 minimum 60°C', NULL, NULL, NULL),

  ('sc04a000-0000-0000-0000-000000000004',
   'c002a000-0000-0000-0000-000000000002',
   'VLSFO', 'Sulphur Content', '% m/m',
   0.48, NULL, 0.50, 0.48, 'ok', NULL, NULL, NULL, NULL),

  ('sc05a000-0000-0000-0000-000000000005',
   'c002a000-0000-0000-0000-000000000002',
   'VLSFO', 'Water Content', '% v/v',
   NULL, NULL, 0.50, 0.12, 'ok', NULL, NULL, NULL, NULL),

  ('sc06a000-0000-0000-0000-000000000006',
   'c002a000-0000-0000-0000-000000000002',
   'VLSFO', 'CCAI', '',
   NULL, NULL, 870.0, 858.0, 'ok', NULL, NULL, NULL, NULL),

  ('sc07a000-0000-0000-0000-000000000007',
   'c002a000-0000-0000-0000-000000000002',
   'VLSFO', 'Aluminium + Silicon', 'mg/kg',
   NULL, NULL, 25.0, 42.0, 'off_spec',
   'Catalytic fines above limit — engine abrasion risk', NULL, NULL, NULL),

  ('sc08a000-0000-0000-0000-000000000008',
   'c002a000-0000-0000-0000-000000000002',
   'VLSFO', 'Vanadium', 'mg/kg',
   NULL, NULL, 150.0, 112.0, 'ok', NULL, NULL, NULL, NULL),

  -- c7: Antwerp VLSFO off-spec (SGS Antwerp)
  ('sc09a000-0000-0000-0000-000000000009',
   'c007a000-0000-0000-0000-000000000007',
   'VLSFO', 'Density at 15°C', 'kg/m³',
   0.9881, NULL, 0.9910, 0.9887, 'ok',
   NULL, 'SGS-ANT-2026-18842', '2026-06-10', 'SGS Antwerp'),

  ('sc10a000-0000-0000-0000-000000000010',
   'c007a000-0000-0000-0000-000000000007',
   'VLSFO', 'Flash Point', '°C',
   63.0, 60.0, NULL, 64.0, 'ok',
   NULL, 'SGS-ANT-2026-18842', '2026-06-10', 'SGS Antwerp'),

  ('sc11a000-0000-0000-0000-000000000011',
   'c007a000-0000-0000-0000-000000000007',
   'VLSFO', 'Sulphur Content', '% m/m',
   0.47, NULL, 0.50, 0.53, 'off_spec',
   'MARPOL SECA violation', 'SGS-ANT-2026-18842', '2026-06-10', 'SGS Antwerp'),

  ('sc12a000-0000-0000-0000-000000000012',
   'c007a000-0000-0000-0000-000000000007',
   'VLSFO', 'Kinematic Viscosity at 50°C', 'cSt',
   372.0, NULL, 380.0, 395.0, 'off_spec',
   'Risk of pump cavitation at elevated viscosity', 'SGS-ANT-2026-18842', '2026-06-10', 'SGS Antwerp'),

  ('sc13a000-0000-0000-0000-000000000013',
   'c007a000-0000-0000-0000-000000000007',
   'VLSFO', 'Aluminium + Silicon', 'mg/kg',
   NULL, NULL, 25.0, 18.0, 'ok',
   NULL, 'SGS-ANT-2026-18842', '2026-06-10', 'SGS Antwerp'),

  ('sc14a000-0000-0000-0000-000000000014',
   'c007a000-0000-0000-0000-000000000007',
   'VLSFO', 'CCAI', '',
   NULL, NULL, 870.0, 848.0, 'ok',
   NULL, 'SGS-ANT-2026-18842', '2026-06-10', 'SGS Antwerp'),

  ('sc15a000-0000-0000-0000-000000000015',
   'c007a000-0000-0000-0000-000000000007',
   'VLSFO', 'Water Content', '% v/v',
   NULL, NULL, 0.50, 0.08, 'ok',
   NULL, 'SGS-ANT-2026-18842', '2026-06-10', 'SGS Antwerp'),

  -- c10: Piraeus VLSFO contamination (Intertek Piraeus)
  ('sc16a000-0000-0000-0000-000000000016',
   'c010a000-0000-0000-0000-000000000010',
   'VLSFO', 'Chlorinated Solvents (toluene+xylene)', 'ppm',
   NULL, NULL, 5.0, 117.0, 'off_spec',
   'Toluene 85ppm, xylene 32ppm detected. Potential engine damage and regulatory violation.',
   'ITEK-PIR-2026-7741', '2026-06-05', 'Intertek Piraeus'),

  ('sc17a000-0000-0000-0000-000000000017',
   'c010a000-0000-0000-0000-000000000010',
   'VLSFO', 'Waste/Other Compounds', '% v/v',
   NULL, NULL, 0.10, 0.15, 'off_spec',
   'ISO 8217 prohibits waste oil contamination',
   'ITEK-PIR-2026-7741', '2026-06-05', 'Intertek Piraeus'),

  ('sc18a000-0000-0000-0000-000000000018',
   'c010a000-0000-0000-0000-000000000010',
   'VLSFO', 'Density at 15°C', 'kg/m³',
   0.9889, NULL, 0.9910, 0.9895, 'ok',
   NULL, 'ITEK-PIR-2026-7741', '2026-06-05', 'Intertek Piraeus'),

  ('sc19a000-0000-0000-0000-000000000019',
   'c010a000-0000-0000-0000-000000000010',
   'VLSFO', 'Flash Point', '°C',
   62.0, 60.0, NULL, 62.0, 'ok',
   NULL, 'ITEK-PIR-2026-7741', '2026-06-05', 'Intertek Piraeus'),

  ('sc20a000-0000-0000-0000-000000000020',
   'c010a000-0000-0000-0000-000000000010',
   'VLSFO', 'Sulphur Content', '% m/m',
   0.44, NULL, 0.50, 0.45, 'ok',
   NULL, 'ITEK-PIR-2026-7741', '2026-06-05', 'Intertek Piraeus'),

  -- c13: Genoa B24 off-spec (DNV Maritime Advisory)
  ('sc21a000-0000-0000-0000-000000000021',
   'c013a000-0000-0000-0000-000000000013',
   'B24', 'FAME Content', '% v/v',
   24.0, NULL, 24.0, 27.2, 'off_spec',
   'Exceeds ISO 8217:2017 FAME limit and supply nomination specification',
   'DNV-GEN-2026-9921', '2026-06-08', 'DNV Maritime Advisory Genoa'),

  ('sc22a000-0000-0000-0000-000000000022',
   'c013a000-0000-0000-0000-000000000013',
   'B24', 'Oxidation Stability (Rancimat)', 'hours',
   NULL, 6.0, NULL, 4.2, 'off_spec',
   'FAME blend must meet minimum 6h oxidation stability per ISO 8217',
   'DNV-GEN-2026-9921', '2026-06-08', 'DNV Maritime Advisory Genoa'),

  ('sc23a000-0000-0000-0000-000000000023',
   'c013a000-0000-0000-0000-000000000013',
   'B24', 'Acid Number', 'mg KOH/g',
   NULL, NULL, 0.50, 0.42, 'warning',
   'Approaching limit; trend risk in storage',
   'DNV-GEN-2026-9921', '2026-06-08', 'DNV Maritime Advisory Genoa'),

  ('sc24a000-0000-0000-0000-000000000024',
   'c013a000-0000-0000-0000-000000000013',
   'B24', 'Sulphur Content', '% m/m',
   0.12, NULL, 0.50, 0.11, 'ok',
   NULL, 'DNV-GEN-2026-9921', '2026-06-08', 'DNV Maritime Advisory Genoa'),

  ('sc25a000-0000-0000-0000-000000000025',
   'c013a000-0000-0000-0000-000000000013',
   'B24', 'Flash Point', '°C',
   NULL, 60.0, NULL, 67.0, 'ok',
   NULL, 'DNV-GEN-2026-9921', '2026-06-08', 'DNV Maritime Advisory Genoa'),

  ('sc26a000-0000-0000-0000-000000000026',
   'c013a000-0000-0000-0000-000000000013',
   'B24', 'Water Content', 'mg/kg',
   NULL, NULL, 500.0, 210.0, 'ok',
   NULL, 'DNV-GEN-2026-9921', '2026-06-08', 'DNV Maritime Advisory Genoa')
ON CONFLICT DO NOTHING;

-- ── Drafts ────────────────────────────────────────────────────────────────────

INSERT INTO drafts (id, case_id, draft_type, title, body, status, version, created_at) VALUES
  -- dr1: c1, LOP_Response
  (
    'dr01a000-0000-0000-0000-000000000001',
    'c001a000-0000-0000-0000-000000000001',
    'LOP_Response',
    'LOP Response — MV Nordic Star — Rotterdam 01 June 2026',
    'Without Prejudice

To: Peninsula Petroleum Ltd
Attn: Bunker Operations Department

Re: MV Nordic Star / IMO 9412345
    Delivery Date: 01 June 2026, Port of Rotterdam
    BDN Reference: PEN-RTM-2026-8821
    Fuel Grade: VLSFO

Dear Sirs,

We write in response to your Letter of Protest dated 01 June 2026 and wish to record our position as follows.

Our client''s vessel, MV Nordic Star, received bunkers from your barge in Rotterdam on 01 June 2026. Post-bunkering ullage measurements conducted by the Chief Officer indicate a net quantity of 487.2 MT received against your stated BDN quantity of 500.0 MT. The independent mass flow meter recorded 495.1 MT.

The discrepancy of 12.8 MT (2.56% of BDN quantity) is outside the commercially acceptable tolerance of ±0.5% and requires formal investigation.

We hereby formally request:
1. Full barge ullage report (departure soundings) duly signed
2. MFM calibration certificate (serial #PEN-MFM-0021)
3. Shore tank reconciliation figures for the relevant parcel

All our client''s rights remain fully reserved.

Yours faithfully,
Copemer Ltd — Disputes & Claims Department',
    'under_review', 2, '2026-06-03T10:00:00Z'
  ),
  -- dr2: c2, Owner_Update
  (
    'dr02a000-0000-0000-0000-000000000002',
    'c002a000-0000-0000-0000-000000000002',
    'Owner_Update',
    'Owner Update — MV Pacific Horizon — Off-Spec VLSFO',
    'CONFIDENTIAL — OWNER COMMUNICATION

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

Copemer Ltd',
    'approved', 1, '2026-05-30T16:00:00Z'
  ),
  -- dr3: c3, Internal_Memo
  (
    'dr03a000-0000-0000-0000-000000000003',
    'c003a000-0000-0000-0000-000000000003',
    'Internal_Memo',
    'Internal Memo — MFM Dispute Analysis — MV Atlantic Carrier',
    'INTERNAL — NOT FOR EXTERNAL DISTRIBUTION

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

Next steps: Sophie to draft claim letter to Minerva.',
    'draft', 1, '2026-05-22T14:00:00Z'
  ),
  -- dr4: c7, Claim_Letter
  (
    'dr04a000-0000-0000-0000-000000000004',
    'c007a000-0000-0000-0000-000000000007',
    'Claim_Letter',
    'Claim Letter — MV Elara Spirit — Antwerp — Off-Spec VLSFO',
    'Without Prejudice — Subject to Contract

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

Copemer Ltd',
    'sent', 1, '2026-06-11T09:00:00Z'
  ),
  -- dr5: c8, Internal_Memo
  (
    'dr05a000-0000-0000-0000-000000000005',
    'c008a000-0000-0000-0000-000000000008',
    'Internal_Memo',
    'Internal Analysis — MV Poseidon Bay — Marsaxlokk Quantity Short',
    'INTERNAL — NOT FOR EXTERNAL DISTRIBUTION

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
Challenge barge departure soundings; request barge tank calibration tables and trim log. Accept independent surveyor figure as primary reference. Estimated shortage claim: approximately 18–22 MT at ~USD 480/MT = USD 8,640–10,560.',
    'draft', 1, '2026-05-28T14:00:00Z'
  ),
  -- dr6: c10, Protest_Letter
  (
    'dr06a000-0000-0000-0000-000000000006',
    'c010a000-0000-0000-0000-000000000010',
    'Protest_Letter',
    'Vessel Protest — MV Hercules Merchant — Contaminated VLSFO — Piraeus',
    'WITHOUT PREJUDICE

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
Copemer Ltd',
    'approved', 1, '2026-06-04T10:00:00Z'
  ),
  -- dr7: c12, LOP_Response
  (
    'dr07a000-0000-0000-0000-000000000007',
    'c012a000-0000-0000-0000-000000000012',
    'LOP_Response',
    'LOP Response — MV Byzantium Star — Le Havre — MFM Dispute',
    'Without Prejudice

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
Copemer Ltd',
    'draft', 1, '2026-06-09T14:00:00Z'
  ),
  -- dr8: c13, Supplier_Challenge
  (
    'dr08a000-0000-0000-0000-000000000008',
    'c013a000-0000-0000-0000-000000000013',
    'Supplier_Challenge',
    'Supplier Quality Challenge — MV Atlantic Carrier — Genoa — B24 Off-Spec',
    'Without Prejudice

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
Copemer Ltd',
    'under_review', 1, '2026-06-09T10:00:00Z'
  ),
  -- dr9: c14, Reservation_of_Rights
  (
    'dr09a000-0000-0000-0000-000000000009',
    'c014a000-0000-0000-0000-000000000014',
    'Reservation_of_Rights',
    'Reservation of Rights — MV Celtic Horizon — Amsterdam — Quantity Short',
    'Without Prejudice

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

Until the above are received and reviewed, all our client''s rights are expressly reserved, including rights of deduction and claim. This communication is written without prejudice.

Copemer Ltd — Disputes & Claims Department',
    'sent', 1, '2026-06-12T11:00:00Z'
  )
ON CONFLICT DO NOTHING;

-- ── Fuel Readiness Records ────────────────────────────────────────────────────

INSERT INTO fuel_readiness_records
  (id, vessel_id, fuel_type, status, readiness_score, requirements, target_date, certifying_body, notes)
VALUES
  -- fr1: v1 Methanol (existing)
  (
    'fr01a000-0000-0000-0000-000000000001',
    'v001a000-0000-0000-0000-000000000001',
    'Methanol', 'in_progress', 45,
    '[
      {"id":"r1","label":"IMO IGF Code assessment","description":"Structural and systems assessment against IGF Code requirements","completed":true,"doc_ref":"ABS-2026-IGF-0441"},
      {"id":"r2","label":"Flag State approval","description":"Flag State (Marshall Islands) approval of methanol fuel systems","completed":false,"due_date":"2026-09-30"},
      {"id":"r3","label":"Class society survey","description":"ABS survey of fuel containment, piping, and safety systems","completed":false,"due_date":"2026-08-15"},
      {"id":"r4","label":"Crew training — methanol","description":"All officers to complete methanol handling and emergency response training","completed":true},
      {"id":"r5","label":"Supplier agreements","description":"Methanol supply agreements at primary ports (Rotterdam, Singapore)","completed":false,"due_date":"2026-10-01"},
      {"id":"r6","label":"Insurance endorsement","description":"P&I Club and H&M insurance endorsement for methanol operations","completed":false}
    ]',
    '2026-12-01', 'ABS',
    'Conversion project underway. Flag State approval is critical path item.'
  ),
  -- fr2: v2 B24 (existing)
  (
    'fr02a000-0000-0000-0000-000000000002',
    'v002a000-0000-0000-0000-000000000002',
    'B24', 'ready', 92,
    '[
      {"id":"r7","label":"Engine compatibility check","description":"MAN B&W engine compatibility with B24 biofuel blend","completed":true},
      {"id":"r8","label":"Fuel system inspection","description":"Seals, gaskets, and elastomers compatibility with FAME content","completed":true},
      {"id":"r9","label":"Supplier qualification","description":"Biofuel supplier quality certification (ISCC)","completed":true,"doc_ref":"ISCC-2026-0882"},
      {"id":"r10","label":"FuelEU compliance check","description":"Verify GHG intensity meets FuelEU Maritime 2025 requirements","completed":true},
      {"id":"r11","label":"Operations procedure update","description":"Update SMS for biofuel handling and blending procedures","completed":false,"due_date":"2026-07-01"}
    ]',
    '2026-07-15', 'DNV',
    'Awaiting SMS update before first B24 bunker call scheduled for Singapore July 2026.'
  ),
  -- fr3: v3 Ammonia (existing)
  (
    'fr03a000-0000-0000-0000-000000000003',
    'v003a000-0000-0000-0000-000000000003',
    'Ammonia', 'not_started', 0,
    '[
      {"id":"r12","label":"Feasibility study","description":"Technical and commercial feasibility assessment for ammonia conversion","completed":false,"due_date":"2027-01-01"},
      {"id":"r13","label":"Class notation application","description":"Apply for ammonia-ready class notation","completed":false},
      {"id":"r14","label":"Port availability survey","description":"Survey ammonia bunkering infrastructure at primary ports","completed":false},
      {"id":"r15","label":"Crew training programme","description":"Toxic gas handling, emergency response, PPE requirements","completed":false}
    ]',
    '2028-01-01', NULL,
    'Deferred pending regulatory clarity on SOLAS ammonia provisions. Monitor IMO MSC developments.'
  ),
  -- fr4: v4 B24 certified (existing)
  (
    'fr04a000-0000-0000-0000-000000000004',
    'v004a000-0000-0000-0000-000000000004',
    'B24', 'certified', 100,
    '[
      {"id":"r16","label":"Engine compatibility check","description":"Wärtsilä engine compatibility with B24","completed":true},
      {"id":"r17","label":"Supplier qualification","description":"ISCC-certified biofuel supplier","completed":true,"doc_ref":"ISCC-2025-0334"},
      {"id":"r18","label":"Class certificate","description":"DNV biofuel-ready certificate issued","completed":true,"doc_ref":"DNV-BF-2025-7721"},
      {"id":"r19","label":"SMS update","description":"Safety Management System updated for biofuel operations","completed":true},
      {"id":"r20","label":"FuelEU compliance","description":"GHG intensity verified meets FuelEU 2025 requirements","completed":true,"doc_ref":"FEU-2025-GT-008"}
    ]',
    NULL, 'DNV',
    'Fully certified. First B24 delivery completed Singapore October 2025.'
  ),
  -- fr5: v5 (Elara Spirit) Methanol in_progress
  (
    'fr05a000-0000-0000-0000-000000000005',
    'v005a000-0000-0000-0000-000000000005',
    'Methanol', 'in_progress', 35,
    '[
      {"id":"r21","label":"Feasibility study","description":"Methanol conversion feasibility study for Aframax tanker","completed":true},
      {"id":"r22","label":"IGF Code pre-assessment","description":"Pre-assessment against IMO IGF Code requirements","completed":false,"due_date":"2026-12-01"},
      {"id":"r23","label":"Flag state notification","description":"Liberia flag state notification and approval process","completed":false},
      {"id":"r24","label":"Crew training","description":"All officers methanol handling and emergency response training","completed":false,"due_date":"2027-01-01"},
      {"id":"r25","label":"Fuel system engineering study","description":"Engineering study for methanol fuel system adaptation","completed":false,"due_date":"2026-11-01"},
      {"id":"r26","label":"Insurance review","description":"P&I and H&M insurance review for methanol operations","completed":false}
    ]',
    '2027-06-01', 'Lloyd''s Register',
    'Aframax conversion study commissioned. Longer timeline due to vessel age and flag state process.'
  ),
  -- fr6: v6 (Poseidon Bay) LNG in_progress
  (
    'fr06a000-0000-0000-0000-000000000006',
    'v006a000-0000-0000-0000-000000000006',
    'LNG', 'in_progress', 55,
    '[
      {"id":"r27","label":"IGF Code design review","description":"Class design review against IMO IGF Code for LNG systems","completed":true},
      {"id":"r28","label":"Class notation application","description":"DNV LNG-ready class notation application submitted","completed":true},
      {"id":"r29","label":"LNG fuel containment system approved","description":"Class approval of LNG containment system design","completed":false,"due_date":"2026-09-30"},
      {"id":"r30","label":"Dual-fuel engine order placed","description":"MAN ME-GI dual-fuel engine order confirmed","completed":true},
      {"id":"r31","label":"Crew training programme","description":"LNG handling, cryogenic safety, and emergency response","completed":true},
      {"id":"r32","label":"Port availability survey","description":"LNG bunkering availability at primary VLCC ports","completed":false,"due_date":"2026-08-01"},
      {"id":"r33","label":"First bunkering SOP","description":"Standard operating procedure for first LNG bunkering","completed":false,"due_date":"2026-10-01"}
    ]',
    '2027-01-01', 'DNV',
    'Engine order confirmed MAN ME-GI. LNG containment system design under class review.'
  ),
  -- fr7: v7 (Thalassa Wind) B24 ready
  (
    'fr07a000-0000-0000-0000-000000000007',
    'v007a000-0000-0000-0000-000000000007',
    'B24', 'ready', 89,
    '[
      {"id":"r34","label":"Engine compatibility confirmed","description":"Wärtsilä engine compatibility with B24 biofuel blend confirmed","completed":true},
      {"id":"r35","label":"ISCC supplier qualification","description":"ISCC-certified biofuel supplier qualified","completed":true},
      {"id":"r36","label":"Fuel system seals inspection","description":"Seals and elastomers compatibility inspection completed","completed":true},
      {"id":"r37","label":"SMS update for biofuel","description":"Safety Management System updated for biofuel handling","completed":true},
      {"id":"r38","label":"FuelEU GHG check","description":"GHG intensity verification against FuelEU 2025 requirements","completed":true},
      {"id":"r39","label":"First delivery SOP signed","description":"Standard operating procedure for B24 delivery signed by master","completed":false,"due_date":"2026-07-15"}
    ]',
    '2026-08-01', 'Bureau Veritas',
    'SMS update pending master signature. All technical checks complete for Wärtsilä engine.'
  ),
  -- fr8: v8 (Hercules Merchant) Ammonia not_started
  (
    'fr08a000-0000-0000-0000-000000000008',
    'v008a000-0000-0000-0000-000000000008',
    'Ammonia', 'not_started', 0,
    '[
      {"id":"r40","label":"Commercial viability study","description":"Assessment of ammonia as fuel commercial viability for bulk carrier trading pattern","completed":false},
      {"id":"r41","label":"Class notation pre-assessment","description":"Preliminary assessment for ammonia-ready class notation","completed":false},
      {"id":"r42","label":"SOLAS amendment review","description":"Review of SOLAS amendments for ammonia as fuel","completed":false},
      {"id":"r43","label":"Port infrastructure survey","description":"Survey of ammonia bunkering infrastructure at primary ports","completed":false}
    ]',
    '2029-01-01', NULL,
    'Deferred pending IMO MSC ammonia-as-fuel regulatory framework. Monitor developments.'
  ),
  -- fr9: v11 (Celtic Horizon) Methanol in_progress
  (
    'fr09a000-0000-0000-0000-000000000009',
    'v011a000-0000-0000-0000-000000000011',
    'Methanol', 'in_progress', 28,
    '[
      {"id":"r44","label":"Feasibility study","description":"Methanol conversion feasibility study completed","completed":true},
      {"id":"r45","label":"IGF pre-assessment","description":"IGF Code pre-assessment by DNV","completed":false,"due_date":"2026-12-01"},
      {"id":"r46","label":"Flag state letter of intent","description":"Isle of Man flag state letter of intent submitted","completed":false,"due_date":"2026-10-01"},
      {"id":"r47","label":"Class notation application","description":"DNV class notation application for methanol","completed":false},
      {"id":"r48","label":"Crew training","description":"All officers methanol handling and safety training","completed":false,"due_date":"2027-03-01"},
      {"id":"r49","label":"Insurance endorsement","description":"P&I and H&M insurance endorsement for methanol operations","completed":false},
      {"id":"r50","label":"Shore supply SOP","description":"Shore supply standard operating procedure for methanol","completed":false}
    ]',
    '2027-09-01', 'DNV',
    'Isle of Man flag state process commenced. Engine room layout assessment complete.'
  ),
  -- fr10: v9 (Cerulean Grace) B24 certified
  (
    'fr10a000-0000-0000-0000-000000000010',
    'v009a000-0000-0000-0000-000000000009',
    'B24', 'certified', 100,
    '[
      {"id":"r51","label":"Engine compatibility check","description":"Engine compatibility with B24 biofuel blend confirmed","completed":true},
      {"id":"r52","label":"Fuel system inspection","description":"Seals and elastomers compatibility verified","completed":true},
      {"id":"r53","label":"ISCC supplier qualification","description":"ISCC-certified biofuel supplier qualified","completed":true},
      {"id":"r54","label":"Class certificate","description":"Bureau Veritas biofuel-ready certificate issued","completed":true,"doc_ref":"BV-BF-2025-4412"},
      {"id":"r55","label":"SMS update","description":"Safety Management System updated for biofuel operations","completed":true},
      {"id":"r56","label":"FuelEU compliance","description":"GHG intensity verified meets FuelEU 2025 requirements","completed":true}
    ]',
    NULL, 'Bureau Veritas',
    'Certified November 2025. Operating B24 on Rotterdam and Antwerp calls.'
  )
ON CONFLICT DO NOTHING;

-- ── Thresholds ────────────────────────────────────────────────────────────────

INSERT INTO thresholds (id, category, parameter, unit, warning_threshold, critical_threshold) VALUES
  ('th01a000-0000-0000-0000-000000000001', 'quantity', 'Quantity Variance (Vessel vs BDN)', '%',               0.3,    0.5),
  ('th02a000-0000-0000-0000-000000000002', 'quantity', 'Quantity Variance (MFM vs BDN)',    '%',               0.3,    0.5),
  ('th03a000-0000-0000-0000-000000000003', 'spec',     'Flash Point',                       '°C below min',   2.0,    5.0),
  ('th04a000-0000-0000-0000-000000000004', 'spec',     'Sulphur Content',                   '% m/m above max',0.01,   0.05),
  ('th05a000-0000-0000-0000-000000000005', 'spec',     'Aluminium + Silicon',               'mg/kg above max', 5.0,  15.0),
  ('th06a000-0000-0000-0000-000000000006', 'spec',     'Density',                           'kg/m³ above max', 0.0002, 0.001),
  ('th07a000-0000-0000-0000-000000000007', 'spec',     'Viscosity at 50°C',                 'cSt above max',   5.0,  20.0)
ON CONFLICT DO NOTHING;

-- ── Templates ─────────────────────────────────────────────────────────────────

INSERT INTO templates (id, draft_type, name, body, is_active) VALUES
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

We write further to the Letter of Protest submitted in connection with the above delivery and wish to record our position as follows.

[Describe discrepancy and supporting measurements]

We hereby formally request:
1. [Request 1]
2. [Request 2]
3. [Request 3]

All our client''s rights remain fully reserved without prejudice to the above.

Yours faithfully,
Copemer Ltd — Disputes & Claims Department',
    true
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

Copemer Ltd',
    true
  ),
  (
    'tmpl0003-0000-0000-0000-000000000003',
    'Owner_Update',
    'Standard Owner Update',
    'CONFIDENTIAL — OWNER COMMUNICATION

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

Copemer Ltd',
    true
  ),
  (
    'tmpl0004-0000-0000-0000-000000000004',
    'Protest_Letter',
    'Standard Protest Letter',
    'WITHOUT PREJUDICE

NOTICE OF VESSEL PROTEST

To: [Supplier Name]
Date: [Date]
Re: [Vessel Name] (IMO [IMO Number]) — [Port] — Delivery [Date] — BDN: [BDN Number]

We hereby formally protest the [quality/quantity] of the bunker delivery described above.

[Describe grounds for protest with supporting evidence]

We hold you responsible for all losses, costs and expenses arising from this delivery. Formal claim to follow.

All rights reserved without prejudice.
Copemer Ltd',
    true
  ),
  (
    'tmpl0005-0000-0000-0000-000000000005',
    'Reservation_of_Rights',
    'Standard Reservation of Rights',
    'Without Prejudice

To: [Supplier Name]
Attn: Operations Department
Re: [Vessel Name] (IMO [IMO Number]) — [Port] — [Date] — BDN Ref: [BDN Number]

We write to formally reserve all rights in connection with the above delivery.

[Describe measurements and discrepancy]

All measurement records are being preserved. We formally request:
(1) Barge departure ullage report signed by barge master
(2) Barge calibration certificate
(3) [Other documents as applicable]

Until the above are received and reviewed, all our client''s rights are expressly reserved. This communication is written without prejudice.

Copemer Ltd — Disputes & Claims Department',
    true
  ),
  (
    'tmpl0006-0000-0000-0000-000000000006',
    'Supplier_Challenge',
    'Standard Supplier Quality Challenge',
    'Without Prejudice

To: [Supplier Name] — Quality Department
Re: [Vessel Name] (IMO [IMO Number]) — [Port] — Delivery [Date] — BDN: [BDN Number]

We write to formally challenge the quality of the fuel supplied under the above delivery.

QUALITY NON-CONFORMANCES
Laboratory analysis ([Lab Name], Report [Report Ref], dated [Date]) confirms:
(1) [Parameter]: [Lab Result] — EXCEEDS/BELOW [Limit] [Unit]
(2) [Parameter]: [Lab Result] — EXCEEDS/BELOW [Limit] [Unit]

We require your written response within 5 business days confirming:
(1) Source of the out-of-specification parameter(s)
(2) Quality control records for this parcel
(3) Your proposed remedy

All rights reserved.
Copemer Ltd',
    true
  )
ON CONFLICT DO NOTHING;
