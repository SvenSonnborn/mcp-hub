/// <reference types="@testing-library/jest-dom" />
import { expect, afterEach, beforeEach, vi } from 'vitest'
import React from 'react'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

const mockRouter = {
  refresh: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => mockRouter),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => '/'),
}))

vi.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => ({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...props }, children),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mCPServer: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    mCPInstallation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

beforeEach(() => {
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
