import { Bell, ChevronDown } from 'lucide-react'
import { mockUsers } from '@/data/mockData'
import { initials } from '@/lib/utils'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  // In production, use auth context. Using mock user for demo.
  const currentUser = mockUsers[3] // Olivia Leblond (admin)

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 flex-shrink-0">
      <div>
        {title && (
          <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications placeholder */}
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors p-1">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">{initials(currentUser.full_name)}</span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-medium text-slate-900 leading-none">{currentUser.full_name}</div>
            <div className="text-xs text-slate-400 leading-none mt-0.5 capitalize">{currentUser.role.replace('_', ' ')}</div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
        </div>
      </div>
    </header>
  )
}
