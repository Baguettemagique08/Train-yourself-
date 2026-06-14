import { useMemo } from 'react'
import { mockMeasurements } from '@/data/mockData'
import type { Measurement } from '@/types'

export function useMeasurements(caseId: string) {
  return useMemo(() => {
    return mockMeasurements.filter((m) => m.case_id === caseId)
  }, [caseId])
}

export function useReconcilerData(caseId: string) {
  const measurements = useMeasurements(caseId)

  return useMemo(() => {
    const bySource = (source: string) =>
      measurements.filter((m) => m.source === source)

    const vesselMeas = bySource('vessel')
    const bargeMeas = bySource('barge')
    const mfmMeas = bySource('mfm')

    const fuelTypes = [...new Set(measurements.map((m) => m.fuel_type))]

    return fuelTypes.map((fuel) => {
      const vessel = vesselMeas.find((m) => m.fuel_type === fuel)
      const barge = bargeMeas.find((m) => m.fuel_type === fuel)
      const mfm = mfmMeas.find((m) => m.fuel_type === fuel)

      const vesselQty = vessel?.net_quantity ?? null
      const bargeQty = barge?.net_quantity ?? null
      const mfmQty = mfm?.net_quantity ?? null

      const vbDiff = vesselQty !== null && bargeQty !== null ? vesselQty - bargeQty : null
      const vbPct = vbDiff !== null && bargeQty !== null ? (vbDiff / bargeQty) * 100 : null
      const vmDiff = vesselQty !== null && mfmQty !== null ? vesselQty - mfmQty : null
      const vmPct = vmDiff !== null && mfmQty !== null ? (vmDiff / mfmQty) * 100 : null

      const getStatus = (pct: number | null) => {
        if (pct === null) return 'ok' as const
        const abs = Math.abs(pct)
        if (abs > 1) return 'critical' as const
        if (abs > 0.5) return 'warning' as const
        return 'ok' as const
      }

      return {
        fuel_type: fuel,
        vessel_qty: vesselQty,
        barge_qty: bargeQty,
        mfm_qty: mfmQty,
        vb_diff: vbDiff,
        vb_pct: vbPct,
        vm_diff: vmDiff,
        vm_pct: vmPct,
        status: getStatus(vbPct),
      }
    })
  }, [measurements])
}
