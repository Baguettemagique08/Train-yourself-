import { useState, useCallback } from 'react'
import { Settings, Users, Shield, Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { mockThresholds, mockTemplates, mockUsers } from '@/data/mockData'
import { cn, formatDate, formatRelative } from '@/lib/utils'
import { DRAFT_TYPE_OPTIONS } from '@/lib/constants'
import type { DraftType, Template, Threshold } from '@/types'

// ── Tab types ──────────────────────────────────────────────────────────────────
type AdminTab = 'thresholds' | 'templates' | 'users' | 'roles' | 'audit'

// ── Mock admin users (richer than mockUsers) ───────────────────────────────────
const ADMIN_USERS = [
  { id: 'u1', name: 'James Hargreaves', email: 'james.hargreaves@copemer.com', role: 'Senior Claims Handler', status: 'active', lastActive: '2026-06-14T08:30:00Z' },
  { id: 'u2', name: 'Sophie Lindqvist', email: 'sophie.lindqvist@copemer.com', role: 'Claims Analyst', status: 'active', lastActive: '2026-06-13T17:05:00Z' },
  { id: 'u3', name: 'Rajan Mehta', email: 'rajan.mehta@copemer.com', role: 'Operations Manager', status: 'active', lastActive: '2026-06-12T11:22:00Z' },
  { id: 'u4', name: 'Olivia Le Blond', email: 'olivia.leblond@copemer.com', role: 'Compliance Officer', status: 'active', lastActive: '2026-06-14T09:15:00Z' },
]

// ── Roles data ─────────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Full system access including configuration, user management, and all case operations.',
    permissions: ['Case Management', 'Document Upload', 'Draft Approve', 'Draft Send', 'Admin Settings', 'User Management', 'Role Management'],
    userCount: 1,
  },
  {
    id: 'role-senior',
    name: 'Senior Claims Handler',
    description: 'Full case operations, draft approval authority, and escalation management.',
    permissions: ['Case Management', 'Document Upload', 'Draft Create', 'Draft Approve', 'Draft Send', 'Reconciler', 'Specs Checker'],
    userCount: 1,
  },
  {
    id: 'role-analyst',
    name: 'Claims Analyst',
    description: 'Case data entry, reconciliation, and draft creation. Cannot approve or send drafts.',
    permissions: ['Case View', 'Document Upload', 'Draft Create', 'Reconciler', 'Specs Checker', 'Fuel Readiness'],
    userCount: 1,
  },
  {
    id: 'role-ops',
    name: 'Operations Manager',
    description: 'Operational oversight, reporting, and fleet readiness monitoring.',
    permissions: ['Case View', 'Fuel Readiness', 'Reports', 'Dashboard'],
    userCount: 1,
  },
  {
    id: 'role-compliance',
    name: 'Compliance Officer',
    description: 'Compliance monitoring, specs checking, and regulatory reporting.',
    permissions: ['Case View', 'Specs Checker', 'Fuel Readiness', 'Reports', 'Thresholds View'],
    userCount: 1,
  },
  {
    id: 'role-readonly',
    name: 'Read Only',
    description: 'View-only access to all non-sensitive case information.',
    permissions: ['Case View', 'Dashboard'],
    userCount: 0,
  },
]

// ── Tab Button ─────────────────────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
      )}
    >
      {icon}
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────
function ThresholdsTab() {
  const [thresholds, setThresholds] = useState<Threshold[]>([...mockThresholds])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Threshold>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newThreshold, setNewThreshold] = useState<Omit<Threshold, 'id'>>({
    category: 'quantity',
    parameter: '',
    unit: '',
    warning_threshold: 0,
    critical_threshold: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const startEdit = (t: Threshold) => {
    setEditingId(t.id)
    setEditValues({ ...t })
  }

  const saveEdit = () => {
    if (!editingId) return
    setThresholds((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, ...editValues } : t))
    )
    setEditingId(null)
    setEditValues({})
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const deleteThreshold = (id: string) => {
    setThresholds((prev) => prev.filter((t) => t.id !== id))
  }

  const addThreshold = () => {
    if (!newThreshold.parameter.trim()) return
    const id = `t-custom-${Date.now()}`
    setThresholds((prev) => [...prev, { id, ...newThreshold }])
    setNewThreshold({ category: 'quantity', parameter: '', unit: '', warning_threshold: 0, critical_threshold: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    setShowAdd(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Variance &amp; Specification Thresholds</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure warning and critical thresholds used in reconciliation and spec analysis.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Threshold
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {['Parameter', 'Warning Threshold', 'Critical Threshold', 'Unit', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {thresholds.map((t) => {
              const isEditing = editingId === t.id
              return (
                <tr key={t.id} className={cn('hover:bg-slate-50 transition-colors', isEditing && 'bg-blue-50')}>
                  {/* Parameter */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-56 rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        value={editValues.parameter ?? ''}
                        onChange={(e) => setEditValues((v) => ({ ...v, parameter: e.target.value }))}
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{t.parameter}</span>
                    )}
                  </td>

                  {/* Warning */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        className="w-24 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-sm focus:border-amber-500 focus:outline-none"
                        value={editValues.warning_threshold ?? ''}
                        onChange={(e) => setEditValues((v) => ({ ...v, warning_threshold: parseFloat(e.target.value) || 0 }))}
                      />
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        {t.warning_threshold}
                      </span>
                    )}
                  </td>

                  {/* Critical */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        className="w-24 rounded border border-red-300 bg-red-50 px-2 py-1 text-sm focus:border-red-500 focus:outline-none"
                        value={editValues.critical_threshold ?? ''}
                        onChange={(e) => setEditValues((v) => ({ ...v, critical_threshold: parseFloat(e.target.value) || 0 }))}
                      />
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        {t.critical_threshold}
                      </span>
                    )}
                  </td>

                  {/* Unit */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        value={editValues.unit ?? ''}
                        onChange={(e) => setEditValues((v) => ({ ...v, unit: e.target.value }))}
                      />
                    ) : (
                      <span className="text-slate-500">{t.unit}</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveEdit}
                          className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(t)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => deleteThreshold(t.id)}
                          className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}

            {/* Add new threshold row */}
            {showAdd && (
              <tr className="bg-green-50">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="Parameter name"
                    className="w-56 rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    value={newThreshold.parameter}
                    onChange={(e) => setNewThreshold((v) => ({ ...v, parameter: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    className="w-24 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-sm focus:outline-none"
                    value={newThreshold.warning_threshold || ''}
                    onChange={(e) => setNewThreshold((v) => ({ ...v, warning_threshold: parseFloat(e.target.value) || 0 }))}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    className="w-24 rounded border border-red-300 bg-red-50 px-2 py-1 text-sm focus:outline-none"
                    value={newThreshold.critical_threshold || ''}
                    onChange={(e) => setNewThreshold((v) => ({ ...v, critical_threshold: parseFloat(e.target.value) || 0 }))}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="unit"
                    className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:outline-none"
                    value={newThreshold.unit}
                    onChange={(e) => setNewThreshold((v) => ({ ...v, unit: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={addThreshold}
                      className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-3 w-3" /> Add
                    </button>
                    <button
                      onClick={() => setShowAdd(false)}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────
function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([...mockTemplates])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const startEdit = (t: Template) => {
    setEditingId(t.id)
    setEditContent(t.body)
  }

  const saveEdit = () => {
    if (!editingId) return
    const now = new Date().toISOString()
    setTemplates((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, body: editContent, updated_at: now } : t))
    )
    setEditingId(null)
    setEditContent('')
  }

  const typeLabel = (type: DraftType): string => {
    return DRAFT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Communication Templates</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage draft templates used in the Drafting Center when creating new communications.
        </p>
      </div>

      {/* Template List */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {['Template Name', 'Draft Type', 'Last Modified', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    {typeLabel(t.draft_type)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(t.updated_at)}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => startEdit(t)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="h-3 w-3" /> Edit Template
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Template Editor Modal */}
      {editingId && (() => {
        const template = templates.find((t) => t.id === editingId)
        if (!template) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Edit Template</h2>
                  <p className="text-xs text-slate-500">{template.name}</p>
                </div>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-md border border-slate-300 p-1.5 text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <textarea
                  className="w-full h-96 rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: USERS
// ─────────────────────────────────────────────────────────────────────────────
function UsersTab() {
  type AdminUser = typeof ADMIN_USERS[0] & { status: 'active' | 'inactive' }
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS as AdminUser[])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState('')
  const [showInvite, setShowInvite] = useState(false)

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage platform users, roles, and access.</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {['Name', 'Email', 'Role', 'Status', 'Last Active', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isEditing = editingId === user.id
              return (
                <tr key={user.id} className={cn('hover:bg-slate-50 transition-colors', isEditing && 'bg-blue-50')}>
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span className="font-semibold text-slate-900">{user.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-slate-500 text-xs">{user.email}</td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:outline-none"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {user.role}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatRelative(user.lastActive)}</td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setUsers((prev) =>
                              prev.map((u) => (u.id === user.id ? { ...u, role: editRole } : u))
                            )
                            setEditingId(null)
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingId(user.id); setEditRole(user.role) }}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                            user.status === 'active'
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          )}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Invite User Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Invite User</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                <input type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Jane Smith" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input type="email" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="jane.smith@copemer.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowInvite(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowInvite(false)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: ROLES
// ─────────────────────────────────────────────────────────────────────────────
function RolesTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Roles &amp; Permissions</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Platform roles define what actions users can perform. Contact your administrator to modify role permissions.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {['Role Name', 'Description', 'Permissions', 'Users'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ROLES.map((role) => (
              <tr key={role.id} className="hover:bg-slate-50 transition-colors align-top">
                {/* Role Name */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-900">{role.name}</span>
                  </div>
                </td>

                {/* Description */}
                <td className="px-4 py-4 text-slate-500 text-xs max-w-xs">
                  {role.description}
                </td>

                {/* Permissions */}
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Users Count */}
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    <Users className="h-3 w-3" />
                    {role.userCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: AUDIT LOG
// ─────────────────────────────────────────────────────────────────────────────

type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE'

interface AuditEntry {
  id: string
  user_name: string
  table_name: string
  record_id: string
  operation: AuditOperation
  changed_fields: string[]
  created_at: string
}

const MOCK_AUDIT_ENTRIES: AuditEntry[] = [
  { id: 'al1', user_name: 'James Hargreaves', table_name: 'cases', record_id: 'c1', operation: 'UPDATE', changed_fields: ['status', 'priority'], created_at: '2026-06-14T08:31:00Z' },
  { id: 'al2', user_name: 'Sophie Lindqvist', table_name: 'spec_checks', record_id: 'sc3', operation: 'INSERT', changed_fields: ['lab_result', 'status', 'deviation_pct'], created_at: '2026-06-14T08:15:00Z' },
  { id: 'al3', user_name: 'Olivia Le Blond', table_name: 'drafts', record_id: 'dr1', operation: 'UPDATE', changed_fields: ['status', 'approved_by', 'approved_at'], created_at: '2026-06-13T17:44:00Z' },
  { id: 'al4', user_name: 'Rajan Mehta', table_name: 'measurements', record_id: 'm5', operation: 'INSERT', changed_fields: ['quantity_mt', 'temperature_c', 'density_at_15c_kgm3'], created_at: '2026-06-13T16:22:00Z' },
  { id: 'al5', user_name: 'James Hargreaves', table_name: 'cases', record_id: 'c2', operation: 'UPDATE', changed_fields: ['status'], created_at: '2026-06-13T15:05:00Z' },
  { id: 'al6', user_name: 'Sophie Lindqvist', table_name: 'documents', record_id: 'd7', operation: 'INSERT', changed_fields: ['filename', 'document_type', 'storage_path'], created_at: '2026-06-13T14:30:00Z' },
  { id: 'al7', user_name: 'Olivia Le Blond', table_name: 'thresholds', record_id: 'th2', operation: 'UPDATE', changed_fields: ['warning_threshold', 'critical_threshold'], created_at: '2026-06-12T11:20:00Z' },
  { id: 'al8', user_name: 'Rajan Mehta', table_name: 'cases', record_id: 'c3', operation: 'INSERT', changed_fields: ['reference', 'status', 'vessel_id', 'port_id', 'supplier_id'], created_at: '2026-06-12T09:45:00Z' },
]

const OP_COLORS: Record<AuditOperation, string> = {
  INSERT: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
}

function AuditLogTab() {
  const [search, setSearch] = useState('')
  const [opFilter, setOpFilter] = useState<AuditOperation | ''>('')
  const [tableFilter, setTableFilter] = useState('')

  const tables = Array.from(new Set(MOCK_AUDIT_ENTRIES.map((e) => e.table_name))).sort()

  const filtered = MOCK_AUDIT_ENTRIES.filter((e) => {
    if (opFilter && e.operation !== opFilter) return false
    if (tableFilter && e.table_name !== tableFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!e.user_name.toLowerCase().includes(q) && !e.table_name.toLowerCase().includes(q) && !e.record_id.toLowerCase().includes(q)) return false
    }
    return true
  })

  const exportCsv = () => {
    const rows = [
      ['Timestamp', 'User', 'Table', 'Record ID', 'Operation', 'Changed Fields'],
      ...filtered.map((e) => [e.created_at, e.user_name, e.table_name, e.record_id, e.operation, e.changed_fields.join('; ')]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Audit Log</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident record of all data changes. Written by database triggers — cannot be modified.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search user, table, record…"
          className="flex-1 min-w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          value={opFilter}
          onChange={(e) => setOpFilter(e.target.value as AuditOperation | '')}
        >
          <option value="">All operations</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
        >
          <option value="">All tables</option>
          {tables.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {['Timestamp', 'User', 'Table', 'Record', 'Operation', 'Changed Fields'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No entries match your filters</td>
              </tr>
            )}
            {filtered.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap font-mono">
                  {new Date(entry.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{entry.user_name}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-slate-100 text-slate-700 rounded px-1.5 py-0.5">{entry.table_name}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{entry.record_id}</td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', OP_COLORS[entry.operation])}>
                    {entry.operation}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {entry.changed_fields.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Showing {filtered.length} of {MOCK_AUDIT_ENTRIES.length} entries · In production, this queries the append-only <span className="font-mono">audit_logs</span> table
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('thresholds')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure platform settings, thresholds, templates, users, and roles.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-white rounded-t-lg px-4">
          <div className="flex overflow-x-auto">
            <TabButton
              active={activeTab === 'thresholds'}
              onClick={() => setActiveTab('thresholds')}
              icon={<Settings className="h-4 w-4" />}
              label="Thresholds"
            />
            <TabButton
              active={activeTab === 'templates'}
              onClick={() => setActiveTab('templates')}
              icon={<Settings className="h-4 w-4" />}
              label="Templates"
            />
            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              icon={<Users className="h-4 w-4" />}
              label="Users"
            />
            <TabButton
              active={activeTab === 'roles'}
              onClick={() => setActiveTab('roles')}
              icon={<Shield className="h-4 w-4" />}
              label="Roles"
            />
            <TabButton
              active={activeTab === 'audit'}
              onClick={() => setActiveTab('audit')}
              icon={<Settings className="h-4 w-4" />}
              label="Audit Log"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-b-lg">
          {activeTab === 'thresholds' && <ThresholdsTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'roles' && <RolesTab />}
          {activeTab === 'audit' && <AuditLogTab />}
        </div>
      </div>
    </div>
  )
}
