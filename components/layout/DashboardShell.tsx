'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { PageTransition } from './PageTransition'
import { cn } from '@/lib/utils'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-expanded')
    if (stored === 'true' || stored === 'false') {
      setExpanded(stored === 'true')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', String(expanded))
  }, [expanded])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        expanded={expanded}
        onToggle={() => setExpanded((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          'min-h-screen transition-[padding] duration-300',
          expanded ? 'lg:pl-60' : 'lg:pl-16'
        )}
      >
        <Header onMenuClick={() => setMobileOpen(true)} />
        <PageTransition>
          <main className="px-4 py-8 lg:px-8">{children}</main>
        </PageTransition>
      </div>
    </div>
  )
}
