import { mockVessels, mockPorts } from '@/data/mockData'
import {
  DEFAULT_WEIGHTS, computeOverall, deriveStatus,
  type CategoryAssessment, type ReadinessCategoryKey, type ReadinessActionItem,
  type VesselFuelReadiness, type PortFuelCapability,
} from '@/lib/fuelReadiness'
import type { FuelType } from '@/types'

// ── builders ──────────────────────────────────────────────────────────────────

function cat(
  prefix: string,
  key: ReadinessCategoryKey,
  crit: [string, boolean][],
  opts?: { manual?: number; notes?: string },
): CategoryAssessment {
  return {
    category: key,
    weight: DEFAULT_WEIGHTS[key],
    criteria: crit.map(([label, met], i) => ({ id: `${prefix}-${key}-${i}`, label, met })),
    manual_score: opts?.manual,
    notes: opts?.notes,
  }
}

interface BuildInput {
  id: string
  vesselId: string
  fuel: FuelType
  ports: string[]
  categories: CategoryAssessment[]
  actions: ReadinessActionItem[]
  target_date?: string
  next_review_date?: string
  certifying_body?: string
  certificate_ref?: string
  assessed_by?: string
  notes?: string
  updated_at: string
}

function build(i: BuildInput): VesselFuelReadiness {
  const { score } = computeOverall(i.categories)
  const status = deriveStatus(score, !!i.certificate_ref)
  const vessel = mockVessels.find((v) => v.id === i.vesselId)
  return {
    id: i.id,
    vessel_id: i.vesselId,
    vessel,
    fuel_type: i.fuel,
    status,
    readiness_score: score,
    categories: i.categories,
    actions: i.actions,
    primary_port_ids: i.ports,
    target_date: i.target_date,
    next_review_date: i.next_review_date,
    certifying_body: i.certifying_body,
    certificate_ref: i.certificate_ref,
    assessed_by: i.assessed_by,
    notes: i.notes,
    created_at: '2026-01-15T08:00:00Z',
    updated_at: i.updated_at,
  }
}

const act = (
  id: string, title: string, category: ReadinessCategoryKey,
  status: ReadinessActionItem['status'], priority: ReadinessActionItem['priority'],
  owner?: string, due_date?: string,
): ReadinessActionItem => ({ id, title, category, status, priority, owner, due_date })

// ── Vessel × fuel programmes ────────────────────────────────────────────────────

export const mockVesselReadiness: VesselFuelReadiness[] = [
  // v1 Nordic Star — Methanol (mid conversion)
  build({
    id: 'fr-v1-methanol', vesselId: 'v1', fuel: 'Methanol', ports: ['p1', 'p2'],
    target_date: '2026-12-01', next_review_date: '2026-07-15',
    certifying_body: 'ABS', assessed_by: 'Olivia Le Blond',
    notes: 'Conversion project underway. Flag-state approval is the critical-path item.',
    updated_at: '2026-06-10T10:00:00Z',
    categories: [
      cat('m1', 'documentation', [['IGF Code design assessment (ABS)', true], ['Flag-state (Marshall Is.) approval', false], ['Updated SMS procedures', false]]),
      cat('m1', 'supplier_access', [['Methanol supply agreement — Rotterdam', true], ['Methanol supply agreement — Singapore', false]]),
      cat('m1', 'tank_system', [['Fuel containment survey', true], ['Piping & double-wall verification', true], ['Inert gas / safety systems', false]]),
      cat('m1', 'crew_readiness', [['Officers methanol training', true], ['Ratings familiarisation', false], ['Emergency drills logged', false]]),
      cat('m1', 'port_capability', [['Primary port bunkering confirmed', true], ['STS procedure agreed', false]]),
      cat('m1', 'sampling_testing', [['Representative sampling procedure', false], ['Retained-sample locker', true]]),
      cat('m1', 'reporting_compliance', [['FuelEU data capture configured', false], ['MRV reporting mapped', true]]),
    ],
    actions: [
      act('a1', 'Submit flag-state approval dossier', 'documentation', 'in_progress', 'high', 'R. Mehta', '2026-09-30'),
      act('a2', 'Finalise Singapore methanol supply MoU', 'supplier_access', 'open', 'normal', 'Ops Desk', '2026-10-01'),
      act('a3', 'Complete inert gas system commissioning', 'tank_system', 'open', 'high', 'Tech Mgr', '2026-08-15'),
      act('a4', 'Schedule full-crew emergency drill', 'crew_readiness', 'open', 'normal', 'Master', '2026-08-01'),
    ],
  }),

  // v1 Nordic Star — B24 (further along)
  build({
    id: 'fr-v1-b24', vesselId: 'v1', fuel: 'B24', ports: ['p1'],
    target_date: '2026-08-15', next_review_date: '2026-06-25',
    certifying_body: 'ABS', assessed_by: 'Olivia Le Blond',
    notes: 'Drop-in blend; minimal system changes. Awaiting SMS sign-off.',
    updated_at: '2026-06-09T09:00:00Z',
    categories: [
      cat('b1', 'documentation', [['Engine maker compatibility letter', true], ['SMS biofuel handling update', false]]),
      cat('b1', 'supplier_access', [['ISCC-certified supplier (Rotterdam)', true]]),
      cat('b1', 'tank_system', [['Seal / elastomer compatibility check', true], ['Fuel system inspection', true]]),
      cat('b1', 'crew_readiness', [['Crew briefing on blend handling', true]]),
      cat('b1', 'port_capability', [['Rotterdam B24 availability', true]]),
      cat('b1', 'sampling_testing', [['FAME content testing arranged', true]]),
      cat('b1', 'reporting_compliance', [['FuelEU GHG intensity verified', true], ['Reporting workflow updated', false]]),
    ],
    actions: [
      act('a5', 'Obtain SMS biofuel sign-off', 'documentation', 'in_progress', 'normal', 'DPA', '2026-07-01'),
      act('a6', 'Update reporting workflow for blend', 'reporting_compliance', 'open', 'low', 'Compliance', '2026-07-10'),
    ],
  }),

  // v2 Pacific Horizon — B24 (ready)
  build({
    id: 'fr-v2-b24', vesselId: 'v2', fuel: 'B24', ports: ['p2', 'p3'],
    target_date: '2026-07-15', next_review_date: '2026-09-01',
    certifying_body: 'DNV', assessed_by: 'Sofia Marchetti',
    notes: 'Ready pending first stem. SMS update complete.',
    updated_at: '2026-06-08T14:00:00Z',
    categories: [
      cat('b2', 'documentation', [['MAN B&W compatibility letter', true], ['SMS updated', true]]),
      cat('b2', 'supplier_access', [['ISCC supplier qualified', true], ['Backup supplier identified', true]]),
      cat('b2', 'tank_system', [['Fuel system inspection', true], ['Storage stability assessment', true]]),
      cat('b2', 'crew_readiness', [['Crew trained', true], ['Procedures briefed', true]]),
      cat('b2', 'port_capability', [['Singapore availability', true], ['Fujairah availability', false]]),
      cat('b2', 'sampling_testing', [['Sampling procedure in place', true]]),
      cat('b2', 'reporting_compliance', [['FuelEU verified', true], ['MRV mapped', true]]),
    ],
    actions: [
      act('a7', 'Confirm Fujairah B24 supply line', 'port_capability', 'open', 'normal', 'Ops Desk', '2026-07-05'),
    ],
  }),

  // v2 Pacific Horizon — LNG (transitional, early planning)
  build({
    id: 'fr-v2-lng', vesselId: 'v2', fuel: 'LNG', ports: ['p2'],
    target_date: '2027-06-01', next_review_date: '2026-08-30',
    assessed_by: 'Sofia Marchetti',
    notes: 'Transitional option under evaluation; no retrofit committed.',
    updated_at: '2026-05-20T11:00:00Z',
    categories: [
      cat('l2', 'documentation', [['Feasibility study', true], ['Class notation enquiry', false]]),
      cat('l2', 'supplier_access', [['LNG supplier mapping', true]]),
      cat('l2', 'tank_system', [['Retrofit scoping', false], ['Cryogenic tank space study', false]]),
      cat('l2', 'crew_readiness', [['LNG awareness training plan', false]]),
      cat('l2', 'port_capability', [['Singapore LNG bunkering', true]]),
      cat('l2', 'sampling_testing', [['Custody-transfer metering review', false]]),
      cat('l2', 'reporting_compliance', [['Methane-slip reporting approach', false]]),
    ],
    actions: [
      act('a8', 'Commission LNG retrofit feasibility', 'tank_system', 'open', 'normal', 'Newbuild Team', '2026-11-01'),
      act('a9', 'Request class notation guidance', 'documentation', 'open', 'low', 'Tech Mgr', '2026-09-15'),
    ],
  }),

  // v3 Atlantic Carrier — Ammonia (early, deferred)
  build({
    id: 'fr-v3-ammonia', vesselId: 'v3', fuel: 'Ammonia', ports: ['p3'],
    target_date: '2028-01-01', next_review_date: '2026-06-20',
    assessed_by: 'Rajan Mehta',
    notes: 'Deferred pending regulatory clarity on SOLAS ammonia provisions.',
    updated_at: '2026-05-01T08:00:00Z',
    categories: [
      cat('n3', 'documentation', [['Feasibility study', false], ['Ammonia-ready notation application', false]]),
      cat('n3', 'supplier_access', [['Ammonia supplier survey', false]]),
      cat('n3', 'tank_system', [['Toxic-gas containment study', false], ['Material compatibility review', false]]),
      cat('n3', 'crew_readiness', [['Toxic-gas handling training plan', false]]),
      cat('n3', 'port_capability', [['Fujairah ammonia infrastructure survey', false]]),
      cat('n3', 'sampling_testing', [['Sampling under toxic regime', false]]),
      cat('n3', 'reporting_compliance', [['GHG well-to-wake approach', false]]),
    ],
    actions: [
      act('a10', 'Commission ammonia feasibility study', 'documentation', 'blocked', 'low', 'Strategy', '2027-01-01'),
      act('a11', 'Monitor IMO MSC ammonia guidelines', 'reporting_compliance', 'open', 'low', 'Compliance'),
    ],
  }),

  // v4 Global Trader — B24 (certified)
  build({
    id: 'fr-v4-b24', vesselId: 'v4', fuel: 'B24', ports: ['p1', 'p2'],
    target_date: '2025-10-01', next_review_date: '2026-10-15',
    certifying_body: 'DNV', certificate_ref: 'DNV-BF-2025-7721', assessed_by: 'Olivia Le Blond',
    notes: 'Fully certified. First B24 delivery completed Singapore Oct 2025.',
    updated_at: '2025-10-15T10:00:00Z',
    categories: [
      cat('b4', 'documentation', [['Wärtsilä compatibility', true], ['DNV biofuel-ready certificate', true], ['SMS updated', true]]),
      cat('b4', 'supplier_access', [['ISCC supplier qualified', true], ['Secondary supplier', true]]),
      cat('b4', 'tank_system', [['Fuel system verified', true], ['Stability assessment', true]]),
      cat('b4', 'crew_readiness', [['Crew trained', true], ['Drills logged', true]]),
      cat('b4', 'port_capability', [['Rotterdam availability', true], ['Singapore availability', true]]),
      cat('b4', 'sampling_testing', [['Sampling & retention in place', true]]),
      cat('b4', 'reporting_compliance', [['FuelEU verified', true], ['MRV reporting live', true]]),
    ],
    actions: [
      act('a12', 'Annual recertification review', 'documentation', 'open', 'normal', 'Compliance', '2026-10-01'),
    ],
  }),

  // v4 Global Trader — Methanol (early scoping)
  build({
    id: 'fr-v4-methanol', vesselId: 'v4', fuel: 'Methanol', ports: ['p1'],
    target_date: '2027-09-01', next_review_date: '2026-09-10',
    assessed_by: 'Olivia Le Blond',
    notes: 'Scoping only; feeder profile may favour methanol on EU routes.',
    updated_at: '2026-05-28T09:00:00Z',
    categories: [
      cat('m4', 'documentation', [['Conversion concept study', true], ['Class pre-approval', false]]),
      cat('m4', 'supplier_access', [['Rotterdam methanol availability', true]]),
      cat('m4', 'tank_system', [['Tank conversion scoping', false], ['Safety system concept', false]]),
      cat('m4', 'crew_readiness', [['Training roadmap drafted', false]]),
      cat('m4', 'port_capability', [['Rotterdam methanol bunkering', true]]),
      cat('m4', 'sampling_testing', [['Sampling procedure draft', false]]),
      cat('m4', 'reporting_compliance', [['FuelEU modelling', false]]),
    ],
    actions: [
      act('a13', 'Commission conversion concept design', 'tank_system', 'open', 'normal', 'Newbuild Team', '2026-12-01'),
    ],
  }),
]

// ── Port capability ─────────────────────────────────────────────────────────────

const port = (id: string) => mockPorts.find((p) => p.id === id)
const pc = (
  id: string, port_id: string, fuel: FuelType, status: PortFuelCapability['status'],
  method?: string, suppliers?: string[], earliest?: string, notes?: string,
): PortFuelCapability => ({ id, port_id, port: port(port_id), fuel_type: fuel, status, bunkering_method: method, suppliers, earliest_date: earliest, notes })

export const mockPortCapabilities: PortFuelCapability[] = [
  pc('pc1', 'p1', 'Methanol', 'available', 'Ship-to-ship', ['OCI / Methanol Institute partners'], undefined, 'Established green-methanol bunkering.'),
  pc('pc2', 'p1', 'B24', 'available', 'Barge', ['GoodFuels', 'FincoEnergies']),
  pc('pc3', 'p1', 'LNG', 'available', 'Ship-to-ship', ['Titan', 'Shell']),
  pc('pc4', 'p1', 'Ammonia', 'planned', 'STS (pilot)', undefined, '2027-01-01', 'Pilot scheme announced.'),
  pc('pc5', 'p2', 'B24', 'available', 'Barge', ['TFG Marine', 'Chemoil']),
  pc('pc6', 'p2', 'LNG', 'available', 'Ship-to-ship', ['FueLNG']),
  pc('pc7', 'p2', 'Methanol', 'planned', 'STS', undefined, '2026-12-01', 'First commercial stems expected late 2026.'),
  pc('pc8', 'p2', 'Ammonia', 'planned', 'Pilot', undefined, '2027-06-01'),
  pc('pc9', 'p3', 'B24', 'planned', 'Barge', undefined, '2026-09-01'),
  pc('pc10', 'p3', 'Methanol', 'unavailable'),
  pc('pc11', 'p3', 'Ammonia', 'unavailable'),
  pc('pc12', 'p3', 'LNG', 'planned', 'Truck-to-ship', undefined, '2026-10-01'),
]
