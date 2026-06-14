import { useState } from 'react'
import { Building2, Plus, Search, ExternalLink, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockCompanies, mockContacts } from '@/data/mockData'

const TYPE_STYLES: Record<string, string> = {
  shipowner: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  charterer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  supplier:  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  other:     'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
}

const TYPE_LABELS: Record<string, string> = {
  shipowner: 'Shipowner',
  charterer: 'Charterer',
  supplier:  'Supplier',
  other:     'Other',
}

export function CounterpartiesPage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const companies = mockCompanies.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
    const matchType = !filterType || c.type === filterType
    return matchSearch && matchType
  })

  const selectedCompany = mockCompanies.find((c) => c.id === selectedId)
  const companyContacts = mockContacts.filter((ct) => ct.company_id === selectedId)

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Counterparties
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Shipowners, charterers, and suppliers active in your operations.
          </p>
        </div>
        <button className="btn-primary text-xs py-1.5 px-3">
          <Plus className="h-3.5 w-3.5" />
          Add Counterparty
        </button>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-5 items-start">
        {/* Left: list */}
        <div className="space-y-3">
          {/* Filters */}
          <div className="card p-3 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search company or country…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input h-8 text-xs py-0 pl-8"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-select h-8 text-xs py-0 w-36"
            >
              <option value="">All types</option>
              <option value="shipowner">Shipowners</option>
              <option value="charterer">Charterers</option>
              <option value="supplier">Suppliers</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="table-base">
              <thead className="table-head">
                <tr>
                  {['Company', 'Type', 'Country', 'Active Cases', 'Contacts', ''].map(
                    (h) => <th key={h} className="table-th">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      No counterparties found.
                    </td>
                  </tr>
                ) : (
                  companies.map((c) => {
                    const contacts = mockContacts.filter((ct) => ct.company_id === c.id)
                    const isSelected = c.id === selectedId
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedId(isSelected ? null : c.id)}
                        className={cn(
                          'table-row cursor-pointer',
                          isSelected && 'bg-blue-50 dark:bg-blue-900/10'
                        )}
                      >
                        <td className="table-td">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {c.name}
                            </span>
                          </div>
                        </td>
                        <td className="table-td">
                          <span className={cn(
                            'inline-flex items-center rounded-full text-[10px] font-semibold px-2 py-0.5',
                            TYPE_STYLES[c.type]
                          )}>
                            {TYPE_LABELS[c.type]}
                          </span>
                        </td>
                        <td className="table-td text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3 w-3 text-slate-400" />
                            {c.country}
                          </div>
                        </td>
                        <td className="table-td text-xs font-mono text-slate-700 dark:text-slate-300">
                          —
                        </td>
                        <td className="table-td text-xs text-slate-500">
                          {contacts.length}
                        </td>
                        <td className="table-td">
                          <button className="btn-ghost py-1 px-2 text-xs">
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="card p-0 overflow-hidden">
          {!selectedCompany ? (
            <div className="py-16 text-center text-sm text-slate-400 px-4">
              <Building2 className="h-8 w-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              Select a company to view details and contacts.
            </div>
          ) : (
            <div>
              <div className="card-header">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {selectedCompany.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn(
                        'inline-flex items-center rounded-full text-[10px] font-semibold px-1.5 py-0.5',
                        TYPE_STYLES[selectedCompany.type]
                      )}>
                        {TYPE_LABELS[selectedCompany.type]}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {selectedCompany.country}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Contacts */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Contacts
                    </span>
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      + Add
                    </button>
                  </div>
                  {companyContacts.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No contacts on record.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {companyContacts.map((ct) => (
                        <div
                          key={ct.id}
                          className="rounded-md border border-slate-100 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-800/60"
                        >
                          <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                            {ct.full_name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {ct.role}
                          </div>
                          <div className="text-[11px] text-blue-500 mt-0.5">
                            {ct.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
