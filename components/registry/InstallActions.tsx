'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type InstallActionsProps = {
  serverId: string
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onInstalled?: (installationId: string) => void
}

export function InstallActions({ serverId, className, size, onInstalled }: InstallActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleInstall = async () => {
    if (!serverId) {
      toast.error('Missing server ID')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/installations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serverId }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to install server')
      }
      toast.success(payload?.alreadyInstalled ? 'Server already installed' : 'Installation started')
      if (payload?.installation?.id) {
        onInstalled?.(payload.installation.id)
      }
      router.refresh()
    } catch (error) {
      toast.error('Installation failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button size={size} className={className} onClick={handleInstall} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {isLoading ? 'Installing...' : 'Install Server'}
    </Button>
  )
}
