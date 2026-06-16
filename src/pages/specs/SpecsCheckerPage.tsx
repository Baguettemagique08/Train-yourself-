import { useState, useCallback, useRef } from 'react'
import {
  CheckCircle, AlertTriangle, XCircle, Plus, Download, Save,
  BookOpen, ChevronDown, UploadCloud, FileText, X, FlaskConical, Loader2,
} from 'lucide-react'
import { mockCases, mockSpecsChecks } from '@/data/mockData'
import { cn, formatDate, specStatusColor, specStatusLabel } from '@/lib/utils'
import {
  ISO_EDITIONS, MARKET_TO_ISO_GRADE,
  getIsoEditionGrades, getIsoSpec,
  type IsoEdition, type IsoParamSpec,
} from '@/lib/iso8217'
import type { SpecStatus } from '@/types'

// MARPOL Annex VI sulphur limits (mass fraction, %)
const MARPOL_SULPHUR: Record<string, { global: number; eca: number }> = {
  VLSFO: { global: 0.50, eca: 0.10 },
  ULSFO: { global: 0.50, eca: 0.10 },
  LSMGO: { global: 0.50, eca: 0.10 },
  MGO: { global: 0.50, eca: 0.10 },
  HSFO: { global: 0.50, eca: 0.10 },
  B24: { global: 0.50, eca: 0.10 },
  B100: { global: 0.50, eca: 0.10 },
  HVO: { global: 0.50, eca: 0.10 },
  Biofuel: { global: 0.50, eca: 0.10 },
}

// ── CCAI calculation ───────────────────────────────────────────────────────────
function calcCCAI(density: number | null, viscosity50: number | null): number | null {
  if (!density || !viscosity50 || viscosity50 <= 0) return null
  const inner = Math.log10(viscosity50 + 0.85)
  if (inner <= 0) return null
  return density - 141 * Math.log10(inner) - 80.6
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface SpecRow {
  id: string
  parameter: string
  unit: string
  bdnValue: string
  contractMin: string
  contractMax: string
  labResult: string
  isCalculated?: boolean
}

function computeVariance(labResult: string, contractMin: string, contractMax: string): number | null {
  const lab = parseFloat(labResult)
  if (isNaN(lab)) return null
  const max = parseFloat(contractMax)
  const min = parseFloat(contractMin)
  if (!isNaN(max)) return lab - max
  if (!isNaN(min)) return lab - min
  return null
}

function computeStatus(labResult: string, contractMin: string, contractMax: string): SpecStatus {
  const lab = parseFloat(labResult)
  if (isNaN(lab)) return 'not_tested'
  const max = parseFloat(contractMax)
  const min = parseFloat(contractMin)
  if (!isNaN(max) && lab > max) return 'off_spec'
  if (!isNaN(min) && lab < min) return 'off_spec'
  if (!isNaN(max) && lab > max * 0.98) return 'warning'
  if (!isNaN(min) && lab < min * 1.02) return 'warning'
  return 'ok'
}

// ── Extraction simulation ──────────────────────────────────────────────────────

function hashString(str: string): number {
  let h = 0x811c9dc5 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

function seededRandom(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function precisionForParam(name: string): number {
  if (name.includes('Density'))                  return 4
  if (name.includes('Viscosity'))                return 1
  if (name.includes('Sulphur'))                  return 3
  if (name.includes('Flash'))                    return 1
  if (name.includes('CCAI'))                     return 0
  if (name.includes('Aluminium'))                return 0
  if (name.includes('Sodium'))                   return 0
  if (name.includes('Vanadium'))                 return 0
  if (name.includes('Zinc'))                     return 0
  if (name.includes('Phosphorus'))               return 0
  if (name.includes('Calcium'))                  return 0
  if (name.includes('Water'))                    return 2
  if (name.includes('Ash'))                      return 3
  if (name.includes('Micro Carbon') || name.includes('MCR')) return 2
  if (name.includes('Total Sediment'))           return 3
  if (name.includes('Acid Number'))              return 2
  if (name.includes('Cetane'))                   return 0
  if (name.includes('Pour Point'))               return 0
  if (name.includes('Cloud Point'))              return 0
  if (name.includes('FAME'))                     return 1
  if (name.includes('Lubricity'))                return 0
  if (name.includes('Oxidation'))                return 1
  if (name.includes('Hydrogen Sulphide'))        return 2
  return 2
}

function simulateExtraction(filename: string, params: IsoParamSpec[]): Record<string, string> {
  const rng = seededRandom(hashString(filename))
  const results: Record<string, string> = {}

  for (const param of params) {
    // Skip non-numeric / informational entries
    if (param.min === undefined && param.max === undefined) continue
    if (param.note?.includes('Statutory') || param.note?.includes('Fail if') ||
        param.note?.includes('Not permitted') || param.note?.includes('FAME blend grade')) continue
    // Skip ULO composite criterion
    if (param.name.includes('Used Lube Oil')) continue

    const r = rng()
    const dp = precisionForParam(param.name)
    let value: number

    if (param.max !== undefined && param.min !== undefined) {
      // Viscosity or similar bounded range
      const range = param.max - param.min
      value = r < 0.12 ? param.max * 1.04 + rng() * range * 0.1
            : r < 0.22 ? param.max * 0.99 + rng() * param.max * 0.01
            : param.min + rng() * range * 0.92
    } else if (param.max !== undefined) {
      value = r < 0.15 ? param.max * (1.02 + rng() * 0.12)
            : r < 0.25 ? param.max * (0.984 + rng() * 0.012)
            : param.max * (0.30 + rng() * 0.65)
    } else if (param.min !== undefined) {
      value = r < 0.15 ? param.min * (0.84 + rng() * 0.13)
            : r < 0.25 ? param.min * (1.00 + rng() * 0.018)
            : param.min * (1.04 + rng() * 0.60)
    } else {
      continue
    }

    results[param.name] = value.toFixed(dp)
  }
  return results
}

// ── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: SpecStatus }) {
  if (status === 'ok') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
      <CheckCircle className="h-3 w-3" /> OK
    </span>
  )
  if (status === 'warning') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
      <AlertTriangle className="h-3 w-3" /> At Limit
    </span>
  )
  if (status === 'off_spec') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
      <XCircle className="h-3 w-3" /> Off-Spec
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
      Not Tested
    </span>
  )
}

function rowBgClass(status: SpecStatus): string {
  if (status === 'off_spec') return 'bg-red-50 dark:bg-red-900/10'
  if (status === 'warning') return 'bg-amber-50 dark:bg-amber-900/10'
  return ''
}

// ── Build rows from mock spec checks ──────────────────────────────────────────
function buildRows(caseId: string): SpecRow[] {
  const checks = mockSpecsChecks.filter((sc) => sc.case_id === caseId)
  if (checks.length === 0) {
    return [
      { id: 'sr-1', parameter: 'Density at 15°C',                 unit: 'kg/m³',   bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-2', parameter: 'Kinematic Viscosity at 50°C',     unit: 'cSt',     bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-3', parameter: 'Flash Point',                     unit: '°C',      bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-4', parameter: 'Sulphur Content',                 unit: '% m/m',   bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-5', parameter: 'Water Content',                   unit: '% v/v',   bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-6', parameter: 'Ash Content',                     unit: '% m/m',   bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-7', parameter: 'CCAI',                            unit: '',        bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
      { id: 'sr-8', parameter: 'Aluminium + Silicon',             unit: 'mg/kg',   bdnValue: '', contractMin: '', contractMax: '', labResult: '' },
    ]
  }
  return checks.map((sc) => ({
    id: sc.id,
    parameter: sc.parameter_name,
    unit: sc.unit,
    bdnValue: sc.bdn_value != null ? String(sc.bdn_value) : '',
    contractMin: sc.contract_min != null ? String(sc.contract_min) : '',
    contractMax: sc.contract_max != null ? String(sc.contract_max) : '',
    labResult: sc.lab_result != null ? String(sc.lab_result) : '',
  }))
}

let customRowCounter = 0

// ── Page ───────────────────────────────────────────────────────────────────────
export default function SpecsCheckerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedCaseId, setSelectedCaseId] = useState<string>(() =>
    mockCases.find((c) => c.id === 'c2')?.id ?? mockCases[0]?.id ?? ''
  )
  const [rows, setRows] = useState<SpecRow[]>(() => buildRows('c2'))
  const [labRef, setLabRef] = useState('BV-SG-2026-44821')
  const [cpRef, setCpRef] = useState('CP-PCH-2026-001')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [linkedToCase, setLinkedToCase] = useState(false)

  // ISO 8217 loader
  const [isoEdition, setIsoEdition] = useState<IsoEdition>('2017')
  const [isoGrade, setIsoGrade] = useState<string>('RMG380')
  const [isoExpanded, setIsoExpanded] = useState(false)

  // COQ / lab report upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisRun, setAnalysisRun] = useState(false)

  const selectedCase = mockCases.find((c) => c.id === selectedCaseId) ?? null

  const handleCaseChange = useCallback((caseId: string) => {
    setSelectedCaseId(caseId)
    setRows(buildRows(caseId))
    setSaved(false)
    setAnalysisRun(false)
    const c = mockCases.find((mc) => mc.id === caseId)
    if (c?.fuel_type) {
      const suggestion = MARKET_TO_ISO_GRADE[c.fuel_type.toUpperCase()] ?? MARKET_TO_ISO_GRADE[c.fuel_type]
      if (suggestion) { setIsoEdition(suggestion.edition); setIsoGrade(suggestion.grade) }
    }
  }, [])

  const updateRow = useCallback(
    (id: string, field: keyof Omit<SpecRow, 'id'>, value: string) => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
      setSaved(false)
    }, []
  )

  const addCustomRow = useCallback(() => {
    customRowCounter += 1
    setRows((prev) => [...prev, {
      id: `custom-${customRowCounter}`,
      parameter: 'Custom Parameter', unit: '',
      bdnValue: '', contractMin: '', contractMax: '', labResult: '',
    }])
  }, [])

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const applyIsoLimits = useCallback(() => {
    const spec = getIsoSpec(isoEdition, isoGrade)
    if (!spec) return
    let n = 0
    setRows(spec.params.map((param) => ({
      id: `iso-${isoEdition}-${isoGrade}-${++n}`,
      parameter: param.name,
      unit: param.unit,
      bdnValue: '',
      contractMin: param.min != null ? String(param.min) : '',
      contractMax: param.max != null ? String(param.max) : '',
      labResult: '',
    })))
    setSaved(false)
    setAnalysisRun(false)
  }, [isoEdition, isoGrade])

  const runAnalysis = useCallback(() => {
    if (!uploadedFile || analyzing) return
    const spec = getIsoSpec(isoEdition, isoGrade)
    if (!spec) return
    setAnalyzing(true)
    setTimeout(() => {
      const extracted = simulateExtraction(uploadedFile.name, spec.params)
      let n = 0
      const newRows: SpecRow[] = spec.params.map((param) => ({
        id: `coq-${isoEdition}-${isoGrade}-${++n}`,
        parameter: param.name,
        unit: param.unit,
        bdnValue: '',
        contractMin: param.min != null ? String(param.min) : '',
        contractMax: param.max != null ? String(param.max) : '',
        labResult: extracted[param.name] ?? '',
      }))

      // Auto-compute CCAI from density@15°C and kinematic viscosity@50°C
      const densityRow = newRows.find((r) =>
        r.parameter.toLowerCase().includes('density') && r.labResult !== '',
      )
      const viscosityRow = newRows.find((r) =>
        (r.parameter.toLowerCase().includes('viscosity') || r.parameter.toLowerCase().includes('kinematic')) &&
        r.labResult !== '',
      )
      const ccaiRow = newRows.find((r) => r.parameter.toLowerCase().includes('ccai'))
      if (densityRow && viscosityRow && ccaiRow && ccaiRow.labResult === '') {
        const computedCCAI = calcCCAI(parseFloat(densityRow.labResult), parseFloat(viscosityRow.labResult))
        if (computedCCAI !== null) {
          ccaiRow.labResult = computedCCAI.toFixed(0)
          ccaiRow.isCalculated = true
        }
      }

      setRows(newRows)
      setLabRef(uploadedFile.name.replace(/\.[^.]+$/, ''))
      setAnalysisRun(true)
      setAnalyzing(false)
      setSaved(false)
    }, 1500)
  }, [uploadedFile, analyzing, isoEdition, isoGrade])

  const handleFileDrop = useCallback((f: File | null) => {
    setUploadedFile(f)
    setAnalysisRun(false)
  }, [])

  // ── Summary ─────────────────────────────────────────────────────────────────
  const statusCounts = rows.reduce((acc, r) => {
    const s = computeStatus(r.labResult, r.contractMin, r.contractMax)
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  }, {} as Record<SpecStatus, number>)

  const offSpecCount = statusCounts['off_spec'] ?? 0
  const warningCount = statusCounts['warning'] ?? 0
  const okCount = statusCounts['ok'] ?? 0

  const handleExport = useCallback(() => {
    const headers = ['Parameter', 'Unit', 'BDN Value', 'Contract Min', 'Contract Max', 'Lab Result', 'Variance', 'Status']
    const csvRows = rows.map((r) => {
      const variance = computeVariance(r.labResult, r.contractMin, r.contractMax)
      const status = computeStatus(r.labResult, r.contractMin, r.contractMax)
      return [r.parameter, r.unit, r.bdnValue, r.contractMin, r.contractMax, r.labResult,
        variance != null ? variance.toFixed(4) : '', specStatusLabel(status)].join(',')
    })
    const csv = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `specs-analysis-${selectedCase?.reference ?? (labRef || 'export')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [rows, selectedCase, labRef])

  const currentIsoSpec = getIsoSpec(isoEdition, isoGrade)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Specifications Checker</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload a COQ or lab report, select the ordered ISO 8217 grade, and instantly see which parameters pass or fail.
          </p>
        </div>

        {/* COQ / Lab Report Upload & Analysis */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              COQ / Lab Report Analysis
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
              Upload a certificate of quality or lab report and select the ordered grade
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Drop zone (2/3 width) */}
            <div className="lg:col-span-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => handleFileDrop(e.target.files?.[0] ?? null)}
              />
              {uploadedFile ? (
                <div className={cn(
                  'flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors',
                  analysisRun
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40',
                )}>
                  <FileText className={cn(
                    'h-8 w-8 flex-shrink-0',
                    analysisRun ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500',
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {(uploadedFile.size / 1024).toFixed(0)} KB
                      {analysisRun && <span className="ml-2 text-green-600 dark:text-green-400 font-medium">✓ Analyzed</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFileDrop(null)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    handleFileDrop(e.dataTransfer.files[0] ?? null)
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 cursor-pointer transition-colors',
                    dragOver
                      ? 'border-blue-400 bg-blue-50/60 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10',
                  )}
                >
                  <UploadCloud className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Drop COQ or lab report here, or click to browse
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">PDF · JPG · PNG</p>
                </div>
              )}
            </div>

            {/* Grade selection + Analyze CTA (1/3 width) */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Ordered Grade (ISO 8217)
                </label>
                <div className="flex gap-2">
                  <select
                    value={isoEdition}
                    onChange={(e) => {
                      const ed = e.target.value as IsoEdition
                      setIsoEdition(ed)
                      const grades = getIsoEditionGrades(ed)
                      const all = [...grades.residual, ...grades.distillate]
                      if (!all.includes(isoGrade)) setIsoGrade(all[0] ?? '')
                      setAnalysisRun(false)
                    }}
                    className="w-28 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    {ISO_EDITIONS.map((ed) => (
                      <option key={ed.value} value={ed.value}>{ed.label}</option>
                    ))}
                  </select>
                  <select
                    value={isoGrade}
                    onChange={(e) => { setIsoGrade(e.target.value); setAnalysisRun(false) }}
                    className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
                  >
                    {(() => {
                      const grades = getIsoEditionGrades(isoEdition)
                      return (
                        <>
                          <optgroup label="Residual">
                            {grades.residual.map((g) => <option key={g} value={g}>{g}</option>)}
                          </optgroup>
                          <optgroup label="Distillate">
                            {grades.distillate.map((g) => <option key={g} value={g}>{g}</option>)}
                          </optgroup>
                        </>
                      )
                    })()}
                  </select>
                </div>
                {currentIsoSpec && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    {currentIsoSpec.params.length} parameters ·{' '}
                    {currentIsoSpec.category === 'residual' ? 'Residual fuel' : 'Distillate fuel'}
                  </p>
                )}
              </div>

              <button
                onClick={runAnalysis}
                disabled={!uploadedFile || analyzing}
                className={cn(
                  'mt-auto w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors shadow-sm',
                  uploadedFile && !analyzing
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed',
                )}
              >
                {analyzing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Extracting parameters…</>
                ) : analysisRun ? (
                  <><FlaskConical className="h-4 w-4" /> Re-analyze</>
                ) : (
                  <><FlaskConical className="h-4 w-4" /> Analyze Document</>
                )}
              </button>

              {!uploadedFile && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                  Upload a document above, then click Analyze
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Draft Analysis Disclaimer */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Draft Analysis:</span> All outputs are draft analyses
            and must be verified against original certified lab reports before use in formal proceedings.
            Extracted values are indicative — always confirm against the source document.
          </p>
        </div>

        {/* ISO 8217 Manual Override (collapsible) */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center gap-3 px-5 py-3 text-left"
            onClick={() => setIsoExpanded((v) => !v)}
          >
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Manual ISO 8217 Limit Override
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-normal ml-1 hidden sm:inline">
              Apply spec limits without uploading a document
            </span>
            <ChevronDown className={cn('h-4 w-4 text-blue-500 ml-auto transition-transform', isoExpanded && 'rotate-180')} />
          </button>

          {isoExpanded && (
            <div className="border-t border-blue-200 dark:border-blue-900/40 bg-white dark:bg-slate-800 px-5 py-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Edition</label>
                  <select
                    value={isoEdition}
                    onChange={(e) => {
                      const ed = e.target.value as IsoEdition
                      setIsoEdition(ed)
                      const grades = getIsoEditionGrades(ed)
                      const all = [...grades.residual, ...grades.distillate]
                      if (!all.includes(isoGrade)) setIsoGrade(all[0] ?? '')
                      setAnalysisRun(false)
                    }}
                    className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {ISO_EDITIONS.map((ed) => (
                      <option key={ed.value} value={ed.value}>{ed.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Grade</label>
                  <select
                    value={isoGrade}
                    onChange={(e) => { setIsoGrade(e.target.value); setAnalysisRun(false) }}
                    className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {(() => {
                      const grades = getIsoEditionGrades(isoEdition)
                      return (
                        <>
                          <optgroup label="Residual">
                            {grades.residual.map((g) => <option key={g} value={g}>{g}</option>)}
                          </optgroup>
                          <optgroup label="Distillate">
                            {grades.distillate.map((g) => <option key={g} value={g}>{g}</option>)}
                          </optgroup>
                        </>
                      )
                    })()}
                  </select>
                </div>
                <button
                  onClick={applyIsoLimits}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <BookOpen className="h-4 w-4" /> Apply Limits Only
                </button>
              </div>
              {currentIsoSpec && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {currentIsoSpec.params.slice(0, 12).map((param) => (
                    <span key={param.name} className="inline-flex items-center rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
                      {param.name}
                      {param.max != null && <span className="ml-1 text-slate-400 dark:text-slate-500">≤{param.max}</span>}
                      {param.min != null && param.max == null && <span className="ml-1 text-slate-400 dark:text-slate-500">≥{param.min}</span>}
                    </span>
                  ))}
                  {currentIsoSpec.params.length > 12 && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">
                      +{currentIsoSpec.params.length - 12} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Case & Reference Details */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Case &amp; Reference Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Case</label>
              <select
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                value={selectedCaseId}
                onChange={(e) => handleCaseChange(e.target.value)}
              >
                {mockCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.reference} — {c.vessel?.name} ({c.fuel_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Lab Report Reference
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                value={labRef}
                onChange={(e) => setLabRef(e.target.value)}
                placeholder="e.g. BV-SG-2026-44821"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Charter Party Reference
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                value={cpRef}
                onChange={(e) => setCpRef(e.target.value)}
                placeholder="e.g. CP-PCH-2026-001"
              />
            </div>
          </div>
          {selectedCase && (
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4">
              <span><span className="font-medium text-slate-700 dark:text-slate-200">Vessel:</span> {selectedCase.vessel?.name}</span>
              <span><span className="font-medium text-slate-700 dark:text-slate-200">Port:</span> {selectedCase.port?.name}</span>
              <span><span className="font-medium text-slate-700 dark:text-slate-200">Supplier:</span> {selectedCase.supplier?.name}</span>
              <span><span className="font-medium text-slate-700 dark:text-slate-200">Delivery:</span> {formatDate(selectedCase.delivery?.delivery_date ?? selectedCase.opened_at)}</span>
              <span><span className="font-medium text-slate-700 dark:text-slate-200">Fuel:</span> {selectedCase.fuel_type}</span>
            </div>
          )}
        </div>

        {/* Summary Banner */}
        <div className="grid grid-cols-3 gap-4">
          <div className={cn(
            'rounded-lg border p-4 flex items-center gap-3 dark:bg-slate-800',
            offSpecCount > 0 ? 'border-red-200 dark:border-red-900/50 bg-red-50' : 'border-slate-200 dark:border-slate-700 bg-white',
          )}>
            <XCircle className={cn('h-8 w-8', offSpecCount > 0 ? 'text-red-500' : 'text-slate-300 dark:text-slate-600')} />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{offSpecCount}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Off-Spec</p>
            </div>
          </div>
          <div className={cn(
            'rounded-lg border p-4 flex items-center gap-3 dark:bg-slate-800',
            warningCount > 0 ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50' : 'border-slate-200 dark:border-slate-700 bg-white',
          )}>
            <AlertTriangle className={cn('h-8 w-8', warningCount > 0 ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600')} />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{warningCount}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">At Limit</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center gap-3">
            <CheckCircle className={cn('h-8 w-8', okCount > 0 ? 'text-green-500' : 'text-slate-300 dark:text-slate-600')} />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{okCount}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Within Spec</p>
            </div>
          </div>
        </div>

        {/* PSC Risk — sulphur non-conformance */}
        {rows.some((r) => {
          const status = computeStatus(r.labResult, r.contractMin, r.contractMax)
          return status === 'off_spec' && r.parameter.toLowerCase().includes('sulphur')
        }) && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/15 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Port State Control Risk — Sulphur Non-Conformance</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                Off-spec sulphur content may trigger PSC detention and MARPOL Annex VI penalties at the next port call.
                Notify flag state, P&amp;I club, and master immediately. File a Fuel Oil Non-Availability Report (FONAR)
                if the non-conformance is with a MARPOL-regulated limit. Document decision to continue or stop fuel use.
              </p>
            </div>
          </div>
        )}

        {/* Analysis provenance tag */}
        {analysisRun && uploadedFile && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/15 px-4 py-2.5">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-300 flex-1">
              Parameters extracted from <span className="font-medium">{uploadedFile.name}</span>
              {' · '}Checked against <span className="font-medium">ISO 8217:{isoEdition} {isoGrade}</span>
            </p>
          </div>
        )}

        {/* Parameter Table */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Parameter Analysis</h2>
            <button
              onClick={addCustomRow}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-left">
                  {['Parameter', 'Unit', 'ISO Min', 'ISO Max', 'Lab Result', 'Variance', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide whitespace-nowrap border-b border-slate-200 dark:border-slate-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {rows.map((row) => {
                  const variance = computeVariance(row.labResult, row.contractMin, row.contractMax)
                  const status = computeStatus(row.labResult, row.contractMin, row.contractMax)
                  const bg = rowBgClass(status)

                  return (
                    <tr key={row.id} className={cn('transition-colors hover:brightness-95', bg)}>
                      {/* Parameter */}
                      <td className="px-4 py-2.5">
                        <div>
                          <input
                            type="text"
                            className="w-52 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                            value={row.parameter}
                            onChange={(e) => updateRow(row.id, 'parameter', e.target.value)}
                          />
                          {row.parameter.toLowerCase().includes('sulphur') && selectedCase?.fuel_type && MARPOL_SULPHUR[selectedCase.fuel_type] && (
                            <div className="mt-0.5 flex gap-1 flex-wrap">
                              <span className="inline-flex items-center rounded px-1 py-0.5 text-xs bg-purple-50 text-purple-700 border border-purple-100">
                                MARPOL Global ≤{MARPOL_SULPHUR[selectedCase.fuel_type].global}%
                              </span>
                              <span className="inline-flex items-center rounded px-1 py-0.5 text-xs bg-purple-50 text-purple-700 border border-purple-100">
                                ECA ≤{MARPOL_SULPHUR[selectedCase.fuel_type].eca}%
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400 w-16 inline-block">{row.unit || '—'}</span>
                      </td>

                      {/* ISO Min (contractMin) */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number" step="any"
                          className="w-20 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-right text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none"
                          value={row.contractMin}
                          onChange={(e) => updateRow(row.id, 'contractMin', e.target.value)}
                          placeholder="—"
                        />
                      </td>

                      {/* ISO Max (contractMax) */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number" step="any"
                          className="w-20 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-right text-slate-700 dark:text-slate-300 focus:border-blue-500 focus:outline-none"
                          value={row.contractMax}
                          onChange={(e) => updateRow(row.id, 'contractMax', e.target.value)}
                          placeholder="—"
                        />
                      </td>

                      {/* Lab Result */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number" step="any"
                            className={cn(
                              'w-24 rounded border px-2 py-1 text-sm text-right font-mono focus:outline-none focus:ring-1',
                              status === 'off_spec'
                                ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300 focus:border-red-500 focus:ring-red-200'
                                : status === 'warning'
                                ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300 focus:border-amber-500 focus:ring-amber-200'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-blue-500',
                            )}
                            value={row.labResult}
                            onChange={(e) => updateRow(row.id, 'labResult', e.target.value)}
                            placeholder="—"
                          />
                          {row.labResult && row.isCalculated && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">(calc.)</span>
                          )}
                        </div>
                      </td>

                      {/* Variance */}
                      <td className="px-4 py-2.5 text-right font-mono text-xs">
                        {variance !== null ? (
                          <span className={cn(
                            status === 'off_spec' ? 'font-semibold text-red-600 dark:text-red-400'
                            : status === 'warning' ? 'font-semibold text-amber-600 dark:text-amber-400'
                            : 'text-green-600 dark:text-green-400',
                          )}>
                            {variance >= 0 ? '+' : ''}{variance.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <StatusBadge status={status} />
                      </td>

                      {/* Remove */}
                      <td className="px-2 py-2.5">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove row"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSaved(true)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" />
            {saved ? 'Analysis Saved' : 'Save Analysis'}
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>

          <button
            onClick={() => setLinkedToCase(true)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors shadow-sm',
              linkedToCase
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700',
            )}
          >
            <CheckCircle className="h-4 w-4" />
            {linkedToCase ? `Linked to ${selectedCase?.reference ?? 'Case'}` : 'Link to Case'}
          </button>
        </div>

        {/* Notes */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Analysis Notes
          </label>
          <textarea
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record interpretation notes, surveyor observations, or follow-up actions required..."
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{notes.length} characters</p>
        </div>

      </div>
    </div>
  )
}
