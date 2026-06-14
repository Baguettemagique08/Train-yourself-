import { useState } from 'react'
import { Settings, Users, FileText, Sliders, Edit, Plus, Check, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { mockThresholds, mockTemplates, mockUsers } from '@/data/mockData'
import { DRAFT_TYPE_OPTIONS } from '@/lib/constants'
import type { TabDefinition, Threshold } from '@/types'

const ADMIN_TABS: TabDefinition[] = [
  { id: 'thresholds', label: 'Thresholds' },
  { id: 'templates', label: 'Templates' },
  { id: 'users', label: 'Users' },
  { id: 'roles', label: 'Roles' },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['View all cases', 'Edit all cases', 'Approve drafts', 'Send communications', 'Manage users', 'Edit thresholds'],
  senior_broker: ['View all cases', 'Edit all cases', 'Approve drafts', 'Send communications'],
  broker: ['View all cases', 'Edit assigned cases', 'Create drafts'],
  analyst: ['View all cases', 'Enter figures', 'Run specs checks', 'Create internal memos'],
  readonly: ['View all cases'],
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('thresholds')
  const [editingThreshold, setEditingThreshold] = useState<string | null>(null)
  const [thresholds, setThresholds] = useState(mockThresholds)

  function saveThreshold(id: string, warning: number, critical: number) {
    setThresholds((prev) => prev.map((t) => t.id === id
      ? { ...t, warning_threshold: warning, critical_threshold: critical }
      : t
    ))
    setEditingThreshold(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-slate-400" />
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Administration</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage thresholds, templates, users, and role permissions</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5">
          <Tabs tabs={ADMIN_TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="p-5">
          {activeTab === 'thresholds' && (
            <ThresholdsTab
              thresholds={thresholds}
              editingId={editingThreshold}
              onEdit={setEditingThreshold}
              onSave={saveThreshold}
              onCancel={() => setEditingThreshold(null)}
            />
          )}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'roles' && <RolesTab />}
        </div>
      </div>
    </div>
  )
}

function ThresholdsTab({
  thresholds, editingId, onEdit, onSave, onCancel,
}: {
  thresholds: Threshold[]
  editingId: string | null
  onEdit: (id: string) => void
  onSave: (id: string, w: number, c: number) => void
  onCancel: () => void
}) {
  const [warnVal, setWarnVal] = useState('')
  const [critVal, setCritVal] = useState('')

  function startEdit(t: Threshold) {
    setWarnVal(t.warning_threshold.toString())
    setCritVal(t.critical_threshold.toString())
    onEdit(t.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Variance & Quality Thresholds</h3>
          <p className="text-xs text-slate-500 mt-0.5">Define when discrepancies trigger warnings and critical flags</p>
        </div>
      </div>
      <div className="table-container">
        <table className="table-base">
          <thead className="table-head">
            <tr>
              <th className="table-th">Parameter</th>
              <th className="table-th text-right">Unit</th>
              <th className="table-th text-right">Warning Threshold</th>
              <th className="table-th text-right">Critical Threshold</th>
              <th className="table-th w-24" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {thresholds.map((t) => (
              <tr key={t.id} className={editingId === t.id ? 'bg-blue-50' : 'table-row'}>
                <td className="table-td font-medium">{t.parameter}</td>
                <td className="table-td text-right text-slate-400">{t.unit}</td>
                <td className="table-td text-right">
                  {editingId === t.id ? (
                    <input
                      type="number"
                      step="any"
                      className="form-input text-right w-28 py-1 text-sm"
                      value={warnVal}
                      onChange={(e) => setWarnVal(e.target.value)}
                    />
                  ) : (
                    <span className="font-mono text-amber-700 font-medium">{t.warning_threshold}</span>
                  )}
                </td>
                <td className="table-td text-right">
                  {editingId === t.id ? (
                    <input
                      type="number"
                      step="any"
                      className="form-input text-right w-28 py-1 text-sm"
                      value={critVal}
                      onChange={(e) => setCritVal(e.target.value)}
                    />
                  ) : (
                    <span className="font-mono text-red-700 font-medium">{t.critical_threshold}</span>
                  )}
                </td>
                <td className="table-td">
                  {editingId === t.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onSave(t.id, parseFloat(warnVal), parseFloat(critVal))}
                        className="text-green-600 hover:text-green-800 p-1"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={onCancel} className="text-slate-400 hover:text-red-600 p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(t)}
                      className="text-slate-400 hover:text-blue-600 p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TemplatesTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Draft Templates</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage standard templates for each communication type</p>
        </div>
        <Button size="sm"><Plus className="h-3.5 w-3.5" /> New Template</Button>
      </div>
      <div className="space-y-3">
        {mockTemplates.map((tmpl) => {
          const typeLabel = DRAFT_TYPE_OPTIONS.find((o) => o.value === tmpl.type)?.label ?? tmpl.type
          return (
            <div key={tmpl.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{tmpl.name}</p>
                  <Badge className="bg-slate-100 text-slate-600 mt-1">{typeLabel}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">Preview</Button>
                <Button size="sm" variant="secondary"><Edit className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UsersTab() {
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    senior_broker: 'bg-blue-100 text-blue-700',
    broker: 'bg-slate-100 text-slate-700',
    analyst: 'bg-teal-100 text-teal-700',
    readonly: 'bg-slate-50 text-slate-400',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">User Management</h3>
          <p className="text-xs text-slate-500 mt-0.5">{mockUsers.length} active users</p>
        </div>
        <Button size="sm"><Plus className="h-3.5 w-3.5" /> Invite User</Button>
      </div>
      <div className="table-container">
        <table className="table-base">
          <thead className="table-head">
            <tr>
              <th className="table-th">User</th>
              <th className="table-th">Email</th>
              <th className="table-th">Role</th>
              <th className="table-th">Member Since</th>
              <th className="table-th w-20" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {mockUsers.map((u) => (
              <tr key={u.id} className="table-row">
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {u.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <span className="font-medium text-slate-900">{u.full_name}</span>
                  </div>
                </td>
                <td className="table-td text-slate-500">{u.email}</td>
                <td className="table-td">
                  <Badge className={roleColors[u.role] ?? 'bg-slate-100 text-slate-600'}>
                    {u.role.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="table-td text-slate-400">
                  {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="table-td">
                  <Button size="sm" variant="ghost"><Edit className="h-3.5 w-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RolesTab() {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Role Permissions</h3>
        <p className="text-xs text-slate-500 mt-0.5">Permissions granted to each role</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
          <Card key={role}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-slate-400" />
              <h4 className="text-sm font-semibold text-slate-900 capitalize">{role.replace('_', ' ')}</h4>
            </div>
            <ul className="space-y-1.5">
              {perms.map((perm) => (
                <li key={perm} className="flex items-center gap-2 text-xs text-slate-700">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  {perm}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
