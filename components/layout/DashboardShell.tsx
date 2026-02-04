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
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/25 blur-[140px]" />
          <div className="absolute right-[-10%] bottom-0 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[160px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-950/60 to-slate-950" />
        </div>

        <Sidebar
          expanded={expanded}
          onToggle={() => setExpanded((prev) => !prev)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'relative z-10 min-h-screen transition-[padding] duration-300',
            expanded ? 'lg:pl-60' : 'lg:pl-16'
          )}
        >
          <Header onMenuClick={() => setMobileOpen(true)} />
          <PageTransition>
            <main className="px-4 py-10 lg:px-8">{children}</main>
          </PageTransition>
        </div>
      </div>
    </div>
  )
}
