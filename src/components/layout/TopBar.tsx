import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Search,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from './ThemeProvider'
import { mockUsers, mockCases } from '@/data/mockData'
import { initials } from '@/lib/utils'

// ── Notification shape ──────────────────────────────────────────────────────
interface Notification {
  id: string
  type: 'urgent' | 'action' | 'info'
  title: string
  body: string
  timestamp: string
  read: boolean
  href?: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'urgent',
    title: 'Case escalated — MV Nordic Star',
    body: 'Quantity short of 18.7 MT on VLSFO delivery at Rotterdam has been escalated.',
    timestamp: '2026-06-14T09:05:00Z',
    read: false,
    href: '/cases/c1',
  },
  {
    id: 'n2',
    type: 'action',
    title: 'Draft pending approval — Charterer Notice',
    body: 'LOP response for case CPM-2026-0042 is awaiting your approval.',
    timestamp: '2026-06-14T08:30:00Z',
    read: false,
    href: '/drafts',
  },
  {
    id: 'n3',
    type: 'action',
    title: 'Off-spec confirmed — MV Pacific Horizon',
    body: 'Lab report received. Flash point 57 °C against 60 °C minimum. Case CPM-2026-0041.',
    timestamp: '2026-06-13T17:45:00Z',
    read: false,
    href: '/cases/c2',
  },
  {
    id: 'n4',
    type: 'info',
    title: 'Delivery reconciled — Singapore',
    body: 'Barge vs vessel figures accepted within tolerance for delivery DEL-2026-0118.',
    timestamp: '2026-06-13T11:20:00Z',
    read: true,
    href: '/deliveries',
  },
  {
    id: 'n5',
    type: 'info',
    title: 'FuelEU deadline — 14 days',
    body: 'Compliance documentation for MV Atlantic Carrier due 28 June 2026.',
    timestamp: '2026-06-12T09:00:00Z',
    read: true,
    href: '/fuel-readiness',
  },
]

// ── Global search items (derived from mock data) ────────────────────────────
function useSearchResults(query: string) {
  if (!query.trim()) return []

  const q = query.toLowerCase()
  const results: Array<{ label: string; sub: string; href: string }> = []

  for (const c of mockCases) {
    if (
      c.reference.toLowerCase().includes(q) ||
      (c.vessel?.name ?? '').toLowerCase().includes(q) ||
      (c.port?.name ?? '').toLowerCase().includes(q)
    ) {
      results.push({
        label: c.reference,
        sub: `${c.vessel?.name ?? 'Unknown vessel'} · ${c.port?.name ?? 'Unknown port'}`,
        href: `/cases/${c.id}`,
      })
    }
  }

  return results.slice(0, 6)
}

// ── Top bar ─────────────────────────────────────────────────────────────────
export function TopBar() {
  const navigate = useNavigate()
  const { theme, toggle: toggleTheme } = useTheme()
  const currentUser = mockUsers[3] // Olivia Le Blond (Compliance Officer)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  const searchResults = useSearchResults(searchQuery)
  const unread = notifications.filter((n) => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close all on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setNotifOpen(false)
        setUserOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  function goTo(href: string | undefined, id?: string) {
    if (id) markRead(id)
    if (href) navigate(href)
    setNotifOpen(false)
    setSearchOpen(false)
    setUserOpen(false)
    setSearchQuery('')
  }

  return (
    <header className={cn(
      'h-14 flex items-center gap-4 px-5 flex-shrink-0 z-30',
      'bg-white border-b border-slate-200',
      'dark:bg-[#111827] dark:border-slate-700/60'
    )}>

      {/* ── Global search ──────────────────────────────────────────────────── */}
      <div ref={searchRef} className="relative flex-1 max-w-sm">
        <div className={cn(
          'flex items-center gap-2 h-8 px-3 rounded-md text-sm',
          'border border-slate-200 dark:border-slate-700',
          'bg-slate-50 dark:bg-slate-800',
          searchOpen && 'ring-2 ring-blue-500 border-transparent'
        )}>
          <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search cases, vessels, ports…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
            className={cn(
              'flex-1 bg-transparent text-[13px] text-slate-900 dark:text-slate-100',
              'placeholder-slate-400 outline-none'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchOpen(false) }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {searchOpen && searchQuery && (
          <div className={cn(
            'dropdown-panel w-full left-0 top-10 py-1',
            'min-w-[320px]'
          )}>
            {searchResults.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                No results for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <>
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Cases
                  </span>
                </div>
                {searchResults.map((r) => (
                  <button
                    key={r.href}
                    onClick={() => goTo(r.href)}
                    className="dropdown-item w-full text-left"
                  >
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      {r.label}
                    </span>
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs truncate">
                      {r.sub}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Right controls ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className={cn(
            'h-8 w-8 rounded-md flex items-center justify-center transition-colors',
            'text-slate-400 hover:text-slate-700 hover:bg-slate-100',
            'dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700'
          )}
        >
          {theme === 'light'
            ? <Moon className="h-4 w-4" />
            : <Sun className="h-4 w-4" />
          }
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((o) => !o); setUserOpen(false) }}
            title="Notifications"
            className={cn(
              'relative h-8 w-8 rounded-md flex items-center justify-center transition-colors',
              'text-slate-400 hover:text-slate-700 hover:bg-slate-100',
              'dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700',
              notifOpen && 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            )}
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className={cn(
                'absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500',
                'ring-2 ring-white dark:ring-[#111827]'
              )} />
            )}
          </button>

          {notifOpen && (
            <div className={cn(
              'dropdown-panel right-0 top-10 w-[380px]'
            )}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Notifications
                  </span>
                  {unread > 0 && (
                    <span className="rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 text-xs font-semibold px-1.5 py-0.5">
                      {unread}
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onClick={() => goTo(n.href, n.id)}
                  />
                ))}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 text-center">
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen((o) => !o); setNotifOpen(false) }}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1 h-8 transition-colors',
              'hover:bg-slate-100 dark:hover:bg-slate-700',
              userOpen && 'bg-slate-100 dark:bg-slate-700'
            )}
          >
            <div className="h-6 w-6 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white leading-none">
                {initials(currentUser.full_name)}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-none">
                {currentUser.full_name}
              </div>
              <div className="text-[10px] text-slate-400 leading-none mt-0.5 capitalize">
                {currentUser.role.replace(/_/g, ' ')}
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>

          {userOpen && (
            <div className={cn('dropdown-panel right-0 top-10 w-52 py-1')}>
              {/* User info header */}
              <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-700 mb-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {currentUser.full_name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentUser.email}
                </div>
              </div>

              <button className="dropdown-item" onClick={() => goTo('/admin')}>
                <User className="h-3.5 w-3.5 text-slate-400" />
                Profile
              </button>
              <button className="dropdown-item" onClick={() => goTo('/admin')}>
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                Settings
              </button>

              <div className="dropdown-divider" />

              <button className="dropdown-item text-red-600 dark:text-red-400">
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

/* ── Notification item ─────────────────────────────────────────────────────── */
function NotificationItem({
  notification: n,
  onClick,
}: {
  notification: Notification
  onClick: () => void
}) {
  const Icon =
    n.type === 'urgent'
      ? AlertTriangle
      : n.type === 'action'
      ? Clock
      : CheckCircle

  const iconColor =
    n.type === 'urgent'
      ? 'text-red-500'
      : n.type === 'action'
      ? 'text-amber-500'
      : 'text-green-500'

  const ts = new Date(n.timestamp)
  const now = new Date()
  const diffH = Math.floor((now.getTime() - ts.getTime()) / 3_600_000)
  const label =
    diffH < 1
      ? 'Just now'
      : diffH < 24
      ? `${diffH}h ago`
      : `${Math.floor(diffH / 24)}d ago`

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-slate-50 dark:hover:bg-slate-700/40',
        !n.read && 'bg-blue-50/40 dark:bg-blue-900/10'
      )}
    >
      <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', iconColor)} />
      <div className="min-w-0 flex-1">
        <div className={cn(
          'text-xs font-semibold leading-snug',
          n.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'
        )}>
          {n.title}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">
          {n.body}
        </div>
        <div className="text-[10px] text-slate-400 mt-1">{label}</div>
      </div>
      {!n.read && (
        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
      )}
    </button>
  )
}
