'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NAV_ITEMS } from './navigation'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type SidebarProps = {
  expanded: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const isActiveRoute = (pathname: string, href: string) => {
  if (pathname === href) return true
  if (href === '/') return pathname === '/'
  return pathname.startsWith(`${href}/`)
}

export function Sidebar({ expanded, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={200}>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden"
          onClick={onMobileClose}
        />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur transition-[width,transform] duration-300',
          expanded ? 'w-60' : 'w-16',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className={cn('flex h-16 items-center gap-3 px-4', expanded ? '' : 'justify-center')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white">
            MCP
          </div>
          {expanded ? (
            <span className="text-sm font-semibold text-slate-100">Hub Console</span>
          ) : null}
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActiveRoute(pathname, item.href)
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  expanded ? '' : 'justify-center',
                  active
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  if (mobileOpen) onMobileClose()
                }}
              >
                <Icon className="h-5 w-5" />
                {expanded ? (
                  <span>{item.label}</span>
                ) : (
                  <span className="sr-only">{item.label}</span>
                )}
              </Link>
            )

            if (expanded) return link

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
        <div className="p-2">
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white',
              expanded ? '' : 'justify-center'
            )}
          >
            {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {expanded ? 'Collapse' : <span className="sr-only">Expand</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
