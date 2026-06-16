import type { SelectOption } from '@/types'

export const CASE_STATUS_OPTIONS: SelectOption[] = [
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'pending_response', label: 'Pending Response' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export const FUEL_TYPE_OPTIONS: SelectOption[] = [
  { value: 'VLSFO', label: 'VLSFO' },
  { value: 'HSFO', label: 'HSFO' },
  { value: 'MGO', label: 'MGO' },
  { value: 'LSMGO', label: 'LSMGO' },
  { value: 'LNG', label: 'LNG' },
  { value: 'Methanol', label: 'Methanol' },
  { value: 'Ammonia', label: 'Ammonia' },
  { value: 'Biofuel', label: 'Biofuel' },
  { value: 'B24', label: 'B24' },
  { value: 'B100', label: 'B100' },
]

export const DISCREPANCY_TYPE_OPTIONS: SelectOption[] = [
  { value: 'quantity_short', label: 'Quantity Short' },
  { value: 'quantity_over', label: 'Quantity Over' },
  { value: 'off_spec', label: 'Off-Spec' },
  { value: 'mfm_dispute', label: 'MFM Dispute' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'other', label: 'Other' },
]

export const DOCUMENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'BDN', label: 'Bunker Delivery Note' },
  { value: 'NOR', label: 'Notice of Readiness' },
  { value: 'LOP', label: 'Letter of Protest' },
  { value: 'Protest', label: 'Protest' },
  { value: 'Lab_Report', label: 'Lab Report' },
  { value: 'MFM_Log', label: 'MFM Log' },
  { value: 'Ullage_Report', label: 'Ullage Report' },
  { value: 'Charter_Party', label: 'Charter Party' },
  { value: 'Bunker_Record_Book', label: 'Bunker Record Book' },
  { value: 'Sample_Analysis_Certificate', label: 'Sample Analysis Certificate' },
  { value: 'MFM_Certificate', label: 'MFM Calibration Certificate' },
  { value: 'Joint_Survey_Report', label: 'Joint Survey Report' },
  { value: 'Supplier_Response', label: 'Supplier Response' },
  { value: 'Other', label: 'Other' },
]

export const DRAFT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'LOP_Response', label: 'LOP Response' },
  { value: 'Owner_Update', label: 'Owner Update' },
  { value: 'Charterer_Notice', label: 'Charterer Notice' },
  { value: 'Internal_Memo', label: 'Internal Memo' },
  { value: 'Claim_Letter', label: 'Claim Letter' },
  { value: 'Protest_Letter', label: 'Protest Letter' },
  { value: 'Supplier_Challenge', label: 'Supplier Challenge' },
]

export const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export const VARIANCE_WARNING_PCT = 0.3
export const VARIANCE_CRITICAL_PCT = 0.5

export const SPEC_PARAMETERS = [
  { name: 'Density at 15°C', unit: 'kg/m³' },
  { name: 'Kinematic Viscosity at 50°C', unit: 'cSt' },
  { name: 'Flash Point', unit: '°C' },
  { name: 'Sulphur Content', unit: '% m/m' },
  { name: 'Water Content', unit: '% v/v' },
  { name: 'Total Sediment', unit: '% m/m' },
  { name: 'Ash Content', unit: '% m/m' },
  { name: 'CCAI', unit: '' },
  { name: 'Net Heat Value', unit: 'MJ/kg' },
  { name: 'Aluminium + Silicon', unit: 'mg/kg' },
  { name: 'Vanadium', unit: 'mg/kg' },
  { name: 'Sodium', unit: 'mg/kg' },
]
