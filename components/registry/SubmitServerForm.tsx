'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { CreateServerSchema, type CreateServerInput } from '@/lib/validators/servers'

const TAG_OPTIONS = [
  'official',
  'filesystem',
  'github',
  'database',
  'postgres',
  'sqlite',
  'search',
  'web',
  'browser',
  'automation',
  'api',
  'ai',
  'tools',
  'cloud',
]

const CATEGORY_OPTIONS: CreateServerInput['category'][] = [
  'FILESYSTEM',
  'DATABASE',
  'API',
  'VERSION_CONTROL',
  'COMMUNICATION',
  'SEARCH',
  'AI_SERVICE',
  'DEV_TOOL',
  'OTHER',
]

const DEFAULT_FORM: CreateServerInput = {
  name: '',
  description: '',
  publisher: '',
  githubUrl: '',
  installUrl: '',
  version: '1.0.0',
  category: 'API',
  tags: [],
}

type FieldErrors = Partial<Record<keyof CreateServerInput, string>> & { form?: string }

export function SubmitServerForm() {
  const [formValues, setFormValues] = useState<CreateServerInput>({ ...DEFAULT_FORM })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const descriptionLength = formValues.description.length
  const descriptionHint = useMemo(() => {
    if (descriptionLength === 0) return '10-500 characters'
    if (descriptionLength < 10) return `${10 - descriptionLength} more characters required`
    if (descriptionLength > 500) return `${descriptionLength - 500} characters over limit`
    return `${descriptionLength}/500 characters`
  }, [descriptionLength])

  const updateField = <K extends keyof CreateServerInput>(
    field: K,
    value: CreateServerInput[K]
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const toggleTag = (tag: string) => {
    const isSelected = formValues.tags.includes(tag)

    if (!isSelected && formValues.tags.length >= 5) {
      setErrors((prev) => ({
        ...prev,
        tags: 'Choose up to 5 tags',
      }))
      return
    }

    const nextTags = isSelected
      ? formValues.tags.filter((item) => item !== tag)
      : [...formValues.tags, tag]

    setErrors((prev) => ({ ...prev, tags: undefined }))
    updateField('tags', nextTags)
  }

  const resetForm = () => {
    setFormValues({ ...DEFAULT_FORM })
    setErrors({})
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})

    const parsed = CreateServerSchema.safeParse(formValues)
    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0]
        if (path && typeof path === 'string') {
          nextErrors[path as keyof CreateServerInput] = issue.message
        }
      })
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ name: payload?.error ?? 'A server with this name already exists.' })
        }
        throw new Error(payload?.error ?? 'Unable to submit server')
      }

      toast.success('Server submitted for review')
      resetForm()
    } catch (error) {
      toast.error('Submission failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl"
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="server-name">Name</Label>
          <Input
            id="server-name"
            maxLength={100}
            placeholder="Acme Filesystem MCP"
            value={formValues.name}
            onChange={(event) => updateField('name', event.target.value)}
          />
          {errors.name && <p className="text-xs text-rose-200">{errors.name}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="server-description">Description</Label>
          <Textarea
            id="server-description"
            maxLength={500}
            placeholder="Describe what this server does and why it is useful."
            value={formValues.description}
            onChange={(event) => updateField('description', event.target.value)}
            className="min-h-32"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className={cn(descriptionLength > 500 && 'text-rose-200')}>
              {descriptionHint}
            </span>
            {errors.description && <span className="text-rose-200">{errors.description}</span>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="server-publisher">Publisher</Label>
          <Input
            id="server-publisher"
            maxLength={100}
            placeholder="Acme Labs"
            value={formValues.publisher}
            onChange={(event) => updateField('publisher', event.target.value)}
          />
          {errors.publisher && <p className="text-xs text-rose-200">{errors.publisher}</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="server-github">GitHub URL</Label>
            <Input
              id="server-github"
              placeholder="https://github.com/acme/mcp-server"
              value={formValues.githubUrl}
              onChange={(event) => updateField('githubUrl', event.target.value)}
            />
            {errors.githubUrl && <p className="text-xs text-rose-200">{errors.githubUrl}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="server-install">Install URL</Label>
            <Input
              id="server-install"
              placeholder="https://www.npmjs.com/package/acme-mcp"
              value={formValues.installUrl}
              onChange={(event) => updateField('installUrl', event.target.value)}
            />
            {errors.installUrl && <p className="text-xs text-rose-200">{errors.installUrl}</p>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="server-version">Version</Label>
            <Input
              id="server-version"
              maxLength={50}
              value={formValues.version}
              onChange={(event) => updateField('version', event.target.value)}
            />
            {errors.version && <p className="text-xs text-rose-200">{errors.version}</p>}
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="server-category">Category</Label>
            <Select
              id="server-category"
              value={formValues.category}
              onChange={(event) =>
                updateField('category', event.target.value as CreateServerInput['category'])
              }
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-slate-950">
                  {option.replace('_', ' ')}
                </option>
              ))}
            </Select>
            {errors.category && <p className="text-xs text-rose-200">{errors.category}</p>}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label>Tags</Label>
            <span className="text-xs text-slate-400">{formValues.tags.length}/5 selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => {
              const isSelected = formValues.tags.includes(tag)
              return (
                <Button
                  key={tag}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'rounded-full px-3 text-xs',
                    isSelected ? 'bg-cyan-400 text-slate-950' : 'text-slate-200'
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Button>
              )
            })}
          </div>
          {errors.tags && <p className="text-xs text-rose-200">{errors.tags}</p>}
        </div>

        {errors.form && <p className="text-sm text-rose-200">{errors.form}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-full">
            {isSubmitting ? 'Submitting...' : 'Submit server'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="rounded-full"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Reset
          </Button>
        </div>
      </div>
    </form>
  )
}
