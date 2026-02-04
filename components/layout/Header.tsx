'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChevronRight, Menu } from 'lucide-react'
import { NAV_LABELS } from './navigation'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type HeaderProps = {
  onMenuClick: () => void
}

const getLabel = (href: string) => NAV_LABELS[href] ?? href.replace('/', '')

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`
    return {
      href,
      label: getLabel(href) || segment,
    }
  })
  const pageTitle = getLabel(pathname) || breadcrumbs.at(-1)?.label || 'Dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-white/5 px-4 backdrop-blur-2xl lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-300 hover:bg-white/10 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-white">
              MCP Hub
            </Link>
            {breadcrumbs.length > 0 ? <ChevronRight className="h-3 w-3" /> : null}
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                <Link
                  href={crumb.href}
                  className="hover:text-white"
                  aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                >
                  {crumb.label}
                </Link>
                {index < breadcrumbs.length - 1 ? <ChevronRight className="h-3 w-3" /> : null}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-100">{pageTitle}</h1>
            <Separator orientation="vertical" className="h-4 bg-white/10" />
            <span className="text-xs text-slate-500">Console</span>
          </div>
        </div>
      </div>
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-300 hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-200 hover:bg-white/10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-white/10 text-xs text-slate-200">
                    OU
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-white/10 bg-slate-950/90 text-slate-100 backdrop-blur-xl"
            >
              <DropdownMenuLabel>Operator</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-400">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>
    </header>
  )
}
