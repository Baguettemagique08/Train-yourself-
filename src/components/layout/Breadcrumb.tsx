import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
          {item.to && i < items.length - 1 ? (
            <Link to={item.to} className="hover:text-slate-700 transition-colors">{item.label}</Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-slate-900 font-medium' : ''}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
