// ISO 8217 Marine Fuel Standard — specification limits for editions 2005, 2010, 2017.
// Source: ISO 8217:2005, ISO 8217:2010, ISO 8217:2017.
// Parameter names match the parameter_name values used throughout the application.

export type IsoEdition = '2005' | '2010' | '2017'
export type IsoCategory = 'distillate' | 'residual'

export interface IsoParamSpec {
  name: string
  unit: string
  min?: number
  max?: number
  note?: string
}

export interface IsoGradeSpec {
  grade: string
  category: IsoCategory
  edition: IsoEdition
  params: IsoParamSpec[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function p(name: string, unit: string, min?: number, max?: number, note?: string): IsoParamSpec {
  return { name, unit, ...(min !== undefined ? { min } : {}), ...(max !== undefined ? { max } : {}), ...(note ? { note } : {}) }
}

// ── ISO 8217:2017 Distillate grades ───────────────────────────────────────────
// DMX, DMA, DFA (FAME blend), DMZ, DFZ (FAME blend), DMB, DFB (FAME blend)

const D2017_common = [
  p('Acid Number',              'mg KOH/g', undefined, 0.5),
  p('Oxidation Stability',      'g/m³',     undefined, 25),
  p('Lubricity (wsd 1.4)',      'µm',       undefined, 520),
  p('Hydrogen Sulphide',        'mg/kg',    undefined, 2.00),
]

const iso2017_DMX: IsoGradeSpec = {
  grade: 'DMX', category: 'distillate', edition: '2017',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 1.400, 5.500),
    p('MCR at 10% Residue',          '% m/m', undefined, 0.30),
    p('Sulphur Content',             '% m/m', undefined, 1.00),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    43.0),
    p('Cloud Point',                 '°C',    undefined, -16,  'Both seasons'),
    p('Cetane Index',                '',      45),
    p('FAME Content',                '% v/v', undefined, 0,    'Not permitted'),
    ...D2017_common,
  ],
}

const iso2017_DMA: IsoGradeSpec = {
  grade: 'DMA', category: 'distillate', edition: '2017',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 2.000, 6.000),
    p('MCR at 10% Residue',          '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 890.0),
    p('Sulphur Content',             '% m/m', undefined, 1.00),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 0),
    p('Pour Point (Winter)',         '°C',    undefined, -6),
    p('Cetane Index',                '',      40),
    p('FAME Content',                '% v/v', undefined, 0,    'Not permitted'),
    ...D2017_common,
  ],
}

const iso2017_DFA: IsoGradeSpec = {
  grade: 'DFA', category: 'distillate', edition: '2017',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 2.000, 6.000),
    p('MCR at 10% Residue',          '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 890.0),
    p('Sulphur Content',             '% m/m', undefined, 1.00),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 0),
    p('Pour Point (Winter)',         '°C',    undefined, -6),
    p('Cetane Index',                '',      40),
    p('FAME Content',                '% v/v', undefined, 7.0,  'FAME blend grade'),
    ...D2017_common,
  ],
}

const iso2017_DMZ: IsoGradeSpec = {
  grade: 'DMZ', category: 'distillate', edition: '2017',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 3.000, 6.000),
    p('MCR at 10% Residue',          '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 890.0),
    p('Sulphur Content',             '% m/m', undefined, 1.00),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 0),
    p('Pour Point (Winter)',         '°C',    undefined, -6),
    p('Cetane Index',                '',      40),
    p('FAME Content',                '% v/v', undefined, 0,    'Not permitted'),
    ...D2017_common,
  ],
}

const iso2017_DFZ: IsoGradeSpec = {
  grade: 'DFZ', category: 'distillate', edition: '2017',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 3.000, 6.000),
    p('MCR at 10% Residue',          '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 890.0),
    p('Sulphur Content',             '% m/m', undefined, 1.00),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 0),
    p('Pour Point (Winter)',         '°C',    undefined, -6),
    p('Cetane Index',                '',      40),
    p('FAME Content',                '% v/v', undefined, 7.0,  'FAME blend grade'),
    ...D2017_common,
  ],
}

const iso2017_DMB: IsoGradeSpec = {
  grade: 'DMB', category: 'distillate', edition: '2017',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 2.000, 11.00),
    p('Micro Carbon Residue',        '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 900.0),
    p('Sulphur Content',             '% m/m', undefined, 1.50),
    p('Water Content',               '% v/v', undefined, 0.30),
    p('Total Sediment',              '% m/m', undefined, 0.10),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 6),
    p('Pour Point (Winter)',         '°C',    undefined, 0),
    p('Cetane Index',                '',      35),
    p('FAME Content',                '% v/v', undefined, 0,    'Not permitted'),
    ...D2017_common,
  ],
}

const iso2017_DFB: IsoGradeSpec = {
  grade: 'DFB', category: 'distillate', edition: '2017',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 2.000, 11.00),
    p('Micro Carbon Residue',        '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 900.0),
    p('Sulphur Content',             '% m/m', undefined, 1.50),
    p('Water Content',               '% v/v', undefined, 0.30),
    p('Total Sediment',              '% m/m', undefined, 0.10),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 6),
    p('Pour Point (Winter)',         '°C',    undefined, 0),
    p('Cetane Index',                '',      35),
    p('FAME Content',                '% v/v', undefined, 7.0,  'FAME blend grade'),
    ...D2017_common,
  ],
}

// ── ISO 8217:2017 Residual grades ─────────────────────────────────────────────
// RMA10, RMA30, RMB80, RMD180, RME180, RMG380/500/700, RMK380/500/700

const R2017_flash    = p('Flash Point',      '°C',    60.0)
const R2017_sediment = p('Total Sediment',   '% m/m', undefined, 0.10, 'Aged method ISO 10307-2')
const R2017_acid     = p('Acid Number',      'mg KOH/g', undefined, 2.5)
const R2017_h2s      = p('Hydrogen Sulphide','mg/kg', undefined, 2.00)
const R2017_sulphur  = p('Sulphur Content',  '% m/m', undefined, undefined, 'Statutory requirement')
const R2017_ulo      = p('Used Lube Oil (Ca+Zn/P)', '', undefined, undefined,
  'Fail if Ca>30 AND (Zn>15 OR P>15) mg/kg')

function residual2017(
  grade: string, viscMax: number,
  densMax: number, mcrMax: number,
  alsiMax: number, naMax: number,
  ashMax: number, vanMax: number | undefined,
  ccaiMax: number, waterMax: number,
  pourSummer: number, pourWinter: number,
): IsoGradeSpec {
  const params: IsoParamSpec[] = [
    p('Kinematic Viscosity at 50°C', 'cSt',   undefined, viscMax),
    p('Density at 15°C',             'kg/m³', undefined, densMax),
    p('Micro Carbon Residue',        '% m/m', undefined, mcrMax),
    p('Aluminium + Silicon',         'mg/kg', undefined, alsiMax),
    p('Sodium',                      'mg/kg', undefined, naMax),
    p('Ash Content',                 '% m/m', undefined, ashMax),
    ...(vanMax !== undefined ? [p('Vanadium', 'mg/kg', undefined, vanMax)] : []),
    p('CCAI',                        '',      undefined, ccaiMax),
    p('Water Content',               '% v/v', undefined, waterMax),
    p('Pour Point (Summer)',         '°C',    undefined, pourSummer),
    p('Pour Point (Winter)',         '°C',    undefined, pourWinter),
    R2017_flash,
    R2017_sulphur,
    R2017_sediment,
    R2017_acid,
    R2017_h2s,
    R2017_ulo,
  ]
  return { grade, category: 'residual', edition: '2017', params }
}

const iso2017_RMA10  = residual2017('RMA10',  10,  920, 2.50, 25, 50,  0.040, 50,  850, 0.30, 6, 0)
const iso2017_RMA30  = residual2017('RMA30',  30,  960, 10.0, 25, 50,  0.040, 150, 850, 0.50, 6, 0)
const iso2017_RMB80  = residual2017('RMB80',  80,  975, 14.0, 40, 100, 0.070, 150, 860, 0.50, 6, 0)
const iso2017_RMD180 = residual2017('RMD180', 180, 991, 15.0, 50, 100, 0.100, 350, 870, 0.50, 6, 0)
const iso2017_RME180 = residual2017('RME180', 180, 991, 18.0, 50, 100, 0.100, 350, 870, 0.50, 6, 0)
const iso2017_RMG380 = residual2017('RMG380', 380, 1010, 20.0, 60, 50, 0.150, 450, 870, 0.50, 30, 30)
const iso2017_RMG500 = residual2017('RMG500', 500, 1010, 20.0, 60, 50, 0.150, 450, 870, 0.50, 30, 30)
const iso2017_RMG700 = residual2017('RMG700', 700, 1010, 20.0, 60, 50, 0.150, 450, 870, 0.50, 30, 30)
const iso2017_RMK380 = residual2017('RMK380', 380, 1010, 20.0, 60, 100, 0.150, 450, 870, 0.50, 30, 30)
const iso2017_RMK500 = residual2017('RMK500', 500, 1010, 20.0, 60, 100, 0.150, 450, 870, 0.50, 30, 30)
const iso2017_RMK700 = residual2017('RMK700', 700, 1010, 20.0, 60, 100, 0.150, 450, 870, 0.50, 30, 30)

// ── ISO 8217:2010 ─────────────────────────────────────────────────────────────
// Same residual grade structure as 2017. Key distillate differences:
// - No DFA/DFZ/DFB grades (FAME blend grades added in 2017)
// - Higher sulphur limits: DMA/DMZ max 1.50, DMB max 2.00

const D2010_common = [
  p('Acid Number',              'mg KOH/g', undefined, 0.5),
  p('Oxidation Stability',      'g/m³',     undefined, 25),
  p('Lubricity (wsd 1.4)',      'µm',       undefined, 520),
  p('Hydrogen Sulphide',        'mg/kg',    undefined, 2.00),
]

const iso2010_DMX: IsoGradeSpec = {
  grade: 'DMX', category: 'distillate', edition: '2010',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 1.400, 5.500),
    p('MCR at 10% Residue',          '% m/m', undefined, 0.30),
    p('Sulphur Content',             '% m/m', undefined, 1.00),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    43.0),
    p('Cloud Point',                 '°C',    undefined, -16,  'Both seasons'),
    p('Cetane Index',                '',      45),
    ...D2010_common,
  ],
}

const iso2010_DMA: IsoGradeSpec = {
  grade: 'DMA', category: 'distillate', edition: '2010',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 2.000, 6.000),
    p('MCR at 10% Residue',          '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 890.0),
    p('Sulphur Content',             '% m/m', undefined, 1.50),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 0),
    p('Pour Point (Winter)',         '°C',    undefined, -6),
    p('Cetane Index',                '',      40),
    ...D2010_common,
  ],
}

const iso2010_DMZ: IsoGradeSpec = {
  grade: 'DMZ', category: 'distillate', edition: '2010',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 3.000, 6.000),
    p('MCR at 10% Residue',          '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 890.0),
    p('Sulphur Content',             '% m/m', undefined, 1.50),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 0),
    p('Pour Point (Winter)',         '°C',    undefined, -6),
    p('Cetane Index',                '',      40),
    ...D2010_common,
  ],
}

const iso2010_DMB: IsoGradeSpec = {
  grade: 'DMB', category: 'distillate', edition: '2010',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 2.000, 11.00),
    p('Micro Carbon Residue',        '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 900.0),
    p('Sulphur Content',             '% m/m', undefined, 2.00),
    p('Water Content',               '% v/v', undefined, 0.30),
    p('Total Sediment',              '% m/m', undefined, 0.10),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 6),
    p('Pour Point (Winter)',         '°C',    undefined, 0),
    p('Cetane Index',                '',      35),
    ...D2010_common,
  ],
}

// 2010 residuals — same limits as 2017 (grade structure unchanged)
const iso2010_RMA10  = { ...iso2017_RMA10,  edition: '2010' as IsoEdition }
const iso2010_RMA30  = { ...iso2017_RMA30,  edition: '2010' as IsoEdition }
const iso2010_RMB80  = { ...iso2017_RMB80,  edition: '2010' as IsoEdition }
const iso2010_RMD180 = { ...iso2017_RMD180, edition: '2010' as IsoEdition }
const iso2010_RME180 = { ...iso2017_RME180, edition: '2010' as IsoEdition }
const iso2010_RMG380 = { ...iso2017_RMG380, edition: '2010' as IsoEdition }
const iso2010_RMG500 = { ...iso2017_RMG500, edition: '2010' as IsoEdition }
const iso2010_RMG700 = { ...iso2017_RMG700, edition: '2010' as IsoEdition }
const iso2010_RMK380 = { ...iso2017_RMK380, edition: '2010' as IsoEdition }
const iso2010_RMK500 = { ...iso2017_RMK500, edition: '2010' as IsoEdition }
const iso2010_RMK700 = { ...iso2017_RMK700, edition: '2010' as IsoEdition }

// ── ISO 8217:2005 ─────────────────────────────────────────────────────────────
// Different grade structure: DMX/DMA/DMZ/DMB (no FAME grades, different limits)
// Residuals: RMA30, RMB30, RMD80, RME180, RMF180, RMG380, RMH380, RMH700, RMK380, RMK700
// No Acid Number, H2S, Lubricity, or Oxidation Stability tests in 2005.

const iso2005_DMX: IsoGradeSpec = {
  grade: 'DMX', category: 'distillate', edition: '2005',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 1.400, 5.500),
    p('MCR at 10% Residue',          '% m/m', undefined, 0.30),
    p('Sulphur Content',             '% m/m', undefined, 1.00),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    43.0),
    p('Cloud Point',                 '°C',    undefined, -16,  'Both seasons'),
    p('Cetane Index',                '',      45),
  ],
}

const iso2005_DMA: IsoGradeSpec = {
  grade: 'DMA', category: 'distillate', edition: '2005',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', 1.500, 6.000),
    p('MCR at 10% Residue',          '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 890.0),
    p('Sulphur Content',             '% m/m', undefined, 1.50),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 0),
    p('Pour Point (Winter)',         '°C',    undefined, -6),
    p('Cetane Index',                '',      40),
  ],
}

const iso2005_DMZ: IsoGradeSpec = {
  grade: 'DMZ', category: 'distillate', edition: '2005',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', undefined, 11.00),
    p('Micro Carbon Residue',        '% m/m', undefined, 0.30),
    p('Density at 15°C',             'kg/m³', undefined, 900.0),
    p('Sulphur Content',             '% m/m', undefined, 2.00),
    p('Water Content',               '% v/v', undefined, 0.30),
    p('Total Sediment',              '% m/m', undefined, 0.10),
    p('Ash Content',                 '% m/m', undefined, 0.010),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 6),
    p('Pour Point (Winter)',         '°C',    undefined, 0),
    p('Cetane Index',                '',      35),
  ],
}

const iso2005_DMB: IsoGradeSpec = {
  grade: 'DMB', category: 'distillate', edition: '2005',
  params: [
    p('Kinematic Viscosity at 40°C', 'mm²/s', undefined, 14.00),
    p('Micro Carbon Residue',        '% m/m', undefined, 2.50),
    p('Density at 15°C',             'kg/m³', undefined, 920.0),
    p('Sulphur Content',             '% m/m', undefined, 2.00),
    p('Water Content',               '% v/v', undefined, 0.30),
    p('Total Sediment',              '% m/m', undefined, 0.10),
    p('Ash Content',                 '% m/m', undefined, 0.050),
    p('Flash Point',                 '°C',    60.0),
    p('Pour Point (Summer)',         '°C',    undefined, 6),
    p('Pour Point (Winter)',         '°C',    undefined, 0),
    p('Vanadium',                    'mg/kg', undefined, 100),
    p('Aluminium + Silicon',         'mg/kg', undefined, 25),
    p('Zinc',                        'mg/kg', undefined, 15),
    p('Phosphorus',                  'mg/kg', undefined, 15),
    p('Calcium',                     'mg/kg', undefined, 30),
  ],
}

// 2005 residuals (pre-MARPOL 2020 sulphur caps; Al+Si limit was 80 mg/kg for all)
const R2005_flash    = p('Flash Point',      '°C',    60.0)
const R2005_sediment = p('Total Sediment',   '% m/m', undefined, 0.10, 'Potential method ISO 10307-1')
const R2005_ulo      = p('Used Lube Oil (Ca+Zn/P)', '', undefined, undefined,
  'Fail if Ca>30 AND (Zn>15 OR P>15) mg/kg')

function residual2005(
  grade: string, viscMax: number,
  densMax: number, mcrMax: number,
  ashMax: number, vanMax: number | undefined,
  sulphurMax: number, pourSummer: number, pourWinter: number,
): IsoGradeSpec {
  const params: IsoParamSpec[] = [
    p('Kinematic Viscosity at 50°C', 'cSt',   undefined, viscMax),
    p('Density at 15°C',             'kg/m³', undefined, densMax),
    p('Micro Carbon Residue',        '% m/m', undefined, mcrMax),
    p('Aluminium + Silicon',         'mg/kg', undefined, 80, 'Max 80 in 2005 edition'),
    p('Ash Content',                 '% m/m', undefined, ashMax),
    ...(vanMax !== undefined ? [p('Vanadium', 'mg/kg', undefined, vanMax)] : []),
    p('Water Content',               '% v/v', undefined, 0.50),
    p('Pour Point (Summer)',         '°C',    undefined, pourSummer),
    p('Pour Point (Winter)',         '°C',    undefined, pourWinter),
    p('Sulphur Content',             '% m/m', undefined, sulphurMax),
    R2005_flash, R2005_sediment, R2005_ulo,
  ]
  return { grade, category: 'residual', edition: '2005', params }
}

const iso2005_RMA30  = residual2005('RMA30',  30,  960,  10, 0.10, 150,  3.5, 6, 0)
const iso2005_RMB30  = residual2005('RMB30',  30,  975,  10, 0.10, 150,  3.5, 6, 0)
const iso2005_RMD80  = residual2005('RMD80',  80,  980,  14, 0.10, 350,  4.0, 6, 0)
const iso2005_RME180 = residual2005('RME180', 180, 991,  15, 0.10, 200,  4.5, 24, 24)
const iso2005_RMF180 = residual2005('RMF180', 180, 991,  20, 0.10, 500,  4.5, 24, 24)
const iso2005_RMG380 = residual2005('RMG380', 380, 1010, 18, 0.15, 300,  4.5, 30, 30)
const iso2005_RMH380 = residual2005('RMH380', 380, 991,  22, 0.15, 600,  4.5, 30, 30)
const iso2005_RMH700 = residual2005('RMH700', 700, 1010, 22, 0.15, 600,  4.5, 30, 30)
const iso2005_RMK380 = residual2005('RMK380', 380, 1010, 22, 0.15, undefined, 4.5, 30, 30)
const iso2005_RMK700 = residual2005('RMK700', 700, 1010, 22, 0.15, undefined, 4.5, 30, 30)

// ── Master spec list ──────────────────────────────────────────────────────────

export const ISO_8217_SPECS: IsoGradeSpec[] = [
  // 2017
  iso2017_DMX, iso2017_DMA, iso2017_DFA, iso2017_DMZ, iso2017_DFZ, iso2017_DMB, iso2017_DFB,
  iso2017_RMA10, iso2017_RMA30, iso2017_RMB80, iso2017_RMD180, iso2017_RME180,
  iso2017_RMG380, iso2017_RMG500, iso2017_RMG700, iso2017_RMK380, iso2017_RMK500, iso2017_RMK700,
  // 2010
  iso2010_DMX, iso2010_DMA, iso2010_DMZ, iso2010_DMB,
  iso2010_RMA10, iso2010_RMA30, iso2010_RMB80, iso2010_RMD180, iso2010_RME180,
  iso2010_RMG380, iso2010_RMG500, iso2010_RMG700, iso2010_RMK380, iso2010_RMK500, iso2010_RMK700,
  // 2005
  iso2005_DMX, iso2005_DMA, iso2005_DMZ, iso2005_DMB,
  iso2005_RMA30, iso2005_RMB30, iso2005_RMD80, iso2005_RME180, iso2005_RMF180,
  iso2005_RMG380, iso2005_RMH380, iso2005_RMH700, iso2005_RMK380, iso2005_RMK700,
]

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function getIsoEditionGrades(edition: IsoEdition): {
  distillate: string[]
  residual: string[]
} {
  const specs = ISO_8217_SPECS.filter((s) => s.edition === edition)
  return {
    distillate: specs.filter((s) => s.category === 'distillate').map((s) => s.grade),
    residual: specs.filter((s) => s.category === 'residual').map((s) => s.grade),
  }
}

export function getIsoSpec(edition: IsoEdition, grade: string): IsoGradeSpec | undefined {
  return ISO_8217_SPECS.find((s) => s.edition === edition && s.grade === grade)
}

// Common market fuel names → closest ISO 8217:2017 grade
export const MARKET_TO_ISO_GRADE: Record<string, { grade: string; edition: IsoEdition; note?: string }> = {
  VLSFO:  { grade: 'RMG380', edition: '2017', note: 'S ≤ 0.50% statutory limit applies' },
  ULSFO:  { grade: 'RMD180', edition: '2017', note: 'S ≤ 0.10% statutory limit applies' },
  HFO:    { grade: 'RMG380', edition: '2017' },
  IFO380: { grade: 'RMG380', edition: '2017' },
  IFO180: { grade: 'RME180', edition: '2017' },
  LSMGO:  { grade: 'DMA',    edition: '2017', note: 'S ≤ 0.10% statutory limit applies' },
  MGO:    { grade: 'DMA',    edition: '2017' },
  MDO:    { grade: 'DMB',    edition: '2017' },
  LSFO:   { grade: 'RMG380', edition: '2017', note: 'S ≤ 0.50% statutory limit applies' },
  HSFO:   { grade: 'RMG380', edition: '2017' },
  B24:    { grade: 'DFB',    edition: '2017', note: 'FAME blend — verify FAME content limit' },
}

export const ISO_EDITIONS: { value: IsoEdition; label: string }[] = [
  { value: '2017', label: 'ISO 8217:2017' },
  { value: '2010', label: 'ISO 8217:2010' },
  { value: '2005', label: 'ISO 8217:2005' },
]
