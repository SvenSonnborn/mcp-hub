'use client'

import { useMemo, useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { Check, CheckCircle2, Copy, Download, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ConfigPreviewProps = {
  config: Record<string, unknown>
  isValid: boolean
  title?: string
  filename?: string
}

export function ConfigPreview({
  config,
  isValid,
  title = 'Generated config',
  filename = 'mcp.json',
}: ConfigPreviewProps) {
  const [copied, setCopied] = useState(false)
  const code = useMemo(() => JSON.stringify(config ?? {}, null, 2), [config])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Config copied to clipboard')
      window.setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      toast.error('Unable to copy config', {
        description: error instanceof Error ? error.message : 'Check clipboard permissions.',
      })
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
              isValid
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
            )}
          >
            {isValid ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {isValid ? 'Valid MCP config' : 'Invalid config'}
          </div>
          <span className="text-sm font-semibold text-slate-200">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-slate-100 hover:border-cyan-400/40 hover:bg-white/10"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-slate-100 hover:border-cyan-400/40 hover:bg-white/10"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <div className="overflow-auto px-4 py-4">
        <Highlight code={code} language="json" theme={themes.nightOwl}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={cn(className, 'min-w-full text-sm leading-6 text-slate-100', 'font-mono')}
              style={style}
            >
              {tokens.map((line, index) => (
                <div key={index} {...getLineProps({ line })} className="table-row">
                  <span className="table-cell pr-4 text-right text-xs text-slate-500 select-none">
                    {index + 1}
                  </span>
                  <span className="table-cell">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </section>
  )
}
