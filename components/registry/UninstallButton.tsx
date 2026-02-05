'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type UninstallButtonProps = {
  installationId: string
  onUninstalled?: () => void
}

export function UninstallButton({ installationId, onUninstalled }: UninstallButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUninstall = async () => {
    if (!installationId) {
      toast.error('Missing installation ID')
      return
    }
    const confirmed = window.confirm('Uninstall this server?')
    if (!confirmed) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/installations/${installationId}`, {
        method: 'DELETE',
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to uninstall server')
      }
      toast.success('Server uninstalled')
      onUninstalled?.()
      router.refresh()
    } catch (error) {
      toast.error('Uninstall failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUninstall}
      disabled={isLoading}
      className="border-rose-500/40 bg-rose-500/10 text-rose-100 hover:border-rose-400/60 hover:bg-rose-500/20"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {isLoading ? 'Uninstalling...' : 'Uninstall Server'}
    </Button>
  )
}
