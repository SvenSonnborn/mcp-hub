'use client'

import { useEffect, useMemo, useState } from 'react'
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
  onConfirm: (config: Record<string, unknown>) => void
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
  onConfirm,
}: InstallConfigDialogProps) {
  const schema = server.configSchema as Schema | undefined
  const properties = schema?.properties ?? {}
  const requiredFields = useMemo(() => new Set(schema?.required ?? []), [schema])
  const [values, setValues] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (!isOpen) return
    setValues(buildInitialValues(schema))
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

  const handleSubmit = () => {
    if (!validate()) return

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

    onConfirm(prepared)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure {server.name}</DialogTitle>
          <DialogDescription>
            Provide the configuration details required to install this MCP server.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-5">
          {Object.entries(properties).map(([key, property]) => {
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
                          onChange={(event) => updateArrayValue(key, index, event.target.value)}
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
                  <Button type="button" variant="secondary" onClick={() => addArrayValue(key)}>
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
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Install
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
