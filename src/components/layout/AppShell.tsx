import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ThemeProvider } from './ThemeProvider'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-[#0f1520]">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

        {/* Content column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />

          <main className={[
            'flex-1 overflow-y-auto',
            'bg-slate-50 dark:bg-[#0f1520]',
          ].join(' ')}>
            <div className="p-6 max-w-[1440px] mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
