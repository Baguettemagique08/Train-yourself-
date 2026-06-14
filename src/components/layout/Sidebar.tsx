import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  Scale,
  FlaskConical,
  FileText,
  Fuel,
  Settings,
  ChevronLeft,
  ChevronRight,
  Anchor,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockCases, mockDrafts } from '@/data/mockData'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  to: string
  icon: typeof LayoutDashboard
  label: string
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const openCases = mockCases.filter((c) => !['resolved', 'closed'].includes(c.status)).length
  const pendingDrafts = mockDrafts.filter((d) => d.status === 'draft' || d.status === 'under_review').length

  const navGroups: NavGroup[] = [
    {
      label: 'Operations',
      items: [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/cases', icon: FolderOpen, label: 'Cases', badge: openCases },
      ],
    },
    {
      label: 'Analysis',
      items: [
        { to: '/reconciler', icon: Scale, label: 'Reconciler' },
        { to: '/specs', icon: FlaskConical, label: 'Specs Checker' },
      ],
    },
    {
      label: 'Communications',
      items: [
        { to: '/drafts', icon: FileText, label: 'Drafting Center', badge: pendingDrafts },
      ],
    },
    {
      label: 'Compliance',
      items: [
        { to: '/fuel-readiness', icon: Fuel, label: 'Alt Fuel Readiness' },
      ],
    },
    {
      label: 'Settings',
      items: [
        { to: '/admin', icon: Settings, label: 'Admin' },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        'flex flex-col bg-slate-900 text-slate-100 transition-all duration-200 flex-shrink-0 relative',
        collapsed ? 'w-14' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-4 py-4 border-b border-slate-800', collapsed && 'justify-center px-2')}>
        <div className="flex-shrink-0 h-8 w-8 bg-blue-700 rounded-md flex items-center justify-center">
          <Anchor className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-white tracking-wider">COPEMER</div>
            <div className="text-xs text-slate-400 leading-none">Disputes & Compliance</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarLink
                  key={item.to}
                  {...item}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 h-6 w-6 rounded-full bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 flex items-center justify-center shadow-md z-10"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  )
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  badge,
  collapsed,
}: NavItem & { collapsed: boolean }) {
  const location = useLocation()
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={cn(
        'sidebar-link',
        isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-xs font-semibold',
                isActive ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300',
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
