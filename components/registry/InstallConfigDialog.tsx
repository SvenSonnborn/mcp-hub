'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { Server } from '@/lib/schemas'
import type { ToolId } from '@/lib/config-generator'

type SchemaProperty = {
  type?: 'string' | 'number' | 'boolean' | 'array'
  description?: string
  default?: unknown
  items?: { type?: string }
}

type Schema = {
  type?: 'object'
  properties?: Record<string, SchemaProperty>
  required?: string[]
}

interface InstallConfigDialogProps {
  server: Server
  isOpen: boolean
  onClose: () => void
  onInstalled?: (installationId: string) => void
}

type ConfigResponse = {
  tool: ToolId
  includeStopped: boolean
  count: number
  valid: boolean
  config: Record<string, unknown>
}

const buildInitialValues = (schema: Schema | undefined) => {
  const properties = schema?.properties ?? {}
  const required = new Set(schema?.required ?? [])
  const values: Record<string, unknown> = {}

  Object.entries(properties).forEach(([key, property]) => {
    if (property.default !== undefined) {
      values[key] = property.default
      return
    }

    switch (property.type) {
      case 'array':
        values[key] = required.has(key) ? [''] : []
        break
      case 'boolean':
        values[key] = false
        break
      default:
        values[key] = ''
        break
    }
  })

  return values
}

export function InstallConfigDialog({
  server,
  isOpen,
  onClose,
  onInstalled,
}: InstallConfigDialogProps) {
  const router = useRouter()
  const schema = server.configSchema as Schema | undefined
  const properties = schema?.properties ?? {}
  const requiredFields = useMemo(() => new Set(schema?.required ?? []), [schema])
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [step, setStep] = useState<'form' | 'preview'>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [configData, setConfigData] = useState<ConfigResponse | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setValues(buildInitialValues(schema))
    setStep('form')
    setConfigData(null)
  }, [isOpen, schema])

  const updateValue = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const updateArrayValue = (key: string, index: number, value: string) => {
    const current = Array.isArray(values[key]) ? [...(values[key] as string[])] : []
    current[index] = value
    updateValue(key, current)
  }

  const addArrayValue = (key: string) => {
    const current = Array.isArray(values[key]) ? [...(values[key] as string[])] : []
    current.push('')
    updateValue(key, current)
  }

  const removeArrayValue = (key: string, index: number) => {
    const current = Array.isArray(values[key]) ? [...(values[key] as string[])] : []
    current.splice(index, 1)
    updateValue(key, current)
  }

  const validate = () => {
    const missing: string[] = []

    requiredFields.forEach((field) => {
      const value = values[field]
      if (Array.isArray(value)) {
        const hasValue = value.some((entry) => String(entry).trim() !== '')
        if (!hasValue) missing.push(field)
        return
      }

      if (typeof value === 'string') {
        if (!value.trim()) missing.push(field)
        return
      }

      if (typeof value === 'number') {
        if (Number.isNaN(value)) missing.push(field)
        return
      }

      if (typeof value === 'boolean') {
        return
      }

      if (value === null || value === undefined) {
        missing.push(field)
      }
    })

    if (missing.length > 0) {
      toast.error('Missing required fields', {
        description: `Please complete: ${missing.join(', ')}`,
      })
      return false
    }

    return true
  }

  const prepareConfig = () => {
    const prepared: Record<string, unknown> = {}

    Object.entries(properties).forEach(([key, property]) => {
      const value = values[key]

      if (property.type === 'array') {
        if (!Array.isArray(value)) return
        const items = value.map((entry) => String(entry).trim()).filter(Boolean)
        if (items.length > 0) {
          prepared[key] = items
        }
        return
      }

      if (property.type === 'number') {
        if (value === '' || value === null || value === undefined) return
        const numeric = typeof value === 'number' ? value : Number(value)
        if (!Number.isNaN(numeric)) {
          prepared[key] = numeric
        }
        return
      }

      if (property.type === 'boolean') {
        prepared[key] = Boolean(value)
        return
      }

      if (typeof value === 'string' && value.trim()) {
        prepared[key] = value.trim()
      }
    })

    return prepared
  }

  const fetchConfig = async (tool: ToolId) => {
    const response = await fetch(`/api/config?tool=${tool}&serverId=${server.id}`)
    const payload = (await response.json().catch(() => ({}))) as ConfigResponse | { error?: string }
    if (!response.ok) {
      throw new Error(
        'error' in payload && payload.error ? payload.error : 'Unable to generate config'
      )
    }
    return payload as ConfigResponse
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const config = prepareConfig()
      const response = await fetch('/api/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: server.id, config }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Unable to generate config')
      }

      if (payload?.installation?.id) {
        onInstalled?.(payload.installation.id)
      }

      const generated = await fetchConfig('claude')
      setConfigData(generated)
      setStep('preview')
      toast.success('Configuration saved')
    } catch (error) {
      toast.error('Unable to generate config', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasFields = Object.keys(properties).length > 0
  const handleDone = () => {
    onClose()
    router.refresh()
  }

  const handleCopyConfig = async () => {
    if (!configData?.config) {
      toast.error('No config available to copy')
      return
    }

    try {
      const serialized = JSON.stringify(configData.config, null, 2)
      await navigator.clipboard.writeText(serialized)
      setCopied(true)
      toast.success('Config copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Unable to copy config', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{`Configure ${server.name}`}</DialogTitle>
          <DialogDescription>
            Provide the settings required to save your MCP configuration.
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <>
            <div className="mt-6 space-y-5">
              {hasFields ? (
                Object.entries(properties).map(([key, property]) => {
                  const isRequired = requiredFields.has(key)
                  const value = values[key]

                  if (property.type === 'boolean') {
                    return (
                      <div key={key} className="flex items-center justify-between gap-4">
                        <div>
                          <Label className="text-sm text-slate-200">
                            {key}
                            {isRequired ? ' *' : ''}
                          </Label>
                          {property.description ? (
                            <p className="text-xs text-slate-400">{property.description}</p>
                          ) : null}
                        </div>
                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => updateValue(key, checked)}
                        />
                      </div>
                    )
                  }

                  if (property.type === 'array') {
                    const items = Array.isArray(value) ? value : []
                    return (
                      <div key={key} className="space-y-3">
                        <div>
                          <Label className="text-sm text-slate-200">
                            {key}
                            {isRequired ? ' *' : ''}
                          </Label>
                          {property.description ? (
                            <p className="text-xs text-slate-400">{property.description}</p>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          {items.map((entry, index) => (
                            <div key={`${key}-${index}`} className="flex items-center gap-2">
                              <Input
                                value={String(entry)}
                                onChange={(event) =>
                                  updateArrayValue(key, index, event.target.value)
                                }
                                placeholder={`Item ${index + 1}`}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => removeArrayValue(key, index)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => addArrayValue(key)}
                        >
                          Add item
                        </Button>
                      </div>
                    )
                  }

                  const inputType = property.type === 'number' ? 'number' : 'text'

                  return (
                    <div key={key} className="space-y-2">
                      <Label className="text-sm text-slate-200">
                        {key}
                        {isRequired ? ' *' : ''}
                      </Label>
                      <Input
                        type={inputType}
                        value={value === undefined || value === null ? '' : String(value)}
                        onChange={(event) => updateValue(key, event.target.value)}
                      />
                      {property.description ? (
                        <p className="text-xs text-slate-400">{property.description}</p>
                      ) : null}
                    </div>
                  )
                })
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  No additional configuration is required for this server. Save your configuration
                  to continue.
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Configuration
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              <p className="font-semibold text-emerald-200">Configuration saved!</p>
              <p className="text-sm text-slate-200">
                Default tool is Claude.
                <br />
                Weitere Einstellungen im Config tab.
              </p>

              <div className="mt-8 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyConfig}
                  disabled={copied}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Config'}
                </Button>
                <Button type="button" onClick={handleDone}>
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
