import { Activity, Boxes, LayoutDashboard, Sliders } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Registry', href: '/registry', icon: Boxes },
  { label: 'Config', href: '/config', icon: Sliders },
  { label: 'Monitor', href: '/monitor', icon: Activity },
]

export const NAV_LABELS = NAV_ITEMS.reduce<Record<string, string>>((acc, item) => {
  acc[item.href] = item.label
  return acc
}, {})
