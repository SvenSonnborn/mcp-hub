import type { ReactNode } from 'react'
import { Space_Grotesk } from 'next/font/google'
import { DashboardShell } from '@/components/layout/DashboardShell'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap' })

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className={spaceGrotesk.className}>
      <DashboardShell>{children}</DashboardShell>
    </div>
  )
}
