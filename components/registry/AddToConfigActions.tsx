'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type AddToConfigActionsProps = {
  serverId: string
  serverName: string
  remoteUrl: string
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function AddToConfigActions({
  serverId,
  serverName,
  remoteUrl,
  className,
  size,
}: AddToConfigActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/config/remote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, remoteUrl }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to add server')
      }
      toast.success(`${serverName} connected`)
      router.refresh()
    } catch (error) {
      toast.error('Failed to add server', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button size={size} className={className} onClick={handleAdd} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      {isLoading ? 'Connecting...' : 'Connect Remote Server'}
    </Button>
  )
}
