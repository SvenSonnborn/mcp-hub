'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

const NON_TERMINAL_STATUSES = new Set(['PENDING', 'INSTALLING', 'UPDATING'])
const POLL_INTERVAL_MS = 5000
const MAX_ATTEMPTS = 24

type StatusPollerProps = {
  installationId: string
  initialStatus: string
}

type InstallationRecord = {
  id: string
  status: string
}

type InstallationsResponse = {
  installations?: InstallationRecord[]
}

const isNonTerminal = (status: string | null | undefined) =>
  status ? NON_TERMINAL_STATUSES.has(status) : false

function StatusPollerContent({ installationId, initialStatus }: StatusPollerProps) {
  const router = useRouter()
  const attemptsRef = useRef(0)
  const lastStatusRef = useRef(initialStatus)

  useEffect(() => {
    lastStatusRef.current = initialStatus
    attemptsRef.current = 0
  }, [initialStatus])

  const { data: status } = useQuery<string | null>({
    queryKey: ['installation-status', installationId],
    queryFn: async () => {
      attemptsRef.current += 1
      const response = await fetch('/api/installations')
      if (!response.ok) {
        throw new Error('Failed to fetch installation status')
      }
      const payload: InstallationsResponse = await response.json()
      const installation = payload.installations?.find((item) => item.id === installationId)
      return installation?.status ?? null
    },
    initialData: initialStatus,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data || !isNonTerminal(data)) {
        return false
      }
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        return false
      }
      return POLL_INTERVAL_MS
    },
  })

  useEffect(() => {
    if (!status) {
      return
    }
    const previousStatus = lastStatusRef.current
    lastStatusRef.current = status
    if (previousStatus && isNonTerminal(previousStatus) && !isNonTerminal(status)) {
      router.refresh()
    }
  }, [router, status])

  return null
}

export function StatusPoller(props: StatusPollerProps) {
  const queryClientRef = useRef<QueryClient | null>(null)

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient()
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <StatusPollerContent {...props} />
    </QueryClientProvider>
  )
}
