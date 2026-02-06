'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
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
import { ConfigPreview } from '@/components/config/ConfigPreview'
import { cn } from '@/lib/utils'
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
  defaultTool?: ToolId
}

type ConfigResponse = {
  tool: ToolId
  includeStopped: boolean
  count: number
  valid: boolean
  config: Record<string, unknown>
}

const TOOL_OPTIONS: Array<{ id: ToolId; label: string; location: string }> = [
  {
    id: 'claude',
    label: 'Claude',
    location: '~/Library/Application Support/Claude/claude_desktop_config.json',
  },
  { id: 'cursor', label: 'Cursor', location: '~/.cursor/mcp.json' },
  { id: 'windsurf', label: 'Windsurf', location: '~/.windsurf/mcp.json' },
]

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
  defaultTool = 'claude',
}: InstallConfigDialogProps) {
  const router = useRouter()
  const schema = server.configSchema as Schema | undefined
  const properties = schema?.properties ?? {}
  const requiredFields = useMemo(() => new Set(schema?.required ?? []), [schema])
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [step, setStep] = useState<'form' | 'preview'>('form')
  const [selectedTool, setSelectedTool] = useState<ToolId>(defaultTool)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [configData, setConfigData] = useState<ConfigResponse | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setValues(buildInitialValues(schema))
    setStep('form')
    setSelectedTool(defaultTool)
    setConfigData(null)
  }, [isOpen, schema, defaultTool])

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

      const generated = await fetchConfig(selectedTool)
      setConfigData(generated)
      setStep('preview')
      toast.success('Config generated')
    } catch (error) {
      toast.error('Unable to generate config', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToolChange = async (tool: ToolId) => {
    setSelectedTool(tool)
    if (step !== 'preview') return
    setIsSubmitting(true)
    try {
      const generated = await fetchConfig(tool)
      setConfigData(generated)
    } catch (error) {
      toast.error('Unable to refresh config', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedOption = TOOL_OPTIONS.find((option) => option.id === selectedTool)
  const hasFields = Object.keys(properties).length > 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'preview'
              ? `${server.name} Config for ${selectedOption?.label ?? 'Claude'}`
              : `Add ${server.name} to ${selectedOption?.label ?? 'Claude'}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'preview'
              ? 'Copy the generated MCP config into your client.'
              : 'Provide the settings required to generate your MCP config.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {TOOL_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleToolChange(option.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                selectedTool === option.id
                  ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-100'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-white'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

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
                  No additional configuration is required for this server. Generate your MCP config
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
                Generate Config
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Config generated!
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p className="text-xs tracking-[0.3em] text-cyan-300 uppercase">Paste this into</p>
                <p className="mt-2 font-mono text-xs text-slate-200">
                  {selectedOption?.location ?? 'mcp.json'}
                </p>
                <p className="mt-3 text-xs text-slate-400">
                  Use Copy or Download, then paste into the file above.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <ConfigPreview
                config={configData?.config ?? {}}
                isValid={configData?.valid ?? true}
                title={`${server.name} config`}
                tool={selectedTool}
              />
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep('form')}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onClose()
                  router.refresh()
                }}
              >
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
