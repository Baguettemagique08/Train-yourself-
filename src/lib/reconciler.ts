// ============================================================================
// Reconciler engine — pure, deterministic analysis of bunker measurement data.
//
// Design principles:
//  • This is an OPERATIONS ANALYSIS aid, not a legal conclusion engine.
//  • Every output is derived from the structured measurement record. The
//    "likely causes" are produced by a fixed rule set with numeric templates —
//    there is no free-text generation, so output is reviewable and repeatable.
//  • Conservative by default: rules describe *patterns consistent with* a cause
//    and always carry the concrete signals that fired them.
// ============================================================================

import type { Measurement, MeasurementSource } from '@/types'

// ── Severity & thresholds ────────────────────────────────────────────────────

export type Severity = 'ok' | 'warning' | 'critical'

export interface VarianceThresholds {
  /** Quantity variance vs baseline, in percent. */
  quantityPctWarn: number
  quantityPctCrit: number
  /** Temperature spread across sources, in °C. */
  tempWarnC: number
  tempCritC: number
  /** Density spread across sources, in the density unit used by the data. */
  densityWarn: number
  densityCrit: number
  /** VCF spread across sources (dimensionless). */
  vcfWarn: number
  vcfCrit: number
  /** Timestamp spread across sources, in hours. */
  timestampWarnHrs: number
  timestampCritHrs: number
}

export const DEFAULT_THRESHOLDS: VarianceThresholds = {
  quantityPctWarn: 0.5,
  quantityPctCrit: 1.0,
  tempWarnC: 3,
  tempCritC: 6,
  densityWarn: 0.0010,
  densityCrit: 0.0030,
  vcfWarn: 0.0010,
  vcfCrit: 0.0030,
  timestampWarnHrs: 3,
  timestampCritHrs: 8,
}

/** Canonical column order. ROB-derived is appended separately when available. */
export const SOURCE_ORDER: MeasurementSource[] = ['vessel', 'barge', 'mfm', 'surveyor', 'manual']

export const SOURCE_LABELS: Record<MeasurementSource, string> = {
  vessel: 'Vessel',
  barge: 'Barge / BDN',
  mfm: 'MFM',
  surveyor: 'Surveyor',
  manual: 'Shore / Manual',
}

// ── Inputs that the analyst can supply on top of the raw measurements ─────────

export interface SourceAdjustment {
  /** Signed manual adjustment to quantity, in MT. */
  delta_mt: number
  /** Mandatory rationale shown alongside the adjustment. */
  reason: string
}

export interface RobReference {
  /** ROB (Remaining On Board) for this grade before the stem, in MT. */
  before_mt: number | null
  /** ROB after the stem, in MT. */
  after_mt: number | null
}

export interface ReconcilerInputs {
  thresholds: VarianceThresholds
  baseSource: MeasurementSource
  adjustments: Partial<Record<MeasurementSource, SourceAdjustment>>
  rob: RobReference
}

// ── Derived row models ───────────────────────────────────────────────────────

export interface QuantityRow {
  /** Unique key — a MeasurementSource or 'rob' for the derived row. */
  key: string
  label: string
  source?: MeasurementSource
  present: boolean
  /** True for the ROB-difference derived figure. */
  derived: boolean
  raw_qty: number | null
  adjustment: number
  adjustment_reason?: string
  adjusted_qty: number | null
  is_base: boolean
  delta_vs_base_mt: number | null
  delta_vs_base_pct: number | null
  severity: Severity
  timestamp: string | null
}

export interface QuantitySummary {
  base_label: string
  base_qty: number | null
  worst_severity: Severity
  /** Independent sources (excluding base) that fall below base beyond warn. */
  short_corroboration: number
  /** Net spread between highest and lowest adjusted figure, in MT. */
  spread_mt: number | null
}

export interface BasisAttr {
  key: 'temperature_c' | 'density_at_obs_kgm3' | 'density_at_15c_kgm3' | 'vcf' | 'observed_volume_m3' | 'trim_correction_m3' | 'timestamp_utc'
  label: string
  unit?: string
  kind: 'number' | 'datetime'
  decimals?: number
}

export const BASIS_ATTRS: BasisAttr[] = [
  { key: 'temperature_c', label: 'Temperature', unit: '°C', kind: 'number', decimals: 1 },
  { key: 'density_at_obs_kgm3', label: 'Density @ obs', unit: 't/m³', kind: 'number', decimals: 4 },
  { key: 'density_at_15c_kgm3', label: 'Density @ 15°C', unit: 't/m³', kind: 'number', decimals: 4 },
  { key: 'vcf', label: 'VCF', kind: 'number', decimals: 4 },
  { key: 'observed_volume_m3', label: 'Observed volume', unit: 'm³', kind: 'number', decimals: 2 },
  { key: 'trim_correction_m3', label: 'Trim/list corr.', unit: 'm³', kind: 'number', decimals: 2 },
  { key: 'timestamp_utc', label: 'Timestamp (UTC)', kind: 'datetime' },
]

export interface BasisCell {
  value: number | string | null
  missing: boolean
}

export interface BasisRow {
  attr: BasisAttr
  cells: Partial<Record<MeasurementSource, BasisCell>>
  spread_severity: Severity
  spread_note?: string
}

// ── Evidence gaps & likely causes ────────────────────────────────────────────

export interface EvidenceGap {
  id: string
  severity: Severity
  title: string
  detail: string
  recommended_evidence: string
}

export interface CauseSignal {
  label: string
  value: string
}

export interface LikelyCause {
  id: string
  title: string
  /** Fixed explanatory template — describes the mechanism, not a verdict. */
  basis: string
  category: 'measurement_basis' | 'instrument' | 'procedure' | 'quantity' | 'data_quality'
  indicator_strength: 'single' | 'multiple'
  signals: CauseSignal[]
}

export interface ReconcilerAnalysis {
  sources: Partial<Record<MeasurementSource, Measurement>>
  present_sources: MeasurementSource[]
  quantity_rows: QuantityRow[]
  summary: QuantitySummary
  basis_rows: BasisRow[]
  evidence_gaps: EvidenceGap[]
  likely_causes: LikelyCause[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function severityFromAbs(value: number, warn: number, crit: number): Severity {
  const a = Math.abs(value)
  if (a >= crit) return 'critical'
  if (a >= warn) return 'warning'
  return 'ok'
}

function worst(a: Severity, b: Severity): Severity {
  const rank: Record<Severity, number> = { ok: 0, warning: 1, critical: 2 }
  return rank[a] >= rank[b] ? a : b
}

/** Pick the most recently recorded measurement per source for the given grade. */
export function assembleSources(measurements: Measurement[]): Partial<Record<MeasurementSource, Measurement>> {
  const out: Partial<Record<MeasurementSource, Measurement>> = {}
  for (const m of measurements) {
    const existing = out[m.source]
    if (!existing || new Date(m.timestamp_utc).getTime() > new Date(existing.timestamp_utc).getTime()) {
      out[m.source] = m
    }
  }
  return out
}

function num(v: number | null | undefined): number | null {
  return typeof v === 'number' && !Number.isNaN(v) ? v : null
}

// ── Quantity reconciliation ──────────────────────────────────────────────────

export function computeQuantityRows(
  sources: Partial<Record<MeasurementSource, Measurement>>,
  inputs: ReconcilerInputs,
): { rows: QuantityRow[]; summary: QuantitySummary } {
  const { adjustments, baseSource, thresholds, rob } = inputs

  const adjustedQty = (src: MeasurementSource): number | null => {
    const m = sources[src]
    if (!m) return null
    const adj = adjustments[src]?.delta_mt ?? 0
    return m.quantity_mt + adj
  }

  // Resolve the baseline — fall back to the first present source if the chosen
  // baseline isn't on file.
  const presentInOrder = SOURCE_ORDER.filter((s) => sources[s])
  const effectiveBase = sources[baseSource] ? baseSource : presentInOrder[0]
  const baseQty = effectiveBase ? adjustedQty(effectiveBase) : null

  const rows: QuantityRow[] = SOURCE_ORDER.map((src) => {
    const m = sources[src]
    const adj = adjustments[src]
    const raw = m ? m.quantity_mt : null
    const adjusted = adjustedQty(src)
    const isBase = src === effectiveBase
    let delta: number | null = null
    let pct: number | null = null
    let severity: Severity = 'ok'
    if (adjusted !== null && baseQty !== null && baseQty !== 0 && !isBase) {
      delta = adjusted - baseQty
      pct = (delta / baseQty) * 100
      severity = severityFromAbs(pct, thresholds.quantityPctWarn, thresholds.quantityPctCrit)
    }
    return {
      key: src,
      label: SOURCE_LABELS[src],
      source: src,
      present: !!m,
      derived: false,
      raw_qty: raw,
      adjustment: adj?.delta_mt ?? 0,
      adjustment_reason: adj?.reason,
      adjusted_qty: adjusted,
      is_base: isBase,
      delta_vs_base_mt: delta,
      delta_vs_base_pct: pct,
      severity,
      timestamp: m?.timestamp_utc ?? null,
    }
  })

  // ROB-by-difference derived row (Vessel net = ROB after − ROB before).
  if (rob.before_mt !== null && rob.after_mt !== null) {
    const robQty = rob.after_mt - rob.before_mt
    let delta: number | null = null
    let pct: number | null = null
    let severity: Severity = 'ok'
    if (baseQty !== null && baseQty !== 0) {
      delta = robQty - baseQty
      pct = (delta / baseQty) * 100
      severity = severityFromAbs(pct, thresholds.quantityPctWarn, thresholds.quantityPctCrit)
    }
    rows.push({
      key: 'rob',
      label: 'Vessel (ROB difference)',
      present: true,
      derived: true,
      raw_qty: robQty,
      adjustment: 0,
      adjusted_qty: robQty,
      is_base: false,
      delta_vs_base_mt: delta,
      delta_vs_base_pct: pct,
      severity,
      timestamp: null,
    })
  }

  // Summary.
  const present = rows.filter((r) => r.adjusted_qty !== null)
  const qtys = present.map((r) => r.adjusted_qty as number)
  const spread = qtys.length >= 2 ? Math.max(...qtys) - Math.min(...qtys) : null
  const shortCorroboration = rows.filter(
    (r) => !r.is_base && r.delta_vs_base_pct !== null && r.delta_vs_base_pct <= -thresholds.quantityPctWarn,
  ).length
  const worstSeverity = rows.reduce<Severity>((acc, r) => worst(acc, r.severity), 'ok')

  return {
    rows,
    summary: {
      base_label: effectiveBase ? SOURCE_LABELS[effectiveBase] : '—',
      base_qty: baseQty,
      worst_severity: worstSeverity,
      short_corroboration: shortCorroboration,
      spread_mt: spread,
    },
  }
}

// ── Measurement-basis matrix (temperature / density / VCF / timing) ───────────

export function computeBasisRows(
  sources: Partial<Record<MeasurementSource, Measurement>>,
  thresholds: VarianceThresholds,
): BasisRow[] {
  const present = SOURCE_ORDER.filter((s) => sources[s])

  return BASIS_ATTRS.map((attr) => {
    const cells: Partial<Record<MeasurementSource, BasisCell>> = {}
    const numericValues: number[] = []
    const times: number[] = []

    for (const src of present) {
      const m = sources[src]!
      const raw = m[attr.key as keyof Measurement] as number | string | undefined
      const missing = raw === undefined || raw === null
      cells[src] = { value: missing ? null : (raw as number | string), missing }
      if (!missing) {
        if (attr.kind === 'number') numericValues.push(raw as number)
        else times.push(new Date(raw as string).getTime())
      }
    }

    let spread: Severity = 'ok'
    let note: string | undefined

    if (attr.kind === 'number' && numericValues.length >= 2) {
      const range = Math.max(...numericValues) - Math.min(...numericValues)
      if (attr.key === 'temperature_c') {
        spread = severityFromAbs(range, thresholds.tempWarnC, thresholds.tempCritC)
        if (spread !== 'ok') note = `${range.toFixed(1)} °C spread across sources`
      } else if (attr.key === 'density_at_obs_kgm3' || attr.key === 'density_at_15c_kgm3') {
        spread = severityFromAbs(range, thresholds.densityWarn, thresholds.densityCrit)
        if (spread !== 'ok') note = `${range.toFixed(4)} t/m³ spread across sources`
      } else if (attr.key === 'vcf') {
        spread = severityFromAbs(range, thresholds.vcfWarn, thresholds.vcfCrit)
        if (spread !== 'ok') note = `${range.toFixed(4)} VCF spread across sources`
      }
    } else if (attr.kind === 'datetime' && times.length >= 2) {
      const rangeHrs = (Math.max(...times) - Math.min(...times)) / 36e5
      spread = severityFromAbs(rangeHrs, thresholds.timestampWarnHrs, thresholds.timestampCritHrs)
      if (spread !== 'ok') note = `${rangeHrs.toFixed(1)} h between earliest and latest reading`
    }

    return { attr, cells, spread_severity: spread, spread_note: note }
  })
}

// ── Evidence-gap finder ──────────────────────────────────────────────────────

export function findEvidenceGaps(
  sources: Partial<Record<MeasurementSource, Measurement>>,
  basisRows: BasisRow[],
): EvidenceGap[] {
  const gaps: EvidenceGap[] = []
  const present = SOURCE_ORDER.filter((s) => sources[s])

  // Missing primary sources.
  if (!sources.barge) {
    gaps.push({
      id: 'missing-barge',
      severity: 'critical',
      title: 'No barge / BDN figure on file',
      detail: 'The supplier (BDN) quantity is the conventional reconciliation baseline and is not present.',
      recommended_evidence: 'Obtain the Bunker Delivery Note and barge departure/arrival ullage report.',
    })
  }
  if (!sources.vessel) {
    gaps.push({
      id: 'missing-vessel',
      severity: 'critical',
      title: 'No vessel figure on file',
      detail: 'Vessel-received quantity (tank soundings/ROB difference) is required to assess any short/over delivery.',
      recommended_evidence: 'Obtain the vessel’s before/after sounding tables signed by the Chief Engineer.',
    })
  }
  if (!sources.mfm) {
    gaps.push({
      id: 'missing-mfm',
      severity: 'warning',
      title: 'No MFM totaliser figure',
      detail: 'A mass flow meter reading provides an independent third measurement where fitted to the barge.',
      recommended_evidence: 'Request the MFM ticket with start/stop totals and the meter calibration certificate.',
    })
  }
  if (!sources.surveyor && !sources.manual) {
    gaps.push({
      id: 'missing-independent',
      severity: 'warning',
      title: 'No independent surveyor / shore figure',
      detail: 'No third-party or shore-tank measurement is on file to corroborate the vessel and barge figures.',
      recommended_evidence: 'Appoint a joint bunker survey or obtain shore-tank before/after gauging.',
    })
  }

  // Single-source corroboration.
  if (present.length <= 1) {
    gaps.push({
      id: 'single-source',
      severity: 'critical',
      title: 'Single-source measurement',
      detail: 'Only one measurement source is available; variance cannot be cross-checked.',
      recommended_evidence: 'Secure at least one independent measurement before drawing any conclusion.',
    })
  }

  // Per-source basis completeness.
  for (const src of present) {
    const m = sources[src]!
    const missingBasis: string[] = []
    if (num(m.temperature_c) === null) missingBasis.push('temperature')
    if (num(m.density_at_obs_kgm3) === null && num(m.density_at_15c_kgm3) === null) missingBasis.push('density')
    if (num(m.temperature_c) !== null && num(m.vcf) === null) missingBasis.push('VCF')
    if (missingBasis.length > 0 && (src === 'vessel' || src === 'barge' || src === 'mfm')) {
      gaps.push({
        id: `basis-${src}`,
        severity: 'warning',
        title: `Incomplete measurement basis — ${SOURCE_LABELS[src]}`,
        detail: `Missing ${missingBasis.join(', ')}. Volume-to-mass conversion cannot be independently re-derived.`,
        recommended_evidence: `Obtain the full ${SOURCE_LABELS[src]} measurement worksheet (temperature, density, VCF).`,
      })
    }
  }

  // Trim/list correction on vessel soundings.
  if (sources.vessel && num(sources.vessel.trim_correction_m3) === null) {
    gaps.push({
      id: 'vessel-trim',
      severity: 'warning',
      title: 'Vessel soundings: trim/list correction not evidenced',
      detail: 'Uncorrected soundings on a trimmed/listed vessel can materially bias the quantity.',
      recommended_evidence: 'Confirm trim/list at gauging and that correction tables were applied.',
    })
  }

  // MFM calibration evidence (heuristic on the notes field).
  if (sources.mfm) {
    const notes = (sources.mfm.notes ?? '').toLowerCase()
    if (!notes.includes('calibrat')) {
      gaps.push({
        id: 'mfm-calibration',
        severity: 'warning',
        title: 'MFM calibration not evidenced',
        detail: 'No calibration reference recorded against the MFM reading.',
        recommended_evidence: 'Attach the current MFM calibration certificate and zero-verification record.',
      })
    }
  }

  // Timing spread surfaced by the basis matrix.
  const tsRow = basisRows.find((r) => r.attr.key === 'timestamp_utc')
  if (tsRow && tsRow.spread_severity !== 'ok') {
    gaps.push({
      id: 'timing-spread',
      severity: tsRow.spread_severity,
      title: 'Measurements taken at materially different times',
      detail: tsRow.spread_note ?? 'Readings are separated in time and may reflect different measurement points.',
      recommended_evidence: 'Reconcile the timeline of each reading against the Statement of Facts / pumping log.',
    })
  }

  return gaps
}

// ── Likely-cause rule engine ─────────────────────────────────────────────────
// Each rule is a small, named function over the structured data. Triggered
// rules return a LikelyCause carrying the exact signals that fired them. No
// rule asserts a conclusion — titles describe patterns "consistent with" a cause.

export function evaluateLikelyCauses(
  sources: Partial<Record<MeasurementSource, Measurement>>,
  quantityRows: QuantityRow[],
  summary: QuantitySummary,
  thresholds: VarianceThresholds,
): LikelyCause[] {
  const causes: LikelyCause[] = []
  const vessel = sources.vessel
  const barge = sources.barge
  const mfm = sources.mfm
  const fmt = (n: number, d = 2) => n.toFixed(d)

  // Rule 1 — multiple independent sources below the BDN baseline.
  if (summary.short_corroboration >= 2) {
    const below = quantityRows.filter(
      (r) => !r.is_base && r.delta_vs_base_pct !== null && r.delta_vs_base_pct <= -thresholds.quantityPctWarn,
    )
    causes.push({
      id: 'corroborated-short',
      title: 'Multiple independent figures fall below the BDN quantity',
      basis: 'Two or more sources measured below the supplier (BDN) figure beyond the warning threshold. Independent corroboration reduces the likelihood of a single-source measurement error.',
      category: 'quantity',
      indicator_strength: 'multiple',
      signals: below.map((r) => ({
        label: r.label,
        value: `${fmt(r.adjusted_qty as number, 1)} MT vs base ${fmt(summary.base_qty as number, 1)} MT (${fmt(r.delta_vs_base_pct as number, 2)}%)`,
      })),
    })
  }

  // Rule 2 — temperature / VCF basis difference between barge and vessel.
  if (vessel && barge && num(vessel.temperature_c) !== null && num(barge.temperature_c) !== null) {
    const dTemp = (barge.temperature_c as number) - (vessel.temperature_c as number)
    if (Math.abs(dTemp) >= thresholds.tempWarnC) {
      const signals: CauseSignal[] = [
        { label: 'Barge temperature', value: `${fmt(barge.temperature_c as number, 1)} °C` },
        { label: 'Vessel temperature', value: `${fmt(vessel.temperature_c as number, 1)} °C` },
        { label: 'Difference', value: `${fmt(dTemp, 1)} °C` },
      ]
      if (num(barge.vcf) !== null) signals.push({ label: 'Barge VCF', value: fmt(barge.vcf as number, 4) })
      if (num(vessel.vcf) !== null) signals.push({ label: 'Vessel VCF', value: fmt(vessel.vcf as number, 4) })
      causes.push({
        id: 'temp-basis',
        title: 'Temperature / VCF basis difference between barge and vessel',
        basis: 'The two sources measured at different temperatures. Because mass is derived from observed volume via temperature and VCF, a temperature basis difference can shift the apparent quantity even when the same parcel is measured.',
        category: 'measurement_basis',
        indicator_strength: 'single',
        signals,
      })
    }
  }

  // Rule 3 — MFM divergence from barge soundings.
  if (mfm && barge && barge.quantity_mt !== 0) {
    const pct = ((mfm.quantity_mt - barge.quantity_mt) / barge.quantity_mt) * 100
    if (Math.abs(pct) >= thresholds.quantityPctWarn) {
      const notes = (mfm.notes ?? '').toLowerCase()
      const signals: CauseSignal[] = [
        { label: 'MFM reading', value: `${fmt(mfm.quantity_mt, 1)} MT` },
        { label: 'Barge soundings', value: `${fmt(barge.quantity_mt, 1)} MT` },
        { label: 'Divergence', value: `${fmt(pct, 2)}%` },
      ]
      if (!notes.includes('calibrat')) signals.push({ label: 'Calibration reference', value: 'not recorded' })
      causes.push({
        id: 'mfm-divergence',
        title: pct < 0
          ? 'MFM reads below barge soundings — consider meter calibration / aeration'
          : 'MFM reads above barge soundings — consider meter calibration / sounding error',
        basis: 'Mass flow meter and barge sounding figures diverge beyond tolerance. Mass-flow divergence is commonly associated with meter calibration/zero drift, entrained air (aeration), or sounding/temperature errors. Direction alone is not conclusive.',
        category: 'instrument',
        indicator_strength: 'single',
        signals,
      })
    }
  }

  // Rule 4 — vessel soundings possibly not trim/list corrected.
  if (vessel && barge) {
    const vesselShort = vessel.quantity_mt < barge.quantity_mt
    if (vesselShort && num(vessel.trim_correction_m3) === null) {
      causes.push({
        id: 'trim-uncorrected',
        title: 'Vessel soundings may not be trim/list corrected',
        basis: 'The vessel figure is below the barge figure and no trim/list correction is recorded. Uncorrected soundings on a trimmed or listed vessel can understate received quantity.',
        category: 'procedure',
        indicator_strength: 'single',
        signals: [
          { label: 'Vessel', value: `${fmt(vessel.quantity_mt, 1)} MT` },
          { label: 'Barge', value: `${fmt(barge.quantity_mt, 1)} MT` },
          { label: 'Trim/list correction', value: 'not recorded' },
        ],
      })
    }
  }

  // Rule 5 — density basis discrepancy (barge vs vessel, observed density).
  if (vessel && barge && num(vessel.density_at_obs_kgm3) !== null && num(barge.density_at_obs_kgm3) !== null) {
    const dDen = Math.abs((barge.density_at_obs_kgm3 as number) - (vessel.density_at_obs_kgm3 as number))
    if (dDen >= thresholds.densityWarn) {
      causes.push({
        id: 'density-basis',
        title: 'Density basis differs between barge and vessel',
        basis: 'The observed densities used to convert volume to mass differ beyond tolerance. A density basis difference propagates directly into the mass figure.',
        category: 'measurement_basis',
        indicator_strength: 'single',
        signals: [
          { label: 'Barge density', value: `${fmt(barge.density_at_obs_kgm3 as number, 4)} t/m³` },
          { label: 'Vessel density', value: `${fmt(vessel.density_at_obs_kgm3 as number, 4)} t/m³` },
          { label: 'Difference', value: fmt(dDen, 4) },
        ],
      })
    }
  }

  return causes
}

// ── Top-level orchestration ──────────────────────────────────────────────────

export function runReconciliation(
  measurements: Measurement[],
  inputs: ReconcilerInputs,
): ReconcilerAnalysis {
  const sources = assembleSources(measurements)
  const present_sources = SOURCE_ORDER.filter((s) => sources[s])
  const { rows, summary } = computeQuantityRows(sources, inputs)
  const basis_rows = computeBasisRows(sources, inputs.thresholds)
  const evidence_gaps = findEvidenceGaps(sources, basis_rows)
  const likely_causes = evaluateLikelyCauses(sources, rows, summary, inputs.thresholds)

  return {
    sources,
    present_sources,
    quantity_rows: rows,
    summary,
    basis_rows,
    evidence_gaps,
    likely_causes,
  }
}
