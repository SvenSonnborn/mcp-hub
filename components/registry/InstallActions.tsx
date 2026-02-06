'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { InstallConfigDialog } from '@/components/registry/InstallConfigDialog'
import type { Server } from '@/lib/schemas'
import type { ToolId } from '@/lib/config-generator'

type InstallActionsProps = {
  serverId: string
  server?: Server
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onInstalled?: (installationId: string) => void
  tool?: ToolId
  variant?: ButtonProps['variant']
}

export function InstallActions({
  serverId,
  server,
  className,
  size,
  onInstalled,
  tool = 'claude',
  variant,
}: InstallActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  return (
    <>
      <Button
        size={size}
        className={className}
        onClick={() => {
          setIsDialogOpen(true)
        }}
        variant={variant}
      >
        <Download className="h-4 w-4" />
        Configure Server
      </Button>
      {server ? (
        <InstallConfigDialog
          server={server}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onInstalled={onInstalled}
        />
      ) : null}
    </>
  )
}
