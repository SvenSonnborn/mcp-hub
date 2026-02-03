'use client'

import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function InstallActions({ npmPackage }: { npmPackage?: string | null }) {
  const handleCopyInstall = async () => {
    if (!npmPackage) {
      toast.error('No install command available')
      return
    }
    try {
      await navigator.clipboard.writeText(`npx ${npmPackage}`)
      toast.success('Install command copied')
    } catch (error) {
      toast.error('Unable to copy install command', {
        description: error instanceof Error ? error.message : 'Check clipboard permissions.',
      })
    }
  }

  return (
    <Button variant="outline" className="flex-1" onClick={handleCopyInstall}>
      <Copy className="h-4 w-4" />
      Copy Install Command
    </Button>
  )
}
