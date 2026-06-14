import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  Truck,
  Scale,
  FlaskConical,
  FileText,
  Leaf,
  Building2,
  Ship,
  PenLine,
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
  icon: React.ElementType
  label: string
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const openCases = mockCases.filter(
    (c) => !['resolved', 'closed'].includes(c.status)
  ).length
  const pendingDrafts = mockDrafts.filter(
    (d) => d.status === 'draft' || d.status === 'under_review'
  ).length

  const navGroups: NavGroup[] = [
    {
      label: 'Operations',
      items: [
        { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/cases',       icon: FolderOpen,      label: 'Cases',       badge: openCases },
        { to: '/deliveries',  icon: Truck,            label: 'Deliveries' },
      ],
    },
    {
      label: 'Analysis',
      items: [
        { to: '/reconciler',  icon: Scale,         label: 'Reconciler' },
        { to: '/specs',       icon: FlaskConical,  label: 'Specs Checker' },
      ],
    },
    {
      label: 'Communications',
      items: [
        { to: '/claim-drafter', icon: PenLine, label: 'Claim Drafter' },
        { to: '/drafts', icon: FileText, label: 'Drafting Center', badge: pendingDrafts },
      ],
    },
    {
      label: 'Compliance',
      items: [
        { to: '/fuel-readiness', icon: Leaf, label: 'Alt Fuel Readiness' },
      ],
    },
    {
      label: 'Masterdata',
      items: [
        { to: '/counterparties', icon: Building2, label: 'Counterparties' },
        { to: '/vessels',        icon: Ship,       label: 'Vessels' },
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
        'relative flex flex-col flex-shrink-0',
        'bg-[#0c1425] text-slate-100',
        'transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-[52px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-2.5 h-14 border-b border-white/10 flex-shrink-0',
          collapsed ? 'justify-center px-0' : 'px-4'
        )}
      >
        <div className="flex-shrink-0 h-7 w-7 bg-blue-600 rounded flex items-center justify-center">
          <Anchor className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="min-w-0 overflow-hidden">
            <div className="text-[13px] font-bold text-white tracking-[0.08em] leading-none">
              COPEMER
            </div>
            <div className="text-[10px] text-slate-500 leading-none mt-1 tracking-wide">
              Disputes &amp; Compliance
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.1em]">
                {group.label}
              </p>
            )}
            {collapsed && <div className="h-px bg-white/5 mx-1 mb-2" />}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarLink key={item.to} {...item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'absolute -right-3 top-[54px]',
          'h-5 w-5 rounded-full flex items-center justify-center',
          'bg-[#1e2d40] border border-slate-600',
          'text-slate-400 hover:text-slate-200 hover:bg-slate-600',
          'shadow-md z-20 transition-colors'
        )}
      >
        {collapsed
          ? <ChevronRight className="h-2.5 w-2.5" />
          : <ChevronLeft className="h-2.5 w-2.5" />
        }
      </button>

      {/* Bottom version tag */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/5">
          <span className="text-[10px] text-slate-600 font-mono">v1.0.0 · internal</span>
        </div>
      )}
    </aside>
  )
}

/* ── Nav Link ──────────────────────────────────────────────────────────────── */
function SidebarLink({
  to,
  icon: Icon,
  label,
  badge,
  collapsed,
}: NavItem & { collapsed: boolean }) {
  const location = useLocation()
  const isActive =
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={cn(
        'sidebar-link',
        isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
        collapsed ? 'justify-center px-0 w-full' : ''
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-[13px]">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span
              className={cn(
                'rounded-full min-w-[18px] h-[18px] px-1 text-[10px] font-semibold',
                'flex items-center justify-center leading-none',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-700 text-slate-300'
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
